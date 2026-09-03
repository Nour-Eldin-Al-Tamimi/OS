import React, { useState } from 'react';
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

const AppContent: React.FC = () => {
  const { state, screen, dismissOpening } = useNour();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070708] text-zinc-100 font-sans-ui selection:bg-zinc-800 selection:text-white">
      {/* Brand opening sequence if not yet dismissed */}
      {!state.hasSeenOpening && (
        <BrandOpening onDismiss={dismissOpening} />
      )}

      {/* Subtle architectural ambient background */}
      <AmbientBackground />

      {/* Main OS Top Navigation & Status Bar */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

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

          <div className="text-[11px] tracking-widest text-zinc-400 uppercase">
            Simple outside &bull; Powerful inside &bull; Built for 6 months
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
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
