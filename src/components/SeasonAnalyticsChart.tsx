import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { TrendingUp, BarChart3, Activity, Layers, Award, Target, Zap } from 'lucide-react';
import { DeepWorkSession, Mission, Habit, DayRecord } from '../types';

interface SeasonAnalyticsChartProps {
  startDateStr: string;
  currentDay: number;
  totalSeasonDays: number;
  allSessions: DeepWorkSession[];
  missions: Record<string, Mission>;
  completions: Record<string, string[]>;
  completionVersions: Record<string, Record<string, 'full' | 'minimum'>>;
  habits: Habit[];
  dayRecords: Record<string, DayRecord>;
  lifetimeXP: number;
}

type ViewMode = 'xp' | 'completion' | 'dual';
type TimeframeFilter = 'all' | 'phase1' | 'phase2';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string | null;
    color?: string;
    dataKey?: string;
    payload: WeeklyDataPoint;
  }>;
  label?: string;
}

interface WeeklyDataPoint {
  week: string;
  weekNum: number;
  label: string;
  fullLabel: string;
  dateRange: string;
  monthNum: number;
  weeklyXP: number | null;
  cumulativeXP: number | null;
  completionRate: number | null;
  deepWorkHours: number;
  targetXP: number;
  targetCumulativeXP: number;
  targetRate: number;
  elapsedDaysInWeek: number;
  completedHabitsCount: number;
  totalPossibleHabits: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl bg-zinc-950/95 border border-zinc-800 p-4 shadow-2xl backdrop-blur-md min-w-[220px] font-mono text-xs space-y-3 z-50">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div>
          <span className="font-semibold text-white text-sm">{data.label}</span>
          <span className="text-[10px] text-zinc-500 block">{data.dateRange}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
            M{data.monthNum}
          </span>
          {data.isCurrent && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              ACTIVE
            </span>
          )}
          {data.isPast && (
            <span className="text-[10px] text-zinc-500">PAST</span>
          )}
          {data.isFuture && (
            <span className="text-[10px] text-zinc-600">UPCOMING</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {data.weeklyXP !== null && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-300" /> Weekly XP:
            </span>
            <span className="font-bold text-white">+{formatNumber(data.weeklyXP)} XP</span>
          </div>
        )}

        {data.cumulativeXP !== null && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Cumulative XP:
            </span>
            <span className="font-bold text-emerald-400">{formatNumber(data.cumulativeXP)} XP</span>
          </div>
        )}

        {data.completionRate !== null && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Habit Completion:
            </span>
            <span className={`font-bold ${data.completionRate >= 80 ? 'text-emerald-400' : 'text-zinc-300'}`}>
              {data.completionRate}%
            </span>
          </div>
        )}

        {data.deepWorkHours > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Deep Work:</span>
            <span className="text-zinc-200">{data.deepWorkHours}h focused</span>
          </div>
        )}

        {data.isFuture && (
          <div className="pt-1 text-[11px] text-zinc-500 italic">
            Target Pace: ~2,500 XP &bull; 80%+ discipline standard
          </div>
        )}
      </div>
    </div>
  );
};

