import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  FileCode,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  Database,
  Lock,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { VivaInfoResponse, FilePreviewResponse } from '../types/auth';

interface VivaInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaInspectorModal: React.FC<VivaInspectorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'viva' | 'file' | 'code' | 'architecture'>('viva');
  const [vivaInfo, setVivaInfo] = useState<VivaInfoResponse | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCodeFile, setSelectedCodeFile] = useState<'storage' | 'auth' | 'userManager' | 'main'>('storage');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [info, preview] = await Promise.all([
        apiClient.getVivaInfo(),
        apiClient.getFilePreview(),
      ]);
      setVivaInfo(info);
      setFilePreview(preview);
    } catch (err) {
      console.error('Failed to load viva inspector data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl bg-[#0d0b1a] border border-violet-500/30 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-violet-500/20 bg-[#120f24] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Viva Defense & Architecture Console
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-emerald-400 font-medium">Live C++ Engine</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Metamorphosis C++ Assignment Inspector
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-violet-900/30 transition-colors cursor-pointer"
              title="Refresh live data from C++ storage"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-violet-900/30 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#0f0d1e] border-b border-violet-500/15 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('viva')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'viva'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-violet-950/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Viva Q&A Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'file'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-violet-950/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Live users.dat File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-violet-950/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>C++ Source Files</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-violet-950/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Concepts</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VIVA QUESTIONS & MODEL ANSWERS */}
          {activeTab === 'viva' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/25">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Viva Defense Preparation Cheat Sheet</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Concise, technically precise answers prepared for engineering examiners.
                </p>
              </div>

              <div className="space-y-4">
                {/* Q1 */}
                <div className="p-4 rounded-xl bg-[#131026] border border-violet-500/20">
                  <h4 className="text-xs font-bold text-cyan-300">
                    Q1: How does duplicate username detection work in C++?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong className="text-white">Answer:</strong> Before writing any new user, the backend executes <code className="text-violet-300 font-mono">FileStorage::usernameExists()</code>. It opens the persistent file with <code className="text-violet-300 font-mono">std::ifstream</code> and reads line by line using <code className="text-violet-300 font-mono">std::getline()</code>. Each line is tokenized, and the username is normalized to lowercase for comparison. If a match is found, registration is rejected immediately with HTTP 409 Conflict.
                  </p>
                </div>

                {/* Q2 */}
                <div className="p-4 rounded-xl bg-[#131026] border border-violet-500/20">
                  <h4 className="text-xs font-bold text-cyan-300">
                    Q2: Why use Argon2id instead of plain SHA-256 or MD5?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong className="text-white">Answer:</strong> SHA-256 and MD5 are general-purpose hashes engineered for maximum speed, enabling attackers to compute billions of guesses per second with GPUs or ASICs. In contrast, <strong>Argon2id</strong> (winner of the Password Hashing Competition) is a memory-hard key derivation function. It requires configured memory (64 MiB), multiple iterations, and a unique 128-bit CSPRNG salt generated via OpenSSL <code className="text-violet-300 font-mono">RAND_bytes()</code>, rendering hardware brute-force attacks infeasible.
                  </p>
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-xl bg-[#131026] border border-violet-500/20">
                  <h4 className="text-xs font-bold text-cyan-300">
                    Q3: How do C++ file streams guarantee persistence across restarts?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong className="text-white">Answer:</strong> Data is written to non-volatile disk storage at <code className="text-violet-300 font-mono">backend/data/users.dat</code> using <code className="text-violet-300 font-mono">std::ofstream</code>. When the process restarts or terminates, the OS flushes and closes the file. On next startup, <code className="text-violet-300 font-mono">ensureStorageExists()</code> verifies file existence via <code className="text-violet-300 font-mono">std::filesystem::exists()</code> and restores the full record set into memory.
                  </p>
                </div>

                {/* Q4 */}
                <div className="p-4 rounded-xl bg-[#131026] border border-violet-500/20">
                  <h4 className="text-xs font-bold text-cyan-300">
                    Q4: How does the backend prevent data corruption during simultaneous writes?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong className="text-white">Answer:</strong> We employ a two-layer safety mechanism: First, concurrency is synchronized using <code className="text-violet-300 font-mono">std::mutex</code> and RAII-based <code className="text-violet-300 font-mono">std::lock_guard</code> to serialize file access. Second, writes are executed atomically: records are written to a temporary file (<code className="text-violet-300 font-mono">users.dat.tmp</code>), flushed, and renamed into place via <code className="text-violet-300 font-mono">std::filesystem::rename()</code>.
                  </p>
                </div>

                {/* Q5 */}
                <div className="p-4 rounded-xl bg-[#131026] border border-violet-500/20">
                  <h4 className="text-xs font-bold text-cyan-300">
                    Q5: How does the frontend communicate with the C++ backend?
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    <strong className="text-white">Answer:</strong> The C++ server runs an embedded multi-threaded HTTP server (<code className="text-violet-300 font-mono">cpp-httplib</code>) on port 8080. The modern frontend transmits JSON payloads (<code className="text-violet-300 font-mono">fetch()</code>). The C++ backend parses JSON with <code className="text-violet-300 font-mono">nlohmann::json</code>, executes verification, and returns standard HTTP status codes and responses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE USERS.DAT FILE PREVIEW */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#120f26] border border-violet-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">File Path: </span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {filePreview?.filePath || 'backend/data/users.dat'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <span>Total Users: <strong className="text-white">{filePreview?.totalUsers ?? 0}</strong></span>
                  <span>Size: <strong className="text-white">{filePreview?.fileSizeBytes ?? 0} bytes</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090812] border border-violet-500/20 font-mono text-xs overflow-x-auto text-slate-200">
                <div className="text-[11px] text-cyan-400/80 mb-2 border-b border-violet-500/20 pb-1.5">
                  // Live on-disk content of backend/data/users.dat (Password hashes partially masked for defense display)
                </div>
                <pre className="whitespace-pre text-slate-300 leading-relaxed">
                  {filePreview?.content || 'No records in file yet or file is initializing.'}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-violet-950/25 border border-violet-500/15 text-xs text-slate-400">
                <strong className="text-slate-200">Record Schema: </strong>
                <code>ID | USERNAME | ARGON2ID_HASH | CREATED_AT | LAST_LOGIN | STAGE | REFLECTION</code>
              </div>
            </div>
          )}

          {/* TAB 3: C++ SOURCE CODE BROWSER */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCodeFile('storage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedCodeFile === 'storage'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-[#120f24]'
                  }`}
                >
                  storage.cpp (File Handling)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCodeFile('auth')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedCodeFile === 'auth'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-[#120f24]'
                  }`}
                >
                  auth.cpp (Argon2id & Cryptography)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCodeFile('userManager')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedCodeFile === 'userManager'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-[#120f24]'
                  }`}
                >
                  user_manager.cpp (Business Logic)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCodeFile('main')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedCodeFile === 'main'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 bg-[#120f24]'
                  }`}
                >
                  main.cpp (HTTP Endpoints)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080712] border border-violet-500/25 font-mono text-xs overflow-x-auto max-h-[380px]">
                {selectedCodeFile === 'storage' && (
                  <pre className="text-slate-300">
{`// storage.cpp - C++ File Handling & Atomic Persistence
bool FileStorage::saveUser(const User& user) {
    std::lock_guard<std::mutex> lock(fileMutex_);
    std::string lowerTarget = toLower(user.username);
    auto users = readAllUsersUnlocked();

    // Prevent duplicate usernames
    for (const auto& u : users) {
        if (toLower(u.username) == lowerTarget) return false;
    }

    users.push_back(user);
    return writeAllUsersUnlocked(users);
}

bool FileStorage::writeAllUsersUnlocked(const std::vector<User>& users) {
    std::string tempPath = filePath_ + ".tmp";
    std::ofstream out(tempPath, std::ios::out | std::ios::trunc);
    if (!out.is_open()) return false;

    out << "# METAMORPHOSIS SECURE USER REPOSITORY v1.0\\n";
    for (const auto& user : users) {
        out << serializeUser(user) << "\\n";
    }
    out.close();

    // Atomic filesystem replacement guarantees integrity
    std::error_code ec;
    std::filesystem::rename(tempPath, filePath_, ec);
    return !ec;
}`}
                  </pre>
                )}

                {selectedCodeFile === 'auth' && (
                  <pre className="text-slate-300">
{`// auth.cpp - Cryptographic Password Hashing via Argon2id
std::string Auth::hashPassword(const std::string& password) {
    std::string salt = generateSalt(16); // 128-bit OpenSSL RAND_bytes

    uint32_t t_cost = 2;        // 2 iterations
    uint32_t m_cost = 65536;    // 64 MiB RAM
    uint32_t parallelism = 1;   // 1 thread
    char encoded[256];

    int result = argon2id_hash_encoded(
        t_cost, m_cost, parallelism,
        password.data(), password.length(),
        salt.data(), salt.length(),
        32, encoded, sizeof(encoded)
    );

    if (result != ARGON2_OK) throw std::runtime_error("Argon2id failed");
    return std::string(encoded);
}

bool Auth::verifyPassword(const std::string& encodedHash, const std::string& password) {
    if (encodedHash.empty() || password.empty()) return false;
    return (argon2id_verify(encodedHash.c_str(), password.data(), password.length()) == ARGON2_OK);
}`}
                  </pre>
                )}

                {selectedCodeFile === 'userManager' && (
                  <pre className="text-slate-300">
{`// user_manager.cpp - Registration & Verification Pipeline
AuthResult UserManager::registerUser(const std::string& username, const std::string& password) {
    auto uVal = validateUsername(username);
    if (!uVal.isValid) return {false, uVal.errorMessage, "", std::nullopt, 400};

    auto pVal = validatePassword(password);
    if (!pVal.isValid) return {false, pVal.errorMessage, "", std::nullopt, 400};

    if (usernameExists(username)) {
        return {false, "Username already registered.", "", std::nullopt, 409};
    }

    std::string encodedHash = Auth::hashPassword(password);
    User newUser{nextUserId_++, username, encodedHash, nowIso, "Never", 1, ""};

    if (!saveUser(newUser)) return {false, "File write failure.", "", std::nullopt, 500};
    return {true, "Registration successful!", "", newUser, 201};
}`}
                  </pre>
                )}

                {selectedCodeFile === 'main' && (
                  <pre className="text-slate-300">
{`// main.cpp - Embedded C++ HTTP REST API
svr.Post("/api/register", [&userManager](const httplib::Request& req, httplib::Response& res) {
    json body = json::parse(req.body);
    AuthResult result = userManager->registerUser(body["username"], body["password"]);
    res.status = result.statusCode;
    res.set_content(resp.dump(), "application/json");
});

svr.Post("/api/login", [&userManager](const httplib::Request& req, httplib::Response& res) {
    json body = json::parse(req.body);
    AuthResult result = userManager->loginUser(body["username"], body["password"]);
    res.status = result.statusCode;
    res.set_content(resp.dump(), "application/json");
});`}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE & CHECKLIST */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#120f26] border border-violet-500/20">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                  Assignment Compliance Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>User registration (username & password)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Duplicate username detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Input validation (empty & rule enforcement)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>C++ persistent file handling (std::fstream)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Argon2id cryptographic password hashing</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Login & password hash verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Protected post-auth Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Session logout & revocation</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#131026] border border-violet-500/20 text-xs space-y-2">
                <h4 className="font-bold text-white">How to Compile & Run Standalone Outside AI Studio:</h4>
                <div className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-cyan-300 space-y-1">
                  <div># 1. Install prerequisites (Debian/Ubuntu)</div>
                  <div className="text-slate-300">sudo apt update && sudo apt install -y g++ make cmake libssl-dev libargon2-dev</div>
                  <div className="mt-2 text-cyan-300"># 2. Build and launch backend</div>
                  <div className="text-slate-300">cd metamorphosis/backend && make && ./bin/metamorphosis_server</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-violet-500/20 bg-[#100e21] flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-400">
            Engineered for Academic Viva & C++ Systems Demonstration
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-violet-700/60 hover:bg-violet-600 text-white font-medium transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
