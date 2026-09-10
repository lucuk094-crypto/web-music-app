import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Song, Playlist, UserProfile } from '../types';

// Keys for local storage fallback
const STORAGE_KEYS = {
  USER: 'aura_music_user',
  PLAYLISTS: 'aura_music_playlists',
  LIKED_SONGS: 'aura_music_liked_songs',
  HISTORY: 'aura_music_history',
  LAST_QUEUE: 'aura_music_last_queue',
  LAST_SESSION: 'aura_music_last_session',
  SUPABASE_CONFIG: 'aura_music_supabase_config',
};

// Retrieve config from env or local storage
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  // Vite exposes env vars via import.meta.env
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // Ignore JSON errors
  }

  return { url: envUrl, anonKey: envKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem(
    STORAGE_KEYS.SUPABASE_CONFIG,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
  );
}

// Client instance holder
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

// ==========================================
// User Authentication Helpers
// ==========================================

export async function getCurrentUser(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const {
        data: { session },
      } = await client.auth.getSession();
      if (session?.user) {
        let username = session.user.user_metadata?.username || session.user.user_metadata?.name;
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile?.username) {
            username = profile.username;
          }
        } catch {
          // If profiles query fails or table not yet created
        }

        return {
          id: session.user.id,
          email: session.user.email || '',
          name:
            username ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'User',
          avatarUrl: session.user.user_metadata?.avatar_url,
        };
      }
    } catch (e) {
      console.warn('Supabase getSession error:', e);
    }
  }

  // Fallback to local user
  try {
    const local = localStorage.getItem(STORAGE_KEYS.USER);
    if (local) return JSON.parse(local);
  } catch {}

  return null;
}

export async function signInUser(
  email: string,
  pass: string
): Promise<{ user: UserProfile | null; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        return {
          user: null,
          error:
            'Email belum dikonfirmasi. Di Supabase Dashboard (Authentication > Providers > Email), matikan opsi "Confirm email" agar akun bisa langsung aktif tanpa verifikasi email.',
        };
      }
      return { user: null, error: error.message };
    }
    if (data.user) {
      let username = data.user.user_metadata?.username || data.user.user_metadata?.name;
      try {
        const { data: profile } = await client
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .maybeSingle();
        if (profile?.username) {
          username = profile.username;
        } else {
          // Ensure profile row exists
          await client.from('profiles').upsert({
            id: data.user.id,
            username: username || email.split('@')[0],
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Profiles check error:', e);
      }

      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        name: username || email.split('@')[0],
      };
      return { user };
    }
  }

  // Local demo fallback
  const mockUser: UserProfile = {
    id: 'local-user-' + Math.random().toString(36).substring(2, 9),
    email,
    name: email.split('@')[0],
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
  return { user: mockUser };
}

export async function signUpUser(
  email: string,
  pass: string,
  name?: string
): Promise<{ user: UserProfile | null; error?: string; message?: string }> {
  const client = getSupabaseClient();
  const username = name?.trim() || email.split('@')[0];

  if (client) {
    const { data, error } = await client.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          username: username,
          name: username,
        },
      },
    });
    if (error) {
      const isRateLimit =
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('rate_limit') ||
        (error as any).status === 429;

      if (isRateLimit) {
        // Check if user was actually created and can sign in directly
        try {
          const directSignIn = await client.auth.signInWithPassword({
            email,
            password: pass,
          });
          if (directSignIn.data?.user) {
            const loggedInUser: UserProfile = {
              id: directSignIn.data.user.id,
              email: directSignIn.data.user.email || email,
              name: username,
            };
            return { user: loggedInUser };
          }
        } catch {
          // ignore
        }

        return {
          user: null,
          error:
            'email rate limit exceeded: Supabase membatasi email konfirmasi bawaan (3-4 email/jam). Solusi: Buka Supabase Dashboard > Authentication > Providers > Email, matikan opsi "Confirm email" agar pendaftaran akun langsung aktif tanpa kirim email.',
        };
      }
      return { user: null, error: error.message };
    }
    if (data.user) {
      // Create row in Supabase "profiles" table: (id, username, created_at)
      try {
        const { error: profileError } = await client
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: username,
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (profileError) {
          console.warn('Supabase profiles row insertion notice:', profileError.message);
        }
      } catch (profileErr) {
        console.warn('Profiles table insert caught error:', profileErr);
      }

      const user: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        name: username,
      };

      if (!data.session) {
        return {
          user,
          message: 'Account created! Please verify your email if required by Supabase, or sign in.',
        };
      }

      return { user };
    }
  }

  // Local fallback
  const mockUser: UserProfile = {
    id: 'local-user-' + Math.random().toString(36).substring(2, 9),
    email,
    name: username,
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
  return { user: mockUser };
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return {};
  }
  return {
    error: 'Supabase credentials are not configured yet. Please configure them in Settings.',
  };
}

