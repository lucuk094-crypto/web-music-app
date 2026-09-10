import React, { useState, useEffect } from 'react';
import { PlayerProvider, useMusicPlayer } from './context/PlayerContextNew';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MiniPlayer } from './components/MiniPlayer';
import { BottomNav } from './components/BottomNav';
import { NowPlayingViewNew } from './components/NowPlayingViewNew';
import { LandingView } from './components/LandingView';
import { HomeViewNew } from './components/HomeViewNew';
import { ExploreView } from './components/ExploreView';
import { LibraryViewNew } from './components/LibraryViewNew';
import { SearchView } from './components/SearchView';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { LoginView } from './components/LoginView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ScreenType } from './types';
import { Music2 } from 'lucide-react';

function AppContent() {
  const { currentUser, isAuthLoading } = useMusicPlayer();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | undefined>();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Cek session di setiap halaman — kalau belum login, redirect ke halaman Login
  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser && currentScreen !== 'login') {
        setCurrentScreen('login');
      } else if (currentUser && currentScreen === 'login') {
        setCurrentScreen('home');
      }
    }
  }, [isAuthLoading, currentUser, currentScreen]);

  const navigateTo = (screen: ScreenType, playlistId?: string) => {
    if (!currentUser && screen !== 'login') {
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen(screen);
    setSelectedPlaylistId(playlistId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial loading screen while checking Supabase session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-pulse">
          <Music2 className="w-7 h-7 text-zinc-950 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col font-sans selection:bg-[#C6FF3D] selection:text-black">
      {/* Top Navigation - Hidden on new home */}
      {currentScreen !== 'home' && (
        <Navbar
          currentScreen={currentScreen}
          onNavigate={navigateTo}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on login screen and new home) */}
        {currentUser && currentScreen !== 'home' && (
          <Sidebar
            currentScreen={currentScreen}
            selectedPlaylistId={selectedPlaylistId}
            onNavigate={navigateTo}
          />
        )}

        {/* Main Workspace / Screens */}
        <main className={`flex-1 overflow-y-auto ${currentScreen === 'home' || currentScreen === 'landing' || currentScreen === 'library' ? 'h-screen' : 'h-[calc(100vh-61px)]'}`}>
          {currentScreen === 'login' && (
            <LoginView
              onSuccess={() => navigateTo('home')}
              onOpenConfig={() => setIsSupabaseModalOpen(true)}
            />
          )}

          {currentScreen === 'landing' && (
            <ExploreView onNavigate={navigateTo} />
          )}

          {currentScreen === 'home' && (
            <HomeViewNew onNavigate={navigateTo} />
          )}

          {currentScreen === 'search' && (
            <SearchView />
          )}

          {currentScreen === 'library' && (
            <LibraryViewNew onNavigate={navigateTo} />
          )}

          {currentScreen === 'playlist-detail' && (
            <PlaylistDetailView
              playlistId={selectedPlaylistId || 'liked-songs'}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsView onNavigate={navigateTo} />
          )}
        </main>
      </div>

      {/* Bottom Navigation with Glassmorphism */}
      {currentUser && currentScreen !== 'login' && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={navigateTo}
        />
      )}

      {/* Persistent Audio MiniPlayer */}
      <MiniPlayer />

      {/* Fullscreen / Expanded Now Playing with Album Art Background */}
      <NowPlayingViewNew />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenConfig={() => setIsSupabaseModalOpen(true)}
      />

      <AddToPlaylistModal />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
