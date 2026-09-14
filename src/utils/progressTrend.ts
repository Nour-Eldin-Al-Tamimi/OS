import { NourOSState } from '../types';

export type ProgressRange = '7D' | '30D' | '3M' | '6M' | '1Y';

export interface ProgressTrendPoint {
  key: string;
  date: string;
  label: string;
  subLabel?: string;
  tooltipTitle: string;
  score: number; // 0 - 100
  hasRealActivity: boolean;
}

export interface ProgressSummary {
  currentScore: number;
  currentPeriodAvg: number;
  prevPeriodAvg?: number;
  diffPercent?: number;
  hasEnoughData: boolean;
  totalDataPointsWithActivity: number;
}

const parseLocalDate = (dateStr: string): Date => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  } catch {
    return new Date();
  }
};

const formatDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates a daily Progress Score from 0–100 based on REAL Habit and Mission completions.
 * Does not punish user for future days.
 */
export const calculateDailyProgressScore = (dateStr: string, state: NourOSState): number => {
  const isMVD = state.dayRecords[dateStr]?.state === 'minimum_viable';
  const activeHabits = state.habits.filter(h => h.active);
  const relevantHabits = isMVD ? activeHabits.filter(h => h.isMinimumViable) : activeHabits;

  const completedIds = state.completions[dateStr] || [];
  const versions = state.completionVersions[dateStr] || {};

  // Habits score calculation
  let habitRatio = 0;
  if (relevantHabits.length > 0) {
    const totalExpectedXP = relevantHabits.reduce((acc, h) => acc + (h.xp || 30), 0);
    const earnedXP = relevantHabits
      .filter(h => completedIds.includes(h.id))
      .reduce((acc, h) => {
        const isMin = versions[h.id] === 'minimum';
        const earned = isMin ? Math.round((h.xp || 30) * 0.6) : (h.xp || 30);
        return acc + earned;
      }, 0);

    habitRatio = totalExpectedXP > 0 ? Math.min(1, earnedXP / totalExpectedXP) : 0;
  }

  // Mission score calculation
  const mission = state.missions[dateStr];
  if (mission) {
    let missionRatio = 0;
    if (mission.status === 'completed') {
      missionRatio = 1.0;
    } else if (mission.status === 'in_progress') {
      missionRatio = 0.5;
    }

    // Weighted 70% habits + 30% mission
    const rawScore = Math.round(habitRatio * 70 + missionRatio * 30);
    return Math.max(0, Math.min(100, rawScore));
  }

  // If no mission scheduled for that day, scale habits to 100%
  const rawScore = Math.round(habitRatio * 100);
  return Math.max(0, Math.min(100, rawScore));
};

/**
 * Checks if a given date has real recorded activity (completions, mission, deep work, etc.)
 */
export const dateHasActivity = (dateStr: string, state: NourOSState): boolean => {
  if (state.completions[dateStr] && state.completions[dateStr].length > 0) return true;
  if (state.missions[dateStr]) return true;
  if (state.dayRecords[dateStr]) return true;
  if (state.deepWorkSessions?.some(s => s.date === dateStr)) return true;
  if (state.timeEntries?.some(e => e.date === dateStr)) return true;
  return false;
};

