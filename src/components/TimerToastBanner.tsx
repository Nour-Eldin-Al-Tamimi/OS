import React from 'react';
import { useNour } from '../context/NourContext';
import { CheckCircle2, X } from 'lucide-react';
import { AREA_COLORS } from '../utils/timeAnalytics';

export const TimerToastBanner: React.FC = () => {
  const { timerToast, dismissTimerToast } = useNour();

  if (!timerToast) return null;

  const colorConfig = AREA_COLORS[timerToast.area] || AREA_COLORS['Learning'];

  return (
    <div 
      id="timer-toast-banner"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 sm:px-0 pointer-events-none transition-all duration-300"
    >
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-black/10 text-[#1d1d1f] rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                {timerToast.durationText} logged
              </span>
              <span className={`w-2 h-2 rounded-full ${colorConfig.bar}`} />
            </div>
            <div className="text-xs text-[#6e6e73] truncate mt-0.5">
              <span>{timerToast.area}</span>
              <span className="mx-1 text-[#86868b]">&bull;</span>
              <span className="text-[#1d1d1f] font-medium">{timerToast.category}</span>
            </div>
          </div>
        </div>

        <button
          onClick={dismissTimerToast}
          aria-label="Dismiss notification"
          className="text-[#86868b] hover:text-[#1d1d1f] p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
