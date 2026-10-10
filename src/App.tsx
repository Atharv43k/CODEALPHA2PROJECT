import React, { useState, useEffect } from 'react';
import { ButterflyWingLogo } from './components/ButterflyWingLogo';
import { BackgroundWings } from './components/BackgroundWings';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { VivaInspectorModal } from './components/VivaInspectorModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { apiClient } from './api/client';
import { User } from './types/auth';
import { ShieldCheck, Cpu, Lock, Sparkles, Database, RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loadingSession, setLoadingSession] = useState(true);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [backendHealth, setBackendHealth] = useState<'online' | 'offline' | 'checking'>('checking');

  // Push notifications
  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check backend health and restore session
  const checkInitialState = async () => {
    setLoadingSession(true);
    try {
      const health = await apiClient.getHealth();
      if (health && health.status === 'online') {
        setBackendHealth('online');
      } else {
        setBackendHealth('offline');
      }
    } catch {
      setBackendHealth('offline');
    }

    const token = apiClient.getToken();
    if (token) {
      try {
        const meRes = await apiClient.getMe();
        if (meRes.success && meRes.user) {
          setCurrentUser(meRes.user);
        } else {
          apiClient.clearToken();
          setCurrentUser(null);
        }
      } catch {
        apiClient.clearToken();
        setCurrentUser(null);
      }
    }
    setLoadingSession(false);
  };

  useEffect(() => {
    checkInitialState();
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    addToast('success', 'Authentication Successful', `Welcome back, ${user.username}! Stage: ${user.transformationStage}`);
  };

  const handleRegisterSuccess = (user: User, message: string) => {
    addToast('success', 'Account Registered', `${message} Please sign in with your credentials.`);
    setAuthMode('login');
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      console.warn('Logout request finished with warning:', err);
    } finally {
      setCurrentUser(null);
      addToast('info', 'Logged Out', 'Your session has been terminated safely.');
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-cyan-200">
      <BackgroundWings />
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
      <VivaInspectorModal isOpen={isVivaModalOpen} onClose={() => setIsVivaModalOpen(false)} />

      {/* Main App Navigation Bar */}
      <header className="w-full border-b border-violet-500/15 bg-[#090714]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <ButterflyWingLogo size="sm" stage={currentUser ? currentUser.transformationStage : 4} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-sm sm:text-base text-white">
                  METAMORPHOSIS
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30">
                  C++ Core
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Transform. Evolve. Become.
              </p>
            </div>
          </div>

          {/* Engine Status & Viva Inspector CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend Engine Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-[#141028] border border-violet-500/20 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendHealth === 'checking'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span className="hidden md:inline font-mono">
                {backendHealth === 'online'
                  ? 'C++ Daemon: Active (Port 9090)'
                  : backendHealth === 'checking'
                  ? 'Checking C++...'
                  : 'C++ Offline'}
              </span>
              <span className="md:hidden font-mono">
                {backendHealth === 'online' ? 'C++ Active' : 'C++ Off'}
              </span>
            </div>

            {/* Viva Inspector Button */}
            <button
              type="button"
              onClick={() => setIsVivaModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-950/50"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Viva Inspector</span>
              <span className="sm:hidden">Viva</span>
            </button>
          </div>
        </div>
      </header>

      {/* Backend Offline Warning Banner */}
      {backendHealth === 'offline' && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-2.5 text-xs text-rose-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            C++ backend server is initializing or unreachable. Please verify server status in the Viva Inspector.
          </span>
          <button
            type="button"
            onClick={checkInitialState}
            className="ml-2 underline font-semibold hover:text-white cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Primary Application Content */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-8 sm:py-12">
        {loadingSession ? (
          <div className="flex flex-col items-center justify-center space-y-4 my-auto">
            <ButterflyWingLogo size="lg" animated stage={4} />
            <div className="text-xs text-cyan-300 font-mono flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Initializing Metamorphosis C++ Session...</span>
            </div>
          </div>
        ) : currentUser ? (
          /* Authenticated Dashboard View */
          <Dashboard
            user={currentUser}
            onLogout={handleLogout}
            onOpenVivaModal={() => setIsVivaModalOpen(true)}
            onUserUpdated={(updated) => setCurrentUser(updated)}
          />
        ) : (
          /* Unauthenticated Landing / Authentication View */
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Brand Panel: Philosophy & Engineering Architecture */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/50 text-violet-300 border border-violet-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Generation Authentication Architecture</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  METAMORPHOSIS
                </h1>
                <p className="text-lg sm:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 mt-2">
                  "Transform. Evolve. Become."
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                A software engineering authentication system exploring human metamorphosis
                and cryptographic durability. Built with a high-performance <strong>C++17</strong> backend,
                memory-hard <strong>Argon2id</strong> password derivation, and resilient file-based storage.
              </p>

              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="p-3.5 rounded-xl bg-[#0e0c1c]/90 border border-violet-500/20">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-cyan-400 flex items-center justify-center mb-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">Argon2id Security</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    PHC winner with 64MB memory cost & CSPRNG salt
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e0c1c]/90 border border-violet-500/20">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-cyan-400 flex items-center justify-center mb-2">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">C++ File Persistence</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Atomic file replace with std::fstream & std::mutex
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e0c1c]/90 border border-violet-500/20">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-cyan-400 flex items-center justify-center mb-2">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">Zero Fake Auth</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Direct communication with native C++ HTTP daemon
                  </div>
                </div>
              </div>

              {/* Viva Quick Launch Banner */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsVivaModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer group"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                  <span className="underline underline-offset-4">
                    Preparing for viva defense? Review C++ concepts & Q&A →
                  </span>
                </button>
              </div>
            </div>

            {/* Right Auth Panel: Switchable Login & Register */}
            <div className="lg:col-span-6 w-full flex flex-col items-center">
              {/* Form Switcher Segmented Control */}
              <div className="mb-4 p-1 rounded-xl bg-[#120f26]/90 border border-violet-500/25 flex items-center gap-1 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Active Form */}
              <div className="w-full">
                {authMode === 'login' ? (
                  <LoginForm
                    onSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setAuthMode('register')}
                    onOpenVivaModal={() => setIsVivaModalOpen(true)}
                  />
                ) : (
                  <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onSwitchToLogin={() => setAuthMode('login')}
                    onOpenVivaModal={() => setIsVivaModalOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-violet-500/10 bg-[#07060f]/90 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">METAMORPHOSIS</span> · Engineering C++ Authentication Assignment
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            <span>ISO C++17</span>
            <span>·</span>
            <span>Argon2id Memory-Hard Cryptography</span>
            <span>·</span>
            <span>Persistent std::fstream Repository</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
