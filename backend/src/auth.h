#ifndef METAMORPHOSIS_AUTH_H
#define METAMORPHOSIS_AUTH_H

#include <string>
#include <unordered_map>
#include <chrono>
#include <mutex>
#include <optional>

namespace Metamorphosis {

struct ValidationResult {
    bool isValid;
    std::string errorMessage;
};

struct Session {
    std::string token;
    std::string username;
    std::chrono::system_clock::time_point createdAt;
    std::chrono::system_clock::time_point expiresAt;
};

class Auth {
public:
    // Core Assignment Validation Functions
    static ValidationResult validateUsername(const std::string& username);
    static ValidationResult validatePassword(const std::string& password);

    // Cryptographic Password Hashing (Argon2id)
    static std::string hashPassword(const std::string& password);
    static bool verifyPassword(const std::string& encodedHash, const std::string& password);

    // Cryptographic Token & Salt Generation
    static std::string generateSecureToken(size_t byteCount = 32);
    static std::string generateSalt(size_t byteCount = 16);
};

class SessionManager {
public:
    SessionManager(std::chrono::seconds sessionDuration = std::chrono::hours(24));

    std::string createSession(const std::string& username);
    std::optional<std::string> getUsernameForToken(const std::string& token);
    bool invalidateSession(const std::string& token);
    void cleanExpiredSessions();
    size_t getActiveSessionCount();

private:
    std::unordered_map<std::string, Session> sessions_;
    std::mutex mutex_;
    std::chrono::seconds sessionDuration_;
};

} // namespace Metamorphosis

#endif // METAMORPHOSIS_AUTH_H
