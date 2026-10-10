#include "storage.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <algorithm>

namespace Metamorphosis {

static std::string toLower(const std::string& str) {
    std::string lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return lower;
}

FileStorage::FileStorage(const std::string& filePath)
    : filePath_(filePath) {
    ensureStorageExists();
}

std::string FileStorage::getCurrentTimestampIso() {
    auto now = std::chrono::system_clock::now();
    std::time_t tt = std::chrono::system_clock::to_time_t(now);
    std::tm gmt{};
    gmtime_r(&tt, &gmt);
    std::ostringstream ss;
    ss << std::put_time(&gmt, "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

bool FileStorage::ensureStorageExists() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    try {
        std::filesystem::path p(filePath_);
        if (p.has_parent_path()) {
            std::filesystem::create_directories(p.parent_path());
        }

        if (!std::filesystem::exists(p)) {
            // Create a brand new repository file with header metadata
            std::ofstream out(filePath_, std::ios::out);
            if (!out.is_open()) {
                std::cerr << "[FileStorage] Error: Failed to create storage file at " << filePath_ << std::endl;
                return false;
            }
            out << "# METAMORPHOSIS SECURE USER REPOSITORY v1.0\n";
            out << "# SCHEMA: ID|USERNAME|ARGON2ID_HASH|CREATED_AT|LAST_LOGIN|STAGE|REFLECTION\n";
            out.close();
        }
        return true;
    } catch (const std::exception& e) {
        std::cerr << "[FileStorage] Filesystem exception: " << e.what() << std::endl;
        return false;
    }
}

std::string FileStorage::sanitizeField(const std::string& input) {
    std::string output;
    output.reserve(input.size());
    for (char c : input) {
        if (c == '|') {
            output += "%7C"; // Escape delimiter
        } else if (c == '\n' || c == '\r') {
            output += " ";
        } else {
            output += c;
        }
    }
    return output;
}

std::string FileStorage::desanitizeField(const std::string& input) {
    std::string output = input;
    size_t pos = 0;
    while ((pos = output.find("%7C", pos)) != std::string::npos) {
        output.replace(pos, 3, "|");
        pos += 1;
    }
    return output;
}

std::string FileStorage::serializeUser(const User& user) {
    std::ostringstream ss;
    ss << user.id << "|"
       << sanitizeField(user.username) << "|"
       << sanitizeField(user.passwordHash) << "|"
       << sanitizeField(user.createdAt) << "|"
       << sanitizeField(user.lastLogin) << "|"
       << user.transformationStage << "|"
       << sanitizeField(user.reflection);
    return ss.str();
}

std::optional<User> FileStorage::deserializeUser(const std::string& line) {
    if (line.empty() || line[0] == '#') {
        return std::nullopt;
    }

    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(line);
    while (std::getline(tokenStream, token, '|')) {
        tokens.push_back(token);
    }

    // Must have at least 6 tokens (reflection can be 7th)
    if (tokens.size() < 6) {
        return std::nullopt;
    }

    try {
        User user;
        user.id = std::stoull(tokens[0]);
        user.username = desanitizeField(tokens[1]);
        user.passwordHash = desanitizeField(tokens[2]);
        user.createdAt = desanitizeField(tokens[3]);
        user.lastLogin = desanitizeField(tokens[4]);
        user.transformationStage = std::stoi(tokens[5]);
        user.reflection = (tokens.size() >= 7) ? desanitizeField(tokens[6]) : "";
        return user;
    } catch (...) {
        return std::nullopt;
    }
}

std::vector<User> FileStorage::readAllUsersUnlocked() {
    std::vector<User> users;
    std::ifstream in(filePath_, std::ios::in);
    if (!in.is_open()) {
        std::cerr << "[FileStorage] Warning: Unable to open file " << filePath_ << " for reading." << std::endl;
        return users;
    }

    std::string line;
    while (std::getline(in, line)) {
        auto optUser = deserializeUser(line);
        if (optUser.has_value()) {
            users.push_back(std::move(optUser.value()));
        }
    }
    in.close();
    return users;
}

bool FileStorage::writeAllUsersUnlocked(const std::vector<User>& users) {
    std::string tempPath = filePath_ + ".tmp";
    std::ofstream out(tempPath, std::ios::out | std::ios::trunc);
    if (!out.is_open()) {
        std::cerr << "[FileStorage] Error: Failed to open temp file " << tempPath << " for atomic write." << std::endl;
        return false;
    }

    out << "# METAMORPHOSIS SECURE USER REPOSITORY v1.0\n";
    out << "# SCHEMA: ID|USERNAME|ARGON2ID_HASH|CREATED_AT|LAST_LOGIN|STAGE|REFLECTION\n";
    for (const auto& user : users) {
        out << serializeUser(user) << "\n";
    }

    if (out.bad() || out.fail()) {
        std::cerr << "[FileStorage] Write error during persistent save." << std::endl;
        out.close();
        std::filesystem::remove(tempPath);
        return false;
    }

    out.close();

    // Atomic rename to prevent data corruption
    std::error_code ec;
    std::filesystem::rename(tempPath, filePath_, ec);
    if (ec) {
        std::cerr << "[FileStorage] Failed to atomically rename temp file: " << ec.message() << std::endl;
        return false;
    }

    return true;
}

bool FileStorage::usernameExists(const std::string& username) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::string lowerTarget = toLower(username);
    auto users = readAllUsersUnlocked();
    for (const auto& u : users) {
        if (toLower(u.username) == lowerTarget) {
            return true;
        }
    }
    return false;
}

bool FileStorage::saveUser(const User& user) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::string lowerTarget = toLower(user.username);
    auto users = readAllUsersUnlocked();

