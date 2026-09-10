import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContext';
import { LyricsView } from './LyricsView';
import {
  ChevronDown,
  MoreVertical,
  Heart,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  FileText,
  Volume2
} from 'lucide-react';

export const NowPlayingViewNew: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    showNowPlaying,
    setShowNowPlaying,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    toggleRepeat,
    toggleShuffle,
    likedSongs,
    toggleLikeSong,
  } = useMusicPlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const isLiked = currentSong ? likedSongs.some(s => s.videoId === currentSong.videoId) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time (negative format)
  const remainingTime = duration - currentTime;

  if (!currentSong || !showNowPlaying) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[100] flex flex-col"
      >
        {/* Full Bleed Album Art Background */}
        <div className="absolute inset-0">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
          
          {/* Dark gradient scrim - top */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
          
          {/* Dark gradient scrim - bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNowPlaying(false)}
              className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.button>

            <div className="flex-1 text-center mx-4">
              <p className="text-xs text-zinc-300 font-medium mb-0.5 uppercase tracking-wider">
                Now Playing
              </p>
              <h3 className="text-sm text-white font-semibold truncate">
                {currentSong.title}
              </h3>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </motion.button>
          </header>

          {/* Spacer to push content to bottom */}
          <div className="flex-1" />

          {/* Bottom Section - Song Info & Controls */}
          <div className="px-6 pb-8">
            {/* Song Title & Artist */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                    {currentSong.title}
                  </h1>
                  <p className="text-lg text-zinc-300 font-medium">
                    {currentSong.artist}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Like Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLikeSong}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        isLiked ? 'fill-[#C6FF3D] text-[#C6FF3D]' : 'text-white'
                      }`}
                    />
                  </motion.button>

                  {/* More Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    setIsDragging(true);
                    seekTo(parseFloat(e.target.value));
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#C6FF3D] hover:h-1.5 transition-all"
                  style={{
                    background: `linear-gradient(to right, #C6FF3D ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                  }}
                />
                
                {/* Custom thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#C6FF3D] shadow-lg shadow-lime-500/50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>

              {/* Time stamps */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-zinc-300 tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs font-medium text-zinc-300 tabular-nums">
                  -{formatTime(remainingTime)}
                </span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Shuffle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleShuffle}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isShuffle
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/30'
                    : 'bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>

              {/* Previous */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSong}
                className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <SkipBack className="w-6 h-6 text-white" />
              </motion.button>

              {/* Play/Pause - Large Center Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-2xl shadow-lime-500/40 hover:bg-lime-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-9 h-9 text-black fill-black" />
                ) : (
                  <Play className="w-9 h-9 text-black fill-black ml-1" />
                )}
              </motion.button>

              {/* Next */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSong}
                className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <SkipForward className="w-6 h-6 text-white" />
              </motion.button>

              {/* Repeat */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRepeat}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  repeatMode !== 'off'
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/30'
                    : 'bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            {/* Bottom Row - Queue, Lyrics, Device */}
            <div className="flex items-center justify-between gap-3">
              {/* Queue Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQueue(!showQueue)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${
                  showQueue
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/20'
                    : 'bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40'
                }`}
              >
                <ListMusic className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">Queue</span>
              </motion.button>

              {/* Lyrics Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLyrics(!showLyrics)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${
                  showLyrics
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/20'
                    : 'bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">Lyrics</span>
              </motion.button>

              {/* Device Output Pill (Spotify Connect style) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/40 transition-all"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Ponsel</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Lyrics Overlay (if enabled) */}
        <LyricsView isOpen={showLyrics} onClose={() => setShowLyrics(false)} />

        {/* Queue Overlay (if enabled) */}
        <AnimatePresence>
          {showQueue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-8"
              onClick={() => setShowQueue(false)}
            >
              <div className="text-center">
                <ListMusic className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Queue is Empty</h3>
                <p className="text-sm text-zinc-400">
                  Add songs to your queue to see them here
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #C6FF3D;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(198, 255, 61, 0.5);
          }

          input[type='range']::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #C6FF3D;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(198, 255, 61, 0.5);
          }

          input[type='range']:hover::-webkit-slider-thumb {
            width: 14px;
            height: 14px;
          }

          input[type='range']:hover::-moz-range-thumb {
            width: 14px;
            height: 14px;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
