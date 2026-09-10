import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon,
  Play,
  Heart,
  PlusCircle,
  ListPlus,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContextNew';
import { searchSongs, SpotifyTrack } from '../lib/api';

const GENRE_TAGS = [
  'All',
  'Pop Hits',
  'Rock & Classic',
  'Chill & Acoustic',
  'Hip Hop',
  'R&B & Soul',
  'Electronic & EDM',
  'Jazz & Blues',
  'Indonesian Hits',
];

export const SearchView: React.FC = () => {
  const {
    playSong,
    currentSong,
    isPlaying,
    isBuffering,
    addToQueue,
    likedSongs,
    toggleLikeSong,
  } = useMusicPlayer();

  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  const activeAbortRef = useRef<AbortController | null>(null);

  // Perform backend search via Spotify API
  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortRef.current = controller;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const tracks = await searchSongs(trimmed, 30);
      setResults(tracks);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search request failed:', err);
        setResults([]);
      }
    } finally {
      if (activeAbortRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  // Initial load or quick query
  useEffect(() => {
    handleSearch('Top hits 2024');
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (activeAbortRef.current) activeAbortRef.current.abort();
    };
  }, []);

  // Debounced live search with 400ms delay to prevent request spam
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(trimmed);
      }, 400);
    } else {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    handleSearch(query);
  };

  const handleGenreClick = (genre: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setActiveGenre(genre);
    const searchQuery = genre === 'All' ? 'Trending music' : genre;
    setQuery(genre === 'All' ? '' : genre);
    handleSearch(searchQuery);
  };

  return (
    <div id="search-screen" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <form onSubmit={handleFormSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
            <SearchIcon className="w-5 h-5" />
          </div>
          <input
            id="search-input-field"
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search songs, artists, albums, or lyrics..."
            autoFocus
            className="w-full pl-12 pr-20 py-3.5 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base shadow-xl transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                handleSearch('Trending music');
              }}
              className="absolute inset-y-0 right-12 flex items-center pr-2 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute inset-y-1.5 right-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center shadow-md shadow-emerald-500/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {GENRE_TAGS.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeGenre === genre
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-100">
            {isLoading
              ? 'Searching tracks...'
              : hasSearched && query
              ? `Results for "${query}"`
              : 'Popular & Trending Tracks'}
          </h2>
        </div>
        {!isLoading && results.length > 0 && (
          <span className="text-xs text-zinc-500">{results.length} songs found</span>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-2.5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-800/40"
            />
          ))}
        </div>
      )}

      {/* Results List */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((song, index) => {
            const isCurrent = currentSong?.spotifyId === song.spotifyId;
            const liked = likedSongs.some(s => s.spotifyId === song.spotifyId);

            return (
              <div
                key={`${song.spotifyId}-${index}`}
                onClick={() => playSong(song, results)}
                className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-zinc-900/40 hover:bg-zinc-800/70 border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                {/* Left: Index + Artwork + Title + Artist */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono text-zinc-500 hidden sm:inline-block">
                    {index + 1}
                  </span>

                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-sm">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(song, results);
                      }}
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Play"
                    >
                      {isCurrent && isBuffering ? (
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 pr-2">
                    <h3
                      className={`font-semibold text-xs sm:text-sm truncate hover:underline ${
                        isCurrent ? 'text-emerald-400' : 'text-zinc-100'
                      }`}
                    >
                      {song.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Right: Duration + Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                  <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">
                    {song.durationFormatted}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeSong();
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
                    title={liked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        liked ? 'text-rose-500 fill-rose-500' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song);
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline-flex"
                    title="Add to Queue"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add to playlist modal
                    }}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Add to Playlist"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(song, results);
                    }}
                    className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-transform hover:scale-105"
                    title="Play track"
                  >
                    <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <SearchIcon className="w-12 h-12 stroke-1 mx-auto mb-3 text-zinc-600" />
          <h3 className="text-base font-semibold text-zinc-300">
            No tracks found
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Try searching for a different artist, song title, or try one of the
            genre tags above.
          </p>
        </div>
      )}
    </div>
  );
};
