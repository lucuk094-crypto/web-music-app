import React from 'react';
import {
  Play,
  Heart,
  Clock,
  Flame,
  PlusCircle,
  ListPlus,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContext';
import { Song, ScreenType } from '../types';

interface HomeViewProps {
  onNavigate: (screen: ScreenType, playlistId?: string) => void;
}

const TRENDING_HITS: Song[] = [
  {
    videoId: 'yKNxeF4KMsY',
    title: 'Coldplay - Yellow',
    artist: 'Coldplay',
    thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    duration: '4:33',
  },
  {
    videoId: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You',
    artist: 'Ed Sheeran',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    duration: '4:24',
  },
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
    videoId: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody',
    artist: 'Queen',
    thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    duration: '5:59',
  },
  {
    videoId: '450p7goxZqg',
    title: 'John Legend - All of Me',
    artist: 'John Legend',
    thumbnail: 'https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg',
    duration: '5:08',
  },
  {
    videoId: '09R8_2nJtjg',
    title: 'Maroon 5 - Sugar',
    artist: 'Maroon 5',
    thumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
    duration: '5:02',
  },
  {
    videoId: 'hT_nvWreIhg',
    title: 'OneRepublic - Counting Stars',
    artist: 'OneRepublic',
    thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg',
    duration: '4:44',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    playSong,
    currentSong,
    isPlaying,
    history,
    playlists,
    likedSongs,
    toggleLike,
    isLiked,
    openAddToPlaylist,
    addToQueue,
  } = useMusicPlayer();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="home-screen" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            {getGreeting()}
            {currentUser?.name ? `, ${currentUser.name}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pick up where you left off or discover new trending music
          </p>
        </div>

        {/* Quick search button */}
        <button
          onClick={() => onNavigate('search')}
          className="self-start sm:self-auto flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Explore All Search</span>
        </button>
      </div>

      {/* Hero Featured Mix Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/50 via-teal-950/40 to-zinc-900 border border-emerald-800/30 p-6 sm:p-8 mb-8 shadow-xl">
        <div className="max-w-xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Top Pick of the Day</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mb-2">
            Coldplay - Yellow
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mb-5 leading-relaxed">
            The timeless acoustic anthem with fully synchronized real-time lyrics
            available right now.
          </p>
          <div className="flex items-center space-x-3">
            <button
              id="hero-btn-play"
              onClick={() => playSong(TRENDING_HITS[0], TRENDING_HITS)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Play Now</span>
            </button>
            <button
              onClick={() => addToQueue(TRENDING_HITS[0])}
              className="flex items-center space-x-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors"
            >
              <ListPlus className="w-4 h-4" />
              <span>Add to Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recently Played (Riwayat) Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">
              Recently Played (Riwayat)
            </h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => onNavigate('playlist-detail', 'history')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              See all ({history.length})
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.slice(0, 6).map((song) => {
              const isCurrent = currentSong?.videoId === song.videoId;
              return (
                <div
                  key={`hist-${song.videoId}`}
                  onClick={() => playSong(song, history)}
                  className={`group relative bg-zinc-900/50 hover:bg-zinc-800/80 border rounded-2xl p-3 cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-zinc-800">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-xs text-zinc-100 truncate">
                    {song.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-900/20 p-5 text-center">
            <p className="text-xs text-zinc-400">
              No recent history yet. Songs played for more than 10 seconds will automatically appear here.
            </p>
          </div>
        )}
      </section>

      {/* Trending Hits Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">
              Trending Top Hits
            </h2>
          </div>
          <span className="text-xs text-zinc-500">Instant Streaming</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRENDING_HITS.map((song) => {
            const isCurrent = currentSong?.videoId === song.videoId;
            const liked = isLiked(song.videoId);

            return (
              <div
                key={song.videoId}
                className={`group relative bg-zinc-900/50 hover:bg-zinc-800/80 border rounded-2xl p-3.5 transition-all duration-200 ${
                  isCurrent
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => playSong(song, TRENDING_HITS)}
                    className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
                    title="Play"
                  >
                    <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/70 text-zinc-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {song.duration}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3
                      onClick={() => playSong(song, TRENDING_HITS)}
                      className="font-semibold text-xs sm:text-sm text-zinc-100 hover:text-emerald-400 cursor-pointer truncate"
                    >
                      {song.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => toggleLike(song)}
                      className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          liked ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => openAddToPlaylist(song)}
                      className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Add to Playlist"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Playlists Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">
            Featured Collections & Playlists
          </h2>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all in Library &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Liked Songs Card */}
          <div
            onClick={() => onNavigate('playlist-detail', 'liked-songs')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900/50 to-zinc-900 border border-rose-800/30 p-5 cursor-pointer hover:border-rose-700/50 transition-all shadow-md"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Liked Songs</h3>
                <p className="text-xs text-zinc-400">
                  {likedSongs.length} favorites saved
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              Your favorite songs all in one synchronized collection.
            </p>
          </div>

          {/* User playlists */}
          {playlists.slice(0, 2).map((pl) => (
            <div
              key={pl.id}
              onClick={() => onNavigate('playlist-detail', pl.id)}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 cursor-pointer hover:border-zinc-700 transition-all shadow-md"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-100 truncate">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {pl.songs.length} tracks
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {pl.description || 'Custom user curated playlist'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
