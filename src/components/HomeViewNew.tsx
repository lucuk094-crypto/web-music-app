import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { fetchFeaturedPlaylists, fetchNewReleases, fetchPlaylistTracks } from '../lib/api';
import { Bell, Search, Settings, Play, Heart, Clock, Download, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeViewNewProps {
  onNavigate: (screen: any, playlistId?: string) => void;
}

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  type: 'playlist' | 'album' | 'mix';
}

export const HomeViewNew: React.FC<HomeViewNewProps> = ({ onNavigate }) => {
  const { currentUser, recentSongs = [], playSong } = useMusicPlayer();
  const [activeFilter, setActiveFilter] = useState<string>('History');
  const [dominantColor, setDominantColor] = useState<string>('59, 130, 246');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Spotify data state
  const [featuredPlaylists, setFeaturedPlaylists] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Spotify data
  useEffect(() => {
    const loadSpotifyData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured playlists
        const playlists = await fetchFeaturedPlaylists(12);
        setFeaturedPlaylists(playlists);
        
        // Fetch new releases
        const releases = await fetchNewReleases(12);
        setNewReleases(releases);
        
        // Fetch trending tracks from featured playlist
        if (playlists.length > 0) {
          const tracks = await fetchPlaylistTracks(playlists[0].id, 20);
          setTrendingTracks(tracks);
        }
      } catch (error) {
        console.error('Error loading Spotify data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpotifyData();
  }, []);

  const featuredItems: FeaturedItem[] = [
    {
      id: '1',
      title: 'Daily Mix',
      subtitle: 'Your personalized playlist',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=85&fit=crop',
      type: 'mix'
    },
    {
      id: '2',
      title: 'Indonesian Hits',
      subtitle: 'Tulus, Raisa, Sheila on 7',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=85&fit=crop',
      type: 'playlist'
    },
    {
      id: '3',
      title: 'Chill Vibes',
      subtitle: 'Relax and unwind',
      coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=85&fit=crop',
      type: 'playlist'
    },
  ];

  const filters = [
    { icon: Clock, label: 'History', count: recentSongs?.length || 0, id: 'filter-history' },
    { icon: TrendingUp, label: 'Stats', count: 0, id: 'filter-stats' },
    { icon: Heart, label: 'Liked', count: 0, id: 'filter-liked' },
    { icon: Download, label: 'Downloaded', count: 0, id: 'filter-downloaded' },
  ];

  useEffect(() => {
    const colors = ['59, 130, 246', '139, 92, 246', '236, 72, 153', '34, 197, 94'];
    setDominantColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

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
        <header className="px-6 pt-6 pb-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C6FF3D] to-lime-500 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-lime-500/20"
          >
            {currentUser?.name.charAt(0).toUpperCase() || 'U'}
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5 text-zinc-300" />
            </motion.button>
            
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
              onClick={() => onNavigate('settings')}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-zinc-300" />
            </motion.button>
          </div>
        </header>

        {/* Greeting */}
        <div className="px-6 mt-6 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-white">
              Hi, {currentUser?.name || 'Guest'}
            </h1>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
            />
          </div>
          <p className="text-zinc-400 mt-1 text-sm">Welcome back to your music</p>
        </div>

        {/* Filter Chips */}
        <div className="px-6 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.label;
              
              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.label)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all backdrop-blur-md border ${
                    isActive
                      ? 'bg-[#C6FF3D] text-black border-[#C6FF3D] shadow-lg shadow-lime-500/20'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {filter.label}
                  </span>
                  {filter.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20' : 'bg-white/20'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 3D Coverflow Carousel */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 px-6">Featured</h2>
          
          <div className="relative h-[420px]">
            {/* Carousel Container with 3D Perspective */}
            <div className="relative h-full flex items-center justify-center overflow-hidden px-4">
              {featuredItems.map((item, index) => {
                const offset = index - currentSlide;
                const isActive = offset === 0;
                const isLeft = offset < 0;
                const isRight = offset > 0;
                const absOffset = Math.abs(offset);
                
                return (
                  <motion.div
                    key={item.id}
                    animate={{
                      x: `${offset * 65}%`,
                      scale: isActive ? 1 : 0.7,
                      opacity: absOffset === 0 ? 1 : absOffset === 1 ? 0.5 : 0.2,
                      zIndex: isActive ? 30 : absOffset === 1 ? 20 : 10,
                      rotateY: isLeft ? 40 : isRight ? -40 : 0,
                    }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    onClick={() => setCurrentSlide(index)}
                    className="absolute w-[70%] md:w-[55%] lg:w-[45%] max-w-sm cursor-pointer"
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1200px',
                    }}
                  >
                    <motion.div
                      whileHover={isActive ? { scale: 1.02 } : {}}
                      className="relative rounded-[44px] overflow-hidden shadow-2xl"
                      style={{
                        aspectRatio: '3/4',
                      }}
                    >
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
                      
                      {/* Card Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-300 opacity-80">
                          {item.subtitle}
                        </p>
                      </div>

                      {/* Play Button - Only on Active Card */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-2xl shadow-lime-500/40"
                          >
                            <Play className="w-7 h-7 text-black fill-black ml-1" />
                          </motion.button>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-40 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              disabled={currentSlide === featuredItems.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-40 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 z-40">
              {featuredItems.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-[#C6FF3D] shadow-lg shadow-lime-500/30'
                      : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Keep Listening Section */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Keep Listening</h2>
            <button className="text-sm text-[#C6FF3D] font-semibold hover:underline">
              See All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {recentSongs && recentSongs.length > 0 ? (
              recentSongs.slice(0, 8).map((song, index) => (
                <motion.div
                  key={`${song.spotifyId}-${index}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    // TODO: Implement play from SpotifyTrack
                    console.log('Play song:', song);
                  }}
                  className="relative flex-shrink-0 w-40 cursor-pointer group"
                >
                  <div className="relative rounded-[24px] overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-full h-40 object-cover"
                    />
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-[#C6FF3D]/90 backdrop-blur-md flex items-center justify-center shadow-lg shadow-lime-500/30"
                      >
                        <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                      </motion.button>
                    </motion.div>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {song.title}
                    </h4>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full rounded-[32px] bg-white/5 backdrop-blur-md border border-white/10 p-8 text-center">
                <Clock className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No History Yet</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Start exploring and your listening history will appear here
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('search')}
                  className="px-6 py-3 rounded-full bg-[#C6FF3D] text-black font-semibold shadow-lg shadow-lime-500/20"
                >
                  Explore Music
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* ROW 1: Indonesian Hits - Varian 1 (Cover dengan Label Overlay) */}
        <div className="mb-10">
          <div className="px-6 mb-4">
            <p className="text-xs font-bold text-[#C6FF3D] uppercase tracking-wider mb-1">
              LAGU HITS INDONESIA
            </p>
            <h2 className="text-3xl font-bold text-purple-400">
              Top Chart Minggu Ini 🔥
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {[
              { title: 'Bertaut', artist: 'Nadin Amizah', cover: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=85&fit=crop', badge: true },
              { title: 'Komang', artist: 'Raim Laode', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=85&fit=crop', badge: true },
              { title: 'Lathi', artist: 'Weird Genius ft. Sara Fajira', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=85&fit=crop', badge: false },
              { title: 'Menungso Ora Toto', artist: 'Tekomlaku', cover: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=800&q=85&fit=crop', badge: false },
            ].map((item, index) => (
              <motion.div
                key={`hits-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-48 cursor-pointer group"
              >
                <div className="relative rounded-[28px] overflow-hidden shadow-lg mb-3">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Badge Play di pojok kiri atas */}
                  {item.badge && (
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                    </div>
                  )}
                  
                  {/* Label Overlay Sticker Style */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Hover Play Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                    </div>
                  </motion.div>
                </div>

                {/* Info di bawah card */}
                <p className="text-xs text-zinc-400 px-1">{item.artist}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROW 2: New Releases - Varian 2 (Cover Foto Polos) */}
        <div className="mb-10">
          <div className="px-6 mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-purple-400">
              Rilis Terbaru
            </h2>
            <button className="text-sm text-zinc-400 hover:text-[#C6FF3D] transition-colors flex items-center gap-1">
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {[
              { title: 'Mungkin Hari Ini Esok Atau Nanti', artist: 'Anneth', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=85&fit=crop' },
              { title: 'Kalah', artist: 'Tiara Andini', cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=85&fit=crop' },
              { title: 'Setelah Kau Pergi', artist: 'Rossa', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=85&fit=crop' },
              { title: 'Pesan Terakhir', artist: 'Lyodra', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=85&fit=crop' },
              { title: 'Sempurna', artist: 'Andra and The Backbone', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=85&fit=crop' },
            ].map((item, index) => (
              <motion.div
                key={`new-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-44 cursor-pointer group"
              >
                <div className="relative rounded-[24px] overflow-hidden shadow-lg mb-3">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-44 object-cover"
                  />
                  
                  {/* Play icon kecil pojok kiri atas */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  </div>

                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                  />
                </div>

                {/* Info di bawah card */}
                <h4 className="text-sm font-semibold text-white truncate px-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate mt-0.5 px-1">{item.artist}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROW 3: Mood/Season - Varian 1 dengan Eyebrow + Emoji */}
        <div className="mb-10">
          <div className="px-6 mb-4">
            <p className="text-xs font-bold text-[#C6FF3D] uppercase tracking-wider mb-1">
              SUASANA MENYENANGKAN & LAGU CERIA
            </p>
            <h2 className="text-3xl font-bold text-purple-400">
              Kemarau Chill ☀️
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {[
              { title: 'Summer Vibes', artist: 'Various Artists', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85&fit=crop' },
              { title: 'Santai Sore', artist: 'Indie Indonesia Mix', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=85&fit=crop' },
              { title: 'Akustik Pantai', artist: 'Beach Acoustic', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85&fit=crop' },
              { title: 'Ngopi Santuy', artist: 'Coffeeshop Playlist', cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85&fit=crop' },
            ].map((item, index) => (
              <motion.div
                key={`mood-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-52 cursor-pointer group"
              >
                <div className="relative rounded-[28px] overflow-hidden shadow-lg mb-3">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-52 object-cover"
                  />
                  
                  {/* Label sticker overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight drop-shadow-lg" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}>
                      {item.title}
                    </h3>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-2xl">
                      <Play className="w-7 h-7 text-black fill-black ml-0.5" />
                    </div>
                  </motion.div>
                </div>

                <p className="text-xs text-zinc-400 px-1">{item.artist}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROW 4: Similar to Artist - Varian 3 (Video Card dengan Play Besar) */}
        <div className="mb-10">
          <div className="px-6 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar Artist */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=85&fit=crop&crop=faces"
                  alt="Artist"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Similar to</p>
                <h2 className="text-2xl font-bold text-purple-400">Tulus</h2>
              </div>
            </div>
            <button className="text-sm text-zinc-400 hover:text-[#C6FF3D] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {[
              { title: 'Hati-Hati di Jalan', artist: 'Tulus', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=85&fit=crop' },
              { title: 'Monokrom', artist: 'Tulus', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=85&fit=crop' },
              { title: 'Pamit', artist: 'Tulus', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=85&fit=crop' },
              { title: 'Mantan Terindah', artist: 'Raisa', cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=85&fit=crop' },
            ].map((item, index) => (
              <motion.div
                key={`similar-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-56 cursor-pointer group"
              >
                <div className="relative rounded-[24px] overflow-hidden shadow-lg mb-3">
                  {/* Desaturated image */}
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-32 object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Play button BESAR DI TENGAH */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#C6FF3D] transition-colors shadow-xl"
                    >
                      <Play className="w-6 h-6 text-white group-hover:text-black fill-current ml-0.5" />
                    </motion.div>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white truncate px-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate mt-0.5 px-1">{item.artist}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROW 5: Trending Playlists - Varian 4 (Collage 4-Foto) */}
        <div className="mb-10">
          <div className="px-6 mb-4">
            <h2 className="text-3xl font-bold text-purple-400">
              Playlist Trending Komunitas 📈
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {[
              {
                title: 'Top 50 Indonesia',
                count: '125 songs',
                covers: [
                  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&q=85&fit=crop',
                ]
              },
              {
                title: 'Indie Indonesia Essentials',
                count: '87 songs',
                covers: [
                  'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=85&fit=crop',
                ]
              },
              {
                title: 'Hits Tahun 2000an',
                count: '200 songs',
                covers: [
                  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=85&fit=crop',
                  'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&q=85&fit=crop',
                ]
              },
            ].map((item, index) => (
              <motion.div
                key={`playlist-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-48 cursor-pointer group"
              >
                {/* Collage 2x2 Grid */}
                <div className="relative rounded-[24px] overflow-hidden shadow-lg mb-3">
                  <div className="grid grid-cols-2 gap-0.5">
                    {item.covers.map((cover, i) => (
                      <div key={i} className="aspect-square">
                        <img
                          src={cover}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-2xl">
                      <Play className="w-6 h-6 text-black fill-black ml-0.5" />
                    </div>
                  </motion.div>
                </div>

                <h4 className="text-sm font-semibold text-white truncate px-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate mt-0.5 px-1">{item.count}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROW 6: More Genres - Varian 2 */}
        <div className="mb-10">
          <div className="px-6 mb-4">
            <p className="text-xs font-bold text-[#C6FF3D] uppercase tracking-wider mb-1">
              JELAJAHI GENRE
            </p>
            <h2 className="text-3xl font-bold text-purple-400">
              Pop & R&B Indonesia 🎵
            </h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pl-6">
            {[
              { title: 'R&B Indo Hits', artist: 'Smooth & Soulful', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=85&fit=crop' },
              { title: 'Pop Ballad Terbaik', artist: 'Heartbreak Songs', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=85&fit=crop' },
              { title: 'Dangdut Modern', artist: 'New Wave Dangdut', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=85&fit=crop' },
              { title: 'Jazz Indonesia', artist: 'Smooth Jazz Vibes', cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=85&fit=crop' },
            ].map((item, index) => (
              <motion.div
                key={`genre-${index}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 w-44 cursor-pointer group"
              >
                <div className="relative rounded-[24px] overflow-hidden shadow-lg mb-3">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-44 object-cover"
                  />
                  
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                  />
                </div>

                <h4 className="text-sm font-semibold text-white truncate px-1">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate mt-0.5 px-1">{item.artist}</p>
              </motion.div>
            ))}
          </div>
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