export const SeasonAnalyticsChart: React.FC<SeasonAnalyticsChartProps> = ({
  startDateStr,
  currentDay,
  totalSeasonDays,
  allSessions,
  missions,
  completions,
  completionVersions,
  habits,
  dayRecords,
  lifetimeXP
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('xp');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');

  // Compute 26-week data series
  const weeklyData = useMemo<WeeklyDataPoint[]>(() => {
    const [sy, sm, sd] = (startDateStr || '2026-09-03').split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const totalWeeks = 26;
    let runningCumulativeXP = 0;

    return Array.from({ length: totalWeeks }, (_, idx) => {
      const weekNum = idx + 1;
      const startDayNum = (weekNum - 1) * 7 + 1;
      const endDayNum = Math.min(totalSeasonDays, weekNum * 7);

      const isPast = endDayNum < currentDay;
      const isCurrent = currentDay >= startDayNum && currentDay <= endDayNum;
      const isFuture = startDayNum > currentDay;

      // Dates for this week
      const startDate = new Date(start);
      startDate.setDate(start.getDate() + (startDayNum - 1));
      const endDate = new Date(start);
      endDate.setDate(start.getDate() + (endDayNum - 1));

      const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      let weekXP = 0;
      let weekDeepWorkMins = 0;
      let totalPossibleHabits = 0;
      let completedHabitsCount = 0;
      let elapsedDaysInWeek = 0;

      const activeHabits = habits.filter(h => h.active);
      const activeHabitsCount = activeHabits.length || 7;

      for (let dayOffset = startDayNum; dayOffset <= endDayNum; dayOffset++) {
        const d = new Date(start);
        d.setDate(start.getDate() + (dayOffset - 1));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;

        const isElapsed = dayOffset <= currentDay;

        if (isElapsed) {
          elapsedDaysInWeek++;
          totalPossibleHabits += activeHabitsCount;
        }

        // Deep Work XP
        const sessions = allSessions.filter(s => s.date === dateStr);
        sessions.forEach(s => {
          weekXP += s.xpEarned;
          weekDeepWorkMins += s.durationMinutes;
        });

        // Mission XP
        const mission = missions[dateStr];
        if (mission?.status === 'completed') {
          weekXP += (mission.xp || 150);
        }

        // Habit XP
        const completedHabitIds = completions[dateStr] || [];
        const versions = completionVersions[dateStr] || {};
        completedHabitsCount += completedHabitIds.length;

        completedHabitIds.forEach(hid => {
          const habit = habits.find(h => h.id === hid);
          const baseXP = habit?.xp || 30;
          const v = versions[hid] || 'full';
          const earned = v === 'minimum' ? Math.round(baseXP * 0.6) : baseXP;
          weekXP += earned;
        });
      }

      if (!isFuture) {
        runningCumulativeXP += weekXP;
      }

      let completionRate: number | null = null;
      if (!isFuture && elapsedDaysInWeek > 0) {
        completionRate = totalPossibleHabits > 0
          ? Math.min(100, Math.round((completedHabitsCount / totalPossibleHabits) * 100))
          : 0;
      }

      const monthNum = Math.min(6, Math.floor((startDayNum - 1) / 30) + 1);

      return {
        week: `W${weekNum}`,
        weekNum,
        label: `Week ${weekNum}`,
        fullLabel: `Week ${weekNum} (Days ${startDayNum}–${endDayNum})`,
        dateRange,
        monthNum,
        weeklyXP: isFuture ? null : weekXP,
        cumulativeXP: isFuture ? null : runningCumulativeXP,
        completionRate,
        deepWorkHours: Math.round((weekDeepWorkMins / 60) * 10) / 10,
        targetXP: 2500,
        targetCumulativeXP: weekNum * 2500,
        targetRate: 80,
        elapsedDaysInWeek,
        completedHabitsCount,
        totalPossibleHabits,
        isPast,
        isCurrent,
        isFuture
      };
    });
  }, [
    startDateStr,
    currentDay,
    totalSeasonDays,
    allSessions,
    missions,
    completions,
    completionVersions,
    habits
  ]);

  // Filtered dataset according to timeframe
  const filteredData = useMemo(() => {
    if (timeframe === 'phase1') {
      return weeklyData.slice(0, 12);
    }
    if (timeframe === 'phase2') {
      return weeklyData.slice(12, 26);
    }
    return weeklyData;
  }, [weeklyData, timeframe]);

  // Derived aggregate metrics
  const activeWeek = weeklyData.find(d => d.isCurrent) || weeklyData[0];
  const currentWeekXP = activeWeek?.weeklyXP || 0;
  const currentWeekRate = activeWeek?.completionRate ?? 0;

  const pastWeeks = weeklyData.filter(d => !d.isFuture);
  const avgWeeklyXP = pastWeeks.length > 0
    ? Math.round(pastWeeks.reduce((acc, d) => acc + (d.weeklyXP || 0), 0) / pastWeeks.length)
    : 0;

  const completedWeeksWithRate = pastWeeks.filter(d => d.completionRate !== null);
  const avgCompletionRate = completedWeeksWithRate.length > 0
    ? Math.round(completedWeeksWithRate.reduce((acc, d) => acc + (d.completionRate || 0), 0) / completedWeeksWithRate.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 subtle-glow-sm space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Season 01 Analytics
            </span>
            <span className="text-zinc-700">&bull;</span>
            <span className="text-xs font-mono text-emerald-400">26-Week Arc</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-semibold text-white tracking-wide mt-1">
            Weekly Velocity & Execution Rates
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Quantitative six-month trajectory tracking disciplined momentum and habit adherence.
          </p>
        </div>

        {/* View Mode & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Tabs */}
          <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-800 p-1">
            <button
              id="tab_xp_accumulation"
              onClick={() => setViewMode('xp')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                viewMode === 'xp'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              XP Velocity
            </button>
            <button
              id="tab_completion_rates"
              onClick={() => setViewMode('completion')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                viewMode === 'completion'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Completion %
            </button>
            <button
              id="tab_dual_trajectory"
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                viewMode === 'dual'
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Dual View
            </button>
          </div>

          {/* Timeframe Scope Selector */}
          <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-800 p-1 text-xs font-mono">
            <button
              id="filter_timeframe_all"
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                timeframe === 'all'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              26 Weeks
            </button>
            <button
              id="filter_timeframe_phase1"
              onClick={() => setTimeframe('phase1')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                timeframe === 'phase1'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              W1–12 (Q1)
            </button>
            <button
              id="filter_timeframe_phase2"
              onClick={() => setTimeframe('phase2')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                timeframe === 'phase2'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              W13–26 (Q2)
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Trajectory Metric Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3.5"
      >
        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Current Week XP</span>
            <Zap className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-mono font-bold text-white mt-1">
            +{formatNumber(currentWeekXP)} <span className="text-xs font-normal text-zinc-500">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Week {activeWeek?.weekNum} of 26
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Weekly Run-Rate</span>
            <TrendingUp className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="text-lg font-mono font-bold text-zinc-200 mt-1">
            {formatNumber(avgWeeklyXP)} <span className="text-xs font-normal text-zinc-500">XP/wk</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Target: 2,500 XP/wk
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Current Adherence</span>
            <Target className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
            {currentWeekRate}%
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            Discipline standard: 80%
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Season Progress</span>
            <Award className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="text-lg font-mono font-bold text-white mt-1">
            {formatNumber(lifetimeXP)} <span className="text-xs font-normal text-zinc-500">XP</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            65,000 XP Season Target
          </div>
        </div>
      </motion.div>

      {/* Chart Section */}
      <div className="space-y-6 pt-2">
        {/* CHART 1: WEEKLY XP ACCUMULATION */}
        {(viewMode === 'xp' || viewMode === 'dual') && (
          <motion.div 
            key="chart-xp-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-zinc-200" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-semibold">
                  Weekly XP Velocity & Cumulative Trajectory
                </h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-zinc-700" /> Weekly XP
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Cumulative XP
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="w-3 border-t border-dashed border-zinc-600 inline-block" /> 2.5k Target
                </span>
              </div>
            </div>

            <div className="w-full h-72 sm:h-80 rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-2 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={filteredData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="cumulativeXPShader" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#27272a"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                  />

                  {/* Left Y Axis for Weekly XP */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                    tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />

                  {/* Right Y Axis for Cumulative XP */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* Baseline Target Reference Line */}
                  <ReferenceLine
                    yAxisId="left"
                    y={2500}
                    stroke="#52525b"
                    strokeDasharray="3 3"
                  />

                  {/* Weekly XP Bars */}
                  <Bar
                    yAxisId="left"
                    dataKey="weeklyXP"
                    fill="#3f3f46"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    isAnimationActive={true}
                    animationDuration={850}
                    animationEasing="ease-out"
                  />

                  {/* Cumulative XP Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativeXP"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#080809' }}
                    activeDot={{ r: 5, fill: '#34d399' }}
                    connectNulls={false}
                    isAnimationActive={true}
                    animationDuration={1050}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* CHART 2: WEEKLY COMPLETION RATES (%) */}
        {(viewMode === 'completion' || viewMode === 'dual') && (
          <motion.div 
            key="chart-completion-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-semibold">
                  Weekly Habit & Mission Execution Rate (%)
                </h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Completion Rate %
                </span>
                <span className="flex items-center gap-1.5 text-amber-400/90">
                  <span className="w-3 border-t border-dashed border-amber-500/80 inline-block" /> 80% Standard
                </span>
              </div>
            </div>

            <div className="w-full h-72 sm:h-80 rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-2 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="rateShader" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#27272a"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 80, 100]}
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#27272a' }}
                    tickLine={{ stroke: '#27272a' }}
                    tickFormatter={(val) => `${val}%`}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* 80% Gold Standard Discipline Reference Line */}
                  <ReferenceLine
                    y={80}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: '80% Standard',
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 10,
                      fontFamily: 'monospace'
                    }}
                  />

                  {/* Completion Rate Area and Line */}
                  <Area
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#rateShader)"
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#080809' }}
                    activeDot={{ r: 5, fill: '#34d399' }}
                    connectNulls={false}
                    isAnimationActive={true}
                    animationDuration={950}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analytical Footnote */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Six-Month Horizon: 26 Weeks &bull; 180 Days &bull; 6 Core Technical Chapters</span>
        </div>
        <div>
          Execution over streak anxiety. Maintain 80%+ consistency to lock transformation.
        </div>
      </div>
    </motion.div>
  );
};
