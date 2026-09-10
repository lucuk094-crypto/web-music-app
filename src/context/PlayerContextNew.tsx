import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { RepeatMode, UserProfile } from '../types';
import { YouTubePlayer, PlayerState } from '../lib/youtubePlayer';
import { SpotifyTrack, resolvePlayback } from '../lib/api';
import {
  getCurrentUser,
  signOutUser,
  addToHistory,
  fetchHistory,
  saveLastSession,
  loadLastSession,
  SessionState,
} from '../lib/supabase';

// Extended Song type with Spotify data
export interface SongWithSpotify extends SpotifyTrack {
  videoId?: string; // YouTube video ID (resolved when playing)
}

interface PlayerContextType {
  // Playback state
  currentSong: SongWithSpotify | null;
  videoId: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: SongWithSpotify[];
  queueIndex: number;

  // View state
  showNowPlaying: boolean;
  isLyricsOpen: boolean;

  // User state
  currentUser: UserProfile | null;
  isAuthLoading: boolean;

  // Actions
  playSong: (song: SongWithSpotify, newQueue?: SongWithSpotify[]) => Promise<void>;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (song: SongWithSpotify) => void;
  setShowNowPlaying: (val: boolean) => void;
  setIsLyricsOpen: (val: boolean) => void;

  // Helpers
  likedSongs: SongWithSpotify[];
  recentSongs: SongWithSpotify[];
  toggleLikeSong: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Playback state
  const [currentSong, setCurrentSong] = useState<SongWithSpotify | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<SongWithSpotify[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // View state
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);

  // Mock user data (replace with real data later)
  const [likedSongs, setLikedSongs] = useState<SongWithSpotify[]>([]);
  const [recentSongs, setRecentSongs] = useState<SongWithSpotify[]>([]);

  // YouTube Player reference
  const playerRef = useRef<YouTubePlayer | null>(null);
  const isResolvingPlayback = useRef(false);
  
  // History tracking
  const playbackStartTime = useRef<number>(0);
  const hasTrackedHistory = useRef<boolean>(false);
  const historyCheckInterval = useRef<any>(null);

  // Session save debounce
  const sessionSaveTimeout = useRef<any>(null);

  // Initialize YouTube Player
  useEffect(() => {
    const initPlayer = async () => {
      try {
        playerRef.current = new YouTubePlayer('youtube-player-container', {
          onReady: () => {
            console.log('✅ YouTube player ready');
          },
          onStateChange: (state: PlayerState) => {
            console.log('Player state changed:', state);
            
            if (state === 'PLAYING') {
              setIsPlaying(true);
              setIsBuffering(false);
            } else if (state === 'PAUSED') {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === 'BUFFERING') {
              setIsBuffering(true);
            } else if (state === 'ENDED') {
              setIsPlaying(false);
              setIsBuffering(false);
              // Auto play next song
              nextSong();
            }
          },
          onProgress: (currentTime: number, duration: number) => {
            setCurrentTime(currentTime);
            setDuration(duration);
          },
          onError: (error: number) => {
            console.error('YouTube player error:', error);
            setIsPlaying(false);
            setIsBuffering(false);
            // Try next song on error
            nextSong();
          },
        });

        await playerRef.current.loadAPI();
        console.log('✅ YouTube IFrame API loaded');
      } catch (error) {
        console.error('❌ Failed to initialize YouTube player:', error);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Check user auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // Load history if user logged in
        if (user) {
          const history = await fetchHistory();
          // Convert history to SongWithSpotify format
          const historyAsSongs: SongWithSpotify[] = history.map((item: any) => ({
            spotifyId: item.video_id,
            title: item.title,
            artist: item.artist,
            album: '',
            cover: item.thumbnail || '',
            duration: 0,
            durationFormatted: '0:00',
            spotifyUrl: '',
          }));
          setRecentSongs(historyAsSongs);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Restore last session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!currentUser) return;

      const session = await loadLastSession();
      if (session && session.currentSong && session.queue.length > 0) {
        console.log('✅ Restoring last session:', session);
        
        setCurrentSong(session.currentSong);
        setQueue(session.queue);
        setQueueIndex(session.queueIndex);
        // Don't auto-play, just show ready to continue
        setShowNowPlaying(false);
      }
    };

    if (currentUser && !isAuthLoading) {
      restoreSession();
    }
  }, [currentUser, isAuthLoading]);

  /**
   * Play song - Main playback function
   * 1. Show cover/metadata immediately (from Spotify)
   * 2. Resolve YouTube videoId in background
   * 3. Start playback once videoId is available
   * 4. Track history after 10 seconds
   */
  const playSong = useCallback(async (song: SongWithSpotify, newQueue?: SongWithSpotify[]) => {
    // Prevent multiple simultaneous resolves
    if (isResolvingPlayback.current) {
      console.log('⏳ Already resolving playback, skipping...');
      return;
    }

    try {
      // Reset history tracking for new song
      playbackStartTime.current = Date.now();
      hasTrackedHistory.current = false;
      
      // Clear old interval
      if (historyCheckInterval.current) {
        clearInterval(historyCheckInterval.current);
      }

      // 1. Update UI immediately with Spotify metadata
      setCurrentSong(song);
      setShowNowPlaying(true);
      setIsBuffering(true);
      setCurrentTime(0);
      setDuration(song.duration);

      // Update queue if provided
      if (newQueue) {
        setQueue(newQueue);
        const index = newQueue.findIndex(s => s.spotifyId === song.spotifyId);
        setQueueIndex(index >= 0 ? index : 0);
      }

      // 2. Check if we already have videoId
      if (song.videoId) {
        console.log('✅ Using cached videoId:', song.videoId);
        setVideoId(song.videoId);
        
        if (playerRef.current) {
          if (playerRef.current.getPlayerState() === 'UNSTARTED') {
            await playerRef.current.initPlayer(song.videoId);
          } else {
            playerRef.current.loadVideoById(song.videoId);
          }
        }
        
        // Start history tracking
        startHistoryTracking(song);
        return;
      }

      // 3. Resolve YouTube videoId in background
      isResolvingPlayback.current = true;
      console.log('🔍 Resolving YouTube playback for:', song.title, '-', song.artist);

      const playbackData = await resolvePlayback(song.title, song.artist, song.duration);
      
      console.log('✅ Resolved videoId:', playbackData.videoId);
      setVideoId(playbackData.videoId);

      // Update song with videoId for caching
      const updatedSong = { ...song, videoId: playbackData.videoId };
      setCurrentSong(updatedSong);

      // Update queue item with videoId
      if (newQueue) {
        const updatedQueue = newQueue.map(s => 
          s.spotifyId === song.spotifyId ? updatedSong : s
        );
        setQueue(updatedQueue);
      }

      // 4. Start playback
      if (playerRef.current) {
        if (playerRef.current.getPlayerState() === 'UNSTARTED') {
          await playerRef.current.initPlayer(playbackData.videoId);
        } else {
          playerRef.current.loadVideoById(playbackData.videoId);
        }
      }
      
      // Start history tracking
      startHistoryTracking(updatedSong);
    } catch (error) {
      console.error('❌ Failed to play song:', error);
      setIsBuffering(false);
      setIsPlaying(false);
    } finally {
      isResolvingPlayback.current = false;
    }
  }, []);

  /**
   * Start tracking playback for history
   * Add to history after 10 seconds of playback
   */
  const startHistoryTracking = (song: SongWithSpotify) => {
    // Clear old interval
    if (historyCheckInterval.current) {
      clearInterval(historyCheckInterval.current);
    }

    // Check every second if 10 seconds have passed
    historyCheckInterval.current = setInterval(() => {
      const elapsedMs = Date.now() - playbackStartTime.current;
      const elapsedSeconds = elapsedMs / 1000;

      if (elapsedSeconds >= 10 && !hasTrackedHistory.current && isPlaying) {
        hasTrackedHistory.current = true;
        
        // Add to history
        addToHistory({
          spotifyId: song.spotifyId,
          videoId: song.videoId,
          title: song.title,
          artist: song.artist,
          cover: song.cover,
        });

        // Update recentSongs
        setRecentSongs(prev => {
          const filtered = prev.filter(s => s.spotifyId !== song.spotifyId);
          return [song, ...filtered].slice(0, 20);
        });

        // Clear interval after tracking
        if (historyCheckInterval.current) {
          clearInterval(historyCheckInterval.current);
        }
      }
    }, 1000);
  };

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    // Handle repeat modes
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else if (repeatMode === 'one') {
        nextIndex = queueIndex;
      } else {
        // End of queue
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    playSong(queue[nextIndex]);
  }, [queue, queueIndex, repeatMode, playSong]);

