import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { fetchLyrics, parseLrcLyrics, LyricLine } from '../lib/api';
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
  Volume2,
  VolumeX,
  GripVertical,
} from 'lucide-react';

type TabType = 'player' | 'lyrics' | 'queue';

export const NowPlayingViewNew: React.FC = () => {
  const {
    currentSong,
    videoId,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    queue,
    queueIndex,
    showNowPlaying,
    setShowNowPlaying,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    likedSongs,
    toggleLikeSong,
    playSong,
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<TabType>('player');
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const isLiked = currentSong ? likedSongs.some(s => s.spotifyId === currentSong.spotifyId) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch lyrics when tab opens
  useEffect(() => {
    if (activeTab === 'lyrics' && currentSong && !lyrics && !plainLyrics && !isLoadingLyrics) {
      const loadLyrics = async () => {
        setIsLoadingLyrics(true);
        setLyricsError(false);
        
        try {
          const lyricsData = await fetchLyrics(currentSong.title, currentSong.artist);
          
          if (lyricsData.syncedLyrics) {
            const parsed = parseLrcLyrics(lyricsData.syncedLyrics);
            setLyrics(parsed);
          } else if (lyricsData.plainLyrics) {
            setPlainLyrics(lyricsData.plainLyrics);
          } else {
            setLyricsError(true);
          }
        } catch (error) {
          console.error('Failed to load lyrics:', error);
          setLyricsError(true);
        } finally {
          setIsLoadingLyrics(false);
        }
      };

      loadLyrics();
    }
  }, [activeTab, currentSong, lyrics, plainLyrics, isLoadingLyrics]);

  // Reset lyrics when song changes
  useEffect(() => {
    setLyrics(null);
    setPlainLyrics(null);
    setLyricsError(false);
  }, [currentSong?.spotifyId]);

  // Find active lyric line
  const activeLyricIndex = lyrics ? lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  }) : -1;

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current && activeLyricIndex >= 0) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex]);

  // Handle progress bar seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    seekTo(Math.max(0, Math.min(duration, newTime)));
  };

  if (!currentSong || !showNowPlaying) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0A]"
      >
        {/* Background based on tab */}
        {activeTab === 'player' && (
          <div className="absolute inset-0">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="absolute inset-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentSong.cover})`,
                filter: 'blur(120px)',
                transform: 'scale(1.2)',
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNowPlaying(false)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
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
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </motion.button>
          </header>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Player Tab */}
            {activeTab === 'player' && (
              <div className="h-full flex flex-col justify-end px-6 pb-8">
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
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleLikeSong}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            isLiked ? 'fill-[#C6FF3D] text-[#C6FF3D]' : 'text-white'
                          }`}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div
                    onClick={handleProgressClick}
                    className="relative h-1 bg-white/20 rounded-full cursor-pointer group mb-2"
                  >
                    <motion.div
                      className="h-full bg-[#C6FF3D] rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#C6FF3D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      style={{ left: `${progressPercent}%`, marginLeft: '-6px' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>{formatTime(currentTime)}</span>
                    <span>-{formatTime(duration - currentTime)}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleShuffle}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isShuffle
                        ? 'bg-[#C6FF3D] text-black shadow-lg shadow-lime-500/30'
                        : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevSong}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <SkipBack className="w-6 h-6 text-white" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlay}
                    disabled={isBuffering}
                    className="w-20 h-20 rounded-full bg-[#C6FF3D] flex items-center justify-center shadow-2xl shadow-lime-500/40 hover:bg-lime-400 transition-colors disabled:opacity-50"
                  >
                    {isBuffering ? (
                      <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-9 h-9 text-black fill-black" />
                    ) : (
                      <Play className="w-9 h-9 text-black fill-black ml-1" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextSong}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <SkipForward className="w-6 h-6 text-white" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleRepeat}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
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
                </div>

                {/* Bottom Row - Queue, Lyrics, Volume */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <ListMusic className="w-5 h-5 text-white" />
                    <span className="text-sm font-semibold text-white">Queue</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('lyrics')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-white" />
                    <span className="text-sm font-semibold text-white">Lyrics</span>
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </motion.button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, white ${
                          (isMuted ? 0 : volume) * 100
                        }%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lyrics Tab */}
            {activeTab === 'lyrics' && (
              <div className="h-full flex flex-col px-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Lyrics</h2>
                  <button
                    onClick={() => setActiveTab('player')}
                    className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-sm font-semibold text-white"
                  >
                    Back
                  </button>
                </div>

                <div
                  ref={lyricsContainerRef}
                  className="flex-1 overflow-y-auto pb-8 scrollbar-hide"
                >
                  {isLoadingLyrics && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-12 h-12 border-4 border-[#C6FF3D] border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-zinc-400">Loading lyrics...</p>
                    </div>
                  )}

                  {lyricsError && !isLoadingLyrics && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <FileText className="w-16 h-16 text-zinc-500 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        Lyrics Not Available
                      </h3>
                      <p className="text-zinc-400">
                        Lyrics for this song are not available
                      </p>
                    </div>
                  )}

                  {lyrics && lyrics.length > 0 && (
                    <div className="space-y-6 py-8">
                      {lyrics.map((line, index) => (
                        <motion.div
                          key={index}
                          ref={index === activeLyricIndex ? activeLineRef : null}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: index === activeLyricIndex ? 1 : 0.35,
                            y: 0,
                            scale: index === activeLyricIndex ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          onClick={() => seekTo(line.time)}
                          className={`cursor-pointer transition-all duration-300 ${
                            index === activeLyricIndex
                              ? 'text-white text-4xl font-bold'
                              : 'text-zinc-400 text-3xl font-semibold'
                          }`}
                        >
                          {line.text}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {plainLyrics && !lyrics && (
                    <div className="py-8 text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                      {plainLyrics}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Queue Tab */}
            {activeTab === 'queue' && (
              <div className="h-full flex flex-col px-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Queue ({queue.length})</h2>
                  <button
                    onClick={() => setActiveTab('player')}
                    className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors text-sm font-semibold text-white"
                  >
                    Back
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide space-y-2">
                  {queue.map((song, index) => {
                    const isCurrent = index === queueIndex;
                    
                    return (
                      <motion.div
                        key={`${song.spotifyId}-${index}`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => playSong(song, queue)}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#C6FF3D]/20 border-2 border-[#C6FF3D]'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={song.cover}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-semibold truncate ${
                              isCurrent ? 'text-[#C6FF3D]' : 'text-white'
                            }`}
                          >
                            {song.title}
                          </h4>
                          <p className="text-sm text-zinc-400 truncate">
                            {song.artist}
                          </p>
                        </div>

                        <span className="text-xs text-zinc-500 font-mono">
                          {song.durationFormatted}
                        </span>

                        {isCurrent && isPlaying && (
                          <div className="flex gap-0.5">
                            <div className="w-1 h-4 bg-[#C6FF3D] animate-pulse" />
                            <div className="w-1 h-4 bg-[#C6FF3D] animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1 h-4 bg-[#C6FF3D] animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
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
