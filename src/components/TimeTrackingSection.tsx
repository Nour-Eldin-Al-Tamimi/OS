import React, { useState, useMemo } from 'react';
import { useNour } from '../context/NourContext';
import { TimeArea, TimeEntry } from '../types';
import { 
  AnalyticsPeriod, 
  getTimeEntriesForPeriod, 
  getAreaBreakdown, 
  getTimeTrendData,
  formatHoursMinutes,
  AREA_COLORS,
  AreaBreakdown
} from '../utils/timeAnalytics';
import { LogTimeModal } from './LogTimeModal';
import { 
  Clock, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  Trash2, 
  Layers, 
  Tag 
} from 'lucide-react';

export const TimeTrackingSection: React.FC = () => {
  const { state, todayKey, deleteTimeEntry } = useNour();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [inspectedArea, setInspectedArea] = useState<TimeArea | null>(null);
  const [showRecentLogs, setShowRecentLogs] = useState(false);

  const timeEntries = state.timeEntries || [];

  // Filter entries for the selected period
  const periodEntries = useMemo(() => {
    return getTimeEntriesForPeriod(timeEntries, period, todayKey);
  }, [timeEntries, period, todayKey]);

  // Total minutes for this period
  const totalPeriodMinutes = useMemo(() => {
    return periodEntries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
  }, [periodEntries]);

  // Area and category breakdown
  const areaBreakdowns = useMemo(() => {
    return getAreaBreakdown(periodEntries);
  }, [periodEntries]);

  // Time trend data points (e.g. Mon-Sun, W1-W4, Jan-Dec)
  const trendPoints = useMemo(() => {
    return getTimeTrendData(periodEntries, period, todayKey);
  }, [periodEntries, period, todayKey]);

  const maxTrendMinutes = useMemo(() => {
    const max = Math.max(...trendPoints.map(p => p.minutes), 0);
    return max > 0 ? max : 60;
  }, [trendPoints]);

  const periodLabels: { key: AnalyticsPeriod; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' }
  ];

  return (
    <section id="section-time-tracking" className="apple-card p-6 sm:p-7 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            <Clock className="w-3.5 h-3.5 text-[#1d1d1f]" />
            <span>Time Invested</span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-3xl font-semibold font-tabular-nums text-[#1d1d1f] tracking-tight">
              {formatHoursMinutes(totalPeriodMinutes)}
            </div>
            <span className="text-xs text-[#86868b] font-medium">
              {periodLabels.find(p => p.key === period)?.label.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Period Selector & Log Time CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-black/[0.04] p-1 rounded-xl border border-black/[0.04]">
            {periodLabels.map((p) => {
              const isActive = period === p.key;
              return (
                <button
                  key={p.key}
                  id={`time-period-btn-${p.key}`}
                  onClick={() => setPeriod(p.key)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            id="open-log-time-modal-btn"
            onClick={() => setIsLogModalOpen(true)}
            className="apple-button-secondary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Main Content: Empty State OR Analytics & Trend */}
      {totalPeriodMinutes === 0 ? (
        <div className="py-12 px-4 text-center border border-dashed border-black/[0.08] rounded-2xl bg-black/[0.015] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center mx-auto text-[#6e6e73]">
            <Clock className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1d1d1f]">No tracked time yet.</p>
            <p className="text-xs text-[#86868b] mt-1 max-w-sm mx-auto">
              Start a Focus Timer to automatically log your time.
            </p>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="apple-button-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Area Breakdown: Clean Horizontal Proportional Bars */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
              <span>Domain Distribution</span>
              <span className="font-tabular-nums text-[#1d1d1f] font-semibold">{formatHoursMinutes(totalPeriodMinutes)} Total</span>
            </div>

            <div className="space-y-2">
              {areaBreakdowns.map((breakdown) => {
                const colors = AREA_COLORS[breakdown.area];
                const isInspected = inspectedArea === breakdown.area;

                return (
                  <div
                    key={breakdown.area}
                    className="rounded-2xl border border-black/[0.06] bg-white p-4 space-y-2.5 transition-all hover:border-black/[0.12]"
                  >
                    {/* Area Summary Row */}
                    <div 
                      onClick={() => setInspectedArea(isInspected ? null : breakdown.area)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.bar}`} />
                        <span className="text-sm font-semibold text-[#1d1d1f]">
                          {breakdown.area}
                        </span>
                        <span className="text-xs font-tabular-nums text-[#86868b] font-medium">
                          {breakdown.percent}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-tabular-nums font-semibold text-[#1d1d1f]">
                          {breakdown.formatted}
                        </span>
                        <button className="text-[#86868b] hover:text-[#1d1d1f] p-0.5">
                          {isInspected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Clean Proportional Bar */}
                    <div className="w-full h-2 rounded-full bg-black/[0.05] overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${breakdown.percent}%` }}
                      />
                    </div>

                    {/* Inspected Category Breakdown */}
                    {isInspected && (
                      <div className="pt-2 border-t border-black/[0.05] space-y-2 mt-2">
                        <div className="text-[11px] font-medium text-[#86868b] tracking-tight uppercase flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-[#86868b]" />
                          <span>{breakdown.area} Categories</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {breakdown.categories.map((cat) => (
                            <div
                              key={cat.category}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04] text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[#1d1d1f] font-medium truncate">{cat.category}</span>
                                <span className="text-[11px] font-tabular-nums text-[#86868b] shrink-0">
                                  ({cat.percent}%)
                                </span>
                              </div>
                              <span className="font-tabular-nums text-[#1d1d1f] shrink-0 font-medium ml-2">
                                {cat.formatted}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Trends Visualization */}
          {trendPoints.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-black/[0.06]">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#1d1d1f]" />
                  <span>Activity Frequency &bull; {periodLabels.find(p => p.key === period)?.label}</span>
                </div>
              </div>

              {/* Bar Grid */}
              <div className="pt-4 pb-2 px-3 bg-black/[0.015] border border-black/[0.06] rounded-2xl">
                <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-28">
                  {trendPoints.map((point, idx) => {
                    const heightPercent = maxTrendMinutes > 0
                      ? Math.max(4, Math.round((point.minutes / maxTrendMinutes) * 100))
                      : 4;
                    const hasValue = point.minutes > 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center h-full justify-end group min-w-0"
                      >
                        {/* Tooltip value on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-tabular-nums text-[#1d1d1f] font-semibold mb-1 whitespace-nowrap">
                          {point.formatted}
                        </div>

                        {/* Bar */}
                        <div className="w-full max-w-[28px] bg-black/[0.05] rounded-t-lg overflow-hidden flex items-end">
                          <div
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              hasValue 
                                ? 'bg-[#1d1d1f] group-hover:bg-black' 
                                : 'bg-transparent'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        {/* Label */}
                        <span className="text-[10px] text-[#86868b] truncate mt-2 w-full text-center">
                          {point.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Entries Drawer */}
          <div className="pt-2 border-t border-black/[0.06]">
            <button
              onClick={() => setShowRecentLogs(!showRecentLogs)}
              className="flex items-center justify-between w-full text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors py-1"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Logged Sessions ({periodEntries.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{showRecentLogs ? 'Hide' : 'Inspect'}</span>
                {showRecentLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showRecentLogs && (
              <div className="space-y-2 mt-3 max-h-60 overflow-y-auto pr-1">
                {periodEntries.map((entry) => {
                  const colors = AREA_COLORS[entry.area];
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-white border border-black/[0.06] rounded-xl text-xs gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${colors.bar} shrink-0`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1d1d1f] truncate">{entry.category}</span>
                            <span className="text-[10px] font-medium text-[#86868b] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/[0.04] shrink-0">
                              {entry.area}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-[11px] text-[#86868b] truncate mt-0.5">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-tabular-nums">
                          <div className="font-semibold text-[#1d1d1f]">
                            {formatHoursMinutes(entry.durationMinutes)}
                          </div>
                          <div className="text-[10px] text-[#86868b]">
                            {entry.date}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="p-1.5 text-[#86868b] hover:text-rose-600 hover:bg-black/[0.04] rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fast Log Time Modal */}
      <LogTimeModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </section>
  );
};
