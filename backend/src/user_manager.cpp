#include "user_manager.h"
#include <iostream>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

namespace Metamorphosis {

UserManager::UserManager(std::shared_ptr<FileStorage> storage)
    : storage_(storage ? storage : std::make_shared<FileStorage>()),
      sessionManager_(std::make_unique<SessionManager>()) {
    initializeNextUserId();
}

void UserManager::initializeNextUserId() {
    uint64_t highestId = 0;
    auto stats = storage_->getStats();
    // Scan stored users to find highest id
    auto usersDump = storage_->getSanitizedFileDump();
    // We can also let storage compute max ID or start from user count + 1
    highestId = static_cast<uint64_t>(stats.totalUsers);
    nextUserId_ = highestId + 1;
}

ValidationResult UserManager::validateUsername(const std::string& username) {
    return Auth::validateUsername(username);
}

ValidationResult UserManager::validatePassword(const std::string& password) {
    return Auth::validatePassword(password);
}

bool UserManager::usernameExists(const std::string& username) {
    return storage_->usernameExists(username);
}

bool UserManager::saveUser(const User& user) {
    return storage_->saveUser(user);
}

bool UserManager::verifyUser(const std::string& username, const std::string& password) {
    auto optUser = storage_->findUser(username);
    if (!optUser.has_value()) {
        return false;
    }
    return Auth::verifyPassword(optUser.value().passwordHash, password);
}

AuthResult UserManager::registerUser(const std::string& username, const std::string& password) {
    // 1. Backend Validation
    auto uVal = validateUsername(username);
    if (!uVal.isValid) {
        return {false, uVal.errorMessage, "", std::nullopt, 400};
    }

    auto pVal = validatePassword(password);
    if (!pVal.isValid) {
        return {false, pVal.errorMessage, "", std::nullopt, 400};
    }

    // 2. Duplicate Check
    if (usernameExists(username)) {
        return {false, "Username '" + username + "' is already registered. Please choose another username.", "", std::nullopt, 409};
    }

    // 3. Cryptographic Password Hashing (Argon2id)
    std::string encodedHash;
    try {
        encodedHash = Auth::hashPassword(password);
    } catch (const std::exception& e) {
        std::cerr << "[UserManager] Hashing exception: " << e.what() << std::endl;
        return {false, "Internal cryptographic error while securing credentials.", "", std::nullopt, 500};
    }

    // 4. Construct persistent user record
    auto now = std::chrono::system_clock::now();
    std::time_t tt = std::chrono::system_clock::to_time_t(now);
    std::tm gmt{};
    gmtime_r(&tt, &gmt);
    std::ostringstream ss;
    ss << std::put_time(&gmt, "%Y-%m-%dT%H:%M:%SZ");
    std::string nowIso = ss.str();

    User newUser;
    newUser.id = nextUserId_++;
    newUser.username = username;
    newUser.passwordHash = encodedHash;
    newUser.createdAt = nowIso;
    newUser.lastLogin = "Never";
    newUser.transformationStage = 1; // Chrysalis stage
    newUser.reflection = "A journey of metamorphosis begins within.";

    // 5. Persistent Storage Save
    bool saved = saveUser(newUser);
    if (!saved) {
        return {false, "Failed to persist user credentials to storage file. Check file permissions.", "", std::nullopt, 500};
    }

    // Sanitize user (strip password hash before returning)
    newUser.passwordHash = "";

    return {true, "Registration successful! Welcome to Metamorphosis.", "", newUser, 201};
}

AuthResult UserManager::loginUser(const std::string& username, const std::string& password) {
    // 1. Input Validation
    if (username.empty() || password.empty()) {
        return {false, "Both username and password are required.", "", std::nullopt, 400};
    }

    // 2. Lookup User
    auto optUser = storage_->findUser(username);
    if (!optUser.has_value()) {
        // Return generic error message to prevent username enumeration
        return {false, "Invalid username or password.", "", std::nullopt, 401};
    }

    auto user = optUser.value();

    // 3. Verify Password against stored Argon2id hash
    bool verified = Auth::verifyPassword(user.passwordHash, password);
    if (!verified) {
        return {false, "Invalid username or password.", "", std::nullopt, 401};
    }

    // 4. Update last login timestamp
    auto now = std::chrono::system_clock::now();
    std::time_t tt = std::chrono::system_clock::to_time_t(now);
    std::tm gmt{};
    gmtime_r(&tt, &gmt);
    std::ostringstream ss;
    ss << std::put_time(&gmt, "%Y-%m-%dT%H:%M:%SZ");
    user.lastLogin = ss.str();
    storage_->updateUser(user);

    // 5. Create Authenticated Session Token
    std::string sessionToken = sessionManager_->createSession(user.username);

    // Sanitize user object (never return password hash)
    user.passwordHash = "";

    return {true, "Authentication successful.", sessionToken, user, 200};
}

bool UserManager::logoutUser(const std::string& token) {
    if (token.empty()) {
        return false;
    }
    return sessionManager_->invalidateSession(token);
}

std::optional<User> UserManager::authenticateSession(const std::string& token) {
    if (token.empty()) {
        return std::nullopt;
    }
    auto optUsername = sessionManager_->getUsernameForToken(token);
    if (!optUsername.has_value()) {
        return std::nullopt;
    }
    auto optUser = storage_->findUser(optUsername.value());
    if (!optUser.has_value()) {
        return std::nullopt;
    }
    auto user = optUser.value();
    user.passwordHash = ""; // Sanitize
    return user;
}

bool UserManager::evolveStage(const std::string& token, int newStage, const std::string& reflection) {
    auto optUser = authenticateSession(token);
    if (!optUser.has_value()) {
        return false;
    }
    auto username = optUser.value().username;
    auto fullUser = storage_->findUser(username);
    if (!fullUser.has_value()) {
        return false;
    }
    auto user = fullUser.value();
    if (newStage >= 1 && newStage <= 4) {
        user.transformationStage = newStage;
    }
    if (!reflection.empty()) {
        user.reflection = reflection;
    }
    return storage_->updateUser(user);
}

size_t UserManager::getActiveSessionsCount() {
    return sessionManager_->getActiveSessionCount();
}

} // namespace Metamorphosis
