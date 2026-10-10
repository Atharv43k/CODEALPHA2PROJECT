# METAMORPHOSIS — C++ Authentication Backend

This directory contains the core C++ backend for the **METAMORPHOSIS** Login and Registration System. It is engineered to satisfy all requirements of a university-level C++ systems programming assignment, implementing secure credential handling, input validation, duplicate checking, and file-based persistence.

---

## 1. Core Architecture

The backend is built in **ISO C++17** and organized modularly:

```
backend/
├── include/
│   ├── httplib.h           # Lightweight multi-threaded C++ HTTP/REST server
│   └── nlohmann/json.hpp   # Modern JSON for C++
├── src/
│   ├── auth.h              # Cryptographic functions, Argon2id, token generation
│   ├── auth.cpp            # Validation rules and Argon2id hash/verify implementation
│   ├── storage.h           # FileStorage class interface and User schema
│   ├── storage.cpp         # std::ifstream / std::ofstream persistence and atomic replacement
│   ├── user_manager.h      # Core assignment methods (registerUser, loginUser, etc.)
│   ├── user_manager.cpp    # Business logic, session management, duplicate check
│   └── main.cpp            # HTTP endpoints and CORS server entrypoint
├── data/
│   └── users.dat           # Persistent on-disk user repository
├── bin/
│   └── metamorphosis_server# Compiled standalone ELF binary
├── CMakeLists.txt          # Standard CMake build definition
└── Makefile                # Fast Make build script
```

---

## 2. Mandatory Assignment Functions Implemented

The assignment requirements are implemented across `UserManager` and `FileStorage`:

1. `registerUser(username, password)` — Validates input, prevents duplicates, hashes with Argon2id, and persists to disk.
2. `loginUser(username, password)` — Validates input, locates user record, verifies password hash, and issues session token.
3. `usernameExists(username)` — Scans storage file using lowercase case-insensitivity to prevent duplicate collisions.
4. `validateUsername(username)` — Enforces length (3-24 characters) and allowed character sets (`[a-zA-Z0-9_]`).
5. `validatePassword(password)` — Enforces minimum 8 characters, requiring at least one letter and one number.
6. `saveUser(user)` — Thread-safe atomic file writing with `std::ofstream`.
7. `verifyUser(username, password)` — Verifies credentials using `argon2id_verify()`.
8. `logoutUser(token)` — Revokes the active session token in memory.

---

## 3. Cryptographic Password Hashing: Argon2id

- **Algorithm**: Argon2id (Winner of the Password Hashing Competition, RFC 9106 standard).
- **Memory Cost**: 64 MiB ($65536 \text{ KiB}$) to defeat GPU and ASIC parallel brute-force attacks.
- **Time Cost**: 2 iterations.
- **Salt**: 16 bytes of cryptographically secure random bytes generated via OpenSSL `RAND_bytes()`.
- **Zero Plaintext**: Passwords are never written to disk or logs in plaintext.

---

## 4. Persistent File Handling

- Data file location: `backend/data/users.dat`.
- Format:
  ```
  ID|USERNAME|ARGON2ID_ENCODED_HASH|CREATED_AT|LAST_LOGIN|STAGE|REFLECTION
  ```
- **Concurrency Control**: Synchronized with `std::mutex` and `std::lock_guard` for thread safety.
- **Crash Resilience**: Writes to a temporary file (`users.dat.tmp`), closes, and renames atomically via `std::filesystem::rename()`.

---

## 5. Build and Execution Instructions

### Prerequisites (Linux / Debian / Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y g++ make cmake libssl-dev libargon2-dev
```

### Build with Make
```bash
cd backend
make
./bin/metamorphosis_server
```

### Build with CMake
```bash
cd backend
mkdir -p build && cd build
cmake ..
cmake --build .
../bin/metamorphosis_server
```

By default, the server listens on `0.0.0.0:8080`.
To specify a custom port:
```bash
CPP_PORT=9000 ./bin/metamorphosis_server
```
