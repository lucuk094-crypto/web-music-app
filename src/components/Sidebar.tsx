import React, { useState } from 'react';
import {
  Home,
  Search,
  Compass,
  Heart,
  Clock,
  Plus,
  Music,
  FolderHeart,
  ListMusic,
  Trash2,
  LogOut,
  User,
  Play,
  Pause,
  Library,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContext';
import { ScreenType } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  selectedPlaylistId?: string;
  onNavigate: (screen: ScreenType, playlistId?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  selectedPlaylistId,
  onNavigate,
}) => {
  const {
    likedSongs,
    history,
    playlists,
    createPlaylist,
    currentUser,
    signOut,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    setIsNowPlayingExpanded,
    togglePlay,
  } = useMusicPlayer();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = await createPlaylist(newTitle);
    setNewTitle('');
    setIsCreating(false);
    onNavigate('playlist-detail', created.id);
  };

  return (
    <aside
      id="main-sidebar"
      className="w-64 shrink-0 hidden md:flex flex-col bg-zinc-950 border-r border-zinc-800/80 p-4 h-[calc(100vh-61px)] overflow-y-auto select-none"
    >
      {/* Primary Navigation */}
      <div className="space-y-1 mb-6">
        <button
          id="sidebar-btn-home"
          onClick={() => onNavigate('home')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentScreen === 'home' && !selectedPlaylistId
              ? 'bg-zinc-800/90 text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          id="sidebar-btn-search"
          onClick={() => onNavigate('search')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentScreen === 'search'
              ? 'bg-zinc-800/90 text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        <button
          id="sidebar-btn-library"
          onClick={() => onNavigate('library')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentScreen === 'library'
              ? 'bg-zinc-800/90 text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Library className="w-5 h-5" />
          <span>Library</span>
        </button>

        <button
          id="sidebar-btn-explore"
          onClick={() => onNavigate('landing')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentScreen === 'landing'
              ? 'bg-zinc-800/90 text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>
      </div>

      {/* Library Section */}
      <div className="mb-6">
        <div className="px-3.5 mb-2 flex items-center justify-between">
          <button
            id="sidebar-heading-library"
            onClick={() => onNavigate('library')}
            className="text-xs font-semibold tracking-wider text-zinc-500 hover:text-zinc-300 uppercase transition-colors"
          >
            Your Library
          </button>
        </div>

        <div className="space-y-1">
          {/* Liked Songs */}
          <button
            id="sidebar-btn-liked"
            onClick={() => onNavigate('playlist-detail', 'liked-songs')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              selectedPlaylistId === 'liked-songs'
                ? 'bg-zinc-800/90 text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
              <span>Liked Songs</span>
            </div>
            {likedSongs.length > 0 && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {likedSongs.length}
              </span>
            )}
          </button>

          {/* History */}
          <button
            id="sidebar-btn-history"
            onClick={() => onNavigate('playlist-detail', 'history')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              selectedPlaylistId === 'history'
                ? 'bg-zinc-800/90 text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center">
                <Clock className="w-3 h-3 text-zinc-300" />
              </div>
              <span>Riwayat (History)</span>
            </div>
            {history.length > 0 && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3.5 mb-2">
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Playlists
          </span>
          <button
            id="sidebar-btn-new-playlist"
            onClick={() => setIsCreating(true)}
            title="Create Playlist"
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Create playlist input form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="px-2 mb-3">
            <div className="flex items-center bg-zinc-900 border border-emerald-500/50 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-emerald-500">
              <input
                id="input-new-playlist-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Playlist name..."
                autoFocus
                className="bg-transparent text-xs text-zinc-100 placeholder-zinc-500 w-full focus:outline-none px-1.5"
              />
              <button
                type="submit"
                className="text-xs bg-emerald-500 text-zinc-950 font-semibold px-2 py-0.5 rounded hover:bg-emerald-400"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-1"
              >
                ✕
              </button>
            </div>
          </form>
        )}

        {/* Playlists list */}
        <div className="space-y-1 overflow-y-auto flex-1 pr-1">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              id={`sidebar-playlist-${pl.id}`}
              onClick={() => onNavigate('playlist-detail', pl.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors text-left truncate ${
                selectedPlaylistId === pl.id
                  ? 'bg-zinc-800/90 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <ListMusic className="w-4 h-4 shrink-0" />
              <span className="truncate">{pl.title}</span>
              <span className="text-[10px] text-zinc-600 ml-auto">
                {pl.songs.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Song / Now Playing mini-widget in sidebar */}
      {currentSong && (
        <div
          id="sidebar-now-playing"
          className="mb-2 p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/30 transition-all cursor-pointer group shrink-0"
          onClick={() => setIsNowPlayingExpanded(true)}
          title="Open Now Playing"
        >
          <div className="flex items-center space-x-2.5">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
                {currentSong.title}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {currentSong.artist}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-zinc-950" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />
              )}
            </button>
          </div>
          {/* Playback progress indicator */}
          <div className="mt-2 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* User Profile & Logout section */}
      {currentUser && (
        <div id="sidebar-profile-menu" className="pt-3 mt-auto border-t border-zinc-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-100 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <button
              id="sidebar-btn-logout"
              onClick={async () => {
                await signOut();
                onNavigate('login');
              }}
              title="Logout / Sign out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
