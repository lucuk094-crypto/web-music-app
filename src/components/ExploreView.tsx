import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface ExploreViewProps {
  onNavigate: (screen: any) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onNavigate }) => {
  const [dominantColor, setDominantColor] = useState<string>('59, 130, 246');

  const moods = [
    'Fokus', 'Santai', 'Sedih', 'Semangat',
    'Bahagia', 'Melankolis', 'Energik', 'Tenang',
    'Romantis', 'Motivasi', 'Nostalgia', 'Pesta'
  ];

  const genres = [
    'Blues', 'Bollywood', 'Dance & Elektronik', 'Hip Hop',
    'Jazz', 'K-Pop', 'Latin', 'Metal',
    'Pop', 'R&B', 'Rock', 'Indie',
    'Classical', 'Country', 'Reggae', 'Soul'
  ];

  useEffect(() => {
    const colors = ['59, 130, 246', '139, 92, 246', '236, 72, 153', '34, 197, 94', '251, 191, 36'];
    setDominantColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Ambient Blur Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: `radial-gradient(circle at 30% 20%, rgba(${dominantColor}, 0.4) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(${dominantColor}, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 50% 80%, rgba(${dominantColor}, 0.2) 0%, transparent 50%)`
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: 'blur(100px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 pb-32">
        {/* Header */}
        <header className="px-6 pt-6 pb-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <h1 className="text-4xl font-bold text-white">Explore</h1>
        </header>

        {/* Mood & Momen Section */}
        <div className="px-6 mt-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Mood & Momen</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood, index) => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 text-left hover:bg-white/10 transition-all duration-200"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#C6FF3D] transition-colors">
                    {mood}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to explore
                  </p>
                </div>

                {/* Decorative element */}
                <motion.div
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#C6FF3D]/10 opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Genre Section */}
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Genre</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {genres.map((genre, index) => (
              <motion.button
                key={genre}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 text-left hover:bg-white/10 transition-all duration-200"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#C6FF3D] transition-colors">
                    {genre}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Discover {genre.toLowerCase()}
                  </p>
                </div>

                {/* Decorative element */}
                <motion.div
                  className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#C6FF3D] opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 2 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="px-6 mb-8">
          <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Discover New Music
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explore curated playlists based on your mood, favorite genres, and listening habits. 
              Find your next favorite song here.
            </p>
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
      `}</style>
    </div>
  );
};
