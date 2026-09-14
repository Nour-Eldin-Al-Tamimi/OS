import React from 'react';
import { useNour } from '../context/NourContext';
import { detectSmartDrift } from '../utils/systemAnalytics';
import { TrendingDown, TrendingUp, Compass } from 'lucide-react';

export const DriftInsightCard: React.FC = () => {
  const { state, todayKey } = useNour();
  const drift = detectSmartDrift(state, todayKey);

  if (!drift) return null;

  return (
    <div 
      id="drift-detection-insight-card"
      className={`rounded-2xl p-4 sm:p-5 transition-all border ${
        drift.type === 'negative'
          ? 'bg-amber-500/[0.04] border-amber-500/20 text-[#1d1d1f]'
          : drift.type === 'positive'
          ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-[#1d1d1f]'
          : 'apple-card text-[#1d1d1f]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
            drift.type === 'negative'
              ? 'bg-amber-500/15 border-amber-500/25 text-amber-700'
              : drift.type === 'positive'
              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-700'
              : 'bg-black/[0.04] border-black/[0.06] text-[#1d1d1f]'
          }`}>
            {drift.type === 'negative' ? (
              <TrendingDown className="w-4 h-4" />
            ) : drift.type === 'positive' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <Compass className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
                Smart Drift Detection
              </span>
              <span className="text-black/[0.15] text-xs">&bull;</span>
              <span className="text-xs font-semibold text-[#1d1d1f]">
                {drift.headline}
              </span>
            </div>

            <p className="text-sm font-medium text-[#424245] mt-1 leading-snug">
              {drift.detail}
            </p>
          </div>
        </div>

        {drift.deltaPercent !== 0 && (
          <div className="text-right font-tabular-nums shrink-0 hidden sm:block">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              drift.type === 'negative'
                ? 'bg-amber-500/10 text-amber-800 border-amber-500/25'
                : 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
            }`}>
              {drift.deltaPercent > 0 ? `+${drift.deltaPercent}%` : `${drift.deltaPercent}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
