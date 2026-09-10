import React from 'react';
import {
  Play,
  Music,
  Headphones,
  FileText,
  Database,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { ScreenType, Song } from '../types';

interface LandingViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenAuth: () => void;
}

const SPOTLIGHT_TRACKS: Song[] = [
  {
    videoId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    duration: '4:33',
  },
  {
    videoId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    duration: '4:24',
  },
  {
    videoId: 'OPf0YbXqDm0',
    title: 'Uptown Funk ft. Bruno Mars',
    artist: 'Mark Ronson',
    thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    duration: '4:31',
  },
  {
    videoId: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    duration: '5:59',
  },
];

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  const { playSong } = useMusicPlayer();

  return (
    <div id="landing-screen" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-zinc-900/90 to-zinc-950 border border-emerald-900/40 p-8 sm:p-14 mb-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Music Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-tight mb-6">
            Listen without boundaries. Sing with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              synced lyrics.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-8">
            Experience lightning-fast YouTube music streaming with synchronized,
            karaoke-style LRCLIB lyrics, customizable playlists, and Supabase cloud
            sync.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              id="landing-btn-start"
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Start Listening</span>
            </button>

            <button
              id="landing-btn-auth"
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Quick Play Cards */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Featured Tracks
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Click any track to listen instantly with real synced lyrics
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Search more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPOTLIGHT_TRACKS.map((song) => (
            <div
              key={song.videoId}
              className="group relative bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-2xl p-4 transition-all duration-300 hover:border-zinc-700 shadow-md"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3.5 bg-zinc-800">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => playSong(song, SPOTLIGHT_TRACKS)}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all"
                  title="Play"
                >
                  <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
                </button>
              </div>

              <h3 className="font-semibold text-sm text-zinc-100 truncate">
                {song.title}
              </h3>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 mb-2">
            Instant Music Search
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Search millions of tracks via our backend proxy. Instant streaming with
            metadata and artwork.
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 mb-2">
            Synchronized Lyrics (LRCLIB)
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Karaoke-style LRC lines that scroll automatically as the song plays. Click
            any line to jump to that timestamp!
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 mb-2">
            Supabase Auth & Database
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Store your custom playlists, liked songs, history, and queue seamlessly
            in your Supabase project with offline fallback.
          </p>
        </div>
      </section>
    </div>
  );
};
