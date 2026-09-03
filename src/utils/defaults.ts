import { NourOSState, DeepWorkSession, Mission, RewardRedemption, DayRecord } from '../types';

export const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getDayNumberInSeason = (startDateStr: string): number => {
  try {
    const [sy, sm, sd] = startDateStr.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd).getTime();
    const [ty, tm, td] = getTodayKey().split('-').map(Number);
    const today = new Date(ty, tm - 1, td).getTime();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(180, diff));
  } catch {
    return 1;
  }
};

export const generateDefaultState = (): NourOSState => {
  const today = getTodayKey();
  const startDateStr = today;

  const habits = [
    {
      id: 'habit_wake',
      name: 'Wake on Schedule',
      description: 'Morning anchor. Out of bed without snoozing or phone browsing.',
      category: 'discipline' as const,
      xp: 35,
      isKeystone: true,
      isMinimumViable: true,
      minimumVersion: 'Out of bed by 8:00 AM, glass of water',
      fullVersion: 'Up at 7:00 AM sharp, cold splash, light stretching',
      active: true,
      order: 1
    },
    {
      id: 'habit_mission',
      name: 'Complete #1 Mission',
      description: 'Execute the single highest-leverage task of the day.',
      category: 'engineering' as const,
      xp: 150,
      isKeystone: true,
      isMinimumViable: true,
      minimumVersion: '30 minutes locked progress on the primary deliverable',
      fullVersion: 'Complete mission to satisfaction and commit/submit',
      active: true,
      order: 2
    },
    {
      id: 'habit_deepwork',
      name: 'Deep Work Block',
      description: 'Uninterrupted flow state programming or technical study.',
      category: 'engineering' as const,
      xp: 120,
      isKeystone: true,
      isMinimumViable: true,
      minimumVersion: '45 minutes uninterrupted focus with zero tabs open',
      fullVersion: '2.5+ hours deep uninterrupted software engineering session',
      active: true,
      order: 3
    },
    {
      id: 'habit_cs_study',
      name: 'CS & AI Study',
      description: 'Core computer science fundamentals, lecture, or problem set.',
      category: 'engineering' as const,
      xp: 60,
      isKeystone: false,
      isMinimumViable: false,
      minimumVersion: '20 minutes reviewing CS concepts or documentation',
      fullVersion: '1 hour lecture + implement problem set test cases',
      active: true,
      order: 4
    },
    {
      id: 'habit_movement',
      name: 'Physical Training',
      description: 'Strengthen body, reset dopamine receptors, maintain energy.',
      category: 'health' as const,
      xp: 50,
      isKeystone: true,
      isMinimumViable: true,
      minimumVersion: '15 min brisk walk + basic pushups/mobility',
      fullVersion: '50 min gym lifting session or 5km run',
      active: true,
      order: 5
    },
    {
      id: 'habit_distraction',
      name: 'Digital Restraint',
      description: 'Strict boundary on mindless scrolling and high-friction doom loops.',
      category: 'discipline' as const,
      xp: 45,
      isKeystone: false,
      isMinimumViable: true,
      minimumVersion: 'Zero social media feeds before noon',
      fullVersion: 'Strict app blockers on, screen time under 2h leisure',
      active: true,
      order: 6
    },
    {
      id: 'habit_shutdown',
      name: 'Evening Reset & Mission Lock',
      description: 'Review day, set tomorrow’s #1 Mission, prepare sleep.',
      category: 'mind' as const,
      xp: 40,
      isKeystone: true,
      isMinimumViable: true,
      minimumVersion: 'Lock tomorrow’s #1 Mission in NOUR OS before bed',
      fullVersion: 'Clean desk, set mission, screen off 45m before sleep',
      active: true,
      order: 7
    }
  ];

  // Completely empty completions for Day 0
  const completions: Record<string, string[]> = {};
  const completionVersions: Record<string, Record<string, 'full' | 'minimum'>> = {};

  // Completely empty deep work sessions for Day 0
  const deepWorkSessions: DeepWorkSession[] = [];

  // Completely empty missions for Day 0
  const missions: Record<string, Mission> = {};

  // 6-Month Roadmap baseline curriculum items initialized to 0 hours / not started
  const learningItems = [
    {
      id: 'learn_cs50',
      title: 'CS50: Computer Science & Algorithmic Thinking',
      track: 'cs_fundamentals' as const,
      status: 'not_started' as const,
      currentMilestone: 'Computational Thinking & CS Foundations',
      hoursInvested: 0,
      totalEstimatedHours: 70
    },
    {
      id: 'learn_python',
      title: 'Python Systems & Idiomatic OOP',
      track: 'python_mastery' as const,
      status: 'not_started' as const,
      currentMilestone: 'Python Data Structures & OOP Foundations',
      hoursInvested: 0,
      totalEstimatedHours: 50
    },
    {
      id: 'learn_backend',
      title: 'Modern Backend Engineering (FastAPI, Postgres, Docker)',
      track: 'backend_systems' as const,
      status: 'not_started' as const,
      currentMilestone: 'Relational DB Modeling & REST Endpoint Security',
      hoursInvested: 0,
      totalEstimatedHours: 60
    },
    {
      id: 'learn_ai',
      title: 'Applied AI & Practical Model Workflows',
      track: 'ai_engineering' as const,
      status: 'not_started' as const,
      currentMilestone: 'Vector Databases, Embeddings & Practical AI Pipelines',
      hoursInvested: 0,
      totalEstimatedHours: 45
    },
    {
      id: 'learn_portfolio',
      title: 'Production SaaS / Software Engineering Project',
      track: 'production_projects' as const,
      status: 'not_started' as const,
      currentMilestone: 'System Architecture Specification & Wireframe',
      hoursInvested: 0,
      totalEstimatedHours: 80
    }
  ];

  // Fresh baseline rewards with 0 redemptions
  const rewards = [
    {
      id: 'rew_espresso',
      title: 'Specialty Coffee & Deep Read Session',
      description: 'Visit a quiet specialty espresso cafe with a technical book.',
      xpCost: 200,
      category: 'personal' as const,
      redemptionsCount: 0
    },
    {
      id: 'rew_movie',
      title: 'Uninterrupted Cinema / Film Night',
      description: 'Guilt-free movie screening with no laptop in sight.',
      xpCost: 350,
      category: 'rest' as const,
      redemptionsCount: 0
    },
    {
      id: 'rew_gaming',
      title: '3-Hour Deep Gaming Session',
      description: 'Zero guilt gaming session after a full week of discipline.',
      xpCost: 450,
      category: 'rest' as const,
      redemptionsCount: 0
    },
    {
      id: 'rew_gear',
      title: 'Mechanical Keyboard Upgrade or Dev Tool',
      description: 'Physical equipment reward for hitting Season Chapter milestone.',
      xpCost: 1500,
      category: 'gear' as const,
      redemptionsCount: 0
    },
    {
      id: 'rew_dinner',
      title: 'High-Protein Steakhouse Dinner',
      description: 'Reward for hitting major 30-day consistency target.',
      xpCost: 750,
      category: 'personal' as const,
      redemptionsCount: 0
    }
  ];

  const redemptions: RewardRedemption[] = [];

  // Fresh financial profile starting at 0
  const finance = {
    monthlyTarget: 1200,
    currentMonthIncome: 0,
    sideIncome: 0,
    savingsTotal: 0,
    currency: '$',
    milestones: [
      { id: 'fin_1', target: 500, label: 'First $500 Month from Technical Skills', achieved: false },
      { id: 'fin_2', target: 1200, label: 'Basic Independence Target ($1,200/mo)', achieved: false },
      { id: 'fin_3', target: 3600, label: '3-Month Living Expense Buffer', achieved: false },
      { id: 'fin_4', target: 5000, label: 'Full Financial Sovereignty', achieved: false }
    ]
  };

  const dayRecords: Record<string, DayRecord> = {};

  return {
    user: {
      name: 'Nour',
      season: 1,
      chapter: 1,
      startDate: startDateStr,
      totalSeasonDays: 180,
      careerTrack: 'Software Engineering & AI'
    },
    missions,
    habits,
    completions,
    completionVersions,
    deepWorkSessions,
    activeDeepWork: null,
    dayRecords,
    rewards,
    redemptions,
    learningItems,
    finance,
    lifetimeXP: 0,
    totalSpentXP: 0,
    recoveryEvents: [],
    hasSeenOpening: false
  };
};

const STORAGE_KEY = 'nour_os_v2_data';

export const clearLegacyStorage = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('nour_os_v1_data');
    }
  } catch {
    // ignore
  }
};

export const clearAllStorage = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('nour_os_v1_data');
    }
  } catch {
    // ignore
  }
};

export const loadState = (): NourOSState => {
  try {
    clearLegacyStorage();
    const raw = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      const initial = generateDefaultState();
      saveState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure critical fields exist
    if (!parsed.user || !parsed.habits || !parsed.missions) {
      const fallback = generateDefaultState();
      saveState(fallback);
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load NOUR OS state:', err);
    return generateDefaultState();
  }
};

export const saveState = (state: NourOSState): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to save NOUR OS state:', err);
  }
};
