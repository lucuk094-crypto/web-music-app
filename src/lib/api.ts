/**
 * API Client for backend endpoints
 */

export interface SpotifyTrack {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
  durationFormatted: string;
  previewUrl?: string;
  spotifyUrl: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  youtubeUrl: string;
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
}

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : '';

/**
 * Search songs via Spotify
 */
export async function searchSongs(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
  try {
    const response = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
}

/**
 * Resolve YouTube video for playback
 * Called ONLY when user clicks play
 */
export async function resolvePlayback(
  title: string,
  artist: string,
  duration: number
): Promise<YouTubeVideo> {
  try {
    const response = await fetch(
      `${API_BASE}/api/resolve-playback?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&duration=${duration}`
    );

    if (!response.ok) {
      throw new Error(`Playback resolve failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Playback resolve error:', error);
    throw error;
  }
}

/**
 * Fetch lyrics from LRCLIB
 */
export async function fetchLyrics(title: string, artist: string): Promise<LyricsData> {
  try {
    const response = await fetch(
      `${API_BASE}/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
    );

    if (!response.ok) {
      throw new Error(`Lyrics fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Lyrics fetch error:', error);
    throw error;
  }
}

/**
 * Parse LRC format lyrics to timestamped lines
 */
export interface LyricLine {
  time: number; // seconds
  text: string;
}

export function parseLrcLyrics(lrcText: string): LyricLine[] {
  if (!lrcText) return [];

  const lines: LyricLine[] = [];
  const lrcLines = lrcText.split('\n');

  for (const line of lrcLines) {
    // Match [mm:ss.xx] or [mm:ss] format
    const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = match[3] ? parseInt(match[3].padEnd(2, '0').slice(0, 2)) : 0;
      const text = match[4].trim();

      const time = minutes * 60 + seconds + centiseconds / 100;
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}
