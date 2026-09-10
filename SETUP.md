# Backend Architecture Setup

## Overview

This music player uses:
- **Spotify Web API** for metadata (search, album covers, track info)
- **YouTube** for audio playback (hidden IFrame player)
- **LRCLIB** for synced lyrics
- **Supabase** for auth and data persistence

## Architecture Flow

1. **Browse/Search** → Spotify API returns metadata (cover art 640x640, title, artist, album)
2. **User clicks Play** → Backend resolves matching YouTube video
3. **Playback** → YouTube IFrame Player API (audio only, hidden)
4. **Lyrics** → LRCLIB API provides synced/plain lyrics

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.template` to `.env.local`:

```bash
cp .env.local.template .env.local
```

Fill in the following credentials:

#### A. Supabase (Auth & Database)

1. Go to https://supabase.com/
2. Create new project
3. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public key → `VITE_SUPABASE_ANON_KEY`

#### B. Spotify API (Metadata)

1. Go to https://developer.spotify.com/dashboard
2. Create new app
3. Copy:
   - Client ID → `SPOTIFY_CLIENT_ID`
   - Client Secret → `SPOTIFY_CLIENT_SECRET`
4. **IMPORTANT**: These stay on the server, never exposed to frontend

#### C. YouTube Data API v3 (Playback)

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "YouTube Data API v3"
4. Create API key (Credentials → Create Credentials → API Key)
5. Copy API key → `YOUTUBE_API_KEY`
6. **Optional**: Restrict key to YouTube Data API v3 for security

### 3. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

## API Endpoints

### Backend Routes (Node.js/Express)

#### `GET /api/spotify-token`
- Returns Spotify access token (for debugging only)
- Token is cached in memory and auto-refreshed

#### `GET /api/search?q={query}&limit={limit}`
- Search songs via Spotify
- Returns: `{ spotifyId, title, artist, album, cover, duration }`
- Cover is highest resolution (usually 640x640)

#### `GET /api/resolve-playback?title={title}&artist={artist}&duration={duration}`
- Find matching YouTube video for playback
- Called **ONLY when user clicks play**
- Returns best match based on title/duration similarity

#### `GET /api/lyrics?title={title}&artist={artist}`
- Fetch lyrics from LRCLIB
- Prioritizes `syncedLyrics` (LRC format with timestamps)
- Falls back to `plainLyrics` if synced not available

## YouTube IFrame Player

The player is hidden (0x0 size) and controlled via JavaScript API:

```typescript
import { YouTubePlayer } from './lib/youtubePlayer';

const player = new YouTubePlayer('player-container-id', {
  onReady: () => console.log('Ready'),
  onStateChange: (state) => console.log('State:', state),
  onProgress: (currentTime, duration) => console.log(currentTime, duration),
});

await player.loadAPI();
await player.initPlayer(videoId);

// Controls
player.play();
player.pause();
player.seekTo(seconds);
player.setVolume(0.8);
```

## Security Notes

1. **Spotify Client Secret** is NEVER exposed to frontend
2. Token generation happens server-side only
3. Frontend calls `/api/search` instead of Spotify directly
4. YouTube API key can be restricted to specific APIs/referrers

## Cache Strategy

All endpoints cache responses for 15 minutes:
- Search results
- Playback resolutions
- Lyrics

This reduces API calls and improves performance.

## Testing Connections

### 1. Test Spotify Connection

```bash
curl http://localhost:3000/api/spotify-token
```

Should return: `{ access_token: "...", expires_at: 1234567890 }`

### 2. Test Search

```bash
curl "http://localhost:3000/api/search?q=coldplay+yellow"
```

Should return array of tracks with Spotify metadata.

### 3. Test Playback Resolution

```bash
curl "http://localhost:3000/api/resolve-playback?title=Yellow&artist=Coldplay&duration=266"
```

Should return YouTube video ID and metadata.

### 4. Test Lyrics

```bash
curl "http://localhost:3000/api/lyrics?title=Yellow&artist=Coldplay"
```

Should return synced or plain lyrics.

## Troubleshooting

### Spotify Authentication Failed
- Check `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
- Verify app is not in Development Mode (or add your account to allowed users)

### YouTube API Quota Exceeded
- Free tier: 10,000 requests/day
- Each search uses ~3 quota units
- Each video details call uses ~1 quota unit
- Monitor usage at: https://console.cloud.google.com/apis/dashboard

### CORS Errors
- Ensure server is running
- Check browser console for actual error
- Verify `API_BASE` in `src/lib/api.ts` is correct

### YouTube Player Not Loading
- Check if YouTube IFrame API script is blocked
- Open browser console for errors
- Verify video ID is valid

## Production Deployment

1. Build frontend:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Deploy `dist/` folder for frontend

4. Ensure server routes are properly configured for SPA routing

## Next Steps

- [ ] Connect SearchView to `/api/search`
- [ ] Implement playback in PlayerContext using YouTubePlayer
- [ ] Connect LyricsView to `/api/lyrics`
- [ ] Setup Supabase auth flows
- [ ] Persist user data (playlists, liked songs, queue) to Supabase
