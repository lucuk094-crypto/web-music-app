import React, { useState } from 'react';
import { Plus, Check, X, ListMusic } from 'lucide-react';
import { useMusicPlayer } from '../context/PlayerContext';

export const AddToPlaylistModal: React.FC = () => {
  const {
    isAddToPlaylistOpen,
    closeAddToPlaylist,
    songForPlaylist,
    playlists,
    addSongToPlaylist,
    createPlaylist,
  } = useMusicPlayer();

  const [newTitle, setNewTitle] = useState('');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isAddToPlaylistOpen || !songForPlaylist) return null;

  const handleAdd = async (playlistId: string) => {
    await addSongToPlaylist(playlistId, songForPlaylist);
    setAddedIds((prev) => [...prev, playlistId]);
    setTimeout(() => {
      closeAddToPlaylist();
      setAddedIds([]);
    }, 600);
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const pl = await createPlaylist(newTitle);
    await addSongToPlaylist(pl.id, songForPlaylist);
    setNewTitle('');
    closeAddToPlaylist();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="add-to-playlist-modal"
        className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={closeAddToPlaylist}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-zinc-100 mb-1">
          Add to Playlist
        </h3>
        <p className="text-xs text-zinc-400 truncate mb-4">
          &quot;{songForPlaylist.title}&quot;
        </p>

        {/* Create new playlist inline */}
        <form onSubmit={handleCreateAndAdd} className="mb-4">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 focus-within:border-emerald-500 rounded-xl p-1.5 transition-colors">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New playlist name..."
              className="bg-transparent text-xs text-zinc-100 placeholder-zinc-500 w-full px-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            >
              Create
            </button>
          </div>
        </form>

        {/* Existing playlists */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {playlists.map((pl) => {
            const alreadyIn = pl.songs.some(
              (s) => s.videoId === songForPlaylist.videoId
            );
            const justAdded = addedIds.includes(pl.id);

            return (
              <button
                key={pl.id}
                onClick={() => handleAdd(pl.id)}
                disabled={alreadyIn || justAdded}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  alreadyIn || justAdded
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <ListMusic className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate">{pl.title}</span>
                </div>
                {alreadyIn || justAdded ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
