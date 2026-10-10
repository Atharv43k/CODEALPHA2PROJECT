#include <iostream>
#include <string>
#include <memory>
#include <cstdlib>
#include <csignal>

#include "httplib.h"
#include "nlohmann/json.hpp"

#include "user_manager.h"
#include "storage.h"
#include "auth.h"

using json = nlohmann::json;
using namespace Metamorphosis;

// Global server pointer for clean shutdown signal handling
static httplib::Server* g_svr = nullptr;

void signalHandler(int signum) {
    std::cout << "\n[Metamorphosis Backend] Intercepted signal " << signum << ". Stopping server gracefully..." << std::endl;
    if (g_svr) {
        g_svr->stop();
    }
}

// Helper to extract Bearer token from Authorization header or JSON
std::string extractToken(const httplib::Request& req) {
    if (req.has_header("Authorization")) {
        std::string auth = req.get_header_value("Authorization");
        if (auth.rfind("Bearer ", 0) == 0) {
            return auth.substr(7);
        }
    }
    // Also check X-Session-Token
    if (req.has_header("X-Session-Token")) {
        return req.get_header_value("X-Session-Token");
    }
    // Or parse JSON body if present
    try {
        if (!req.body.empty()) {
            json body = json::parse(req.body);
            if (body.contains("token") && body["token"].is_string()) {
                return body["token"].get<std::string>();
            }
        }
    } catch (...) {}
    return "";
}

// Attach CORS headers
void setCorsHeaders(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Token");
}

