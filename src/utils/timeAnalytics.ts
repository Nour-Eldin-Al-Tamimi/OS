import { TimeArea, TimeEntry } from '../types';

export const TIME_AREAS: TimeArea[] = [
  'Learning',
  'Fitness',
  'University',
  'Career',
  'Personal',
  'Other'
];

export const DEFAULT_CATEGORIES: Record<TimeArea, string[]> = {
  Learning: ['Python', 'Mathematics', 'Computer Science', 'AI', 'Programming', 'Other'],
  Fitness: ['Workout', 'Cardio', 'Walking', 'Other'],
  University: ['Studying', 'Assignments', 'Lectures', 'Revision', 'Other'],
  Career: ['Projects', 'Coding', 'Job Search', 'Portfolio', 'Other'],
  Personal: ['Reading', 'Rest', 'Errands', 'Other'],
  Other: ['Planning', 'Admin', 'General', 'Other']
};

export function formatTimer(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AREA_COLORS: Record<TimeArea, { stroke: string; bg: string; text: string; bar: string }> = {
  Learning: {
    stroke: '#38bdf8',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    bar: 'bg-sky-400'
  },
  Fitness: {
    stroke: '#34d399',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    bar: 'bg-emerald-400'
  },
  University: {
    stroke: '#a78bfa',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    bar: 'bg-purple-400'
  },
  Career: {
    stroke: '#fbbf24',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    bar: 'bg-amber-400'
  },
  Personal: {
    stroke: '#f472b6',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    bar: 'bg-pink-400'
  },
  Other: {
    stroke: '#9ca3af',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    bar: 'bg-zinc-400'
  }
};

export const formatHoursMinutes = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export const parseLocalDate = (dateStr: string): Date => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  } catch {
    return new Date();
  }
};

export const formatDateToKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTimeEntriesForPeriod = (
  entries: TimeEntry[] = [],
  period: AnalyticsPeriod,
  todayKey: string
): TimeEntry[] => {
  if (!entries || entries.length === 0) return [];
  
  const todayDate = parseLocalDate(todayKey);
  const todayYear = todayDate.getFullYear();
  const todayMonth = todayDate.getMonth();

  if (period === 'today') {
    return entries.filter(e => e.date === todayKey);
  }

  if (period === 'week') {
    // Current week Monday through Sunday
    const currentDay = todayDate.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return entries.filter(e => {
      const d = parseLocalDate(e.date);
      return d >= monday && d <= sunday;
    });
  }

  if (period === 'month') {
    return entries.filter(e => {
      const d = parseLocalDate(e.date);
      return d.getFullYear() === todayYear && d.getMonth() === todayMonth;
    });
  }

  if (period === 'year') {
    return entries.filter(e => {
      const d = parseLocalDate(e.date);
      return d.getFullYear() === todayYear;
    });
  }

  return entries; // 'all'
};

export interface CategoryBreakdown {
  category: string;
  minutes: number;
  formatted: string;
  percent: number;
}

export interface AreaBreakdown {
  area: TimeArea;
  minutes: number;
  formatted: string;
  percent: number;
  categories: CategoryBreakdown[];
}