export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch(() => {});
  }
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ==========================================
// Liked Songs Management
// Table: liked_songs (id, user_id, video_id, title, artist, thumbnail, duration, liked_at)
// ==========================================

export async function fetchLikedSongs(userId?: string): Promise<Song[]> {
  const client = getSupabaseClient();
  if (client && userId) {
    try {
      // First try ordering by liked_at (requested schema)
      const { data, error } = await client
        .from('liked_songs')
        .select('*')
        .eq('user_id', userId)
        .order('liked_at', { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          videoId: item.video_id,
          title: item.title,
          artist: item.artist || '',
          thumbnail: item.thumbnail || '',
          duration: item.duration || '3:30',
        }));
      } else if (error) {
        // Fallback in case created_at exists instead of liked_at
        const fallback = await client
          .from('liked_songs')
          .select('*')
          .eq('user_id', userId);
        if (!fallback.error && fallback.data) {
          return fallback.data.map((item: any) => ({
            videoId: item.video_id,
            title: item.title,
            artist: item.artist || '',
            thumbnail: item.thumbnail || '',
            duration: item.duration || '3:30',
          }));
        }
      }
    } catch (e) {
      console.warn('Supabase liked_songs fetch failed, using local storage:', e);
    }
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function toggleLikedSongDb(
  song: Song,
  userId?: string
): Promise<Song[]> {
  const current = await fetchLikedSongs(userId);
  const exists = current.some((s) => s.videoId === song.videoId);
  const updated = exists
    ? current.filter((s) => s.videoId !== song.videoId)
    : [song, ...current];

  // Save to local storage for instant optimistic UI
  localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(updated));

  // Sync to Supabase if configured & user is authenticated
  const client = getSupabaseClient();
  if (client && userId) {
    try {
      if (exists) {
        await client
          .from('liked_songs')
          .delete()
          .eq('user_id', userId)
          .eq('video_id', song.videoId);
      } else {
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'like-' + Date.now();
        const now = new Date().toISOString();
        const { error } = await client.from('liked_songs').insert({
          id,
          user_id: userId,
          video_id: song.videoId,
          title: song.title,
          artist: song.artist || '',
          thumbnail: song.thumbnail || '',
          duration: song.duration || '3:30',
          liked_at: now,
        });
        if (error) {
          // Retry with created_at if table had created_at
          await client.from('liked_songs').insert({
            id,
            user_id: userId,
            video_id: song.videoId,
            title: song.title,
            artist: song.artist || '',
            thumbnail: song.thumbnail || '',
            duration: song.duration || '3:30',
            created_at: now,
          });
        }
      }
    } catch (e) {
      console.warn('Supabase sync liked song failed:', e);
    }
  }

  return updated;
}

// ==========================================
// Playlists Management
// Tables:
// - playlists (id, user_id, title, description, created_at)
// - playlist_songs (id, playlist_id, video_id, title, artist, thumbnail, duration, added_at)
// ==========================================

const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'chill-mix-01',
    title: 'Chill & Relax Hits',
    description: 'Calm acoustic, lo-fi, and chill acoustic favorites',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    songs: [
      {
        videoId: 'yKNxeF4KMsY',
        title: 'Coldplay - Yellow',
        artist: 'Coldplay',
        thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
        duration: '4:33',
      },
      {
        videoId: '450p7goxZqg',
        title: 'John Legend - All of Me',
        artist: 'John Legend',
        thumbnail: 'https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg',
        duration: '5:08',
      },
      {
        videoId: 'JGwWNGJdvx8',
        title: 'Ed Sheeran - Shape of You',
        artist: 'Ed Sheeran',
        thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
        duration: '4:24',
      },
    ],
  },
  {
    id: 'upbeat-party-02',
    title: 'Energy & Workout Pop',
    description: 'High tempo bangers to keep you pumped up',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    songs: [
      {
        videoId: 'OPf0YbXqDm0',
        title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
        artist: 'Mark Ronson',
        thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
        duration: '4:31',
      },
      {
        videoId: 'kJQP7kiw5Fk',
        title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
        artist: 'Luis Fonsi',
        thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        duration: '4:42',
      },
      {
        videoId: '09R8_2nJtjg',
        title: 'Maroon 5 - Sugar',
        artist: 'Maroon 5',
        thumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
        duration: '5:02',
      },
    ],
  },
];

