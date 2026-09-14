import React from 'react';
import { useNour } from '../context/NourContext';
import { calculateJourneyStats } from '../utils/systemAnalytics';
import { Compass } from 'lucide-react';

export const JourneyIndicator: React.FC = () => {
  const { dayNumber, state } = useNour();
  const journey = calculateJourneyStats(dayNumber, state.user.totalSeasonDays || 180);

  return (
    <div 
      id="journey-indicator-card" 
      className="apple-card p-5 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black/[0.04] border border-black/[0.04] flex items-center justify-center text-[#1d1d1f] shrink-0">
            <Compass className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
              6-Month Journey
            </div>
            <div className="text-sm font-semibold text-[#1d1d1f] tracking-tight">
              Month {journey.currentMonth} of {journey.totalMonths}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-tabular-nums text-[#6e6e73]">
            Day <strong className="text-[#1d1d1f] font-semibold">{journey.currentDay}</strong> of {journey.totalDays}
          </span>
          <span className="text-black/[0.15] text-xs">&bull;</span>
          <span className="text-xs font-tabular-nums font-medium text-[#1d1d1f] px-2 py-0.5 rounded-full bg-black/[0.04]">
            {journey.progressPercent}% Elapsed
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full bg-black/[0.05] overflow-hidden">
        <div 
          className="h-full bg-[#1d1d1f] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${journey.progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#86868b] mt-2.5 font-tabular-nums">
        <span>Started {state.user.startDate}</span>
        <span className="font-medium text-[#6e6e73]">{state.user.careerTrack || 'Software Engineering'}</span>
      </div>
    </div>
  );
};