  const prevSong = useCallback(() => {
    // If more than 3 seconds played, restart current song
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    setQueueIndex(prevIndex);
    playSong(queue[prevIndex]);
  }, [currentTime, queue, queueIndex, repeatMode, playSong]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clampedVolume = Math.max(0, Math.min(1, val));
    setVolumeState(clampedVolume);
    
    if (playerRef.current) {
      playerRef.current.setVolume(clampedVolume);
    }

    // Auto unmute if setting volume
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
      if (playerRef.current) {
        playerRef.current.unMute();
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (playerRef.current) {
      if (newMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  }, [isMuted]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
    
    // TODO: Implement shuffle logic
    // Shuffle queue but keep current song at current position
  }, []);

  const addToQueue = useCallback((song: SongWithSpotify) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const toggleLikeSong = useCallback(async () => {
    if (!currentSong) return;

    const isCurrentlyLiked = likedSongs.some(s => s.spotifyId === currentSong.spotifyId);
    
    if (isCurrentlyLiked) {
      setLikedSongs(prev => prev.filter(s => s.spotifyId !== currentSong.spotifyId));
    } else {
      setLikedSongs(prev => [currentSong, ...prev]);
    }

    // TODO: Save to Supabase
  }, [currentSong, likedSongs]);

  // Save session state (debounced)
  useEffect(() => {
    if (!currentUser || !currentSong) return;

    // Clear previous timeout
    if (sessionSaveTimeout.current) {
      clearTimeout(sessionSaveTimeout.current);
    }

    // Save after 2 seconds of inactivity
    sessionSaveTimeout.current = setTimeout(() => {
      const sessionState: SessionState = {
        currentSong,
        queue,
        queueIndex,
        currentTime,
      };

      saveLastSession(sessionState);
    }, 2000);

    return () => {
      if (sessionSaveTimeout.current) {
        clearTimeout(sessionSaveTimeout.current);
      }
    };
  }, [currentUser, currentSong, queue, queueIndex, currentTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (historyCheckInterval.current) {
        clearInterval(historyCheckInterval.current);
      }
      if (sessionSaveTimeout.current) {
        clearTimeout(sessionSaveTimeout.current);
      }
    };
  }, []);

  const value: PlayerContextType = {
    // Playback state
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

    // View state
    showNowPlaying,
    isLyricsOpen,

    // User state
    currentUser,
    isAuthLoading,

    // Actions
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
    setShowNowPlaying,
    setIsLyricsOpen,

    // Helpers
    likedSongs,
    recentSongs,
    toggleLikeSong,
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Hidden YouTube Player Container */}
      <div id="youtube-player-container" style={{ display: 'none' }} />
      {children}
    </PlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a PlayerProvider');
  }
  return context;
}
