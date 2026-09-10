import { SyncedLyricLine } from '../types';

/**
 * Parses LRC synced lyrics format into an array of timestamped lines.
 * Example input:
 * [00:14.20] Look at the stars
 * [00:18.45] Look how they shine for you
 */
export function parseLrcLyrics(lrcText: string): SyncedLyricLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const result: SyncedLyricLine[] = [];

  // Match [mm:ss.xx] or [mm:ss.xxx] or [mm:ss]
  const timeRegex = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    timeRegex.lastIndex = 0;
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = timeRegex.exec(line)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3]
        ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10)
        : 0;

      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      timestamps.push(totalSeconds);
    }

    // Strip out all [tags] to leave pure lyric text
    const text = line.replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

    if (text.length > 0 && timestamps.length > 0) {
      for (const time of timestamps) {
        result.push({ time, text });
      }
    }
  }

  // Sort chronologically
  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * Finds the index of the currently active lyric line for the given audio playback time.
 */
export function getActiveLyricIndex(
  lyrics: SyncedLyricLine[],
  currentTime: number
): number {
  if (!lyrics || lyrics.length === 0) return -1;

  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}

/**
 * Format seconds to mm:ss string
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse duration string like "4:33" to seconds
 */
export function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}
