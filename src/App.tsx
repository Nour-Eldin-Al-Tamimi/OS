import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NourProvider, useNour } from './context/NourContext';
import { AmbientBackground } from './components/AmbientBackground';
import { BrandOpening } from './components/BrandOpening';
import { Header } from './components/Header';
import { TodayScreen } from './components/TodayScreen';
import { DeepWorkScreen } from './components/DeepWorkScreen';
import { HabitsScreen } from './components/HabitsScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { LearningScreen } from './components/LearningScreen';
import { FinanceRewardsScreen } from './components/FinanceRewardsScreen';
import { RecoveryScreen } from './components/RecoveryScreen';
import { SettingsModal } from './components/SettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

const AppContent: React.FC = () => {
  const { state, screen, setScreen, dismissOpening } = useNour();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Keyboard Shortcuts Hook
  const { toast } = useGlobalShortcuts({
    currentScreen: screen,
    onNavigate: setScreen,
    isSettingsOpen,
    setIsSettingsOpen,
    isShortcutsOpen,
    setIsShortcutsOpen
  });

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070708] text-zinc-100 font-sans-ui selection:bg-zinc-800 selection:text-white">
      {/* Brand opening sequence if not yet dismissed */}
      {!state.hasSeenOpening && (
        <BrandOpening onDismiss={dismissOpening} />
      )}

      {/* Subtle architectural ambient background */}
      <AmbientBackground />

      {/* Main OS Top Navigation & Status Bar */}
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenShortcuts={() => setIsShortcutsOpen(true)} 
      />

      {/* Dynamic Screen Viewport */}
      <main className="relative z-10 flex-1 pb-16">
        {screen === 'today' && <TodayScreen />}
        {screen === 'habits' && <HabitsScreen />}
        {screen === 'deep_work' && <DeepWorkScreen />}
        {screen === 'progress' && <ProgressScreen />}
        {screen === 'learning' && <LearningScreen />}
        {screen === 'rewards' && <FinanceRewardsScreen />}
        {screen === 'recovery' && <RecoveryScreen />}
      </main>

      {/* Global Minimalist Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-[#070708]/80 py-6 text-center text-xs font-mono text-zinc-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-accent-italic text-lg text-white font-normal">Nour</span>
            <span className="font-serif-display font-bold text-zinc-400">OS</span>
            <span className="text-zinc-700">&bull;</span>
            <span>Season 01 // Chapter 01</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] tracking-wider text-zinc-400">
            <span className="uppercase">Simple outside &bull; Powerful inside</span>
            <span className="text-zinc-700">&bull;</span>
            <button
              id="footer-shortcuts-trigger-btn"
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Shortcuts</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-300">
                ?
              </kbd>
            </button>
          </div>
        </div>
      </footer>

      {/* Keyboard Navigation Feedback Pill Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/95 border border-zinc-700/90 text-xs font-mono text-zinc-200 shadow-2xl backdrop-blur-md pointer-events-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-400">Jumped to:</span>
            <span className="text-white font-semibold">{toast.message}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 font-mono text-[10px] font-bold text-emerald-400">
              {toast.keyLabel}
            </kbd>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onNavigate={setScreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <NourProvider>
      <AppContent />
    </NourProvider>
  );
}
