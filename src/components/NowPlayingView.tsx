import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  FileText,
  PlusCircle,
  Clock,
  Sparkles,
  ExternalLink,
  GripVertical,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContext';
import { formatTime, getActiveLyricIndex } from '../lib/lyrics';

export const NowPlayingView: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    lyrics,
    isLoadingLyrics,
    queue,
    queueIndex,
    isNowPlayingExpanded,
    setIsNowPlayingExpanded,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    isLiked,
    openAddToPlaylist,
    playSong,
    removeFromQueue,
    reorderQueue,
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('lyrics');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedQueue = [...queue];
    const [movedItem] = updatedQueue.splice(draggedIndex, 1);
    updatedQueue.splice(targetIndex, 0, movedItem);

    reorderQueue(updatedQueue);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!isNowPlayingExpanded || !currentSong) {
    return null;
  }

  const liked = isLiked(currentSong.videoId);
  const syncedLines = lyrics?.parsedLines || [];
  const activeLyricIdx = getActiveLyricIndex(syncedLines, currentTime);

  // Auto-scroll lyrics smoothly to active line
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIdx]);

  return (
    <div
      id="now-playing-fullscreen"
      className="fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto flex flex-col text-zinc-100 transition-all select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Dynamic ambient background glow using song thumbnail */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none filter blur-[120px] scale-150 transform transition-all duration-700"
        style={{
          backgroundImage: `url(${currentSong.thumbnail})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/40">
        <button
          id="now-playing-btn-collapse"
          onClick={() => setIsNowPlayingExpanded(false)}
          className="p-2 rounded-full hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <ChevronDown className="w-5 h-5" />
          <span>Minimize</span>
        </button>

        {/* Tab switchers: Lyrics vs Queue */}
        <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            id="tab-btn-lyrics"
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lyrics'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
            {lyrics?.hasSynced && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            id="tab-btn-queue"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Up Next</span>
            <span className="text-[10px] bg-zinc-700/60 px-1.5 py-0.2 rounded-full">
              {queue.length}
            </span>
          </button>
        </div>

        <button
          id="now-playing-btn-external"
          onClick={() =>
            window.open(
              `https://www.youtube.com/watch?v=${currentSong.videoId}`,
              '_blank'
            )
          }
          title="Open in YouTube"
          className="p-2 rounded-full hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-0">
        {/* Left Column: Big Artwork & Details & Player Controls */}
        <div className="lg:col-span-6 flex flex-col items-center max-w-md mx-auto w-full">
          {/* Large Artwork with gentle shadow & vinyl appearance */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 group mb-6 bg-zinc-900">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent opacity-60" />
          </div>

          {/* Title & Artist & Like */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="min-w-0 pr-4">
              <h2
                id="now-playing-title"
                className="text-xl sm:text-2xl font-bold text-zinc-100 truncate"
              >
                {currentSong.title}
              </h2>
              <p
                id="now-playing-artist"
                className="text-sm sm:text-base text-zinc-400 truncate mt-0.5"
              >
                {currentSong.artist}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="now-playing-btn-like"
                onClick={() => toggleLike(currentSong)}
                className="p-2.5 rounded-full hover:bg-zinc-900 transition-colors"
              >
                <Heart
                  className={`w-6 h-6 transition-transform hover:scale-110 ${
                    liked
                      ? 'text-rose-500 fill-rose-500'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                />
              </button>
              <button
                id="now-playing-btn-add-playlist"
                onClick={() => openAddToPlaylist(currentSong)}
                className="p-2.5 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scrubber timeline */}
          <div className="w-full mb-4">
            <div className="relative flex items-center py-2 group cursor-pointer">
              <input
                id="now-playing-slider-scrub"
                type="range"
                min={0}
                max={duration || 1}
                step={0.5}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:h-2 transition-all"
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 font-mono mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="w-full flex items-center justify-between px-2 mb-6">
            <button
              onClick={toggleShuffle}
              title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
              className={`p-2.5 rounded-full transition-colors ${
                isShuffle
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={prevSong}
              title="Previous"
              className="p-2.5 rounded-full text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/30"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-zinc-950" />
              ) : (
                <Play className="w-6 h-6 fill-zinc-950 ml-1" />
              )}
            </button>

            <button
              onClick={nextSong}
              title="Next"
              className="p-2.5 rounded-full text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            <button
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              className={`p-2.5 rounded-full transition-colors ${
                repeatMode !== 'off'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Volume Slider in full screen */}
          <div className="w-full flex items-center space-x-3 px-4 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Right Column: Tab View (Synced Lyrics OR Up Next Queue) */}
        <div className="lg:col-span-6 h-[460px] sm:h-[520px] flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 overflow-hidden shadow-xl backdrop-blur-md">
          {activeTab === 'lyrics' ? (
            /* Synced Lyrics Pane */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-zinc-200">
                    {lyrics?.hasSynced
                      ? 'Synchronized Lyrics'
                      : lyrics?.hasLyrics
                      ? 'Lyrics'
                      : 'Lyrics'}
                  </span>
                </div>
                {lyrics?.hasSynced && (
                  <span className="text-[11px] bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
                    Live Synced via LRCLIB
                  </span>
                )}
              </div>

              {isLoadingLyrics ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Fetching lyrics from LRCLIB...</p>
                </div>
              ) : lyrics?.hasSynced && syncedLines.length > 0 ? (
                /* Synced Lyrics interactive list */
                <div
                  ref={lyricsContainerRef}
                  className="flex-1 overflow-y-auto space-y-5 py-8 pr-2 scroll-smooth"
                >
                  {syncedLines.map((line, idx) => {
                    const isActive = idx === activeLyricIdx;
                    return (
                      <p
                        key={idx}
                        ref={isActive ? activeLyricRef : null}
                        onClick={() => seekTo(line.time)}
                        className={`cursor-pointer transition-all duration-300 rounded-lg px-3 py-1.5 ${
                          isActive
                            ? 'text-emerald-400 font-bold text-xl sm:text-2xl scale-102 bg-emerald-500/10 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300 text-base sm:text-lg font-medium opacity-60 hover:opacity-90'
                        }`}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              ) : lyrics?.plainLyrics ? (
                /* Plain Lyrics fallback */
                <div className="flex-1 overflow-y-auto pr-2 py-4 whitespace-pre-line text-zinc-300 text-sm sm:text-base leading-relaxed">
                  <div className="text-xs text-zinc-500 mb-3 italic">
                    Synced timestamps not available for this track. Showing full lyrics:
                  </div>
                  {lyrics.plainLyrics}
                </div>
              ) : (
                /* No lyrics found state */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <FileText className="w-10 h-10 stroke-1 mb-2 text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-400">
                    Lirik tidak tersedia
                  </p>
                  <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                    Lirik untuk &quot;{currentSong.title}&quot; tidak ditemukan.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Up Next Queue Pane */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80">
                <span className="text-sm font-semibold text-zinc-200">
                  Play Queue ({queue.length} tracks)
                </span>
                <span className="text-xs text-zinc-500">
                  Playing {queueIndex + 1} of {queue.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {queue.map((track, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <div
                      key={`${track.videoId}-${idx}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        dragOverIndex === idx
                          ? 'border-2 border-dashed border-emerald-400 bg-emerald-500/10'
                          : isCurrent
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                          : 'bg-zinc-900/60 hover:bg-zinc-800/70 text-zinc-300'
                      }`}
                    >
                      <div
                        title="Drag to reorder"
                        className="cursor-grab active:cursor-grabbing text-zinc-600 group-hover:text-zinc-400 p-1 -ml-1 mr-1.5 transition-colors"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <button
                        onClick={() => playSong(track, queue)}
                        className="flex items-center space-x-3 min-w-0 flex-1 text-left"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {track.artist}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center space-x-2 pl-2">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {track.duration}
                        </span>
                        <button
                          onClick={() => removeFromQueue(idx)}
                          title="Remove from queue"
                          className="text-zinc-500 hover:text-zinc-300 text-xs px-1.5 py-0.5 rounded hover:bg-zinc-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
