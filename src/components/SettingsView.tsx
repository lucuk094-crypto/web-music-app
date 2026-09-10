import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useMusicPlayer } from '../context/PlayerContext';
import {
  ArrowLeft,
  Palette,
  Monitor,
  User,
  FileText,
  Music2,
  Users,
  HardDrive,
  Database,
  ChevronRight
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (screen: any) => void;
}

interface SettingItem {
  id: string;
  icon: any;
  label: string;
  iconBg: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { currentUser } = useMusicPlayer();
  const [dominantColor, setDominantColor] = useState<string>('59, 130, 246');

  const settingsItems: SettingItem[] = [
    { id: 'appearance', icon: Palette, label: 'Appearance', iconBg: 'from-purple-600 to-purple-400' },
    { id: 'aod', icon: Monitor, label: 'Always On Display', iconBg: 'from-blue-600 to-blue-400' },
    { id: 'account', icon: User, label: 'Account', iconBg: 'from-emerald-600 to-emerald-400' },
    { id: 'content', icon: FileText, label: 'Content', iconBg: 'from-orange-600 to-orange-400' },
    { id: 'player', icon: Music2, label: 'Player and audio', iconBg: 'from-pink-600 to-pink-400' },
    { id: 'together', icon: Users, label: 'Listen Together', iconBg: 'from-cyan-600 to-cyan-400' },
    { id: 'storage', icon: HardDrive, label: 'Storage', iconBg: 'from-amber-600 to-amber-400' },
    { id: 'backup', icon: Database, label: 'Backup and restore', iconBg: 'from-rose-600 to-rose-400' },
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
          
          <h1 className="text-4xl font-bold text-white">Settings</h1>
        </header>

        {/* App Branding Section */}
        <div className="px-6 mt-8 mb-12 text-center">
          {/* Logo Placeholder */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#C6FF3D] to-lime-500 flex items-center justify-center shadow-2xl shadow-lime-500/30"
          >
            <Music2 className="w-12 h-12 text-black stroke-[2.5]" />
          </motion.div>

          {/* App Name with Accent */}
          <h2 className="text-3xl font-bold text-white mb-2">
            Aura <span className="text-[#C6FF3D]">Music</span>
          </h2>

          {/* Developer Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              DEV BY
            </span>
            <span className="text-xs font-bold text-[#C6FF3D]">
              {currentUser?.name || 'Kiro Team'}
            </span>
          </div>

          {/* Version */}
          <p className="text-xs text-zinc-500 mt-2">
            Version 1.0.0 • Build 2026
          </p>
        </div>

        {/* General Settings Section */}
        <div className="px-6 mb-8">
          <h3 className="text-xs font-bold text-[#C6FF3D] uppercase tracking-wider mb-4 px-2">
            General Settings
          </h3>

          {/* Settings Card - Unified */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === settingsItems.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
                  >
                    {/* Icon Container */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Label */}
                    <span className="flex-1 text-base font-semibold text-white">
                      {item.label}
                    </span>

                    {/* Chevron Indicator */}
                    <ChevronRight className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  </motion.button>

                  {/* Divider (except for last item) */}
                  {!isLast && (
                    <div className="h-px bg-white/10 mx-5" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        <div className="px-6 mb-8">
          <h3 className="text-xs font-bold text-[#C6FF3D] uppercase tracking-wider mb-4 px-2">
            About
          </h3>

          <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Aura Music is a modern music streaming application built with React, TypeScript, and Supabase. 
              Featuring ambient glassmorphism design, synced lyrics, and seamless playback.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                React 19
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                TypeScript
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                Tailwind CSS
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                Supabase
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                YouTube Music API
              </span>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="px-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center text-xs text-zinc-500">
            <button className="hover:text-[#C6FF3D] transition-colors">
              Privacy Policy
            </button>
            <span className="text-zinc-700">•</span>
            <button className="hover:text-[#C6FF3D] transition-colors">
              Terms of Service
            </button>
            <span className="text-zinc-700">•</span>
            <button className="hover:text-[#C6FF3D] transition-colors">
              Open Source Licenses
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 text-center">
          <p className="text-xs text-zinc-600">
            Made with ❤️ by Kiro AI
          </p>
          <p className="text-xs text-zinc-700 mt-1">
            © 2026 Aura Music. All rights reserved.
          </p>
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
