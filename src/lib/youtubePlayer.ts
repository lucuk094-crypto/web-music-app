/**
 * YouTube IFrame Player API Integration
 * Handles audio-only playback (hidden player)
 */

// Global YT namespace from YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PlayerState = 'UNSTARTED' | 'ENDED' | 'PLAYING' | 'PAUSED' | 'BUFFERING' | 'CUED';

interface YouTubePlayerCallbacks {
  onReady?: () => void;
  onStateChange?: (state: PlayerState) => void;
  onError?: (error: number) => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export class YouTubePlayer {
  private player: any = null;
  private callbacks: YouTubePlayerCallbacks = {};
  private progressInterval: any = null;
  private isApiReady = false;
  private containerId: string;

  constructor(containerId: string, callbacks: YouTubePlayerCallbacks = {}) {
    this.containerId = containerId;
    this.callbacks = callbacks;
  }

  /**
   * Load YouTube IFrame API script
   */
  async loadAPI(): Promise<void> {
    return new Promise((resolve) => {
      // Check if API already loaded
      if (window.YT && window.YT.Player) {
        this.isApiReady = true;
        resolve();
        return;
      }

      // Set up callback
      window.onYouTubeIframeAPIReady = () => {
        this.isApiReady = true;
        console.log('✅ YouTube IFrame API ready');
        resolve();
      };

      // Load script if not already present
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    });
  }

  /**
   * Initialize player (audio only, hidden)
   */
  async initPlayer(videoId: string): Promise<void> {
    await this.loadAPI();

    return new Promise((resolve, reject) => {
      try {
        this.player = new window.YT.Player(this.containerId, {
          height: '0',
          width: '0',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log('✅ YouTube player ready');
              this.startProgressTracking();
              if (this.callbacks.onReady) {
                this.callbacks.onReady();
              }
              resolve();
            },
            onStateChange: (event: any) => {
              const stateMap: { [key: number]: PlayerState } = {
                [-1]: 'UNSTARTED',
                [0]: 'ENDED',
                [1]: 'PLAYING',
                [2]: 'PAUSED',
                [3]: 'BUFFERING',
                [5]: 'CUED',
              };
              const state = stateMap[event.data] || 'UNSTARTED';
              
              if (state === 'PLAYING') {
                this.startProgressTracking();
              } else {
                this.stopProgressTracking();
              }

              if (this.callbacks.onStateChange) {
                this.callbacks.onStateChange(state);
              }
            },
            onError: (event: any) => {
              console.error('❌ YouTube player error:', event.data);
              this.stopProgressTracking();
              if (this.callbacks.onError) {
                this.callbacks.onError(event.data);
              }
              reject(new Error(`YouTube player error: ${event.data}`));
            },
          },
        });
      } catch (error) {
        console.error('❌ Failed to initialize YouTube player:', error);
        reject(error);
      }
    });
  }

  /**
   * Track playback progress
   */
  private startProgressTracking(): void {
    this.stopProgressTracking();
    
    this.progressInterval = setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();
        
        if (this.callbacks.onProgress) {
          this.callbacks.onProgress(currentTime, duration);
        }
      }
    }, 500); // Update every 500ms
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Load and play new video
   */
  loadVideoById(videoId: string, startSeconds: number = 0): void {
    if (!this.player) {
      throw new Error('Player not initialized');
    }
    this.player.loadVideoById({ videoId, startSeconds });
  }

  /**
   * Playback controls
   */
  play(): void {
    if (this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
    }
  }

  pause(): void {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
    }
  }

  stop(): void {
    if (this.player && typeof this.player.stopVideo === 'function') {
      this.player.stopVideo();
      this.stopProgressTracking();
    }
  }

  seekTo(seconds: number): void {
    if (this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
    }
  }

  setVolume(volume: number): void {
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(Math.max(0, Math.min(100, volume * 100)));
    }
  }

  mute(): void {
    if (this.player && typeof this.player.mute === 'function') {
      this.player.mute();
    }
  }

  unMute(): void {
    if (this.player && typeof this.player.unMute === 'function') {
      this.player.unMute();
    }
  }

  /**
   * Get current state
   */
  getCurrentTime(): number {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      return this.player.getCurrentTime();
    }
    return 0;
  }

  getDuration(): number {
    if (this.player && typeof this.player.getDuration === 'function') {
      return this.player.getDuration();
    }
    return 0;
  }

  getPlayerState(): PlayerState {
    if (!this.player || typeof this.player.getPlayerState !== 'function') {
      return 'UNSTARTED';
    }

    const stateMap: { [key: number]: PlayerState } = {
      [-1]: 'UNSTARTED',
      [0]: 'ENDED',
      [1]: 'PLAYING',
      [2]: 'PAUSED',
      [3]: 'BUFFERING',
      [5]: 'CUED',
    };

    return stateMap[this.player.getPlayerState()] || 'UNSTARTED';
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopProgressTracking();
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    this.player = null;
  }
}
