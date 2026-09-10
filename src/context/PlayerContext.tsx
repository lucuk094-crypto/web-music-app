import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Song, LyricsData, RepeatMode, Playlist, UserProfile } from '../types';
import { parseLrcLyrics, parseDurationToSeconds } from '../lib/lyrics';
import {
  fetchLikedSongs,
  toggleLikedSongDb,
  fetchHistory,
  addToHistory,
  fetchPlaylists,
  createPlaylistDb,
  addSongToPlaylistDb,
  removeSongFromPlaylistDb,
  deletePlaylistDb,
  saveLastSession,
  loadLastSession,
  saveLastQueueLocal,
  loadLastQueueLocal,
  getCurrentUser,
  getSupabaseClient,
  signOutUser,
  SessionState,
} from '../lib/supabase';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerContextType {
  // Playback state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
  queueIndex: number;

  // Lyrics state
  lyrics: LyricsData | null;
  isLoadingLyrics: boolean;

  // Modals & Panels
  isNowPlayingExpanded: boolean;
  showNowPlaying: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
  isAddToPlaylistOpen: boolean;
  songForPlaylist: Song | null;

  // User state
  currentUser: UserProfile | null;
  isAuthLoading: boolean;
  likedSongs: Song[];
  recentSongs: Song[];
  history: Song[];
  playlists: Playlist[];

  // Actions
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (newQueue: Song[]) => void;

  // View controls
  setIsNowPlayingExpanded: (val: boolean) => void;
  setShowNowPlaying: (val: boolean) => void;
  setIsLyricsOpen: (val: boolean) => void;
  setIsQueueOpen: (val: boolean) => void;
  openAddToPlaylist: (song: Song) => void;
  closeAddToPlaylist: () => void;

  // Data Actions
  toggleLike: (song: Song) => Promise<void>;
  toggleLikeSong: () => Promise<void>;
  isLiked: (videoId: string) => boolean;
  createPlaylist: (title: string, description?: string) => Promise<Playlist>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  setCurrentUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Lyrics
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  // Views & Modals
  const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [songForPlaylist, setSongForPlaylist] = useState<Song | null>(null);

  // User & DB
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // YouTube player references
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingSongRef = useRef<Song | null>(null);
  const timeUpdateInterval = useRef<any>(null);
  const fallbackInterval = useRef<any>(null);

  // Sync refs to avoid stale closure issues in YouTube IFrame event callbacks
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  repeatModeRef.current = repeatMode;

  const isShuffleRef = useRef<boolean>(isShuffle);
  isShuffleRef.current = isShuffle;

  const queueRef = useRef<Song[]>(queue);
  queueRef.current = queue;

  const queueIndexRef = useRef<number>(queueIndex);
  queueIndexRef.current = queueIndex;

  const currentSongRef = useRef<Song | null>(currentSong);
  currentSongRef.current = currentSong;

  const handleTrackEndedRef = useRef<() => void>(() => {});

  const currentUserRef = useRef<UserProfile | null>(currentUser);
  currentUserRef.current = currentUser;

  // 10-second history tracking
  const playTimeCounterRef = useRef<number>(0);
  const hasRecordedCurrentSongRef = useRef<boolean>(false);
  const activeTrackIdRef = useRef<string | null>(null);

  // Reset 10-second tracking when currentSong changes
  useEffect(() => {
    if (currentSong?.videoId !== activeTrackIdRef.current) {
      activeTrackIdRef.current = currentSong ? currentSong.videoId : null;
      playTimeCounterRef.current = 0;
      hasRecordedCurrentSongRef.current = false;
    }
  }, [currentSong]);

  // Load initial user and saved queue/session + listen for auth changes
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setCurrentUser(user);
        }
        const [liked, hist, lists] = await Promise.all([
          fetchLikedSongs(user?.id),
          fetchHistory(),
          fetchPlaylists(user?.id),
        ]);
        if (isMounted) {
          setLikedSongs(liked);
          setHistory(hist);
          setPlaylists(lists);
        }

        // Restore last session (queue & currentSong) without auto-playing
        const savedSession = await loadLastSession();
        if (savedSession && savedSession.queue.length > 0 && isMounted) {
          setQueue(savedSession.queue);
          setQueueIndex(savedSession.queueIndex || 0);
          const restoredSong =
            savedSession.currentSong ||
            savedSession.queue[savedSession.queueIndex || 0] ||
            null;
          setCurrentSong(restoredSong);
          if (savedSession.currentTime && savedSession.currentTime > 0) {
            setCurrentTime(savedSession.currentTime);
          }
          if (restoredSong?.duration) {
            const durSec = parseDurationToSeconds(restoredSong.duration);
            if (durSec > 0) setDuration(durSec);
          }
          // Ensure auto-play is NOT started on restore
          setIsPlaying(false);
        }
      } catch (err) {
        console.warn('Initial auth/data load error:', err);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    init();

    const client = getSupabaseClient();
    let authSub: any = null;
    if (client) {
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          let username = session.user.user_metadata?.username || session.user.user_metadata?.name;
          try {
            const { data: profile } = await client
              .from('profiles')
              .select('username')
              .eq('id', session.user.id)
              .maybeSingle();
            if (profile?.username) {
              username = profile.username;
            } else {
              // Ensure profile row exists (e.g. for Google OAuth logins)
              await client.from('profiles').upsert({
                id: session.user.id,
                username: username || session.user.email?.split('@')[0] || 'User',
                created_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            }
          } catch {}

          const loggedUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name:
              username ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'User',
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setCurrentUser(loggedUser);

          const [liked, hist, lists] = await Promise.all([
            fetchLikedSongs(loggedUser.id),
            fetchHistory(),
            fetchPlaylists(loggedUser.id),
          ]);
          if (isMounted) {
            setLikedSongs(liked);
            setHistory(hist);
            setPlaylists(lists);
          }

          // Restore user's last session from Supabase if queue is currently empty
          if (queueRef.current.length === 0) {
            const userSession = await loadLastSession();
            if (userSession && userSession.queue.length > 0 && isMounted) {
              setQueue(userSession.queue);
              setQueueIndex(userSession.queueIndex || 0);
              const restored =
                userSession.currentSong ||
                userSession.queue[userSession.queueIndex || 0] ||
                null;
              setCurrentSong(restored);
              if (userSession.currentTime && userSession.currentTime > 0) {
                setCurrentTime(userSession.currentTime);
              }
              if (restored?.duration) {
                const durSec = parseDurationToSeconds(restored.duration);
                if (durSec > 0) setDuration(durSec);
              }
              setIsPlaying(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setLikedSongs([]);
          setHistory([]);
          setPlaylists([]);
        }
        setIsAuthLoading(false);
      });
      authSub = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authSub) {
        authSub.unsubscribe();
      }
    };
  }, []);

  // Debounced auto-save last session (queue & current song) to localStorage and Supabase
  const sessionSaveTimerRef = useRef<any>(null);
  useEffect(() => {
    if (queue.length === 0 && !currentSong) return;

    clearTimeout(sessionSaveTimerRef.current);
    sessionSaveTimerRef.current = setTimeout(() => {
      saveLastSession({
        currentSong,
        queue,
        queueIndex: queueIndex,
        currentTime,
      });
    }, 1200);

    return () => clearTimeout(sessionSaveTimerRef.current);
  }, [queue, queueIndex, currentSong, currentTime, currentUser]);

  const signOut = useCallback(async () => {
    await signOutUser();
    setCurrentUser(null);
    setLikedSongs([]);
    setHistory([]);
    setPlaylists([]);
  }, []);

  const refreshUserData = useCallback(async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    const [liked, hist, lists] = await Promise.all([
      fetchLikedSongs(user?.id),
      fetchHistory(),
      fetchPlaylists(user?.id),
    ]);
    setLikedSongs(liked);
    setHistory(hist);
    setPlaylists(lists);
  }, []);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player && ytContainerRef.current) {
        clearInterval(checkYT);
        if (!ytPlayerRef.current) {
          try {
            ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
              height: '100',
              width: '100',
              videoId: '',
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                playsinline: 1,
                rel: 0,
                modestbranding: 1,
                origin: window.location.origin,
              },
              events: {
                onReady: (event: any) => {
                  isYtReadyRef.current = true;
                  try {
                    event.target.setVolume(volume * 100);
                  } catch {}
                  if (pendingSongRef.current) {
                    const songToPlay = pendingSongRef.current;
                    pendingSongRef.current = null;
                    try {
                      event.target.loadVideoById(songToPlay.videoId);
                      event.target.playVideo?.();
                      setIsPlaying(true);
                    } catch (err) {
                      console.warn('Error playing pending song onReady:', err);
                    }
                  }
                },
                onStateChange: (event: any) => {
                  if (event.data === window.YT.PlayerState.PLAYING) {
                    clearInterval(fallbackInterval.current);
                    setIsPlaying(true);
                    try {
                      const dur = event.target.getDuration?.();
                      if (dur && dur > 0) setDuration(dur);
                    } catch {}
                  } else if (event.data === window.YT.PlayerState.PAUSED) {
                    setIsPlaying(false);
                  } else if (event.data === window.YT.PlayerState.ENDED) {
                    handleTrackEndedRef.current();
                  }
                },
                onError: (e: any) => {
                  console.warn('YouTube Player error, falling back:', e);
                  // Keep timer progressing in fallback
                  startFallbackTimer();
                },
              },
            });
          } catch (err) {
            console.warn('YT player init exception:', err);
          }
        }
      }
    }, 300);

    return () => clearInterval(checkYT);
  }, []);

  // Fetch lyrics when current song changes
  const fetchLyricsForSong = useCallback(async (song: Song) => {
    setIsLoadingLyrics(true);
    try {
      const res = await fetch(
        `/api/lyrics?title=${encodeURIComponent(
          song.title
        )}&artist=${encodeURIComponent(song.artist)}`
      );
      if (res.ok) {
        const data: LyricsData = await res.json();
        if (data.syncedLyrics) {
          data.parsedLines = parseLrcLyrics(data.syncedLyrics);
        }
        setLyrics(data);
      } else {
        setLyrics(null);
      }
    } catch (err) {
      console.error('Failed to fetch lyrics:', err);
      setLyrics(null);
    } finally {
      setIsLoadingLyrics(false);
    }
  }, []);

  // Time progress synchronization & 10-second history tracking
  useEffect(() => {
    if (isPlaying && currentSong) {
      timeUpdateInterval.current = setInterval(() => {
        let playerCurrentTime = 0;
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const time = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            playerCurrentTime = time;
            setCurrentTime(time);
            if (dur > 0) setDuration(dur);
          } catch {
            // Ignore cross-origin error
          }
        }

        // Trigger history save only after 10+ seconds of playback
        if (!hasRecordedCurrentSongRef.current && currentSongRef.current) {
          playTimeCounterRef.current += 0.25;
          if (playTimeCounterRef.current >= 10 || playerCurrentTime >= 10) {
            hasRecordedCurrentSongRef.current = true;
            const songToSave = currentSongRef.current;
            addToHistory({
              videoId: songToSave.videoId,
              title: songToSave.title,
              artist: songToSave.artist,
              thumbnail: songToSave.thumbnail,
            });
            // Refresh history list
            fetchHistory().then(hist => setHistory(hist));
          }
        }
      }, 250);
    } else {
      clearInterval(timeUpdateInterval.current);
    }

    return () => clearInterval(timeUpdateInterval.current);
  }, [isPlaying, currentSong]);

  // Fallback timer simulation for seamless scrub/lyrics in case YouTube video is restricted in iframe
  const startFallbackTimer = () => {
    clearInterval(fallbackInterval.current);
    fallbackInterval.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25;

        // Trigger history save only after 10+ seconds of playback
        if (!hasRecordedCurrentSongRef.current && currentSongRef.current) {
          playTimeCounterRef.current += 0.25;
          if (playTimeCounterRef.current >= 10 || next >= 10) {
            hasRecordedCurrentSongRef.current = true;
            const songToSave = currentSongRef.current;
            addToHistory({
              videoId: songToSave.videoId,
              title: songToSave.title,
              artist: songToSave.artist,
              thumbnail: songToSave.thumbnail,
            });
            // Refresh history list
            fetchHistory().then(hist => setHistory(hist));
          }
        }

        if (next >= duration) {
          handleTrackEndedRef.current?.();
          return 0;
        }
        return next;
      });
    }, 250);
  };

  // Play a song
  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      setCurrentSong(song);
      setCurrentTime(0);

      // Reset 10-second history tracking for this track
      playTimeCounterRef.current = 0;
      hasRecordedCurrentSongRef.current = false;
      activeTrackIdRef.current = song.videoId;

      // Estimate duration from string
      const parsedDur = parseDurationToSeconds(song.duration);
      if (parsedDur > 0) setDuration(parsedDur);

      let updatedQueue = queue;
      let newIndex = queueIndex;

      if (newQueue && newQueue.length > 0) {
        updatedQueue = newQueue;
        newIndex = newQueue.findIndex((s) => s.videoId === song.videoId);
        if (newIndex === -1) newIndex = 0;
        setQueue(updatedQueue);
        setQueueIndex(newIndex);
      } else {
        // Add to queue if not in queue
        const existingIdx = queue.findIndex((s) => s.videoId === song.videoId);
        if (existingIdx !== -1) {
          newIndex = existingIdx;
          setQueueIndex(existingIdx);
        } else {
          updatedQueue = [...queue, song];
          newIndex = updatedQueue.length - 1;
          setQueue(updatedQueue);
          setQueueIndex(newIndex);
        }
      }

      saveLastSession({
        currentSong: song,
        queue: updatedQueue,
        queueIndex: newIndex,
        currentTime: 0,
      });

      // Load and play in YouTube player
      if (
        isYtReadyRef.current &&
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.loadVideoById === 'function'
      ) {
        try {
          ytPlayerRef.current.loadVideoById(song.videoId);
          ytPlayerRef.current.playVideo?.();
          setIsPlaying(true);
        } catch {
          startFallbackTimer();
          setIsPlaying(true);
        }
      } else {
        pendingSongRef.current = song;
        startFallbackTimer();
        setIsPlaying(true);
      }

      // Fetch lyrics (history will be recorded after 10 seconds of playback)
      fetchLyricsForSong(song);
    },
    [queue, queueIndex, currentUser, fetchLyricsForSong]
  );

  const togglePlay = useCallback(() => {
    if (!currentSong) {
      if (queue.length > 0) {
        playSong(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, currentSong, queue, playSong]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearInterval(fallbackInterval.current);
    if (
      ytPlayerRef.current &&
      typeof ytPlayerRef.current.pauseVideo === 'function'
    ) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    }
  }, []);

  const resume = useCallback(() => {
    if (!currentSong) {
      if (queue.length > 0) {
        playSong(queue[0]);
      }
      return;
    }

    setIsPlaying(true);
    if (
      ytPlayerRef.current &&
      typeof ytPlayerRef.current.playVideo === 'function'
    ) {
      try {
        const videoData = ytPlayerRef.current.getVideoData?.();
        // If the player hasn't loaded this track yet (e.g. restored session without playing)
        if (!videoData || videoData.video_id !== currentSong.videoId) {
          if (typeof ytPlayerRef.current.loadVideoById === 'function') {
            ytPlayerRef.current.loadVideoById(currentSong.videoId, currentTime || 0);
          }
        }
        ytPlayerRef.current.playVideo();
      } catch {
        startFallbackTimer();
      }
    } else {
      pendingSongRef.current = currentSong;
      startFallbackTimer();
    }
  }, [currentSong, queue, currentTime, playSong]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (
      ytPlayerRef.current &&
      typeof ytPlayerRef.current.seekTo === 'function'
    ) {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
      } catch {}
    }
  }, []);

  const handleTrackEnded = useCallback(() => {
    const currentRepeat = repeatModeRef.current;
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    const currentS = currentSongRef.current;

    // Mode: Repeat One ('one')
    if (currentRepeat === 'one' && currentS) {
      if (
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.seekTo === 'function' &&
        typeof ytPlayerRef.current.playVideo === 'function'
      ) {
        try {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          setCurrentTime(0);
          return;
        } catch (err) {
          console.warn('Error looping song in YouTube player:', err);
        }
      }
      playSong(currentS, currentQ);
      return;
    }

    if (currentQ.length === 0) {
      setIsPlaying(false);
      return;
    }

    let nextIdx = currentIdx + 1;
    if (isShuffleRef.current && currentQ.length > 1) {
      let rand = Math.floor(Math.random() * currentQ.length);
      if (rand === currentIdx) {
        rand = (rand + 1) % currentQ.length;
      }
      nextIdx = rand;
    } else if (nextIdx >= currentQ.length) {
      if (currentRepeat === 'all') {
        // Mode: Repeat All ('all') -> loop to start
        nextIdx = 0;
      } else {
        // Mode: No Repeat ('off' / none) -> stop at end of queue
        pause();
        setCurrentTime(0);
        return;
      }
    }

    const nextTrack = currentQ[nextIdx];
    if (nextTrack) {
      playSong(nextTrack, currentQ);
    } else {
      pause();
    }
  }, [pause, playSong]);

  useEffect(() => {
    handleTrackEndedRef.current = handleTrackEnded;
  }, [handleTrackEnded]);

  const nextSong = useCallback(() => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;

    if (currentQ.length === 0) return;

    let nextIdx = currentIdx + 1;
    if (isShuffleRef.current && currentQ.length > 1) {
      let rand = Math.floor(Math.random() * currentQ.length);
      if (rand === currentIdx) {
        rand = (rand + 1) % currentQ.length;
      }
      nextIdx = rand;
    } else if (nextIdx >= currentQ.length) {
      nextIdx = 0;
    }

    const nextTrack = currentQ[nextIdx];
    if (nextTrack) {
      playSong(nextTrack, currentQ);
    }
  }, [playSong]);

  const prevSong = useCallback(() => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;

    if (currentQ.length === 0) return;

    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) {
      prevIdx = currentQ.length - 1;
    }

    const prevTrack = currentQ[prevIdx];
    if (prevTrack) {
      playSong(prevTrack, currentQ);
    }
  }, [currentTime, seekTo, playSong]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (
      ytPlayerRef.current &&
      typeof ytPlayerRef.current.setVolume === 'function'
    ) {
      try {
        ytPlayerRef.current.setVolume(clamped * 100);
      } catch {}
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(volume > 0 ? volume : 0.7);
    } else {
      setIsMuted(true);
      if (
        ytPlayerRef.current &&
        typeof ytPlayerRef.current.setVolume === 'function'
      ) {
        try {
          ytPlayerRef.current.setVolume(0);
        } catch {}
      }
    }
  }, [isMuted, volume, setVolume]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const nextState = !prev;
      if (nextState && queueRef.current.length > 1) {
        setQueue((prevQueue) => {
          if (prevQueue.length <= 1) return prevQueue;
          const current = currentSongRef.current;
          const others = prevQueue.filter((s) => s.videoId !== current?.videoId);
          // Shuffle other tracks randomly
          for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
          }
          const shuffled = current ? [current, ...others] : others;
          setQueueIndex(0);
          saveLastQueueLocal(shuffled, 0);
          return shuffled;
        });
      }
      return nextState;
    });
  }, []);

  const reorderQueue = useCallback((newQueue: Song[]) => {
    setQueue(newQueue);
    const current = currentSongRef.current;
    if (current) {
      const idx = newQueue.findIndex((s) => s.videoId === current.videoId);
      if (idx !== -1) {
        setQueueIndex(idx);
        saveLastQueueLocal(newQueue, idx);
        return;
      }
    }
    saveLastQueueLocal(newQueue, queueIndexRef.current);
  }, []);

  const addToQueue = useCallback(
    (song: Song) => {
      setQueue((prev) => {
        const updated = [...prev, song];
        saveLastQueueLocal(updated, queueIndex);
        return updated;
      });
    },
    [queueIndex]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        saveLastQueueLocal(updated, queueIndex);
        return updated;
      });
    },
    [queueIndex]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
    saveLastQueueLocal([], 0);
  }, []);

  const toggleLike = useCallback(
    async (song: Song) => {
      const updated = await toggleLikedSongDb(song, currentUser?.id);
      setLikedSongs(updated);
    },
    [currentUser]
  );

  const toggleLikeSong = useCallback(async () => {
    if (currentSong) {
      await toggleLike(currentSong);
    }
  }, [currentSong, toggleLike]);

  const isLiked = useCallback(
    (videoId: string) => {
      return likedSongs.some((s) => s.videoId === videoId);
    },
    [likedSongs]
  );

  const createPlaylist = useCallback(
    async (title: string, description?: string): Promise<Playlist> => {
      const created = await createPlaylistDb(title, description, currentUser?.id);
      setPlaylists((prev) => [created, ...prev]);
      return created;
    },
    [currentUser]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, song: Song) => {
      await addSongToPlaylistDb(playlistId, song, currentUser?.id);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            if (!pl.songs.some((s) => s.videoId === song.videoId)) {
              return {
                ...pl,
                coverUrl: pl.coverUrl || song.thumbnail,
                songs: [...pl.songs, song],
              };
            }
          }
          return pl;
        })
      );
    },
    [currentUser]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, videoId: string) => {
      await removeSongFromPlaylistDb(playlistId, videoId, currentUser?.id);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            return {
              ...pl,
              songs: pl.songs.filter((s) => s.videoId !== videoId),
            };
          }
          return pl;
        })
      );
    },
    [currentUser]
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      const updated = await deletePlaylistDb(playlistId, currentUser?.id);
      setPlaylists(updated);
    },
    [currentUser]
  );

  const openAddToPlaylist = useCallback((song: Song) => {
    setSongForPlaylist(song);
    setIsAddToPlaylistOpen(true);
  }, []);

  const closeAddToPlaylist = useCallback(() => {
    setIsAddToPlaylistOpen(false);
    setSongForPlaylist(null);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        queue,
        queueIndex,
        lyrics,
        isLoadingLyrics,
        isNowPlayingExpanded,
        showNowPlaying,
        isLyricsOpen,
        isQueueOpen,
        isAddToPlaylistOpen,
        songForPlaylist,
        currentUser,
        isAuthLoading,
        likedSongs,
        recentSongs: history,
        history,
        playlists,
        playSong,
        togglePlay,
        pause,
        resume,
        nextSong,
        prevSong,
        seekTo,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        setIsNowPlayingExpanded,
        setShowNowPlaying,
        setIsLyricsOpen,
        setIsQueueOpen,
        openAddToPlaylist,
        closeAddToPlaylist,
        toggleLike,
        toggleLikeSong,
        isLiked,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        refreshUserData,
        setCurrentUser,
        signOut,
      }}
    >
      {children}
      {/* Hidden container for YouTube IFrame API audio playback */}
      <div
        id="yt-player-container"
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <div ref={ytContainerRef} id="yt-player-element" />
      </div>
    </PlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a PlayerProvider');
  }
  return context;
}
