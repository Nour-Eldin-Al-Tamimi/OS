import { NourOSState, TimeArea, TimeEntry } from '../types';
import { parseLocalDate, formatDateToKey, formatHoursMinutes, getTimeEntriesForPeriod } from './timeAnalytics';

export interface JourneyStats {
  currentMonth: number;
  totalMonths: number;
  currentDay: number;
  totalDays: number;
  progressPercent: number;
}

export interface ConsistencyStats {
  completedDays: number;
  totalPlannedDays: number;
  consistencyPercent: number;
  isStrong: boolean;
}

export interface FocusActivityItem {
  id: string;
  title: string;
  categoryDisplay: string;
  area: TimeArea;
  category: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  isInProgress: boolean;
  isMission: boolean;
  habitId?: string;
  missionId?: string;
}

export interface DriftInsight {
  type: 'positive' | 'negative' | 'neutral';
  headline: string;
  detail: string;
  metricLabel: string;
  deltaPercent: number;
}

export interface WeeklyReviewStats {
  weekKey: string;
  totalMinutes: number;
  totalHoursFormatted: string;
  topArea?: { area: TimeArea; formatted: string };
  missionsCompleted: number;
  missionsPlanned: number;
  habitCompletionPercent: number;
}

/**
 * Calculates position in 6-month journey using real user start date & total season days.
 */
export const calculateJourneyStats = (dayNumber: number, totalDays: number = 180): JourneyStats => {
  const safeDay = Math.max(1, Math.min(totalDays, dayNumber));
  const currentMonth = Math.min(6, Math.max(1, Math.floor((safeDay - 1) / 30) + 1));
  const progressPercent = Math.min(100, Math.max(1, Math.round((safeDay / totalDays) * 100)));

  return {
    currentMonth,
    totalMonths: 6,
    currentDay: safeDay,
    totalDays,
    progressPercent
  };
};

/**
 * Calculates consistency as forgiving % of planned days where meaningful progress was logged.
 */
