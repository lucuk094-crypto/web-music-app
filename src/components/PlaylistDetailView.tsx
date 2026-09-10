import React from 'react';
import {
  Play,
  Shuffle,
  Heart,
  Clock,
  Trash2,
  Plus,
  Music,
  ListPlus,
  ArrowLeft,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContext';
import { Song, ScreenType } from '../types';

interface PlaylistDetailViewProps {
  playlistId: string;
  onNavigate: (screen: ScreenType) => void;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlistId,
  onNavigate,
}) => {
  const {
    likedSongs,
    history,
    playlists,
    playSong,
    currentSong,
    isPlaying,
    toggleLike,
    isLiked,
    removeSongFromPlaylist,
    deletePlaylist,
    addToQueue,
  } = useMusicPlayer();

  // Determine which playlist to display
  let title = 'Playlist';
  let description = '';
  let coverUrl =
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  let songs: Song[] = [];
  let isSystem = false;
  let isLikedSongsList = false;

  if (playlistId === 'liked-songs') {
    title = 'Liked Songs';
    description = 'All your favorite songs synchronized in one place.';
    coverUrl =
      'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=600&auto=format&fit=crop&q=80';
    songs = likedSongs;
    isSystem = true;
    isLikedSongsList = true;
  } else if (playlistId === 'history') {
    title = 'Riwayat (Listening History)';
    description = 'Tracks you have recently streamed.';
    coverUrl =
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80';
    songs = history;
    isSystem = true;
  } else {
    const found = playlists.find((p) => p.id === playlistId);
    if (found) {
      title = found.title;
      description = found.description || 'Custom user playlist';
      coverUrl = found.coverUrl || coverUrl;
      songs = found.songs;
    }
  }

  const handlePlayAll = (shuffle = false) => {
    if (songs.length === 0) return;
    if (shuffle) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    } else {
      playSong(songs[0], songs);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await deletePlaylist(playlistId);
      onNavigate('home');
    }
  };

  return (
    <div
      id="playlist-detail-screen"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28"
    >
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Playlist Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8 border-b border-zinc-800/80 mb-6">
        {/* Cover Art */}
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 shrink-0 bg-zinc-900">
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            {isLikedSongsList
              ? 'Collection'
              : isSystem
              ? 'History'
              : 'Public Playlist'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight mt-1 mb-2 truncate">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mb-4 max-w-xl">
            {description}
          </p>

          <div className="flex items-center justify-center sm:justify-start space-x-3 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">
              {songs.length} tracks
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            id="playlist-btn-play-all"
            disabled={songs.length === 0}
            onClick={() => handlePlayAll(false)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>Play All</span>
          </button>

          <button
            id="playlist-btn-shuffle"
            disabled={songs.length === 0}
            onClick={() => handlePlayAll(true)}
            className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 border border-zinc-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>

        {!isSystem && (
          <button
            onClick={handleDelete}
            title="Delete Playlist"
            className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 px-3 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Playlist</span>
          </button>
        )}
      </div>

      {/* Tracks List */}
      {songs.length > 0 ? (
        <div className="space-y-1.5">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.videoId === song.videoId;
            const liked = isLiked(song.videoId);

            return (
              <div
                key={`${song.videoId}-${index}`}
                className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-200 border ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-zinc-900/30 hover:bg-zinc-800/60 border-zinc-800/40 hover:border-zinc-700/60'
                }`}
              >
                {/* Index + Artwork + Title */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono text-zinc-500">
                    {index + 1}
                  </span>

                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => playSong(song, songs)}
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Play"
                    >
                      <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 ml-0.5" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 pr-2">
                    <h3
                      onClick={() => playSong(song, songs)}
                      className={`font-semibold text-xs sm:text-sm truncate cursor-pointer hover:underline ${
                        isCurrent ? 'text-emerald-400' : 'text-zinc-100'
                      }`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Duration & Row actions */}
                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                  <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">
                    {song.duration}
                  </span>

                  <button
                    onClick={() => toggleLike(song)}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
                    title={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => addToQueue(song)}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline-flex"
                    title="Add to Queue"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  {!isSystem && (
                    <button
                      onClick={() =>
                        removeSongFromPlaylist(playlistId, song.videoId)
                      }
                      className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => playSong(song, songs)}
                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-transform hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl text-zinc-500">
          <Music className="w-12 h-12 stroke-1 mx-auto mb-3 text-zinc-600" />
          <h3 className="text-base font-semibold text-zinc-300">
            No tracks in this collection yet
          </h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Search for your favorite songs to add them here.
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-700/80 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Find Music to Add</span>
          </button>
        </div>
      )}
    </div>
  );
};
