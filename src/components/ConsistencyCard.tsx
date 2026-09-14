import React from 'react';
import { useNour } from '../context/NourContext';
import { calculateConsistencyStats } from '../utils/systemAnalytics';
import { Zap, CheckCircle2 } from 'lucide-react';

export const ConsistencyCard: React.FC = () => {
  const { state, todayKey, completionRatePercent } = useNour();
  const consistency = calculateConsistencyStats(state, todayKey);

  return (
    <div 
      id="consistency-progress-card" 
      className="apple-card p-6 sm:p-7 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
          <Zap className="w-3.5 h-3.5 text-[#1d1d1f]" />
          <span>Execution & Consistency</span>
        </div>

        <span className="text-[11px] font-medium text-[#86868b]">
          Analytical Model
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Today's Progress Score */}
        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05] space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#6e6e73]">
            <span>Today's Progress</span>
            <span className="text-xs font-tabular-nums text-[#1d1d1f] font-semibold">{completionRatePercent}%</span>
          </div>

          <div className="text-3xl font-semibold font-tabular-nums text-[#1d1d1f] tracking-tight">
            {completionRatePercent}%
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div 
              className="h-full bg-[#1d1d1f] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRatePercent}%` }}
            />
          </div>

          <p className="text-[11px] text-[#86868b]">
            {completionRatePercent >= 70 ? 'Core targets on track' : 'Scheduled activities in progress'}
          </p>
        </div>

        {/* 6-Month Trajectory Consistency Score */}
        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05] space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#6e6e73]">
            <span>Consistency</span>
            <span className="text-xs font-tabular-nums text-emerald-700 font-semibold">{consistency.consistencyPercent}%</span>
          </div>

          <div className="text-3xl font-semibold font-tabular-nums text-emerald-700 tracking-tight">
            {consistency.consistencyPercent}%
          </div>

          {/* Consistency bar */}
          <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${consistency.consistencyPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-[#86868b] font-tabular-nums">
            {consistency.completedDays} of {consistency.totalPlannedDays} planned days completed
          </p>
        </div>
      </div>

      {/* Philosophical Anchor */}
      <div className="pt-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#86868b]">
        <span className="italic text-[#6e6e73]">"Win the day, don't perfect the day."</span>
        <span className="text-[11px] text-[#86868b]">
          Non-punitive momentum tracking
        </span>
      </div>
    </div>
  );
};
