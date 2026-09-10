import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, Database, Shield } from 'lucide-react';
import { signInUser, signUpUser, signInWithGoogle, isSupabaseConfigured } from '../lib/supabase';
import { useMusicPlayer } from '../context/PlayerContext';
import { AuthRateLimitHelp } from './AuthRateLimitHelp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfig: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenConfig,
}) => {
  const { setCurrentUser, refreshUserData } = useMusicPlayer();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasSupabase = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await signInUser(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          setCurrentUser(res.user);
          await refreshUserData();
          onClose();
        }
      } else {
        const res = await signUpUser(email, password, name);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          setCurrentUser(res.user);
          await refreshUserData();
          if (res.message) {
            setSuccessMsg(res.message);
          } else {
            onClose();
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    const demoEmail = 'music.lover@example.com';
    const res = await signInUser(demoEmail, 'demopassword123');
    if (res.user) {
      setCurrentUser(res.user);
      await refreshUserData();
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="auth-modal"
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switchers: Login vs Register */}
        <div className="flex bg-zinc-900 p-1 rounded-xl mb-6 border border-zinc-800">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === 'login'
                ? 'bg-zinc-800 text-emerald-400 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === 'register'
                ? 'bg-zinc-800 text-emerald-400 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-zinc-100">
            {mode === 'login' ? 'Welcome back to Aura' : 'Join Aura Music'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {hasSupabase
              ? 'Synced with your Supabase database'
              : 'Sign in to sync your playlists and liked tracks'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4">
            <div className="p-3 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-xs">
              {errorMsg}
            </div>
            {errorMsg.toLowerCase().includes('rate limit') && (
              <div className="mt-3">
                <AuthRateLimitHelp
                  onSwitchToLogin={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  onUseDemo={handleDemoLogin}
                />
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Your Name
              </label>
              <input
                id="input-auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Taylor"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              id="input-auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              id="input-auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase tracking-wider">
            Quick options
          </span>
        </div>

        {/* Login with Google Button */}
        <button
          id="btn-auth-google"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-medium py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2.5 mb-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Login with Google</span>
        </button>

        {/* Demo Login Button */}
        <button
          id="btn-auth-demo"
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-medium py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Demo Sign In (1-Click)</span>
        </button>

        {/* Supabase credentials setup trigger */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenConfig();
            }}
            className="text-xs text-zinc-500 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <Database className="w-3 h-3" />
            <span>Configure Supabase Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