export async function fetchPlaylists(userId?: string): Promise<Playlist[]> {
  const client = getSupabaseClient();
  if (client && userId) {
    try {
      // 1. Fetch user playlists from public.playlists (id, user_id, title, description, created_at)
      const { data: playlistsData, error: plError } = await client
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!plError && playlistsData) {
        if (playlistsData.length === 0) {
          return [];
        }

        const playlistIds = playlistsData.map((p: any) => p.id);

        // 2. Fetch all songs for these playlists from public.playlist_songs
        let songsByPlaylist: Record<string, Song[]> = {};
        try {
          const { data: songsData, error: sError } = await client
            .from('playlist_songs')
            .select('*')
            .in('playlist_id', playlistIds)
            .order('added_at', { ascending: true });

          if (!sError && songsData) {
            songsData.forEach((row: any) => {
              if (!songsByPlaylist[row.playlist_id]) {
                songsByPlaylist[row.playlist_id] = [];
              }
              songsByPlaylist[row.playlist_id].push({
                videoId: row.video_id,
                title: row.title,
                artist: row.artist || '',
                thumbnail: row.thumbnail || '',
                duration: row.duration || '3:30',
              });
            });
          }
        } catch (songFetchErr) {
          console.warn('playlist_songs query caught error:', songFetchErr);
        }

        return playlistsData.map((item: any) => {
          const songsFromRelation = songsByPlaylist[item.id];
          const songs =
            songsFromRelation ||
            (Array.isArray(item.songs) ? item.songs : []);

          return {
            id: item.id,
            title: item.title,
            description: item.description || '',
            coverUrl:
              songs[0]?.thumbnail ||
              item.cover_url ||
              item.coverUrl ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
            songs,
            createdAt: item.created_at,
          };
        });
      }
    } catch (e) {
      console.warn('Supabase fetch playlists error:', e);
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    if (saved) return JSON.parse(saved);
  } catch {}

  return INITIAL_PLAYLISTS;
}

export async function createPlaylistDb(
  title: string,
  description = '',
  userId?: string
): Promise<Playlist> {
  const newId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'pl-' + Date.now();
  const now = new Date().toISOString();

  const newPl: Playlist = {
    id: newId,
    title: title.trim(),
    description: description.trim(),
    coverUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    songs: [],
    createdAt: now,
  };

  // Local storage optimistic sync
  try {
    const current = await fetchPlaylists(userId);
    const updated = [newPl, ...current];
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
  } catch {}

  const client = getSupabaseClient();
  if (client && userId) {
    try {
      await client.from('playlists').insert({
        id: newId,
        user_id: userId,
        title: newPl.title,
        description: newPl.description,
        created_at: now,
      });
    } catch (e) {
      console.warn('Supabase create playlist failed:', e);
    }
  }

  return newPl;
}

export async function addSongToPlaylistDb(
  playlistId: string,
  song: Song,
  userId?: string
): Promise<void> {
  // Local storage update
  try {
    const current = await fetchPlaylists(userId);
    const updated = current.map((pl) => {
      if (pl.id === playlistId) {
        if (!pl.songs.some((s) => s.videoId === song.videoId)) {
          return {
            ...pl,
            coverUrl: pl.coverUrl || song.thumbnail,
            songs: [...pl.songs, song],
          };
        }
      }
      return pl;
    });
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
  } catch {}

  const client = getSupabaseClient();
  if (client && userId) {
    try {
      // Check if song already exists in playlist_songs
      const { data: existing } = await client
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('video_id', song.videoId)
        .maybeSingle();

      if (!existing) {
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'ps-' + Date.now();
        await client.from('playlist_songs').insert({
          id,
          playlist_id: playlistId,
          video_id: song.videoId,
          title: song.title,
          artist: song.artist || '',
          thumbnail: song.thumbnail || '',
          duration: song.duration || '3:30',
          added_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Supabase addSongToPlaylist failed:', e);
    }
  }
}

export async function removeSongFromPlaylistDb(
  playlistId: string,
  videoId: string,
  userId?: string
): Promise<void> {
  try {
    const current = await fetchPlaylists(userId);
    const updated = current.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          songs: pl.songs.filter((s) => s.videoId !== videoId),
        };
      }
      return pl;
    });
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
  } catch {}

  const client = getSupabaseClient();
  if (client && userId) {
    try {
      await client
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('video_id', videoId);
    } catch (e) {
      console.warn('Supabase removeSongFromPlaylist failed:', e);
    }
  }
}

