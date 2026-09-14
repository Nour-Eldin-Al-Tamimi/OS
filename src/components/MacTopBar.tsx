import React from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { Menu, Settings, Clock, ShieldAlert } from 'lucide-react';
import { ScreenType } from '../types';

interface MacTopBarProps {
  onToggleSidebarMobile: () => void;
  onOpenSettings: () => void;
}

export const MacTopBar: React.FC<MacTopBarProps> = ({ 
  onToggleSidebarMobile,
  onOpenSettings
}) => {
  const { 
    screen, 
    setScreen, 
    todayKey, 
    dayNumber, 
    state,
    isMinimumViableDayActive 
  } = useNour();

  const getScreenTitle = (s: ScreenType) => {
    switch (s) {
      case 'today': return 'Command Center';
      case 'habits': return 'Core & Keystone Habits';
      case 'deep_work': return 'Deep Work & Timer';
      case 'progress': return 'Progress & Analytics';
      case 'learning': return 'Learning Matrix';
      case 'rewards': return 'Rewards & Milestones';
      case 'recovery': return 'Recovery Protocol';
      default: return 'Overview';
    }
  };

  const activeTimer = state.activeDeepWork;

  return (
    <header 
      id="mac-top-bar"
      className="sticky top-0 z-30 w-full h-14 bg-[#fbfbfa]/80 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-4 sm:px-8 select-none"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebarMobile}
          aria-label="Toggle navigation"
          className="md:hidden p-2 -ml-2 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Context / Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1d1d1f] tracking-tight">
            {getScreenTitle(screen)}
          </span>
          <span className="text-[#86868b] text-xs">&bull;</span>
          <span className="text-xs text-[#86868b] font-medium hidden sm:inline">
            {formatDateDisplay(todayKey)}
          </span>
        </div>
      </div>

      {/* Right Side Minimal Indicators */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* MVD Active badge */}
        {isMinimumViableDayActive && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Minimum Viable Day</span>
            <span className="sm:hidden">MVD</span>
          </span>
        )}

        {/* Active timer quick status */}
        {activeTimer?.isRunning && (
          <button
            onClick={() => setScreen('deep_work')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold">
              {Math.floor(activeTimer.elapsedSeconds / 60)}:{(activeTimer.elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-neutral-400 hidden sm:inline">&bull; {activeTimer.category}</span>
          </button>
        )}

        {/* Settings button on mobile */}
        <button
          onClick={onOpenSettings}
          className="md:hidden p-2 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.04] transition-colors"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
