import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import { User as UserType } from '../types/auth';

interface LoginFormProps {
  onSuccess: (user: UserType, token: string) => void;
  onSwitchToRegister: () => void;
  onOpenVivaModal: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onOpenVivaModal,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = 'Please enter your username.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.login(username.trim(), password);
      if (response.success && response.user && response.token) {
        onSuccess(response.user, response.token);
      } else {
        setError(response.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the C++ authentication engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative p-7 sm:p-9 rounded-2xl bg-[#0f0d1b]/85 border border-violet-500/20 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
        {/* Card Header */}
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            Portal Access
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Sign In to Metamorphosis
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Verified by native C++ engine with Argon2id password protection
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium text-rose-200">Authentication Failed:</span>{' '}
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username Field */}
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                disabled={loading}
                placeholder="e.g. Aurelia_99"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141126]/90 border text-sm text-slate-100 placeholder:text-slate-500 transition-all outline-none ${
                  fieldErrors.username
                    ? 'border-rose-500/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-violet-500/25 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-rose-400 font-normal">{fieldErrors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-slate-300"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={loading}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#141126]/90 border text-sm text-slate-100 placeholder:text-slate-500 transition-all outline-none ${
                  fieldErrors.password
                    ? 'border-rose-500/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-violet-500/25 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-400 font-normal">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.99] transition-all shadow-lg shadow-violet-900/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying with C++ Core...</span>
              </>
            ) : (
              <>
                <span>Authenticate & Evolve</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-5 border-t border-violet-500/15 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <span className="text-slate-400">New to Metamorphosis?</span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors hover:underline cursor-pointer"
          >
            Create an Account →
          </button>
        </div>

        {/* Viva Quick Launcher */}
        <div className="mt-4 pt-3 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenVivaModal}
            className="inline-flex items-center gap-1.5 text-[11px] text-violet-300/80 hover:text-violet-200 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Viva Inspector & C++ Code Architecture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
