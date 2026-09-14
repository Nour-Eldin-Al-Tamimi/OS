import React, { useMemo } from 'react';
import { useNour } from '../context/NourContext';
import { ScreenType } from '../types';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Award, 
  RotateCcw, 
  Settings,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface MacSidebarProps {
  onOpenSettings: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const MacSidebar: React.FC<MacSidebarProps> = ({ 
  onOpenSettings,
  isOpenMobile = false,
  onCloseMobile 
}) => {
  const { 
    screen, 
    setScreen, 
    dayNumber, 
    state, 
    currentLevel, 
    availableXP,
    isMinimumViableDayActive,
    smartDayState 
  } = useNour();

  const navItems: { id: ScreenType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: Target },
    { id: 'habits', label: 'Habits', icon: CheckCircle2 },
    { id: 'deep_work', label: 'Deep Work', icon: Clock },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'recovery', label: 'Recovery', icon: RotateCcw },
  ];

  const activeTimer = state.activeDeepWork;
  const activeTimerDisplay = useMemo(() => {
    if (!activeTimer || !activeTimer.isRunning) return null;
    const s = activeTimer.elapsedSeconds;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h > 0) {
      return `${h}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, [activeTimer?.elapsedSeconds, activeTimer?.isRunning]);

  const handleSelect = (id: ScreenType) => {
    setScreen(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside 
      id="mac-sidebar"
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#f5f5f7]/95 backdrop-blur-xl border-r border-black/[0.07] flex flex-col justify-between
        transition-transform duration-250 ease-out md:translate-x-0 select-none
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Top Header Section with macOS Traffic Lights */}
      <div className="p-5 pb-3">
        {/* macOS Traffic Light Dots */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 inline-block shadow-sm" />
        </div>

        {/* Application Brand */}
        <div className="px-1">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
              6-Months System
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-black/[0.05] text-[#6e6e73]">
              v2.0
            </span>
          </div>
          <p className="text-[11px] text-[#86868b] mt-0.5 font-medium">
            Season 01 &bull; Day {dayNumber} of {state.user.totalSeasonDays || 180}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider px-3 py-1 mb-1">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = screen === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150
                ${isSelected 
                  ? 'bg-black/[0.07] text-[#1d1d1f] font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]' 
                  : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-black/[0.035]'}
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`} />
                <span>{item.label}</span>
              </div>

              {/* Badges for special states */}
              {item.id === 'deep_work' && activeTimer?.isRunning && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-500/15 border border-emerald-600/20 px-1.5 py-0.5 rounded-md font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {activeTimerDisplay}
                </span>
              )}

              {item.id === 'recovery' && isMinimumViableDayActive && (
                <span className="text-[10px] font-mono text-amber-700 bg-amber-500/15 border border-amber-600/20 px-1.5 py-0.5 rounded-md">
                  MVD
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & Settings Section */}
      <div className="p-3 border-t border-black/[0.06] bg-[#f5f5f7]/60">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white border border-black/[0.08] shadow-sm flex items-center justify-center text-xs font-semibold text-[#1d1d1f] shrink-0">
              {state.user.name ? state.user.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1d1d1f] truncate">
                {state.user.name || 'Nour'}
              </div>
              <div className="text-[11px] text-[#86868b] font-mono">
                Level {currentLevel} &bull; {availableXP} XP
              </div>
            </div>
          </div>

          <button
            id="sidebar-open-settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.05] transition-colors"
            title="System Settings"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
