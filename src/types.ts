export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  durationSec?: number;
}

export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  title: string;
  artist: string;
  trackName: string;
  artistName: string;
  syncedLyrics: string | null;
  plainLyrics: string | null;
  hasSynced: boolean;
  hasLyrics: boolean;
  duration?: number | null;
  parsedLines?: SyncedLyricLine[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  songs: Song[];
  createdAt: string;
  isSystem?: boolean; // Liked songs, History
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export type ScreenType =
  | 'login'
  | 'landing'
  | 'home'
  | 'search'
  | 'library'
  | 'playlist-detail'
  | 'now-playing'
  | 'settings';

export type RepeatMode = 'off' | 'all' | 'one';
