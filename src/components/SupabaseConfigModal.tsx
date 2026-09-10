import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle,
  AlertCircle,
  Key,
  Globe,
  Copy,
  Check,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
} from '../lib/supabase';
import { useMusicPlayer } from '../context/PlayerContextNew';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { refreshUserData } = useMusicPlayer();
  const currentCreds = getSupabaseCredentials();

  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, anonKey);
    setIsSaved(true);
    await refreshUserData();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const sqlSchema = `-- Run this in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS public.playlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  playlist_id TEXT NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.liked_songs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT liked_songs_user_video_unique UNIQUE (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS public.history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.last_session (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_song JSONB,
  queue JSONB DEFAULT '[]'::jsonb,
  current_index INTEGER DEFAULT 0,
  current_time NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS & Policies
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.last_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own playlists" ON public.playlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage playlist songs" ON public.playlist_songs FOR ALL USING (EXISTS (SELECT 1 FROM public.playlists WHERE public.playlists.id = public.playlist_songs.playlist_id AND public.playlists.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.playlists WHERE public.playlists.id = public.playlist_songs.playlist_id AND public.playlists.user_id = auth.uid()));
CREATE POLICY "Users can manage liked songs" ON public.liked_songs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage history" ON public.history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage last session" ON public.last_session FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="supabase-config-modal"
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">
              Supabase Configuration
            </h2>
            <p className="text-xs text-zinc-400">
              Database for auth, playlists, liked tracks & history
            </p>
          </div>
        </div>

        {/* Current status pill */}
        <div
          className={`p-3 rounded-xl border my-4 flex items-center space-x-2.5 text-xs ${
            isConfigured
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}
        >
          {isConfigured ? (
            <>
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Supabase is connected. User data will sync to cloud tables.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Using local browser storage fallback. Enter your Supabase keys
                below to activate cloud sync!
              </span>
            </>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Supabase Project URL</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span>Supabase Anon Public Key</span>
            </label>
            <textarea
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved & Synchronized!</span>
              </>
            ) : (
              <span>Save & Connect Supabase</span>
            )}
          </button>
        </form>

        {/* Important Auth Tip */}
        <div className="mb-4 p-3 rounded-xl border border-blue-900/40 bg-blue-950/20 text-xs text-blue-300">
          <div className="font-semibold text-blue-200 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Tips Mencegah Error &quot;Email Rate Limit Exceeded&quot;</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Di Supabase Dashboard &rarr; <span className="text-white font-medium">Authentication</span> &rarr; <span className="text-white font-medium">Providers</span> &rarr; <span className="text-white font-medium">Email</span>, matikan / nonaktifkan switch <span className="text-amber-300 font-semibold">&quot;Confirm email&quot;</span>. Hal ini membuat registrasi akun langsung aktif seketika tanpa dibatasi kuota 3 email/jam gratis Supabase.
          </p>
        </div>

        {/* Recommended Supabase SQL Tables */}
        <div className="border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Recommended SQL Schema (Optional)
            </span>
            <button
              onClick={copySql}
              className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-400 font-mono overflow-x-auto max-h-36">
            {sqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
