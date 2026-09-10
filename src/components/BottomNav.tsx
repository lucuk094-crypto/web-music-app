import React from 'react';
import { motion } from 'motion/react';
import { Home, TrendingUp, Compass, Library, Search } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { icon: Home, label: 'Home', screen: 'home' as ScreenType, id: 'nav-home' },
    { icon: TrendingUp, label: 'Stats', screen: 'library' as ScreenType, id: 'nav-stats' },
    { icon: Compass, label: 'Explore', screen: 'landing' as ScreenType, id: 'nav-explore' },
    { icon: Library, label: 'Library', screen: 'library' as ScreenType, id: 'nav-library' },
    { icon: Search, label: 'Search', screen: 'search' as ScreenType, id: 'nav-search' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl border-t border-white/10" />
      
      {/* Nav items */}
      <div className="relative flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(item.screen)}
              className="relative flex flex-col items-center gap-1 min-w-[60px]"
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomNavTab"
                  className="absolute inset-0 rounded-full bg-[#C6FF3D]/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-[#C6FF3D]' : 'text-zinc-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-semibold transition-colors relative z-10 ${
                  isActive ? 'text-[#C6FF3D]' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