    // Check duplicate username
    for (const auto& u : users) {
        if (toLower(u.username) == lowerTarget) {
            std::cerr << "[FileStorage] Rejecting registration: Username '" << user.username << "' already exists." << std::endl;
            return false;
        }
    }

    users.push_back(user);
    return writeAllUsersUnlocked(users);
}

std::optional<User> FileStorage::findUser(const std::string& username) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::string lowerTarget = toLower(username);
    auto users = readAllUsersUnlocked();
    for (const auto& u : users) {
        if (toLower(u.username) == lowerTarget) {
            return u;
        }
    }
    return std::nullopt;
}

bool FileStorage::updateUser(const User& updatedUser) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    auto users = readAllUsersUnlocked();
    bool found = false;
    for (auto& u : users) {
        if (u.id == updatedUser.id || toLower(u.username) == toLower(updatedUser.username)) {
            u = updatedUser;
            found = true;
            break;
        }
    }

    if (!found) {
        return false;
    }

    return writeAllUsersUnlocked(users);
}

size_t FileStorage::getUserCount() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    return readAllUsersUnlocked().size();
}

StorageStats FileStorage::getStats() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    StorageStats stats;
    stats.filePath = filePath_;
    stats.totalUsers = 0;
    stats.fileSizeBytes = 0;
    stats.lastModified = "N/A";

    try {
        if (std::filesystem::exists(filePath_)) {
            stats.fileSizeBytes = std::filesystem::file_size(filePath_);
            auto ftime = std::filesystem::last_write_time(filePath_);
            auto sctp = std::chrono::time_point_cast<std::chrono::system_clock::duration>(
                ftime - std::filesystem::file_time_type::clock::now() + std::chrono::system_clock::now()
            );
            std::time_t cftime = std::chrono::system_clock::to_time_t(sctp);
            std::tm tm{};
            gmtime_r(&cftime, &tm);
            std::ostringstream ss;
            ss << std::put_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
            stats.lastModified = ss.str();
        }
        stats.totalUsers = readAllUsersUnlocked().size();
    } catch (...) {}

    return stats;
}

std::string FileStorage::getSanitizedFileDump() {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::ifstream in(filePath_);
    if (!in.is_open()) {
        return "# Error: Unable to open file for preview\n";
    }

    std::ostringstream ss;
    std::string line;
    while (std::getline(in, line)) {
        if (line.empty() || line[0] == '#') {
            ss << line << "\n";
            continue;
        }
        // Mask the password hash partially for security demonstration during viva
        auto optUser = deserializeUser(line);
        if (optUser.has_value()) {
            const auto& u = optUser.value();
            std::string maskedHash = u.passwordHash;
            if (maskedHash.length() > 24) {
                maskedHash = maskedHash.substr(0, 15) + "..." + maskedHash.substr(maskedHash.length() - 8);
            }
            ss << u.id << "|" << u.username << "|" << maskedHash << "|"
               << u.createdAt << "|" << u.lastLogin << "|" << u.transformationStage
               << "|" << u.reflection << "\n";
        }
    }
    return ss.str();
}

} // namespace Metamorphosis
