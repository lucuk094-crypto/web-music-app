# 🎵 Music Player Setup Guide

## Quick Start (3 Steps)

### 1️⃣ Get Spotify API Credentials

1. **Go to:** https://developer.spotify.com/dashboard
2. **Login** with your Spotify account (or create free account)
3. **Click** green button: **"Create app"**
4. **Fill in the form:**
   ```
   App name: Music Player App
   App description: Personal music streaming application
   Redirect URI: http://localhost:3000/callback
   Which API/SDKs: ☑ Web API
   ☑ I agree to the terms
   ```
5. **Click "Save"**
6. **In your new app dashboard:**
   - Click **"Settings"** (top right)
   - Copy the **Client ID** (visible)
   - Click **"View client secret"** → Copy **Client Secret**

### 2️⃣ Configure .env.local File

1. **Open file:** `.env.local` (in project root)
2. **Replace these lines:**
   ```bash
   SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID_HERE_EXAMPLE_a1b2c3d4e5f67890
   SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET_HERE_EXAMPLE_z9y8x7w6v5u4
   ```
   
   **With your actual credentials (no quotes needed):**
   ```bash
   SPOTIFY_CLIENT_ID=a1b2c3d4e5f6789012345678901234567890
   SPOTIFY_CLIENT_SECRET=z9y8x7w6v5u4321098765432109876543210
   ```

3. **Also fill in Supabase credentials:**
   ```bash
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   Get from: https://supabase.com/dashboard → Your Project → Settings → API

4. **Save the file**

### 3️⃣ Test & Run

**Test your Spotify credentials:**
```bash
node test-spotify.js
```

**Expected output:**
```
✅ SUCCESS! Spotify credentials are valid!
🎉 Access token received
⏰ Token expires in: 3600 seconds
```

**If successful, start the server:**
```bash
npm run dev
```

**Open browser:**
```
http://localhost:3000
```

---

## 🐛 Troubleshooting

### Problem: "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set"

**Solution:**
- Make sure `.env.local` file exists (not `.env.example`)
- Check that credentials are filled in (not placeholder text)
- Restart the dev server after editing `.env.local`

### Problem: "401 Unauthorized" when testing

**Solution:**
- Double-check Client ID is correct (no typos)
- Make sure you clicked "View client secret" (not just the hidden dots)
- Credentials should have NO quotes, NO spaces
- Copy-paste directly from Spotify Dashboard

### Problem: Server doesn't detect changes

**Solution:**
```bash
# Stop server (Ctrl+C)
# Restart:
npm run dev
```

### Problem: "Network error" or CORS

**Solution:**
- Make sure you're accessing via `http://localhost:3000` (not `127.0.0.1`)
- Check firewall isn't blocking port 3000

---

## 📋 Checklist

- [ ] Created Spotify Developer app
- [ ] Copied Client ID to `.env.local`
- [ ] Copied Client Secret to `.env.local`
- [ ] Filled in Supabase URL and anon key
- [ ] Ran `node test-spotify.js` → ✅ Success
- [ ] Started server: `npm run dev`
- [ ] Opened browser: http://localhost:3000
- [ ] Can search songs via Spotify API

---

## 🎯 What You Get

With Spotify API credentials, your app can:
- ✅ Search 50+ million songs
- ✅ Get high-quality album covers (640x640px)
- ✅ Fetch accurate metadata (title, artist, duration)
- ✅ Browse by genre/mood/playlist
- ✅ Get recommendations

**Note:** This uses "Client Credentials Flow" which doesn't require user authentication. The app searches Spotify's catalog but plays audio via YouTube (hidden player).

---

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Client Secret stays server-side only (never exposed to frontend)
- ✅ Credentials are loaded via Node.js `dotenv` package
- ✅ Token is cached in memory (refreshed automatically)

---

## 📚 Additional Resources

- **Spotify Web API Docs:** https://developer.spotify.com/documentation/web-api
- **Client Credentials Flow:** https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
- **Dashboard:** https://developer.spotify.com/dashboard

---

Need help? Check console errors or refer to this guide.
