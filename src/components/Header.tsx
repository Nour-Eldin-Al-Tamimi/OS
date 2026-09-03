import React from 'react';
import { useNour } from '../context/NourContext';
import { ScreenType } from '../types';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  RotateCcw, 
  Settings, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { 
    screen, 
    setScreen, 
    dayNumber, 
    state, 
    availableXP, 
    currentLevel, 
    todayDeepWorkMinutes, 
    smartDayState,
    isMinimumViableDayActive
  } = useNour();

  const navItems: { id: ScreenType; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'habits', label: 'Habits' },
    { id: 'deep_work', label: 'Deep Work' },
    { id: 'progress', label: 'Progress' },
    { id: 'learning', label: 'Learning' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'recovery', label: 'Recovery' },
  ];

  const deepWorkHours = Math.floor(todayDeepWorkMinutes / 60);
  const deepWorkRemainderMinutes = todayDeepWorkMinutes % 60;

  const getSmartStateBadge = () => {
    if (isMinimumViableDayActive) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider bg-zinc-800/90 text-amber-300 border border-amber-500/30">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          MVD ACTIVE
        </span>
      );
    }
    switch (smartDayState) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider bg-zinc-900 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'recovering':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-500/30">
            <RotateCcw className="w-3 h-3 text-zinc-300" />
            RECOVERING
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider bg-zinc-900 text-zinc-200 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider bg-zinc-900/80 text-zinc-400 border border-zinc-800">
            NOT STARTED
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#080809]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Season Tracker */}
          <div className="flex items-center gap-4">
            <button
              id="brand-logo-btn"
              onClick={() => setScreen('today')}
              className="flex items-baseline gap-1.5 group cursor-pointer focus:outline-none"
            >
              <span className="font-accent-italic text-2xl md:text-3xl text-white italic font-normal tracking-tight group-hover:text-zinc-200 transition-colors">
                Nour
              </span>
              <span className="font-serif-display text-sm md:text-base font-bold tracking-[0.18em] text-zinc-400 group-hover:text-white transition-colors">
                OS
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs font-mono text-zinc-400">
              <span className="text-zinc-300 font-medium">S1</span>
              <span>&bull;</span>
              <span>Day {dayNumber} of {state.user.totalSeasonDays}</span>
            </div>
          </div>

          {/* Center Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-full border border-zinc-800/80">
            {navItems.map((item) => {
              const isActive = screen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setScreen(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicators */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Deep Work summary pill */}
            <button
              id="header-deepwork-shortcut-btn"
              onClick={() => setScreen('deep_work')}
              title="Today's Deep Work"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-full text-xs font-mono text-zinc-300 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{deepWorkHours}h {deepWorkRemainderMinutes}m</span>
            </button>

            {/* Level & XP pill */}
            <button
              id="header-xp-shortcut-btn"
              onClick={() => setScreen('rewards')}
              title="Level and Available XP"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-full text-xs font-mono text-zinc-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-zinc-300" />
              <span className="text-zinc-400">LVL {currentLevel}</span>
              <span className="text-zinc-600">&bull;</span>
              <span className="font-semibold text-white">{availableXP} XP</span>
            </button>

            {/* Smart Day State */}
            <div className="hidden sm:block">
              {getSmartStateBadge()}
            </div>

            {/* Settings button */}
            <button
              id="header-settings-btn"
              onClick={onOpenSettings}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-full transition-colors focus:outline-none"
              title="Settings & System Data"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-zinc-800/40 no-scrollbar">
          {navItems.map((item) => {
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