export const getAreaBreakdown = (entries: TimeEntry[] = []): AreaBreakdown[] => {
  const totalMinutes = entries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
  if (totalMinutes === 0) return [];

  const areaMap: Record<string, { minutes: number; categories: Record<string, number> }> = {};

  for (const entry of entries) {
    if (!areaMap[entry.area]) {
      areaMap[entry.area] = { minutes: 0, categories: {} };
    }
    areaMap[entry.area].minutes += entry.durationMinutes;
    const cat = entry.category || 'Other';
    areaMap[entry.area].categories[cat] = (areaMap[entry.area].categories[cat] || 0) + entry.durationMinutes;
  }

  const result: AreaBreakdown[] = Object.keys(areaMap).map(areaKey => {
    const area = areaKey as TimeArea;
    const data = areaMap[area];
    const categories: CategoryBreakdown[] = Object.entries(data.categories)
      .map(([cat, mins]) => ({
        category: cat,
        minutes: mins,
        formatted: formatHoursMinutes(mins),
        percent: Math.round((mins / data.minutes) * 100)
      }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      area,
      minutes: data.minutes,
      formatted: formatHoursMinutes(data.minutes),
      percent: Math.round((data.minutes / totalMinutes) * 100),
      categories
    };
  });

  return result.sort((a, b) => b.minutes - a.minutes);
};

export interface TrendBarPoint {
  label: string;
  subLabel?: string;
  minutes: number;
  formatted: string;
}

export const getTimeTrendData = (
  entries: TimeEntry[] = [],
  period: AnalyticsPeriod,
  todayKey: string
): TrendBarPoint[] => {
  if (!entries || entries.length === 0) return [];

  const todayDate = parseLocalDate(todayKey);

  if (period === 'today') {
    // Show entries logged today grouped by area or chronologically
    const todayEntries = entries.filter(e => e.date === todayKey);
    if (todayEntries.length === 0) return [];
    return todayEntries.map((e, idx) => ({
      label: e.category || e.area,
      subLabel: e.area,
      minutes: e.durationMinutes,
      formatted: formatHoursMinutes(e.durationMinutes)
    }));
  }

  if (period === 'week') {
    // Mon -> Tue -> Wed -> Thu -> Fri -> Sat -> Sun
    const currentDay = todayDate.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() + mondayOffset);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const points: TrendBarPoint[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = formatDateToKey(d);
      const dayMins = entries
        .filter(e => e.date === key)
        .reduce((sum, e) => sum + (e.durationMinutes || 0), 0);

      points.push({
        label: dayLabels[i],
        subLabel: `${d.getMonth() + 1}/${d.getDate()}`,
        minutes: dayMins,
        formatted: formatHoursMinutes(dayMins)
      });
    }

    return points;
  }

  if (period === 'month') {
    // Week 1 -> Week 2 -> Week 3 -> Week 4 (and Week 5 if applicable)
    const year = todayDate.getFullYear();
    const month = todayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: TrendBarPoint[] = [
      { label: 'Week 1', subLabel: '1-7', minutes: 0, formatted: '0m' },
      { label: 'Week 2', subLabel: '8-14', minutes: 0, formatted: '0m' },
      { label: 'Week 3', subLabel: '15-21', minutes: 0, formatted: '0m' },
      { label: 'Week 4', subLabel: '22-28', minutes: 0, formatted: '0m' }
    ];

    if (daysInMonth > 28) {
      weeks.push({ label: 'Week 5', subLabel: `29-${daysInMonth}`, minutes: 0, formatted: '0m' });
    }

    for (const e of entries) {
      const d = parseLocalDate(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (day <= 7) weeks[0].minutes += e.durationMinutes;
        else if (day <= 14) weeks[1].minutes += e.durationMinutes;
        else if (day <= 21) weeks[2].minutes += e.durationMinutes;
        else if (day <= 28) weeks[3].minutes += e.durationMinutes;
        else if (weeks[4]) weeks[4].minutes += e.durationMinutes;
      }
    }

    return weeks.map(w => ({
      ...w,
      formatted: formatHoursMinutes(w.minutes)
    }));
  }

  if (period === 'year') {
    // Jan -> Feb -> Mar -> ... -> Dec
    const year = todayDate.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const points: TrendBarPoint[] = monthNames.map(m => ({
      label: m,
      minutes: 0,
      formatted: '0m'
    }));

    for (const e of entries) {
      const d = parseLocalDate(e.date);
      if (d.getFullYear() === year) {
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          points[mIdx].minutes += e.durationMinutes;
        }
      }
    }

    return points.map(p => ({
      ...p,
      formatted: formatHoursMinutes(p.minutes)
    }));
  }

  // 'all' period: group by last 6 months or all months
  const monthMap: Record<string, number> = {};
  for (const e of entries) {
    const d = parseLocalDate(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + e.durationMinutes;
  }

  const sortedMonths = Object.keys(monthMap).sort();
  return sortedMonths.map(mKey => {
    const [y, m] = mKey.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const mins = monthMap[mKey];
    return {
      label,
      minutes: mins,
      formatted: formatHoursMinutes(mins)
    };
  });
};