export async function deletePlaylistDb(
  playlistId: string,
  userId?: string
): Promise<Playlist[]> {
  const current = await fetchPlaylists(userId);
  const updated = current.filter((p) => p.id !== playlistId);

  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));

  const client = getSupabaseClient();
  if (client && userId) {
    try {
      // Delete playlist songs first (in case cascading delete is not enabled)
      await client.from('playlist_songs').delete().eq('playlist_id', playlistId);
      // Delete playlist
      await client.from('playlists').delete().eq('id', playlistId).eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase delete playlist failed:', e);
    }
  }

  return updated;
}

// ==========================================
// Backward compatibility helper for old code
// ==========================================
export function saveLastQueueLocal(queue: Song[], currentIndex: number): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.LAST_QUEUE,
      JSON.stringify({ queue, currentIndex })
    );
  } catch {}
}

export function loadLastQueueLocal(): { queue: Song[]; currentIndex: number } {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_QUEUE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.queue)) {
        return { queue: parsed.queue, currentIndex: parsed.currentIndex || 0 };
      }
    }
  } catch {}
  return { queue: [], currentIndex: 0 };
}

// =============================================================================
// HISTORY TRACKING
// =============================================================================

/**
 * Add song to history (called after 10+ seconds of playback)
 */
export async function addToHistory(song: {
  videoId?: string;
  spotifyId?: string;
  title: string;
  artist: string;
  thumbnail?: string;
  cover?: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use spotifyId or videoId as identifier
      const identifier = song.spotifyId || song.videoId;
      if (!identifier) return;

      await supabase.from('history').insert({
        user_id: user.id,
        video_id: identifier,
        title: song.title,
        artist: song.artist,
        thumbnail: song.cover || song.thumbnail || '',
        played_at: new Date().toISOString(),
      });

      console.log('✅ Added to history:', song.title);
    } catch (error) {
      console.error('❌ Failed to add to history:', error);
    }
  }
}

/**
 * Fetch listening history (distinct, sorted by recent)
 */
export async function fetchHistory(): Promise<any[]> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get distinct songs ordered by most recent play
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false });

      if (error) throw error;

      // Deduplicate by video_id (keep most recent)
      const seen = new Set();
      const unique = (data || []).filter((item: any) => {
        if (seen.has(item.video_id)) return false;
        seen.add(item.video_id);
        return true;
      });

      return unique.slice(0, 20); // Return 20 most recent
    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
      return [];
    }
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// =============================================================================
// SESSION PERSISTENCE
// =============================================================================

export interface SessionState {
  currentSong: any | null;
  queue: any[];
  queueIndex: number;
  currentTime: number;
}

/**
 * Save last session (queue + current song)
 */
export async function saveLastSession(state: SessionState): Promise<void> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('last_session')
        .upsert({
          user_id: user.id,
          current_song: state.currentSong,
          queue: state.queue,
          current_index: state.queueIndex,
          current_time: state.currentTime,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      console.log('✅ Session saved');
    } catch (error) {
      console.error('❌ Failed to save session:', error);
    }
  } else {
    // Fallback to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SESSION, JSON.stringify(state));
    } catch (error) {
      console.error('❌ Failed to save session to localStorage:', error);
    }
  }
}

/**
 * Load last session
 */
export async function loadLastSession(): Promise<SessionState | null> {
  const supabase = getSupabaseClient();
  
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('last_session')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return {
        currentSong: data.current_song,
        queue: data.queue || [],
        queueIndex: data.current_index || 0,
        currentTime: data.current_time || 0,
      };
    } catch (error) {
      console.error('❌ Failed to load session:', error);
      return null;
    }
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_SESSION);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