int main(int argc, char* argv[]) {
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);

    int port = 9090;
    if (const char* envPort = std::getenv("CPP_PORT")) {
        port = std::atoi(envPort);
    } else if (argc > 1) {
        port = std::atoi(argv[1]);
    }

    std::string dataPath = "backend/data/users.dat";
    if (const char* envData = std::getenv("USERS_FILE_PATH")) {
        dataPath = envData;
    }

    std::cout << "========================================================\n";
    std::cout << "      METAMORPHOSIS: C++ AUTHENTICATION BACKEND         \n";
    std::cout << "      Assignment: File-Based Credentials & Argon2id     \n";
    std::cout << "========================================================\n";
    std::cout << "[Init] Storage path: " << dataPath << std::endl;
    std::cout << "[Init] Target Port: " << port << std::endl;

    auto storage = std::make_shared<FileStorage>(dataPath);
    auto userManager = std::make_shared<UserManager>(storage);

    httplib::Server svr;
    g_svr = &svr;

    // Handle Pre-flight CORS OPTIONS requests
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        setCorsHeaders(res);
        res.status = 204;
    });

    // ----------------------------------------------------
    // GET /api/health
    // ----------------------------------------------------
    svr.Get("/api/health", [&storage, &userManager](const httplib::Request&, httplib::Response& res) {
        setCorsHeaders(res);
        auto stats = storage->getStats();
        json j = {
            {"status", "online"},
            {"engine", "Metamorphosis C++ Core v1.0"},
            {"language", "C++17"},
            {"hashingAlgorithm", "Argon2id (PHC Winner)"},
            {"storageBackend", "C++ File Handling (std::fstream)"},
            {"dataFile", stats.filePath},
            {"totalUsers", stats.totalUsers},
            {"activeSessions", userManager->getActiveSessionsCount()}
        };
        res.set_content(j.dump(), "application/json");
    });

    // ----------------------------------------------------
    // POST /api/register
    // ----------------------------------------------------
    svr.Post("/api/register", [&userManager](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        try {
            if (req.body.empty()) {
                json err = {{"success", false}, {"message", "Empty request payload."}};
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            json body = json::parse(req.body);
            std::string username = body.value("username", "");
            std::string password = body.value("password", "");

            AuthResult result = userManager->registerUser(username, password);

            json resp;
            resp["success"] = result.success;
            resp["message"] = result.message;
            if (result.user.has_value()) {
                const auto& u = result.user.value();
                resp["user"] = {
                    {"id", u.id},
                    {"username", u.username},
                    {"createdAt", u.createdAt},
                    {"lastLogin", u.lastLogin},
                    {"transformationStage", u.transformationStage},
                    {"reflection", u.reflection}
                };
            }

            res.status = result.statusCode;
            res.set_content(resp.dump(), "application/json");
        } catch (const json::parse_error& e) {
            json err = {{"success", false}, {"message", "Malformed JSON request."}};
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        } catch (const std::exception& e) {
            json err = {{"success", false}, {"message", std::string("Internal server error: ") + e.what()}};
            res.status = 500;
            res.set_content(err.dump(), "application/json");
        }
    });

    // ----------------------------------------------------
    // POST /api/login
    // ----------------------------------------------------
    svr.Post("/api/login", [&userManager](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        try {
            if (req.body.empty()) {
                json err = {{"success", false}, {"message", "Empty request payload."}};
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            json body = json::parse(req.body);
            std::string username = body.value("username", "");
            std::string password = body.value("password", "");

            AuthResult result = userManager->loginUser(username, password);

            json resp;
            resp["success"] = result.success;
            resp["message"] = result.message;
            if (result.success) {
                resp["token"] = result.token;
                if (result.user.has_value()) {
                    const auto& u = result.user.value();
                    resp["user"] = {
                        {"id", u.id},
                        {"username", u.username},
                        {"createdAt", u.createdAt},
                        {"lastLogin", u.lastLogin},
                        {"transformationStage", u.transformationStage},
                        {"reflection", u.reflection}
                    };
                }
            }

            res.status = result.statusCode;
            res.set_content(resp.dump(), "application/json");
        } catch (const json::parse_error& e) {
            json err = {{"success", false}, {"message", "Malformed JSON request."}};
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        } catch (const std::exception& e) {
            json err = {{"success", false}, {"message", std::string("Internal server error: ") + e.what()}};
            res.status = 500;
            res.set_content(err.dump(), "application/json");
        }
    });

    // ----------------------------------------------------
    // POST /api/logout
    // ----------------------------------------------------
    svr.Post("/api/logout", [&userManager](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        std::string token = extractToken(req);
        bool loggedOut = userManager->logoutUser(token);

        json resp;
        resp["success"] = true;
        resp["message"] = loggedOut ? "Logged out successfully. Session revoked." : "No active session to terminate.";
        res.status = 200;
        res.set_content(resp.dump(), "application/json");
    });

    // ----------------------------------------------------
    // GET /api/me (Protected Dashboard Endpoint)
    // ----------------------------------------------------
    svr.Get("/api/me", [&userManager](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        std::string token = extractToken(req);
        auto optUser = userManager->authenticateSession(token);

        if (!optUser.has_value()) {
            json err = {
                {"success", false},
                {"message", "Unauthorized. Invalid or expired session token. Please log in."}
            };
            res.status = 401;
            res.set_content(err.dump(), "application/json");
            return;
        }

        const auto& u = optUser.value();
        json resp;
        resp["success"] = true;
        resp["user"] = {
            {"id", u.id},
            {"username", u.username},
            {"createdAt", u.createdAt},
            {"lastLogin", u.lastLogin},
            {"transformationStage", u.transformationStage},
            {"reflection", u.reflection}
        };
        res.status = 200;
        res.set_content(resp.dump(), "application/json");
    });

    // ----------------------------------------------------
    // POST /api/user/evolve (Protected Transformation Upgrade)
    // ----------------------------------------------------
    svr.Post("/api/user/evolve", [&userManager](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        std::string token = extractToken(req);
        if (token.empty()) {
            res.status = 401;
            json err = {{"success", false}, {"message", "Unauthorized."}};
            res.set_content(err.dump(), "application/json");
            return;
        }

        try {
            json body = json::parse(req.body);
            int newStage = body.value("stage", 1);
            std::string reflection = body.value("reflection", "");

            bool ok = userManager->evolveStage(token, newStage, reflection);
            if (!ok) {
                res.status = 400;
                json err = {{"success", false}, {"message", "Failed to update metamorphosis stage."}};
                res.set_content(err.dump(), "application/json");
                return;
            }

            auto updatedUser = userManager->authenticateSession(token);
            json resp;
            resp["success"] = true;
            resp["message"] = "Metamorphosis stage evolved successfully in persistent storage.";
            if (updatedUser.has_value()) {
                const auto& u = updatedUser.value();
                resp["user"] = {
                    {"id", u.id},
                    {"username", u.username},
                    {"createdAt", u.createdAt},
                    {"lastLogin", u.lastLogin},
                    {"transformationStage", u.transformationStage},
                    {"reflection", u.reflection}
                };
            }
            res.status = 200;
            res.set_content(resp.dump(), "application/json");
        } catch (...) {
            res.status = 400;
            json err = {{"success", false}, {"message", "Invalid evolution payload."}};
            res.set_content(err.dump(), "application/json");
        }
    });

    // ----------------------------------------------------
    // GET /api/viva/info (Viva Prep & Examiner Diagnostics)
    // ----------------------------------------------------
    svr.Get("/api/viva/info", [&storage, &userManager](const httplib::Request&, httplib::Response& res) {
        setCorsHeaders(res);
        auto stats = storage->getStats();
        json j = {
            {"project", "METAMORPHOSIS Authentication System"},
            {"language", "ISO C++17"},
            {"security", {
                {"hashingAlgorithm", "Argon2id (RFC 9106 / PHC Standard)"},
                {"memoryCostKiB", 65536},
                {"iterations", 2},
                {"parallelism", 1},
                {"saltSource", "OpenSSL RAND_bytes (128-bit CSPRNG)"},
                {"timingAttackProtection", "argon2id_verify constant-time buffer comparison"},
                {"plaintextStored", false}
            }},
            {"storage", {
                {"mechanism", "C++ File Handling (std::ifstream / std::ofstream)"},
                {"format", "Structured Delimited Record (ID|Username|Argon2Hash|Dates|Stage|Reflection)"},
                {"concurrencyControl", "std::mutex thread synchronization"},
                {"atomicity", "Temporary file write and atomic filesystem rename"},
                {"filePath", stats.filePath},
                {"fileSizeBytes", stats.fileSizeBytes},
                {"lastModified", stats.lastModified},
                {"totalUsers", stats.totalUsers}
            }},
            {"keyCppConcepts", {
                "Object-Oriented Programming (Encapsulation, Classes: UserManager, FileStorage, SessionManager)",
                "Standard File Streams (std::ifstream, std::ofstream, std::fstream, std::getline)",
                "Filesystem Library (std::filesystem for file existence, sizes, atomic renames)",
                "Concurrency & Multi-threading (std::mutex, std::lock_guard, thread-safe session handling)",
                "Modern C++ Standards (std::optional, smart pointers std::shared_ptr, lambda closures)",
                "Cryptographic Systems Programming (Integration with C/C++ native libraries: libargon2, OpenSSL)",
                "Defensive Programming (Duplicate username checking, input regex validation, empty file fallback)"
            }}
        };
        res.set_content(j.dump(), "application/json");
    });

    // ----------------------------------------------------
    // GET /api/viva/file-preview (Examiner Persistent Disk View)
    // ----------------------------------------------------
    svr.Get("/api/viva/file-preview", [&storage](const httplib::Request&, httplib::Response& res) {
        setCorsHeaders(res);
        std::string raw = storage->getSanitizedFileDump();
        auto stats = storage->getStats();
        json j = {
            {"filePath", stats.filePath},
            {"totalUsers", stats.totalUsers},
            {"fileSizeBytes", stats.fileSizeBytes},
            {"lastModified", stats.lastModified},
            {"content", raw}
        };
        res.set_content(j.dump(), "application/json");
    });

    std::cout << "[Ready] Metamorphosis C++ HTTP Server listening on 0.0.0.0:" << port << "...\n";
    svr.listen("0.0.0.0", port);

    std::cout << "[Shutdown] C++ Server stopped cleanly.\n";
    return 0;
}
