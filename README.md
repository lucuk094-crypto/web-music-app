# 🎵 Aura Music Player

Full-featured music streaming web app with Spotify metadata, YouTube playback, synced lyrics, and Supabase persistence.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.x-61dafb)

## ✨ Features

- 🔍 **Smart Search** - Search 50M+ songs via Spotify API with 400ms debounce
- 🎵 **High-Quality Audio** - YouTube playback with HD album covers (640x640)
- 📝 **Synced Lyrics** - Real-time karaoke-style lyrics with LRCLIB integration
- 📊 **Queue Management** - Drag-to-reorder, shuffle, repeat modes
- 📚 **History Tracking** - Auto-save after 10s playback, Recently Played section
- 💾 **Session Restore** - Resume queue & position on app reload (no auto-play)
- 🎨 **Ambient UI** - Glassmorphism design with dynamic background blur
- 🔐 **Supabase Auth** - User authentication & data persistence
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## 🚀 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- Spotify Web API (metadata)
- YouTube IFrame API (playback)
- LRCLIB API (lyrics)
- Supabase (auth & database)

## 📦 Installation

### Prerequisites

- Node.js 18+ or Bun
- Spotify Developer Account
- Supabase Project
- (Optional) YouTube Data API Key

### 1. Clone Repository

```bash
git clone https://gitlab.com/vanxgalaxy/web-music.git
cd web-music
npm install
# or
bun install
```

### 2. Setup Environment Variables

Create `.env.local` file in project root:

```bash
# Spotify API (Required)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Supabase (Required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# YouTube API (Optional)
YOUTUBE_API_KEY=your_youtube_api_key
```

**Get Spotify Credentials:**
1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Copy Client ID and Client Secret
4. Add Redirect URI: `https://your-domain.vercel.app/callback`

**Get Supabase Credentials:**
1. Go to https://supabase.com/dashboard
2. Create project → Settings → API
3. Copy Project URL and anon public key

### 3. Setup Supabase Database

Run the SQL schema in Supabase SQL Editor:

```bash
# Copy content from supabase/schema.sql
# Paste in Supabase Dashboard → SQL Editor → New Query
# Click "Run"
```

This creates tables for:
- `playlists` - User playlists
- `playlist_songs` - Songs in playlists
- `liked_songs` - Favorited tracks
- `history` - Listening history (10s+ playback)
- `last_session` - Queue & position restoration

### 4. Test Setup

```bash
# Test Spotify credentials
node test-spotify.js

# Should output:
# ✅ SUCCESS! Spotify credentials are valid!
```

### 5. Run Development Server

```bash
npm run dev
# or
bun run dev
```

Open http://localhost:3000

## 🌐 Deployment (Vercel)

### Step 1: Connect Repository

1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitLab: `vanxgalaxy/web-music`

### Step 2: Configure Build Settings

```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
YOUTUBE_API_KEY (optional)
```

### Step 4: Update Spotify App Settings

After deployment, update your Spotify app:
1. Go to https://developer.spotify.com/dashboard
2. Click your app → Settings
3. Add Redirect URI: `https://your-app.vercel.app/callback`
4. Save

### Step 5: Deploy

Click "Deploy" - your app will be live in ~2 minutes!

## 📖 Usage

### Basic Playback

1. **Search Songs** - Type in search bar (searches Spotify)
2. **Click to Play** - Instantly shows cover, resolves YouTube playback in background
3. **Control Playback** - Play/pause, next/prev, seek, volume
4. **View Lyrics** - Click Now Playing → Lyrics tab (auto-scroll karaoke)
5. **Manage Queue** - Now Playing → Queue tab (reorder, click to jump)

### History & Session

- **Auto-track History** - Songs played 10+ seconds saved automatically
- **Recently Played** - Home page shows last 20 unique songs
- **Session Restore** - Close & reopen app → queue restored (paused, not auto-play)

### Playlists

- Create playlists
- Add songs from search or Now Playing
- Edit/delete playlists
- View in Library

## 🏗️ Project Structure

```
music-player/
├── src/
│   ├── components/         # UI components
│   │   ├── HomeView.tsx
│   │   ├── SearchView.tsx
│   │   ├── NowPlayingView.tsx
│   │   ├── MiniPlayer.tsx
│   │   └── ...
│   ├── context/            # React Context
│   │   ├── PlayerContext.tsx       # Old context
│   │   └── PlayerContextNew.tsx    # New context (with history)
│   ├── lib/                # Utilities
│   │   ├── api.ts          # Spotify/YouTube API wrappers
│   │   ├── supabase.ts     # Supabase client & helpers
│   │   ├── youtubePlayer.ts # YouTube IFrame API wrapper
│   │   └── lyrics.ts       # Lyrics parsing
│   ├── types.ts            # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── server.ts               # Backend Express server
├── supabase/
│   └── schema.sql          # Database schema
├── public/                 # Static assets
├── .env.example            # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── SETUP_GUIDE.md         # Detailed setup guide
└── README.md              # This file
```

## 🔧 API Endpoints

**Backend Server (Express):**

- `GET /api/spotify-token` - Get cached Spotify access token
- `GET /api/search?q={query}` - Search Spotify catalog
- `GET /api/resolve-playback?title={title}&artist={artist}` - Get YouTube videoId
- `GET /api/lyrics?title={title}&artist={artist}` - Fetch synced lyrics from LRCLIB

## 🎯 Key Features Explained

### History Tracking (10s Threshold)

```typescript
// PlayerContextNew.tsx
// Tracks playback time, saves to Supabase after 10 continuous seconds
startHistoryTracking(song) {
  // Check every 1 second
  // If elapsed >= 10s → addToHistory()
  // Updates recentSongs state → HomeView displays
}
```

### Session Persistence

```typescript
// Saves to Supabase every 2 seconds (debounced)
saveLastSession({
  currentSong,
  queue,
  queueIndex,
  currentTime
})

// On app mount → restore without autoplay
loadLastSession() // Returns { currentSong, queue, queueIndex, currentTime }
```

### Smart Playback Flow

1. User clicks song → Show Spotify cover immediately
2. Background: Resolve YouTube videoId via `/api/resolve-playback`
3. Start YouTube IFrame Player (hidden, audio-only)
4. Real-time progress updates via `onStateChange` event
5. Synced lyrics highlight active line based on `currentTime`

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting.

**Common Issues:**

- **"Spotify credentials not set"** - Check `.env.local` file exists and has valid credentials
- **"Invalid redirect URI"** - Update Spotify app settings with your Vercel URL
- **CORS errors** - Make sure Redirect URI matches exactly (including protocol https://)
- **History not saving** - Must play song for 10+ continuous seconds
- **Session not restoring** - Check Supabase RLS policies are enabled

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🙏 Credits

- **Spotify Web API** - Music metadata
- **YouTube IFrame API** - Audio playback
- **LRCLIB** - Synced lyrics database
- **Supabase** - Backend as a Service
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations

## 🔗 Links

- **Live Demo:** (coming soon after Vercel deployment)
- **GitLab Repo:** https://gitlab.com/vanxgalaxy/web-music
- **Issues:** https://gitlab.com/vanxgalaxy/web-music/-/issues

---

Made with ❤️ by vanxgalaxy
