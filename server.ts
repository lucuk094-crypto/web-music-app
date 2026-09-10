import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import axios from "axios";

dotenv.config();

// ============================================================================
// SPOTIFY TOKEN MANAGER (In-Memory Cache)
// ============================================================================
let spotifyToken: string | null = null;
let spotifyTokenExpiry: number = 0;

async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (spotifyToken && Date.now() < spotifyTokenExpiry - 5 * 60 * 1000) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
      }
    );

    spotifyToken = response.data.access_token;
    spotifyTokenExpiry = Date.now() + response.data.expires_in * 1000;

    console.log("✅ Spotify token refreshed, expires in", response.data.expires_in, "seconds");
    return spotifyToken;
  } catch (error: any) {
    console.error("❌ Failed to get Spotify token:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Spotify");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Parse duration string "PT3M45S" to seconds
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

// Format seconds to "M:SS" or "H:MM:SS"
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

// Sanitize title for lyrics search
function sanitizeForLrclib(str: string): string {
  return str
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*(?:official|video|audio|lyrics|hd|4k|remastered|visualizer|live|feat|ft\.)[^)]*\)/gi, "")
    .replace(/(?:official\s+video|official\s+audio|lyrics|lyric\s+video)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================================
// CACHE
// ============================================================================
const searchCache = new Map<string, { timestamp: number; data: any }>();
const playbackCache = new Map<string, { timestamp: number; data: any }>();
const lyricsCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// SERVER
// ============================================================================

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  /**
   * GET /api/spotify-token
   * Returns Spotify access token (for frontend debugging only - not recommended in production)
   * Note: Frontend should call /api/search instead of using token directly
   */
  app.get("/api/spotify-token", async (_req, res) => {
    try {
      const token = await getSpotifyToken();
      res.json({ access_token: token, expires_at: spotifyTokenExpiry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/search?q={query}&limit={limit}
   * Search songs via Spotify Web API
   * Returns: { spotifyId, title, artist, album, cover (640x640), duration }
   */
  app.get("/api/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    const limit = parseInt(req.query.limit as string || "20");

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const cacheKey = `${query.toLowerCase()}_${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const token = await getSpotifyToken();
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: query,
          type: "track",
          limit: Math.min(limit, 50),
          market: "ID", // Indonesia market for better local results
        },
      });

      const tracks = response.data.tracks.items.map((track: any) => ({
        spotifyId: track.id,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(", "),
        album: track.album.name,
        cover: track.album.images[0]?.url || "", // Highest resolution (usually 640x640)
        duration: Math.floor(track.duration_ms / 1000), // Convert to seconds
        durationFormatted: formatDuration(Math.floor(track.duration_ms / 1000)),
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls.spotify,
      }));

      const result = { query, results: tracks, total: tracks.length };
      searchCache.set(cacheKey, { timestamp: Date.now(), data: result });

      res.json(result);
    } catch (error: any) {
      console.error("❌ Spotify search error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to search Spotify", 
        details: error.response?.data?.error || error.message 
      });
    }
  });

  /**
   * GET /api/resolve-playback?title={title}&artist={artist}&duration={duration}
   * Find matching YouTube video for playback
   * Called ONLY when user clicks play (not during browsing)
   */
  app.get("/api/resolve-playback", async (req, res) => {
    const title = (req.query.title as string || "").trim();
    const artist = (req.query.artist as string || "").trim();
    const spotifyDuration = parseInt(req.query.duration as string || "0");

    if (!title || !artist) {
      return res.status(400).json({ error: "Both 'title' and 'artist' are required" });
    }

    const cacheKey = `${title.toLowerCase()}_${artist.toLowerCase()}`;
    const cached = playbackCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY not configured" });
    }

    try {
      // Search YouTube for best match
      const searchQuery = `${artist} ${title} official audio`;
      const searchResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: searchQuery,
          type: "video",
          maxResults: 5,
          videoCategoryId: "10", // Music category
          key: youtubeApiKey,
        },
      });

      const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId).join(",");

      // Get video details (including duration)
      const detailsResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          part: "contentDetails,snippet",
          id: videoIds,
          key: youtubeApiKey,
        },
      });

      // Find best match based on duration similarity
      let bestMatch: any = null;
      let minDiff = Infinity;

      for (const video of detailsResponse.data.items) {
        const ytDuration = parseDuration(video.contentDetails.duration);
        const diff = Math.abs(ytDuration - spotifyDuration);

        // Prefer results with "official" or "audio" in title and similar duration
        const titleLower = video.snippet.title.toLowerCase();
        const isOfficial = titleLower.includes("official") || titleLower.includes("audio");
        const score = diff + (isOfficial ? 0 : 30); // Bonus for official videos

        if (score < minDiff) {
          minDiff = score;
          bestMatch = video;
        }
      }

      if (!bestMatch) {
        return res.status(404).json({ error: "No matching YouTube video found" });
      }

      const result = {
        videoId: bestMatch.id,
        title: bestMatch.snippet.title,
        thumbnail: bestMatch.snippet.thumbnails.high?.url || bestMatch.snippet.thumbnails.default?.url,
        duration: parseDuration(bestMatch.contentDetails.duration),
        youtubeUrl: `https://www.youtube.com/watch?v=${bestMatch.id}`,
      };

      playbackCache.set(cacheKey, { timestamp: Date.now(), data: result });
      res.json(result);
    } catch (error: any) {
      console.error("❌ YouTube resolve error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to resolve YouTube playback", 
        details: error.response?.data?.error || error.message 
      });
    }
  });

  /**
   * GET /api/lyrics?title={title}&artist={artist}
   * Fetch lyrics from LRCLIB
   * Prioritizes syncedLyrics (LRC format), fallback to plainLyrics
   */
  app.get("/api/lyrics", async (req, res) => {
    const rawTitle = (req.query.title as string || "").trim();
    const rawArtist = (req.query.artist as string || "").trim();

    if (!rawTitle) {
      return res.status(400).json({ error: "title parameter is required" });
    }

    const cacheKey = `${rawTitle.toLowerCase()}___${rawArtist.toLowerCase()}`;
    const cached = lyricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    const cleanTitle = sanitizeForLrclib(rawTitle);
    const cleanArtist = sanitizeForLrclib(rawArtist);

    try {
      let lrclibData: any = null;

      // 1. Try exact get
      if (cleanArtist && cleanTitle) {
        const getUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
          cleanArtist
        )}&track_name=${encodeURIComponent(cleanTitle)}`;
        const directRes = await axios.get(getUrl, {
          headers: { "User-Agent": "MusicStreamApp/1.0" },
          validateStatus: () => true,
        });
        if (directRes.status === 200) {
          lrclibData = directRes.data;
        }
      }

      // 2. If exact get failed, search LRCLIB
      if (!lrclibData || (!lrclibData.syncedLyrics && !lrclibData.plainLyrics)) {
        const searchQueries = [
          `${cleanArtist} ${cleanTitle}`.trim(),
          cleanTitle,
          rawTitle,
        ];

        for (const query of searchQueries) {
          if (!query) continue;
          const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
          const searchRes = await axios.get(searchUrl, {
            headers: { "User-Agent": "MusicStreamApp/1.0" },
            validateStatus: () => true,
          });

          if (searchRes.status === 200 && Array.isArray(searchRes.data) && searchRes.data.length > 0) {
            const withSynced = searchRes.data.find((item: any) => item.syncedLyrics);
            const withPlain = searchRes.data.find((item: any) => item.plainLyrics);
            lrclibData = withSynced || withPlain || searchRes.data[0];
            if (lrclibData?.syncedLyrics || lrclibData?.plainLyrics) {
              break;
            }
          }
        }
      }

      const syncedLyrics = lrclibData?.syncedLyrics || null;
      const plainLyrics = lrclibData?.plainLyrics || null;

      const responsePayload = {
        title: rawTitle,
        artist: rawArtist,
        trackName: lrclibData?.trackName || rawTitle,
        artistName: lrclibData?.artistName || rawArtist,
        syncedLyrics,
        plainLyrics,
        hasSynced: !!syncedLyrics,
        hasLyrics: !!(syncedLyrics || plainLyrics),
        duration: lrclibData?.duration || null,
      };

      lyricsCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
      res.json(responsePayload);
    } catch (error: any) {
      console.error("❌ Lyrics fetch error:", error.message);
      res.json({
        title: rawTitle,
        artist: rawArtist,
        syncedLyrics: null,
        plainLyrics: null,
        hasSynced: false,
        hasLyrics: false,
        error: "Failed to fetch lyrics from LRCLIB",
      });
    }
  });

  /**
   * GET /api/browse/featured-playlists
   * Get Spotify featured playlists
   */
  app.get("/api/browse/featured-playlists", async (req, res) => {
    const limit = parseInt(req.query.limit as string || "20");
    const cacheKey = `featured_playlists_${limit}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const token = await getSpotifyToken();
      const response = await axios.get("https://api.spotify.com/v1/browse/featured-playlists", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          country: "ID",
          locale: "id_ID",
          limit: Math.min(limit, 50),
        },
      });

      const playlists = response.data.playlists.items.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        cover: playlist.images[0]?.url || "",
        tracksCount: playlist.tracks.total,
        owner: playlist.owner.display_name,
        spotifyUrl: playlist.external_urls.spotify,
      }));

      const result = { playlists, total: playlists.length };
      searchCache.set(cacheKey, { timestamp: Date.now(), data: result });
      res.json(result);
    } catch (error: any) {
      console.error("❌ Featured playlists error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch featured playlists" });
    }
  });

  /**
   * GET /api/browse/new-releases
   * Get Spotify new releases
   */
  app.get("/api/browse/new-releases", async (req, res) => {
    const limit = parseInt(req.query.limit as string || "20");
    const cacheKey = `new_releases_${limit}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const token = await getSpotifyToken();
      const response = await axios.get("https://api.spotify.com/v1/browse/new-releases", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          country: "ID",
          limit: Math.min(limit, 50),
        },
      });

      const albums = response.data.albums.items.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artists.map((a: any) => a.name).join(", "),
        cover: album.images[0]?.url || "",
        releaseDate: album.release_date,
        tracksCount: album.total_tracks,
        spotifyUrl: album.external_urls.spotify,
        type: album.album_type,
      }));

      const result = { albums, total: albums.length };
      searchCache.set(cacheKey, { timestamp: Date.now(), data: result });
      res.json(result);
    } catch (error: any) {
      console.error("❌ New releases error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch new releases" });
    }
  });

  /**
   * GET /api/browse/categories
   * Get Spotify browse categories
   */
  app.get("/api/browse/categories", async (req, res) => {
    const limit = parseInt(req.query.limit as string || "20");
    const cacheKey = `categories_${limit}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const token = await getSpotifyToken();
      const response = await axios.get("https://api.spotify.com/v1/browse/categories", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          country: "ID",
          locale: "id_ID",
          limit: Math.min(limit, 50),
        },
      });

      const categories = response.data.categories.items.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icons[0]?.url || "",
      }));

      const result = { categories, total: categories.length };
      searchCache.set(cacheKey, { timestamp: Date.now(), data: result });
      res.json(result);
    } catch (error: any) {
      console.error("❌ Categories error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  /**
   * GET /api/browse/category/:id/playlists
   * Get playlists for specific category
   */
  app.get("/api/browse/category/:id/playlists", async (req, res) => {
    const categoryId = req.params.id;
    const limit = parseInt(req.query.limit as string || "20");
    const cacheKey = `category_${categoryId}_${limit}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const token = await getSpotifyToken();
      const response = await axios.get(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          country: "ID",
          limit: Math.min(limit, 50),
        },
      });

      const playlists = response.data.playlists.items.map((playlist: any) => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        cover: playlist.images[0]?.url || "",
        tracksCount: playlist.tracks.total,
        owner: playlist.owner.display_name,
        spotifyUrl: playlist.external_urls.spotify,
      }));

      const result = { playlists, total: playlists.length };
      searchCache.set(cacheKey, { timestamp: Date.now(), data: result });
      res.json(result);
    } catch (error: any) {
      console.error("❌ Category playlists error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch category playlists" });
    }
  });

  /**
   * GET /api/playlist/:id/tracks
   * Get tracks from a specific playlist
   */
  app.get("/api/playlist/:id/tracks", async (req, res) => {
    const playlistId = req.params.id;
    const limit = parseInt(req.query.limit as string || "50");
    const cacheKey = `playlist_tracks_${playlistId}_${limit}`;
    const cached = searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    try {
      const token = await getSpotifyToken();
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          market: "ID",
          limit: Math.min(limit, 100),
        },
      });

      const tracks = response.data.items
        .filter((item: any) => item.track) // Filter out null tracks
        .map((item: any) => ({
          spotifyId: item.track.id,
          title: item.track.name,
          artist: item.track.artists.map((a: any) => a.name).join(", "),
          album: item.track.album.name,
          cover: item.track.album.images[0]?.url || "",
          duration: Math.floor(item.track.duration_ms / 1000),
          durationFormatted: formatDuration(Math.floor(item.track.duration_ms / 1000)),
          previewUrl: item.track.preview_url,
          spotifyUrl: item.track.external_urls.spotify,
          addedAt: item.added_at,
        }));

      const result = { 
        playlistId,
        tracks, 
        total: tracks.length,
        next: response.data.next 
      };
      searchCache.set(cacheKey, { timestamp: Date.now(), data: result });
      res.json(result);
    } catch (error: any) {
      console.error("❌ Playlist tracks error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch playlist tracks" });
    }
  });

  // Vite middleware in dev; static dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