export const calculateConsistencyStats = (
  state: NourOSState,
  todayKey: string
): ConsistencyStats => {
  const todayDate = parseLocalDate(todayKey);
  const startDateStr = state.user.startDate;
  const startDate = parseLocalDate(startDateStr);

  // Total days from start date up to today (inclusive)
  const diffDays = Math.max(1, Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const totalPlannedDays = Math.min(diffDays, 180);

  let completedDays = 0;

  for (let i = 0; i < totalPlannedDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = formatDateToKey(d);

    const isMVD = state.dayRecords[key]?.state === 'minimum_viable';
    const missionDone = state.missions[key]?.status === 'completed';
    const completions = state.completions[key] || [];
    const activeHabitCount = state.habits.filter(h => h.active).length;

    // Day is completed if: MVD completed, or mission completed, or >= 50% habits checked, or >= 45m deep work
    const habitPercent = activeHabitCount > 0 ? (completions.length / activeHabitCount) : 0;
    const hasDeepWork = state.deepWorkSessions?.some(s => s.date === key && s.durationMinutes >= 45);

    if (isMVD || missionDone || habitPercent >= 0.5 || hasDeepWork) {
      completedDays++;
    }
  }

  // Ensure completedDays does not exceed totalPlannedDays
  const safeCompleted = Math.min(totalPlannedDays, completedDays);
  const consistencyPercent = totalPlannedDays > 0 ? Math.round((safeCompleted / totalPlannedDays) * 100) : 100;

  return {
    completedDays: safeCompleted,
    totalPlannedDays,
    consistencyPercent,
    isStrong: consistencyPercent >= 75
  };
};

/**
 * Resolves planned activities for Today's Focus and finds the Next Activity to start.
 */
export const getPlannedActivitiesAndNext = (
  state: NourOSState,
  todayKey: string
): {
  plannedActivities: FocusActivityItem[];
  nextActivity: FocusActivityItem | null;
  hasActivities: boolean;
  allCompleted: boolean;
} => {
  const activities: FocusActivityItem[] = [];
  const todayMission = state.missions[todayKey];
  const isMVD = state.dayRecords[todayKey]?.state === 'minimum_viable';
  const completedHabitIds = state.completions[todayKey] || [];

  // 1. #1 Mission (Primary planned item if set)
  if (todayMission && todayMission.title.trim()) {
    const isCompleted = todayMission.status === 'completed';
    const isInProgress = todayMission.status === 'in_progress';
    const area: TimeArea = todayMission.category === 'cs_study' || todayMission.category === 'exam' 
      ? 'University' 
      : todayMission.category === 'career_deliverable' 
      ? 'Career' 
      : 'Learning';
    const category = todayMission.category === 'cs_study' 
      ? 'Computer Science' 
      : todayMission.category === 'ai_project' 
      ? 'AI Models' 
      : 'Software Engineering';

    activities.push({
      id: todayMission.id,
      title: todayMission.title,
      categoryDisplay: todayMission.category === 'cs_study' ? 'CS & Algorithms' : todayMission.category === 'ai_project' ? 'AI Project' : 'Software Engineering',
      area,
      category,
      estimatedMinutes: 90,
      isCompleted,
      isInProgress,
      isMission: true,
      missionId: todayMission.id
    });
  }

  // 2. Active Habits with realistic durations
  const activeHabits = state.habits.filter(h => {
    if (!h.active) return false;
    if (h.id === 'habit_mission') return false; // Already represented by mission
    if (isMVD && !h.isMinimumViable) return false;
    return true;
  });

  for (const habit of activeHabits) {
    const isCompleted = completedHabitIds.includes(habit.id);
    let area: TimeArea = 'Learning';
    let category = habit.name;
    let estimatedMinutes = 30;

    if (habit.category === 'health') {
      area = 'Fitness';
      category = 'Workout';
      estimatedMinutes = 30;
    } else if (habit.id === 'habit_deepwork') {
      area = 'Learning';
      category = 'Software Engineering';
      estimatedMinutes = 60;
    } else if (habit.id === 'habit_cs_study') {
      area = 'University';
      category = 'Computer Science';
      estimatedMinutes = 60;
    } else if (habit.category === 'discipline') {
      area = 'Personal';
      category = habit.name;
      estimatedMinutes = 15;
    } else {
      area = 'Personal';
      category = habit.name;
      estimatedMinutes = 20;
    }

    activities.push({
      id: habit.id,
      title: habit.name,
      categoryDisplay: habit.category === 'health' ? 'Fitness' : habit.category === 'engineering' ? 'Engineering' : 'Habit',
      area,
      category,
      estimatedMinutes,
      isCompleted,
      isInProgress: false,
      isMission: false,
      habitId: habit.id
    });
  }

  // Determine Next Activity:
  // First, check if active timer matches one:
  let nextActivity: FocusActivityItem | null = null;

  // Uncompleted mission comes first
  const uncompletedMission = activities.find(a => a.isMission && !a.isCompleted);
  if (uncompletedMission) {
    nextActivity = uncompletedMission;
  } else {
    // Then find the next uncompleted activity
    const nextUncompleted = activities.find(a => !a.isCompleted);
    nextActivity = nextUncompleted || null;
  }

  const hasActivities = activities.length > 0;
  const allCompleted = hasActivities && activities.every(a => a.isCompleted);

  return {
    plannedActivities: activities,
    nextActivity,
    hasActivities,
    allCompleted
  };
};

/**
 * Generates ISO week string identifier like '2026-W37'
 */
export const getWeekIdentifier = (d: Date): string => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

/**
 * Gathers factual Weekly Review metrics for the current week.
 */
export const getWeeklyReviewStats = (
  state: NourOSState,
  todayKey: string
): WeeklyReviewStats => {
  const todayDate = parseLocalDate(todayKey);
  const weekKey = getWeekIdentifier(todayDate);

  // Time entries this week
  const weekEntries = getTimeEntriesForPeriod(state.timeEntries || [], 'week', todayKey);
  const totalMinutes = weekEntries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);

  // Find top area
  const areaMinutesMap: Record<string, number> = {};
  for (const e of weekEntries) {
    areaMinutesMap[e.area] = (areaMinutesMap[e.area] || 0) + e.durationMinutes;
  }

  let topArea: { area: TimeArea; formatted: string } | undefined = undefined;
  let topAreaMins = 0;
  for (const [area, mins] of Object.entries(areaMinutesMap)) {
    if (mins > topAreaMins) {
      topAreaMins = mins;
      topArea = { area: area as TimeArea, formatted: formatHoursMinutes(mins) };
    }
  }

  // Count missions this week (Monday through today)
  const currentDay = todayDate.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() + mondayOffset);

  let missionsCompleted = 0;
  let missionsPlanned = 0;
  let habitSum = 0;
  let daysEvaluated = 0;

  const activeHabitsCount = state.habits.filter(h => h.active).length;

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    if (cur > todayDate) continue; // Don't check future days

    const curKey = formatDateToKey(cur);
    daysEvaluated++;

    if (state.missions[curKey]) {
      missionsPlanned++;
      if (state.missions[curKey].status === 'completed') {
        missionsCompleted++;
      }
    }

    const completedHabits = state.completions[curKey] || [];
    if (activeHabitsCount > 0) {
      habitSum += Math.min(1, completedHabits.length / activeHabitsCount);
    }
  }

  const habitCompletionPercent = daysEvaluated > 0 ? Math.round((habitSum / daysEvaluated) * 100) : 0;

  return {
    weekKey,
    totalMinutes,
    totalHoursFormatted: formatHoursMinutes(totalMinutes),
    topArea,
    missionsCompleted,
    missionsPlanned: Math.max(missionsPlanned, missionsCompleted),
    habitCompletionPercent
  };
};

