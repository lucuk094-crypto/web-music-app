import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Play,
  Music2,
  FolderPlus,
  Compass,
  Search,
  Sparkles,
  Disc3,
  X,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { ScreenType, Playlist } from '../types';

interface LibraryViewProps {
  onNavigate: (screen: ScreenType, playlistId?: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onNavigate }) => {
  const {
    playlists,
    likedSongs,
    playSong,
    createPlaylist,
    currentUser,
  } = useMusicPlayer();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = await createPlaylist(newTitle.trim(), newDescription.trim());
    setNewTitle('');
    setNewDescription('');
    setIsCreating(false);
    onNavigate('playlist-detail', created.id);
  };

  const handlePlayLikedSongs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  const handlePlayPlaylist = (e: React.MouseEvent, pl: Playlist) => {
    e.stopPropagation();
    if (pl.songs && pl.songs.length > 0) {
      playSong(pl.songs[0], pl.songs);
    } else {
      onNavigate('playlist-detail', pl.id);
    }
  };

  const filteredPlaylists = playlists.filter((p) =>
    p.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div id="library-screen" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-3">
            <span>Your Library</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
              {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Cloud synchronized collections & liked tracks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Filter */}
          {playlists.length > 2 && (
            <div className="relative w-40 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter library..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* New Playlist Trigger */}
          <button
            id="library-btn-new-playlist"
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Create New Playlist
                </h3>
                <p className="text-xs text-zinc-400">
                  Saves to Supabase cloud database
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Playlist Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Chill Vibes, Roadtrip 2025"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What's this playlist about?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-md shadow-emerald-500/20"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Liked Songs Hero Card + All User Playlists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {/* Special "Liked Songs" Card */}
        <div
          id="library-card-liked-songs"
          onClick={() => onNavigate('playlist-detail', 'liked-songs')}
          className="group relative h-64 sm:h-72 rounded-3xl p-6 bg-gradient-to-br from-indigo-900/90 via-purple-900/70 to-rose-950/80 border border-indigo-500/30 hover:border-indigo-400/60 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-all pointer-events-none" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-rose-400 shadow-lg mb-4">
              <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300/80 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
              Special Collection
            </span>

            <h2 className="text-xl font-bold text-white mt-2 mb-1">
              Liked Songs
            </h2>
            <p className="text-xs text-zinc-300 line-clamp-2">
              All your favorite tracks saved across searches and playlists
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-semibold text-rose-200">
              {likedSongs.length} {likedSongs.length === 1 ? 'track' : 'tracks'}
            </span>

            <button
              onClick={handlePlayLikedSongs}
              disabled={likedSongs.length === 0}
              className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-110 active:scale-95"
              title="Play Liked Songs"
            >
              <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
            </button>
          </div>
        </div>

        {/* User Playlists */}
        {filteredPlaylists.map((pl) => {
          const songCount = pl.songs ? pl.songs.length : 0;
          const displayCover =
            pl.songs?.[0]?.thumbnail ||
            pl.coverUrl ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={pl.id}
              id={`library-card-${pl.id}`}
              onClick={() => onNavigate('playlist-detail', pl.id)}
              className="group bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-3xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
            >
              {/* Cover Art with Hover Play Button */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3.5 bg-zinc-800 shadow-md">
                <img
                  src={displayCover}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Play Button */}
                <button
                  onClick={(e) => handlePlayPlaylist(e, pl)}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hover:scale-110"
                  title="Play all tracks"
                >
                  <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
                </button>
              </div>

              {/* Title & Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
                  {pl.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                  {pl.description || `${songCount} tracks`}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
                <span className="font-medium">
                  {songCount} {songCount === 1 ? 'track' : 'tracks'}
                </span>
                <span className="capitalize text-[10px] text-zinc-400">
                  Playlist
                </span>
              </div>
            </div>
          );
        })}

        {/* Create Card in Grid if no user playlists */}
        {playlists.length === 0 && (
          <div
            onClick={() => setIsCreating(true)}
            className="h-64 sm:h-72 rounded-3xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-900/20 hover:bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-200 group-hover:text-emerald-400 transition-colors">
              Create Your First Playlist
            </h3>
            <p className="text-xs text-zinc-500 max-w-[180px] mt-1">
              Add songs from search or collections into custom sets
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
