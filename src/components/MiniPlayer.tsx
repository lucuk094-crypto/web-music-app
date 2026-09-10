import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { Play, Pause, SkipForward, SkipBack, Heart, Maximize2 } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setShowNowPlaying,
    likedSongs,
    toggleLikeSong,
  } = useMusicPlayer();

  const [dominantColor, setDominantColor] = useState('59, 130, 246');
  const [isMarquee, setIsMarquee] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const isLiked = currentSong ? likedSongs.some(s => s.spotifyId === currentSong.spotifyId) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Check if title needs marquee
  useEffect(() => {
    if (titleRef.current) {
      const needsMarquee = titleRef.current.scrollWidth > titleRef.current.clientWidth;
      setIsMarquee(needsMarquee);
    }
  }, [currentSong]);

  // Simulate color extraction
  useEffect(() => {
    if (currentSong) {
      const colors = ['59, 130, 246', '139, 92, 246', '236, 72, 153', '34, 197, 94', '251, 191, 36'];
      setDominantColor(colors[Math.floor(Math.random() * colors.length)]);
    }
  }, [currentSong?.spotifyId]);

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    
    seekTo(Math.max(0, Math.min(duration, newTime)));
  };

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40"
      >
        {/* Ambient blur background */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: `radial-gradient(circle at 30% 50%, rgba(${dominantColor}, 0.6) 0%, rgba(${dominantColor}, 0.3) 50%, transparent 100%)`
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ filter: 'blur(60px)' }}
          />
        </div>

        {/* Glassmorphism pill */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Progress bar at top of pill */}
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
          >
            <motion.div
              className="h-full bg-[#C6FF3D]"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Hover thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#C6FF3D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progressPercent}%`, marginLeft: '-6px' }}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 pt-4">
            {/* Thumbnail */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNowPlaying(true)}
              className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden cursor-pointer ring-2 ring-white/20"
            >
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              {isBuffering && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#C6FF3D] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
            </motion.div>

            {/* Song info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => setShowNowPlaying(true)}
            >
              <div ref={titleRef} className="relative overflow-hidden">
                <motion.h4
                  animate={isMarquee ? {
                    x: [0, -200, 0],
                  } : {}}
                  transition={isMarquee ? {
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  } : {}}
                  className="text-sm font-bold text-white whitespace-nowrap"
                >
                  {currentSong.title}
                </motion.h4>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {currentSong.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Like button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleLikeSong}
                className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isLiked ? 'fill-[#C6FF3D] text-[#C6FF3D]' : 'text-zinc-300'
                  }`}
                />
              </motion.button>

              {/* Previous button (hidden on mobile) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSong}
                className="hidden sm:flex w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 items-center justify-center hover:bg-white/10 transition-colors"
              >
                <SkipBack className="w-4 h-4 text-zinc-300" />
              </motion.button>

              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                disabled={isBuffering}
                className="w-10 h-10 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-lg shadow-lime-500/30 hover:bg-lime-400 transition-colors disabled:opacity-50"
              >
                {isBuffering ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 text-black fill-black" />
                ) : (
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                )}
              </motion.button>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSong}
                className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <SkipForward className="w-4 h-4 text-zinc-300" />
              </motion.button>

              {/* Maximize button (desktop only) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNowPlaying(true)}
                className="hidden md:flex w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-zinc-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
