import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContext';
import {
  ChevronDown,
  MoreVertical,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';

interface LyricsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ isOpen, onClose }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    volume,
    isMuted,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    toggleMute,
  } = useMusicPlayer();

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Mock synced lyrics data (in production, fetch from LRCLIB API)
  const mockLyrics = [
    { time: 0, text: 'Welcome to the lyrics view' },
    { time: 5, text: 'This is a synced lyrics demo' },
    { time: 10, text: 'Lines highlight as the song plays' },
    { time: 15, text: 'Smooth auto-scroll keeps you centered' },
    { time: 20, text: 'Ambient blur background is beautiful' },
    { time: 25, text: 'Active line is bright and clear' },
    { time: 30, text: 'Other lines fade to gray' },
    { time: 35, text: 'This creates perfect focus' },
    { time: 40, text: 'On what\'s being sung right now' },
    { time: 45, text: 'Enjoy the music experience' },
  ];

  // Find active line based on current time
  const getActiveLine = () => {
    for (let i = mockLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= mockLyrics[i].time) {
        return i;
      }
    }
    return -1;
  };

  const activeLineIndex = getActiveLine();

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[110] flex flex-col"
      >
        {/* Ultra Blurred Album Art Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentSong.thumbnail})`,
              filter: 'blur(120px)',
              transform: 'scale(1.2)',
            }}
          />
          
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.button>

            <div className="flex-1 text-center mx-4">
              <p className="text-xs text-zinc-300 font-medium mb-0.5 uppercase tracking-wider">
                Lyrics
              </p>
              <h3 className="text-sm text-white font-semibold truncate">
                {currentSong.title}
              </h3>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </motion.button>
          </header>

          {/* Lyrics Container */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-6 py-12 scrollbar-hide"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              {mockLyrics.length > 0 ? (
                mockLyrics.map((line, index) => (
                  <motion.div
                    key={index}
                    ref={index === activeLineIndex ? activeLineRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: index === activeLineIndex ? 1 : 0.35,
                      y: 0,
                      scale: index === activeLineIndex ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`transition-all duration-300 cursor-pointer ${
                      index === activeLineIndex
                        ? 'text-white text-3xl md:text-4xl font-bold'
                        : 'text-zinc-400 text-2xl md:text-3xl font-semibold'
                    }`}
                    onClick={() => seekTo(line.time)}
                  >
                    {line.text}
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Music className="w-20 h-20 text-zinc-500 mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    No Lyrics Available
                  </h3>
                  <p className="text-zinc-400 text-lg">
                    Lyrics for this song are not available yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls Section */}
          <div className="px-6 pb-6 flex-shrink-0">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#C6FF3D]"
                  style={{
                    background: `linear-gradient(to right, #C6FF3D ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                  }}
                />
              </div>

              {/* Time stamps */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-zinc-300 tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs font-medium text-zinc-300 tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {/* Repeat */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRepeat}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  repeatMode !== 'off'
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/30'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </motion.button>

              {/* Previous */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSong}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-6 h-6 text-white" />
              </motion.button>

              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-2xl shadow-lime-500/40 hover:bg-lime-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-black fill-black" />
                ) : (
                  <Play className="w-8 h-8 text-black fill-black ml-1" />
                )}
              </motion.button>

              {/* Next */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSong}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-6 h-6 text-white" />
              </motion.button>

              {/* Shuffle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleShuffle}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isShuffle
                    ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/30'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Volume Control Row */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-3">
              {/* Mute/Unmute Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="flex-shrink-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </motion.button>

              {/* Volume Slider */}
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${
                      (isMuted ? 0 : volume) * 100
                    }%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>

              {/* Volume Icon (right) */}
              <Volume2 className="w-5 h-5 text-white flex-shrink-0 opacity-50" />
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

          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }

          input[type='range']::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};
