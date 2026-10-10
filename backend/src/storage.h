#ifndef METAMORPHOSIS_STORAGE_H
#define METAMORPHOSIS_STORAGE_H

#include <string>
#include <vector>
#include <optional>
#include <mutex>
#include <filesystem>

namespace Metamorphosis {

struct User {
    uint64_t id;
    std::string username;
    std::string passwordHash;
    std::string createdAt;
    std::string lastLogin;
    int transformationStage; // 1 to 4
    std::string reflection;
};

struct StorageStats {
    size_t totalUsers;
    std::string filePath;
    uintmax_t fileSizeBytes;
    std::string lastModified;
};

class FileStorage {
public:
    explicit FileStorage(const std::string& filePath = "backend/data/users.dat");

    // Core Assignment Requirements
    bool usernameExists(const std::string& username);
    bool saveUser(const User& user);
    std::optional<User> findUser(const std::string& username);
    bool updateUser(const User& user);

    // Diagnostics & Viva Tools
    StorageStats getStats();
    std::string getSanitizedFileDump();
    size_t getUserCount();
    std::string getFilePath() const { return filePath_; }

    // File Handling & Integrity Check
    bool ensureStorageExists();

private:
    std::string filePath_;
    std::mutex fileMutex_;

    // Internal File Stream Helpers
    std::vector<User> readAllUsersUnlocked();
    bool writeAllUsersUnlocked(const std::vector<User>& users);
    static std::string serializeUser(const User& user);
    static std::optional<User> deserializeUser(const std::string& line);
    static std::string sanitizeField(const std::string& input);
    static std::string desanitizeField(const std::string& input);
    static std::string getCurrentTimestampIso();
};

} // namespace Metamorphosis

#endif // METAMORPHOSIS_STORAGE_H
