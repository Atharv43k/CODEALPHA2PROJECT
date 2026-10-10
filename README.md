# METAMORPHOSIS — C++ Login & Registration System

A full-stack, engineering-grade Authentication and Credential Management application inspired by personal transformation and evolution.

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, and Metamorphosis Theme (midnight purple, electric violet, cyan accents, and glowing geometric wing designs).
- **Backend**: ISO C++17 REST Server utilizing Argon2id cryptographic password hashing, standard file streams (`std::ifstream`, `std::ofstream`), and atomic persistence.
- **Integration**: Full-stack Node gateway running Express on port 3000 that seamlessly mounts Vite and forwards `/api/*` requests to the compiled C++ daemon.

---

## 1. System Architecture

```
Browser Client (React UI / Port 3000)
       │
       │ HTTP REST (JSON)
       ▼
Express Gateway & Vite Dev Server (port 3000)
       │
       │ Reverse Proxy (/api/*)
       ▼
Compiled C++ Binary: metamorphosis_server (port 8080)
       │
       ├─► Argon2id & OpenSSL Cryptography Engine
       ├─► UserManager Business Logic & Input Validation
       └─► FileStorage (std::ifstream / std::ofstream)
             │
             ▼
       Disk File: backend/data/users.dat
```

---

## 2. Core Assignment Features

| Feature | Implementation Details | Status |
|---|---|---|
| User Registration | Validates inputs, rejects duplicates, hashes password, saves to file | Verified |
| Duplicate Detection | Case-insensitive username lookup in `FileStorage::usernameExists()` | Verified |
| Input Validation | Username regex `^[a-zA-Z0-9_]+$`, password min 8 chars with letter & number | Verified |
| File Persistence | Written line-by-line with `std::ofstream`, persists across restarts | Verified |
| Password Hashing | Memory-hard Argon2id ($m=64\text{MB}, t=2$) + 128-bit CSPRNG salt | Verified |
| User Login | Compares hash using `argon2id_verify()`, generates 256-bit session token | Verified |
| Protected Dashboard | Accessible only after successful authentication with Bearer token | Verified |
| Logout Functionality | Invalidates token in `SessionManager`, returns user to sign-in screen | Verified |
| Error Resilience | Automatically initializes missing data files, handles atomic rewrites | Verified |
| Viva Inspector | Built-in UI modal displaying live C++ file dumps, source code, and Q&A | Verified |

---

## 3. Running the Project

### Running in Google AI Studio
The development server automatically starts both the Node/Express proxy and the C++ backend daemon:
```bash
npm run dev
```

### Running the C++ Backend Standalone
If executing outside this environment:
1. Ensure dependencies are installed:
   ```bash
   sudo apt-get update && sudo apt-get install -y g++ make cmake libssl-dev libargon2-dev
   ```
2. Compile and run:
   ```bash
   make -C backend
   ./backend/bin/metamorphosis_server 8080
   ```
3. Test endpoints with curl:
   ```bash
   # Register
   curl -X POST http://127.0.0.1:8080/api/register \
     -H "Content-Type: application/json" \
     -d '{"username":"Aurelia","password":"Password123!"}'

   # Login
   curl -X POST http://127.0.0.1:8080/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"Aurelia","password":"Password123!"}'
   ```

---

## 4. Viva Examination Preparation Guide

### Q1: How does duplicate username detection work?
`UserManager::registerUser()` calls `FileStorage::usernameExists()`. The file stream reads `users.dat` line by line, extracts the second token (username), and compares it case-insensitively using `std::transform` with `std::tolower`. If matched, registration aborts before any hash computation or disk write.

### Q2: Why is Argon2id chosen over SHA-256?
Plain SHA-256 is designed for fast message integrity; GPUs can compute billions of SHA-256 hashes per second. **Argon2id** is a memory-hard key derivation function that won the Password Hashing Competition (PHC). It forces attackers to allocate 64 MB of RAM per guess and integrates a 16-byte random salt generated via OpenSSL `RAND_bytes()`, defeating dictionary and rainbow table attacks.

### Q3: How is data corruption prevented during writes?
Two techniques:
1. `std::mutex` ensures thread safety under concurrent HTTP connections.
2. Atomic write strategy: data is written to `users.dat.tmp`, flushed, closed, and then replaced via POSIX atomic rename `std::filesystem::rename()`.

### Q4: How is the file formatted on disk?
Records are pipe-delimited text lines:
`ID|USERNAME|ARGON2ID_HASH|CREATED_AT|LAST_LOGIN|STAGE|REFLECTION`
Example:
`1|Aurelia_99|$argon2id$v=19$m=65536,t=2,p=1$...|2026-10-10T15:24:33Z|2026-10-10T15:24:42Z|1|A journey begins.`
