#include "auth.h"
#include <argon2.h>
#include <openssl/rand.h>
#include <iomanip>
#include <sstream>
#include <regex>
#include <cctype>

namespace Metamorphosis {

ValidationResult Auth::validateUsername(const std::string& username) {
    if (username.empty()) {
        return {false, "Username cannot be empty."};
    }
    if (username.length() < 3) {
        return {false, "Username must be at least 3 characters long."};
    }
    if (username.length() > 24) {
        return {false, "Username cannot exceed 24 characters."};
    }
    // Only allow alphanumeric characters and underscores
    static const std::regex validPattern("^[a-zA-Z0-9_]+$");
    if (!std::regex_match(username, validPattern)) {
        return {false, "Username can only contain letters, numbers, and underscores."};
    }
    return {true, ""};
}

ValidationResult Auth::validatePassword(const std::string& password) {
    if (password.empty()) {
        return {false, "Password cannot be empty."};
    }
    if (password.length() < 8) {
        return {false, "Password must be at least 8 characters long."};
    }
    if (password.length() > 64) {
        return {false, "Password cannot exceed 64 characters."};
    }

    bool hasUpper = false;
    bool hasLower = false;
    bool hasDigit = false;
    for (char c : password) {
        if (std::isupper(static_cast<unsigned char>(c))) hasUpper = true;
        if (std::islower(static_cast<unsigned char>(c))) hasLower = true;
        if (std::isdigit(static_cast<unsigned char>(c))) hasDigit = true;
    }

    if (!hasLower && !hasUpper) {
        return {false, "Password must contain at least one letter."};
    }
    if (!hasDigit) {
        return {false, "Password must contain at least one number."};
    }

    return {true, ""};
}

std::string Auth::generateSalt(size_t byteCount) {
    std::vector<unsigned char> salt(byteCount);
    if (RAND_bytes(salt.data(), static_cast<int>(byteCount)) != 1) {
        // Fallback salt in unlikely case of RAND_bytes failure
        return "metamorphosis_salt_fallback_16b";
    }
    std::ostringstream oss;
    for (unsigned char b : salt) {
        oss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(b);
    }
    return oss.str();
}

std::string Auth::hashPassword(const std::string& password) {
    // Generate 16 bytes of cryptographically secure random salt
    std::string salt = generateSalt(16);

    uint32_t t_cost = 2;            // 2 iterations
    uint32_t m_cost = 65536;        // 64 MiB memory
    uint32_t parallelism = 1;       // 1 thread
    size_t hash_len = 32;           // 32-byte digest

    char encoded[256];
    int result = argon2id_hash_encoded(
        t_cost,
        m_cost,
        parallelism,
        password.data(),
        password.length(),
        salt.data(),
        salt.length(),
        hash_len,
        encoded,
        sizeof(encoded)
    );

    if (result != ARGON2_OK) {
        throw std::runtime_error(std::string("Argon2id hashing failed: ") + argon2_error_message(result));
    }

    return std::string(encoded);
}

bool Auth::verifyPassword(const std::string& encodedHash, const std::string& password) {
    if (encodedHash.empty() || password.empty()) {
        return false;
    }
    int result = argon2id_verify(encodedHash.c_str(), password.data(), password.length());
    return (result == ARGON2_OK);
}

std::string Auth::generateSecureToken(size_t byteCount) {
    std::vector<unsigned char> token(byteCount);
    if (RAND_bytes(token.data(), static_cast<int>(byteCount)) != 1) {
        // Fallback pseudo-random token
        static uint64_t counter = 0;
        counter++;
        return "token_" + std::to_string(counter) + "_" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
    }
    std::ostringstream oss;
    for (unsigned char b : token) {
        oss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(b);
    }
    return oss.str();
}

SessionManager::SessionManager(std::chrono::seconds sessionDuration)
    : sessionDuration_(sessionDuration) {}

std::string SessionManager::createSession(const std::string& username) {
    std::lock_guard<std::mutex> lock(mutex_);
    cleanExpiredSessions();

    std::string token = Auth::generateSecureToken(32);
    auto now = std::chrono::system_clock::now();
    Session session{
        token,
        username,
        now,
        now + sessionDuration_
    };
    sessions_[token] = session;
    return token;
}

std::optional<std::string> SessionManager::getUsernameForToken(const std::string& token) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = sessions_.find(token);
    if (it == sessions_.end()) {
        return std::nullopt;
    }

    auto now = std::chrono::system_clock::now();
    if (now > it->second.expiresAt) {
        sessions_.erase(it);
        return std::nullopt;
    }

    return it->second.username;
}

bool SessionManager::invalidateSession(const std::string& token) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = sessions_.find(token);
    if (it != sessions_.end()) {
        sessions_.erase(it);
        return true;
    }
    return false;
}

void SessionManager::cleanExpiredSessions() {
    auto now = std::chrono::system_clock::now();
    for (auto it = sessions_.begin(); it != sessions_.end();) {
        if (now > it->second.expiresAt) {
            it = sessions_.erase(it);
        } else {
            ++it;
        }
    }
}

size_t SessionManager::getActiveSessionCount() {
    std::lock_guard<std::mutex> lock(mutex_);
    return sessions_.size();
}

} // namespace Metamorphosis
