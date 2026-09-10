-- ==========================================================
-- Supabase Schema & Migration for Aura Music
-- Tables: playlists, playlist_songs, liked_songs
-- ==========================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. playlists table
-- Stores user playlists with metadata
CREATE TABLE IF NOT EXISTS public.playlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. playlist_songs table
-- Stores songs added to playlists
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

-- 3. liked_songs table
-- Stores tracks liked (favorited) by users
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

-- 4. history table (user_id, video_id, title, artist, thumbnail, played_at)
-- Stores played tracks after 10+ seconds of playback
CREATE TABLE IF NOT EXISTS public.history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backward compatibility alias: listening_history
CREATE TABLE IF NOT EXISTS public.listening_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. last_session table
-- Stores last queue and current song to restore without autoplay
CREATE TABLE IF NOT EXISTS public.last_session (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_song JSONB,
  queue JSONB DEFAULT '[]'::jsonb,
  current_index INTEGER DEFAULT 0,
  current_time NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON public.playlists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_added_at ON public.playlist_songs(added_at ASC);
CREATE INDEX IF NOT EXISTS idx_liked_songs_user_id ON public.liked_songs(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_songs_liked_at ON public.liked_songs(liked_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON public.history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_played_at ON public.history(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user_video ON public.history(user_id, video_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.last_session ENABLE ROW LEVEL SECURITY;

-- Drop old policies to allow idempotent reruns
DROP POLICY IF EXISTS "Users can manage their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can view and edit their playlist songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "Users can manage their own liked songs" ON public.liked_songs;
DROP POLICY IF EXISTS "Users can manage their own history" ON public.history;
DROP POLICY IF EXISTS "Users can manage their own listening history" ON public.listening_history;
DROP POLICY IF EXISTS "Users can manage their own last session" ON public.last_session;

-- RLS Policies
CREATE POLICY "Users can manage their own playlists"
  ON public.playlists
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and edit their playlist songs"
  ON public.playlist_songs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE public.playlists.id = public.playlist_songs.playlist_id
      AND public.playlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE public.playlists.id = public.playlist_songs.playlist_id
      AND public.playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own liked songs"
  ON public.liked_songs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own history"
  ON public.history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own listening history"
  ON public.listening_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own last session"
  ON public.last_session
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