export const getProgressTrendData = (
  state: NourOSState,
  range: ProgressRange,
  todayKey: string
): { points: ProgressTrendPoint[]; summary: ProgressSummary } => {
  const todayDate = parseLocalDate(todayKey);
  const startDateStr = state.user.startDate;
  const userStartDate = parseLocalDate(startDateStr);

  const points: ProgressTrendPoint[] = [];

  if (range === '7D') {
    // 7 daily points ending today
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const k = formatDateKey(d);
      const score = calculateDailyProgressScore(k, state);
      const hasAct = dateHasActivity(k, state) || k === todayKey;

      points.push({
        key: k,
        date: k,
        label: dayNames[d.getDay()],
        subLabel: `${d.getMonth() + 1}/${d.getDate()}`,
        tooltipTitle: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        score,
        hasRealActivity: hasAct
      });
    }
  } else if (range === '30D') {
    // 30 daily points ending today
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const k = formatDateKey(d);
      const score = calculateDailyProgressScore(k, state);
      const hasAct = dateHasActivity(k, state) || k === todayKey;

      const isKeyTick = i % 5 === 0 || i === 29;
      points.push({
        key: k,
        date: k,
        label: isKeyTick ? `${d.getMonth() + 1}/${d.getDate()}` : '',
        subLabel: `${d.getMonth() + 1}/${d.getDate()}`,
        tooltipTitle: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        score,
        hasRealActivity: hasAct
      });
    }
  } else if (range === '3M') {
    // 12 weeks ending this week
    for (let w = 11; w >= 0; w--) {
      const weekEnd = new Date(todayDate);
      weekEnd.setDate(todayDate.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      let weekTotalScore = 0;
      let daysWithAct = 0;
      let totalDaysConsidered = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const cur = new Date(weekStart);
        cur.setDate(weekStart.getDate() + dayOffset);
        if (cur > todayDate) continue; // Don't check future days

        const curKey = formatDateKey(cur);
        const hasAct = dateHasActivity(curKey, state) || curKey === todayKey;
        const score = calculateDailyProgressScore(curKey, state);

        totalDaysConsidered++;
        weekTotalScore += score;
        if (hasAct && score > 0) {
          daysWithAct++;
        }
      }

      const avgScore = totalDaysConsidered > 0 ? Math.round(weekTotalScore / totalDaysConsidered) : 0;
      const startKey = formatDateKey(weekStart);
      const endKey = formatDateKey(weekEnd);

      points.push({
        key: `week_${w}`,
        date: startKey,
        label: `W${12 - w}`,
        subLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        tooltipTitle: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        score: avgScore,
        hasRealActivity: daysWithAct > 0 || w === 0
      });
    }
  } else if (range === '6M') {
    // 24 weeks (~6 months)
    for (let w = 23; w >= 0; w--) {
      const weekEnd = new Date(todayDate);
      weekEnd.setDate(todayDate.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      let weekTotalScore = 0;
      let daysWithAct = 0;
      let totalDaysConsidered = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const cur = new Date(weekStart);
        cur.setDate(weekStart.getDate() + dayOffset);
        if (cur > todayDate) continue;

        const curKey = formatDateKey(cur);
        const hasAct = dateHasActivity(curKey, state) || curKey === todayKey;
        const score = calculateDailyProgressScore(curKey, state);

        totalDaysConsidered++;
        weekTotalScore += score;
        if (hasAct && score > 0) {
          daysWithAct++;
        }
      }

      const avgScore = totalDaysConsidered > 0 ? Math.round(weekTotalScore / totalDaysConsidered) : 0;
      const startKey = formatDateKey(weekStart);

      // Label month at intervals
      const showMonth = w % 4 === 0;
      points.push({
        key: `w6m_${w}`,
        date: startKey,
        label: showMonth ? weekStart.toLocaleDateString('en-US', { month: 'short' }) : '',
        subLabel: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        tooltipTitle: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        score: avgScore,
        hasRealActivity: daysWithAct > 0 || w === 0
      });
    }
  } else if (range === '1Y') {
    // 12 monthly aggregated points
    const curYear = todayDate.getFullYear();
    const curMonth = todayDate.getMonth();

    for (let m = 11; m >= 0; m--) {
      const targetMonthDate = new Date(curYear, curMonth - m, 1);
      const y = targetMonthDate.getFullYear();
      const monthIdx = targetMonthDate.getMonth();
      const daysInTargetMonth = new Date(y, monthIdx + 1, 0).getDate();

      let monthTotalScore = 0;
      let daysEvaluated = 0;
      let daysWithAct = 0;

      for (let day = 1; day <= daysInTargetMonth; day++) {
        const cur = new Date(y, monthIdx, day);
        if (cur > todayDate) continue;

        const curKey = formatDateKey(cur);
        const hasAct = dateHasActivity(curKey, state) || curKey === todayKey;
        const score = calculateDailyProgressScore(curKey, state);

        daysEvaluated++;
        monthTotalScore += score;
        if (hasAct && score > 0) {
          daysWithAct++;
        }
      }

      const avgScore = daysEvaluated > 0 ? Math.round(monthTotalScore / daysEvaluated) : 0;
      const mLabel = targetMonthDate.toLocaleDateString('en-US', { month: 'short' });

      points.push({
        key: `m_${y}_${monthIdx}`,
        date: `${y}-${String(monthIdx + 1).padStart(2, '0')}-01`,
        label: mLabel,
        tooltipTitle: targetMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        score: avgScore,
        hasRealActivity: daysWithAct > 0 || m === 0
      });
    }
  }

  // Calculate Summary and Previous Period Comparison
  const activePoints = points.filter(p => p.hasRealActivity);
  const currentScore = calculateDailyProgressScore(todayKey, state);

  // Compute current period average from active days
  const currentPeriodSum = points.reduce((acc, p) => acc + p.score, 0);
  const currentPeriodAvg = points.length > 0 ? Math.round(currentPeriodSum / points.length) : currentScore;

  // Calculate previous period average
  let prevPeriodAvg: number | undefined = undefined;
  let diffPercent: number | undefined = undefined;

  let daysBack = 7;
  if (range === '7D') daysBack = 7;
  else if (range === '30D') daysBack = 30;
  else if (range === '3M') daysBack = 90;
  else if (range === '6M') daysBack = 180;
  else if (range === '1Y') daysBack = 365;

  let prevSum = 0;
  let prevCount = 0;
  let prevHasActCount = 0;

  for (let i = daysBack * 2; i > daysBack; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    // Only check if it's on or after user started or has history
    const k = formatDateKey(d);
    if (dateHasActivity(k, state)) {
      prevHasActCount++;
    }
    prevSum += calculateDailyProgressScore(k, state);
    prevCount++;
  }

  // Only declare a comparison if previous period had recorded activity
  if (prevCount > 0 && prevHasActCount > 0) {
    prevPeriodAvg = Math.round(prevSum / prevCount);
    diffPercent = currentPeriodAvg - prevPeriodAvg;
  }

  const hasEnoughData = activePoints.length > 0 || dateHasActivity(todayKey, state);

  return {
    points,
    summary: {
      currentScore,
      currentPeriodAvg,
      prevPeriodAvg,
      diffPercent,
      hasEnoughData,
      totalDataPointsWithActivity: activePoints.length
    }
  };
};

/**
 * Generates smooth SVG cubic Bezier path commands for arbitrary 2D coordinates.
 */
export const generateSmoothSvgPath = (coords: { x: number; y: number }[]): string => {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  if (coords.length === 2) {
    return `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y}`;
  }

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

    const tension = 0.2;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;

    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
};