/**
 * Smart Drift Detection: Compares current 7-day performance vs previous 7-day period.
 * Only surfaces calm, factual insights when sufficient real data exists.
 */
export const detectSmartDrift = (
  state: NourOSState,
  todayKey: string
): DriftInsight | null => {
  const todayDate = parseLocalDate(todayKey);
  const timeEntries = state.timeEntries || [];

  // Window 1: Last 7 days (today - 6 to today)
  const w1Start = new Date(todayDate);
  w1Start.setDate(todayDate.getDate() - 6);
  w1Start.setHours(0, 0, 0, 0);

  // Window 2: Previous 7 days (today - 13 to today - 7)
  const w2Start = new Date(todayDate);
  w2Start.setDate(todayDate.getDate() - 13);
  w2Start.setHours(0, 0, 0, 0);

  const w2End = new Date(todayDate);
  w2End.setDate(todayDate.getDate() - 7);
  w2End.setHours(23, 59, 59, 999);

  let w1Minutes = 0;
  let w2Minutes = 0;
  let w1LearningMins = 0;
  let w2LearningMins = 0;

  for (const e of timeEntries) {
    const d = parseLocalDate(e.date);
    if (d >= w1Start && d <= todayDate) {
      w1Minutes += e.durationMinutes;
      if (e.area === 'Learning' || e.area === 'University') {
        w1LearningMins += e.durationMinutes;
      }
    } else if (d >= w2Start && d <= w2End) {
      w2Minutes += e.durationMinutes;
      if (e.area === 'Learning' || e.area === 'University') {
        w2LearningMins += e.durationMinutes;
      }
    }
  }

  // Count habit completions in both windows
  let w1HabitCompletions = 0;
  let w2HabitCompletions = 0;

  for (let i = 0; i < 7; i++) {
    const d1 = new Date(w1Start);
    d1.setDate(w1Start.getDate() + i);
    const k1 = formatDateToKey(d1);
    w1HabitCompletions += (state.completions[k1] || []).length;

    const d2 = new Date(w2Start);
    d2.setDate(w2Start.getDate() + i);
    const k2 = formatDateToKey(d2);
    w2HabitCompletions += (state.completions[k2] || []).length;
  }

  // Require meaningful activity in the previous window to compare against
  if (w2Minutes < 60 && w2HabitCompletions < 5) {
    return null; // Not enough historical comparison data
  }

  // Check 1: Significant drop in primary Learning/Engineering time (>30% drop)
  if (w2LearningMins >= 120 && w1LearningMins < w2LearningMins * 0.7) {
    const dropPct = Math.round(((w2LearningMins - w1LearningMins) / w2LearningMins) * 100);
    return {
      type: 'negative',
      headline: 'Consistency Warning',
      detail: `Technical learning time decreased ${dropPct}% this week compared to last week.`,
      metricLabel: 'Learning Pace',
      deltaPercent: -dropPct
    };
  }

  // Check 2: Strong momentum in habit execution or time (>20% increase)
  if (w2HabitCompletions >= 10 && w1HabitCompletions >= w2HabitCompletions * 1.2) {
    const increasePct = Math.round(((w1HabitCompletions - w2HabitCompletions) / w2HabitCompletions) * 100);
    return {
      type: 'positive',
      headline: 'Positive Momentum',
      detail: `Your habit execution rate increased ${increasePct}% this week. Strong daily discipline.`,
      metricLabel: 'Habit Output',
      deltaPercent: increasePct
    };
  }

  // Check 3: Overall time increase
  if (w2Minutes >= 180 && w1Minutes >= w2Minutes * 1.2) {
    const increasePct = Math.round(((w1Minutes - w2Minutes) / w2Minutes) * 100);
    return {
      type: 'positive',
      headline: 'Volume Increase',
      detail: `Productive focused hours increased ${increasePct}% compared to last week.`,
      metricLabel: 'Focus Hours',
      deltaPercent: increasePct
    };
  }

  // Steady
  if (w1Minutes >= 180 && Math.abs(w1Minutes - w2Minutes) / w2Minutes <= 0.15) {
    return {
      type: 'neutral',
      headline: 'Steady Velocity',
      detail: 'Focus hours remain aligned with your 6-month trajectory. Maintain this cadence.',
      metricLabel: 'Cadence',
      deltaPercent: 0
    };
  }

  return null;
};
