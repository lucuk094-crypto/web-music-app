import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { 
  Search, 
  Settings, 
  Heart, 
  Download, 
  Database, 
  TrendingUp, 
  FolderOpen,
  Music,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

interface LibraryViewNewProps {
  onNavigate: (screen: any, playlistId?: string) => void;
}

export const LibraryViewNew: React.FC<LibraryViewNewProps> = ({ onNavigate }) => {
  const { likedSongs = [], playlists = [] } = useMusicPlayer();
  const [activeTab, setActiveTab] = useState<string>('Playlists');
  const [dominantColor, setDominantColor] = useState<string>('59, 130, 246');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const tabs = ['Playlists', 'Songs', 'Albums', 'Artists', 'Local files'];

  const libraryItems = [
    { 
      id: 'downloaded', 
      label: 'Downloaded', 
      icon: Download, 
      count: 0,
      gradient: 'from-blue-600 to-blue-400'
    },
    { 
      id: 'cached', 
      label: 'Cached', 
      icon: Database, 
      count: 0,
      gradient: 'from-purple-600 to-purple-400'
    },
    { 
      id: 'top50', 
      label: 'My Top 50', 
      icon: TrendingUp, 
      count: 50,
      gradient: 'from-emerald-600 to-emerald-400'
    },
    { 
      id: 'local', 
      label: 'Local', 
      icon: FolderOpen, 
      count: 0,
      gradient: 'from-amber-600 to-amber-400'
    },
    { 
      id: 'spotify', 
      label: 'Import Spotify', 
      icon: Music, 
      count: null,
      gradient: 'from-green-600 to-green-400',
      isImport: true
    },
    { 
      id: 'youtube', 
      label: 'Import YouTube', 
      icon: Music, 
      count: null,
      gradient: 'from-red-600 to-red-400',
      isImport: true
    },
  ];

  useEffect(() => {
    const colors = ['59, 130, 246', '139, 92, 246', '236, 72, 153', '34, 197, 94', '251, 191, 36'];
    setDominantColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Ambient Blur Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: `radial-gradient(circle at 30% 20%, rgba(${dominantColor}, 0.4) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(${dominantColor}, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 50% 80%, rgba(${dominantColor}, 0.2) 0%, transparent 50%)`
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: 'blur(100px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 pb-32">
        {/* Header */}
        <header className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Library</h1>
              <p className="text-sm text-zinc-400">Saved music in Aura Music</p>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('search')}
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5 text-zinc-300" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5 text-zinc-300" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="px-6 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              
              return (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full transition-all backdrop-blur-md border whitespace-nowrap ${
                    isActive
                      ? 'bg-[#C6FF3D] text-black border-[#C6FF3D] shadow-lg shadow-lime-500/20'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-semibold">{tab}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sort Control */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="text-sm font-medium text-zinc-300">Name</span>
              <motion.div
                animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowUpDown className="w-4 h-4 text-zinc-400" />
              </motion.div>
            </motion.button>

            <span className="text-xs text-zinc-500 font-medium">
              {playlists.length + 6} items
            </span>
          </div>
        </div>

        {/* Liked Songs - Full Width Featured Card */}
        <div className="px-6 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('playlist-detail', 'liked-songs')}
            className="w-full rounded-3xl bg-gradient-to-br from-rose-900/40 via-pink-900/40 to-orange-900/40 backdrop-blur-md border border-white/10 p-6 flex items-center gap-5 hover:border-white/20 transition-all group"
          >
            {/* Heart Icon Container */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#C6FF3D] transition-colors">
                Liked Songs
              </h3>
              <p className="text-sm text-zinc-400">
                {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>

            {/* Arrow indicator */}
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-[#C6FF3D] rotate-[-90deg]" />
            </motion.div>
          </motion.button>
        </div>

        {/* Library Items Grid - Bento Style */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-2 gap-3">
            {libraryItems.map((item, index) => {
              const Icon = item.icon;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 text-left hover:bg-white/10 transition-all duration-200 group"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Label */}
                    <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#C6FF3D] transition-colors">
                      {item.label}
                    </h4>

                    {/* Count or Action */}
                    {item.isImport ? (
                      <p className="text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to import
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400">
                        {item.count === 0 ? 'Empty' : `${item.count} items`}
                      </p>
                    )}
                  </div>

                  {/* Spotify/YouTube badge */}
                  {item.id === 'spotify' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {item.id === 'youtube' && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Playlists Section */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Playlists</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-[#C6FF3D] text-black text-sm font-semibold shadow-lg shadow-lime-500/20 hover:bg-lime-400 transition-colors"
            >
              + New
            </motion.button>
          </div>

          {playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.map((playlist, index) => (
                <motion.button
                  key={playlist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('playlist-detail', playlist.id)}
                  className="w-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex items-center gap-4 hover:bg-white/10 transition-all group"
                >
                  {/* Playlist Cover */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Music className="w-6 h-6 text-zinc-400" />
                  </div>

                  {/* Playlist Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-[#C6FF3D] transition-colors">
                      {playlist.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate">
                      {playlist.songs?.length || 0} songs
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronDown className="w-5 h-5 text-zinc-500 rotate-[-90deg] group-hover:text-[#C6FF3D] transition-colors" />
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 text-center">
              <Music className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No Playlists Yet</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Create your first playlist and start organizing your music
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full bg-[#C6FF3D] text-black font-semibold shadow-lg shadow-lime-500/20"
              >
                Create Playlist
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
