#ifndef METAMORPHOSIS_USER_MANAGER_H
#define METAMORPHOSIS_USER_MANAGER_H

#include <string>
#include <memory>
#include <optional>
#include <atomic>
#include "auth.h"
#include "storage.h"

namespace Metamorphosis {

struct AuthResult {
    bool success;
    std::string message;
    std::string token;
    std::optional<User> user;
    int statusCode; // HTTP status: 200, 400, 401, 409, 500
};

class UserManager {
public:
    explicit UserManager(std::shared_ptr<FileStorage> storage = nullptr);

    // ==========================================
    // Core Assignment Mandated Functions
    // ==========================================
    AuthResult registerUser(const std::string& username, const std::string& password);
    AuthResult loginUser(const std::string& username, const std::string& password);
    bool logoutUser(const std::string& token);

    bool usernameExists(const std::string& username);
    ValidationResult validateUsername(const std::string& username);
    ValidationResult validatePassword(const std::string& password);
    bool saveUser(const User& user);
    bool verifyUser(const std::string& username, const std::string& password);

    // ==========================================
    // Session & Dashboard State
    // ==========================================
    std::optional<User> authenticateSession(const std::string& token);
    bool evolveStage(const std::string& token, int newStage, const std::string& reflection);

    // ==========================================
    // Diagnostics & Viva Tools
    // ==========================================
    std::shared_ptr<FileStorage> getStorage() const { return storage_; }
    size_t getActiveSessionsCount();

private:
    std::shared_ptr<FileStorage> storage_;
    std::unique_ptr<SessionManager> sessionManager_;
    std::atomic<uint64_t> nextUserId_{1};

    void initializeNextUserId();
};

} // namespace Metamorphosis

#endif // METAMORPHOSIS_USER_MANAGER_H
