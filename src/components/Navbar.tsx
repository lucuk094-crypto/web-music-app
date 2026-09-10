import React from 'react';
import {
  Music2,
  Search,
  User,
  Database,
  Compass,
  Home,
  Heart,
  Clock,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Library,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContext';
import { isSupabaseConfigured, signOutUser } from '../lib/supabase';
import { ScreenType } from '../types';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType, playlistId?: string) => void;
  onOpenAuth: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenAuth,
  onOpenSupabaseConfig,
}) => {
  const { currentUser, signOut } = useMusicPlayer();
  const hasSupabase = isSupabaseConfigured();

  const handleLogout = async () => {
    await signOut();
    onNavigate('login');
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors"
    >
      {/* Brand / Logo */}
      <div className="flex items-center space-x-6">
        <button
          id="btn-brand-logo"
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Music2 className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
              Aura <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Music</span>
            </span>
          </div>
        </button>

        {/* Primary nav buttons for tablet/desktop */}
        <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-zinc-800">
          <button
            id="nav-btn-home"
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              currentScreen === 'home'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            id="nav-btn-search"
            onClick={() => onNavigate('search')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              currentScreen === 'search'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            id="nav-btn-library"
            onClick={() => onNavigate('library')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              currentScreen === 'library'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Library className="w-4 h-4" />
            Library
          </button>
          <button
            id="nav-btn-landing"
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              currentScreen === 'landing'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </button>
        </nav>
      </div>

      {/* Quick Search trigger & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Search Bar pill trigger */}
        <button
          id="navbar-search-trigger"
          onClick={() => onNavigate('search')}
          className="hidden sm:flex items-center space-x-3 bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3.5 py-1.5 rounded-full text-sm transition-all w-52 md:w-64"
        >
          <Search className="w-4 h-4 text-zinc-400" />
          <span className="truncate">Search songs, artists...</span>
          <kbd className="hidden lg:inline-block ml-auto text-[10px] text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
            /
          </kbd>
        </button>

        {/* Supabase status badge / button */}
        <button
          id="btn-supabase-status"
          onClick={onOpenSupabaseConfig}
          title={
            hasSupabase
              ? 'Supabase Database Connected'
              : 'Supabase Offline/Local Storage (Click to configure)'
          }
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            hasSupabase
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/50'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {hasSupabase ? 'Supabase Active' : 'Supabase'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              hasSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400/80'
            }`}
          />
        </button>

        {/* User Account / Auth */}
        {currentUser ? (
          <div className="flex items-center space-x-2">
            <div
              id="user-profile-badge"
              className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-zinc-200 hidden sm:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </div>
            <button
              id="btn-logout"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="btn-login-open"
            onClick={() => onNavigate('login')}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
