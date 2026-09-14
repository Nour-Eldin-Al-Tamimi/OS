import React, { useState } from 'react';
import { NourProvider, useNour } from './context/NourContext';
import { AmbientBackground } from './components/AmbientBackground';
import { MacSidebar } from './components/MacSidebar';
import { MacTopBar } from './components/MacTopBar';
import { TodayScreen } from './components/TodayScreen';
import { DeepWorkScreen } from './components/DeepWorkScreen';
import { HabitsScreen } from './components/HabitsScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { LearningScreen } from './components/LearningScreen';
import { FinanceRewardsScreen } from './components/FinanceRewardsScreen';
import { RecoveryScreen } from './components/RecoveryScreen';
import { SettingsModal } from './components/SettingsModal';
import { TimerToastBanner } from './components/TimerToastBanner';

const AppContent: React.FC = () => {
  const { screen } = useNour();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex bg-[#fbfbfa] text-[#1d1d1f] font-sans antialiased selection:bg-[#1d1d1f] selection:text-white">
      {/* Ambient background illumination */}
      <AmbientBackground />

      {/* macOS-style Sidebar Navigation */}
      <MacSidebar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* macOS Top Bar */}
        <MacTopBar 
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
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

        {/* Minimalist Sub-Footer */}
        <footer className="relative z-10 border-t border-black/[0.05] py-5 text-center text-xs text-[#86868b]">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1d1d1f]">6-Months System</span>
              <span className="text-black/20">&bull;</span>
              <span>Win the day, don't perfect the day</span>
            </div>

            <div className="text-[11px] text-[#86868b]">
              Personal Operating System
            </div>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Lightweight Timer Log Toast Banner */}
      <TimerToastBanner />
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
