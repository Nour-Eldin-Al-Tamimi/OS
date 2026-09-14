import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { 
  NourOSState, 
  ScreenType, 
  SmartDayState, 
  Habit, 
  Mission, 
  DeepWorkSession, 
  Reward, 
  LearningRoadmapItem, 
  FinancialProfile, 
  UserConfig, 
  RecoveryEvent,
  TimeEntry,
  TimeArea,
  TimerRecordedToast
} from '../types';
import { loadState, saveState, getTodayKey, generateDefaultState, getDayNumberInSeason } from '../utils/defaults';

export interface StartTimerOptions {
  focusArea: string;
  area?: TimeArea;
  category?: string;
  missionId?: string;
  habitId?: string;
  taskId?: string;
  notes?: string;
}

interface NourContextType {
  state: NourOSState;
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  todayKey: string;
  dayNumber: number;
  
  // Mission
  todayMission: Mission | null;
  completedMissions: Mission[];
  saveTodayMission: (title: string, description?: string, category?: Mission['category']) => void;
  setMissionStatus: (status: Mission['status']) => void;
  
  // Habits
  todayCompletedHabitIds: string[];
  todayCompletionVersions: Record<string, 'full' | 'minimum'>;
  toggleHabit: (habitId: string, version?: 'full' | 'minimum') => void;
  saveHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  reorderHabits: (habits: Habit[]) => void;
  
  // Deep Work & Timer Engine
  todayDeepWorkMinutes: number;
  weeklyDeepWorkHours: number;
  startDeepWork: (focusAreaOrOptions: string | StartTimerOptions, maybeOptions?: Partial<StartTimerOptions>) => void;
  pauseDeepWork: () => void;
  resumeDeepWork: () => void;
  finishDeepWork: (notes?: string) => void;
  cancelDeepWork: () => void;
  
  // Minimum Viable Day & Recovery
  isMinimumViableDayActive: boolean;
  activateMinimumViableDay: () => void;
  deactivateMinimumViableDay: () => void;
  triggerRecovery: (reason: string, microAction: string) => void;
  completeRecoveryMicroAction: (recoveryId: string) => void;
  
  // Gamification & Rewards
  availableXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  levelProgressPercent: number;
  redeemReward: (rewardId: string) => boolean;
  saveReward: (reward: Reward) => void;
  deleteReward: (rewardId: string) => void;
  
  // Career & Finance
  saveLearningItem: (item: LearningRoadmapItem) => void;
  saveFinance: (finance: FinancialProfile) => void;
  
  // Time Tracking
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  deleteTimeEntry: (id: string) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  timerToast: TimerRecordedToast | null;
  dismissTimerToast: () => void;
  saveWeeklyReview: (weekKey: string, wentWell: string, needsAttention: string) => void;

  // State & Settings
  saveUserSettings: (user: Partial<UserConfig>) => void;
  resetAllData: () => void;
  exportJSON: () => string;
  importJSON: (data: string) => boolean;
  dismissOpening: () => void;
  
  // Derived state
  smartDayState: SmartDayState;
  mentorPrompt: string;
  completionRatePercent: number;
}

const NourContext = createContext<NourContextType | null>(null);

export const NourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NourOSState>(() => loadState());
  const [screen, setScreen] = useState<ScreenType>('today');
  const todayKey = getTodayKey();

  // Keep state synchronized to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const isFinishingRef = useRef(false);
  const [timerToast, setTimerToast] = useState<TimerRecordedToast | null>(null);

  // Auto-dismiss lightweight timer toast after 6 seconds
  useEffect(() => {
    if (!timerToast) return;
    const timer = setTimeout(() => {
      setTimerToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [timerToast]);

  const dismissTimerToast = () => {
    setTimerToast(null);
  };

  // Handle active deep work timer ticks
  useEffect(() => {
    if (!state.activeDeepWork || !state.activeDeepWork.isRunning || state.activeDeepWork.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.activeDeepWork || !prev.activeDeepWork.isRunning || prev.activeDeepWork.isPaused) {
          return prev;
        }
        const now = Date.now();
        const last = prev.activeDeepWork.lastTickTimestamp || now;
        const delta = Math.max(1, Math.floor((now - last) / 1000));
        return {
          ...prev,
          activeDeepWork: {
            ...prev.activeDeepWork,
            elapsedSeconds: prev.activeDeepWork.elapsedSeconds + delta,
            lastTickTimestamp: now
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeDeepWork?.isRunning, state.activeDeepWork?.isPaused]);

  // Derived values
  const dayNumber = useMemo(() => {
    return getDayNumberInSeason(state.user.startDate);
  }, [state.user.startDate]);

  const todayMission = useMemo(() => {
    return state.missions[todayKey] || null;
  }, [state.missions, todayKey]);

  const completedMissions = useMemo(() => {
    const list = Object.values(state.missions || {}) as Mission[];
    return list
      .filter((m): m is Mission => Boolean(m && m.status === 'completed'))
      .sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        return dateB.localeCompare(dateA);
      });
  }, [state.missions]);

  const todayCompletedHabitIds = useMemo(() => {
    return state.completions[todayKey] || [];
  }, [state.completions, todayKey]);

  const todayCompletionVersions = useMemo(() => {
    return state.completionVersions[todayKey] || {};
  }, [state.completionVersions, todayKey]);

  const todayDeepWorkMinutes = useMemo(() => {
    const recorded = state.deepWorkSessions
      .filter(s => s.date === todayKey)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const active = state.activeDeepWork?.isRunning 
      ? Math.floor(state.activeDeepWork.elapsedSeconds / 60) 
      : 0;
    return recorded + active;
  }, [state.deepWorkSessions, state.activeDeepWork, todayKey]);

  const weeklyDeepWorkHours = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const totalMinutes = state.deepWorkSessions
      .filter(s => new Date(s.date).getTime() >= weekAgo.getTime())
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [state.deepWorkSessions]);

  const availableXP = useMemo(() => {
    return Math.max(0, state.lifetimeXP - state.totalSpentXP);
  }, [state.lifetimeXP, state.totalSpentXP]);

  const currentLevel = useMemo(() => {
    return Math.floor(state.lifetimeXP / 250) + 1;
  }, [state.lifetimeXP]);

  const xpToNextLevel = useMemo(() => {
    const nextLevelTarget = currentLevel * 250;
    return nextLevelTarget - state.lifetimeXP;
  }, [currentLevel, state.lifetimeXP]);

  const levelProgressPercent = useMemo(() => {
    const currentLevelBase = (currentLevel - 1) * 250;
    const currentProgress = state.lifetimeXP - currentLevelBase;
    return Math.min(100, Math.max(0, Math.round((currentProgress / 250) * 100)));
  }, [currentLevel, state.lifetimeXP]);

  const isMinimumViableDayActive = useMemo(() => {
    const record = state.dayRecords[todayKey];
    return record?.state === 'minimum_viable';
  }, [state.dayRecords, todayKey]);

  const activeHabits = useMemo(() => {
    return state.habits.filter(h => h.active);
  }, [state.habits]);

  const relevantHabits = useMemo(() => {
    if (isMinimumViableDayActive) {
      return activeHabits.filter(h => h.isMinimumViable);
    }
    return activeHabits;
  }, [activeHabits, isMinimumViableDayActive]);

  const completionRatePercent = useMemo(() => {
    if (relevantHabits.length === 0) return 0;
    const completedCount = relevantHabits.filter(h => todayCompletedHabitIds.includes(h.id)).length;
    return Math.round((completedCount / relevantHabits.length) * 100);
  }, [relevantHabits, todayCompletedHabitIds]);

  // Smart Daily State
  const smartDayState = useMemo<SmartDayState>(() => {
    const existing = state.dayRecords[todayKey]?.state;
    if (existing === 'recovering' || existing === 'minimum_viable' || existing === 'rest_day') {
      return existing;
    }

    const missionDone = todayMission?.status === 'completed';
    const habitPercent = completionRatePercent;

    if (missionDone && habitPercent >= 75) {
      return 'completed';
    }
    if (todayCompletedHabitIds.length > 0 || todayMission?.status === 'in_progress' || todayDeepWorkMinutes > 0) {
      return 'in_progress';
    }
    return 'not_started';
  }, [state.dayRecords, todayKey, todayMission, completionRatePercent, todayCompletedHabitIds, todayDeepWorkMinutes]);

  // Mentor Prompt (Quiet, direct, situational)
  const mentorPrompt = useMemo<string>(() => {
    if (smartDayState === 'recovering') {
      return 'Momentum preserved. Take the smallest useful action.';
    }
    if (smartDayState === 'minimum_viable') {
      return 'Minimum Viable Day locked. Avoid zero days.';
    }
    if (state.activeDeepWork?.isRunning && !state.activeDeepWork?.isPaused) {
      return 'Execution in progress. Protect your focus.';
    }
    if (!todayMission || todayMission.status === 'not_started') {
      return 'Start the #1 Mission.';
    }
    if (todayMission.status === 'in_progress') {
      return 'Execute with intent. Eliminate browser noise.';
    }
    if (smartDayState === 'completed') {
      return 'Day executed cleanly. Prepare tomorrow’s priority.';
    }
    if (completionRatePercent >= 50) {
      return 'Consistent pace today. Finish the essentials.';
    }
    return 'Decide. Start. Execute.';
  }, [smartDayState, state.activeDeepWork, todayMission, completionRatePercent]);

  // Mission Actions
  const saveTodayMission = (title: string, description?: string, category: Mission['category'] = 'software_dev') => {
    setState(prev => {
      const existing = prev.missions[todayKey];
      const updated: Mission = {
        id: existing?.id || `mission_${todayKey}`,
        date: todayKey,
        title: title.trim(),
        description: description?.trim(),
        status: existing?.status || 'not_started',
        xp: 150,
        category,
        startedAt: existing?.startedAt,
        completedAt: existing?.completedAt
      };
      return {
        ...prev,
        missions: {
          ...prev.missions,
          [todayKey]: updated
        }
      };
    });
  };

  const setMissionStatus = (status: Mission['status']) => {
    setState(prev => {
      const existing = prev.missions[todayKey];
      if (!existing) return prev;

      const wasCompleted = existing.status === 'completed';
      const isNowCompleted = status === 'completed';
      const xpDiff = !wasCompleted && isNowCompleted ? 150 : wasCompleted && !isNowCompleted ? -150 : 0;

      const updatedMission: Mission = {
        ...existing,
        status,
        startedAt: status === 'in_progress' && !existing.startedAt ? Date.now() : existing.startedAt,
        completedAt: isNowCompleted ? Date.now() : undefined
      };

      // Also toggle the corresponding mission habit if it exists
      const currentCompleted = prev.completions[todayKey] || [];
      const hasMissionHabit = prev.habits.some(h => h.id === 'habit_mission');
      let newCompletions = [...currentCompleted];

      if (hasMissionHabit) {
        if (isNowCompleted && !newCompletions.includes('habit_mission')) {
          newCompletions.push('habit_mission');
        } else if (!isNowCompleted && newCompletions.includes('habit_mission')) {
          newCompletions = newCompletions.filter(id => id !== 'habit_mission');
        }
      }

      return {
        ...prev,
        missions: {
          ...prev.missions,
          [todayKey]: updatedMission
        },
        completions: {
          ...prev.completions,
          [todayKey]: newCompletions
        },
        lifetimeXP: Math.max(0, prev.lifetimeXP + xpDiff)
      };
    });
  };

  // Habit Actions
  const toggleHabit = (habitId: string, version: 'full' | 'minimum' = 'full') => {
    setState(prev => {
      const currentList = prev.completions[todayKey] || [];
      const isAlreadyCompleted = currentList.includes(habitId);
      const habit = prev.habits.find(h => h.id === habitId);
      const baseXP = habit?.xp || 30;
      const earnedXP = version === 'minimum' ? Math.round(baseXP * 0.6) : baseXP;

      let nextList: string[];
      let xpDelta = 0;

      const currentVersions = { ...(prev.completionVersions[todayKey] || {}) };

      if (isAlreadyCompleted) {
        nextList = currentList.filter(id => id !== habitId);
        const prevVersion = currentVersions[habitId] || 'full';
        const prevEarned = prevVersion === 'minimum' ? Math.round(baseXP * 0.6) : baseXP;
        xpDelta = -prevEarned;
        delete currentVersions[habitId];
      } else {
        nextList = [...currentList, habitId];
        xpDelta = earnedXP;
        currentVersions[habitId] = version;
      }

      return {
        ...prev,
        completions: {
          ...prev.completions,
          [todayKey]: nextList
        },
        completionVersions: {
          ...prev.completionVersions,
          [todayKey]: currentVersions
        },
        lifetimeXP: Math.max(0, prev.lifetimeXP + xpDelta)
      };
    });
  };

  const saveHabit = (habit: Habit) => {
    setState(prev => {
      const exists = prev.habits.some(h => h.id === habit.id);
      const newHabits = exists 
        ? prev.habits.map(h => h.id === habit.id ? habit : h)
        : [...prev.habits, habit];
      return {
        ...prev,
        habits: newHabits
      };
    });
  };

  const deleteHabit = (habitId: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId)
    }));
  };

  const reorderHabits = (habits: Habit[]) => {
    setState(prev => ({
      ...prev,
      habits
    }));
  };

  // Deep Work & Timer Engine Actions
  const startDeepWork = (focusAreaOrOptions: string | StartTimerOptions, maybeOptions?: Partial<StartTimerOptions>) => {
    let opts: StartTimerOptions;
    if (typeof focusAreaOrOptions === 'string') {
      opts = {
        focusArea: focusAreaOrOptions,
        ...maybeOptions
      };
    } else {
      opts = {
        ...focusAreaOrOptions,
        ...maybeOptions
      };
    }

    const focusTitle = (opts.focusArea || '').trim() || 'Software Engineering Flow';
    const mission = opts.missionId 
      ? (state.missions[todayKey]?.id === opts.missionId ? state.missions[todayKey] : null) 
      : (todayMission?.id === opts.missionId ? todayMission : null);
    const habit = opts.habitId ? state.habits.find(h => h.id === opts.habitId) : null;
    
    // Smart Context Detection: Area & Category
    let resolvedArea: TimeArea = opts.area || 'Learning';
    let resolvedCategory: string = opts.category || '';

    if (!opts.area || !opts.category) {
      if (habit) {
        if (habit.category === 'health') {
          resolvedArea = opts.area || 'Fitness';
          resolvedCategory = opts.category || 'Workout';
        } else if (habit.category === 'discipline') {
          resolvedArea = opts.area || 'Personal';
          resolvedCategory = opts.category || habit.name;
        } else if (habit.id === 'habit_cs_study') {
          resolvedArea = opts.area || 'University';
          resolvedCategory = opts.category || 'Computer Science';
        } else {
          resolvedArea = opts.area || 'Learning';
          resolvedCategory = opts.category || habit.name;
        }
      } else if (mission) {
        if (mission.category === 'cs_study') {
          resolvedArea = opts.area || 'University';
          resolvedCategory = opts.category || 'Computer Science';
        } else if (mission.category === 'software_dev') {
          resolvedArea = opts.area || 'Learning';
          resolvedCategory = opts.category || 'Software Dev';
        } else if (mission.category === 'ai_project') {
          resolvedArea = opts.area || 'Learning';
          resolvedCategory = opts.category || 'AI Models';
        } else if (mission.category === 'career_deliverable') {
          resolvedArea = opts.area || 'Career';
          resolvedCategory = opts.category || 'Deliverables';
        } else if (mission.category === 'exam') {
          resolvedArea = opts.area || 'University';
          resolvedCategory = opts.category || 'Exams';
        }
      } else {
        const text = focusTitle.toLowerCase();
        if (text.includes('cs50') || text.includes('pointer') || text.includes('c ') || text.includes('algorithm') || text.includes('math') || text.includes('university') || text.includes('lecture') || text.includes('assignment')) {
          resolvedArea = opts.area || 'University';
          resolvedCategory = opts.category || (text.includes('math') ? 'Mathematics' : 'Computer Science');
        } else if (text.includes('fastapi') || text.includes('backend') || text.includes('python') || text.includes('api') || text.includes('database') || text.includes('sql') || text.includes('docker')) {
          resolvedArea = opts.area || 'Learning';
          resolvedCategory = opts.category || (text.includes('python') ? 'Python' : text.includes('fastapi') ? 'FastAPI' : 'Backend Systems');
        } else if (text.includes('ai') || text.includes('model') || text.includes('gemini') || text.includes('agent') || text.includes('prompt')) {
          resolvedArea = opts.area || 'Learning';
          resolvedCategory = opts.category || 'AI & Models';
        } else if (text.includes('workout') || text.includes('gym') || text.includes('run') || text.includes('lift') || text.includes('training') || text.includes('fitness')) {
          resolvedArea = opts.area || 'Fitness';
          resolvedCategory = opts.category || 'Workout';
        } else if (text.includes('client') || text.includes('portfolio') || text.includes('job') || text.includes('resume') || text.includes('revenue') || text.includes('freelance')) {
          resolvedArea = opts.area || 'Career';
          resolvedCategory = opts.category || 'Deliverables';
        } else if (text.includes('read') || text.includes('book') || text.includes('reflection') || text.includes('meditat') || text.includes('sleep')) {
          resolvedArea = opts.area || 'Personal';
          resolvedCategory = opts.category || 'Reflection';
        } else {
          resolvedArea = opts.area || 'Learning';
          resolvedCategory = opts.category || 'Programming';
        }
      }
    }

    if (!resolvedCategory) {
      resolvedCategory = focusTitle.slice(0, 24);
    }

    const now = Date.now();
    setState(prev => ({
      ...prev,
      activeDeepWork: {
        isRunning: true,
        isPaused: false,
        startedAt: now,
        lastTickTimestamp: now,
        elapsedSeconds: 0,
        totalPausedSeconds: 0,
        focusArea: focusTitle,
        area: resolvedArea,
        category: resolvedCategory,
        missionId: opts.missionId,
        habitId: opts.habitId,
        taskId: opts.taskId,
        notes: opts.notes
      }
    }));
  };

  const pauseDeepWork = () => {
    setState(prev => {
      if (!prev.activeDeepWork || !prev.activeDeepWork.isRunning || prev.activeDeepWork.isPaused) return prev;
      const now = Date.now();
      const last = prev.activeDeepWork.lastTickTimestamp || now;
      const tickDelta = Math.max(0, Math.floor((now - last) / 1000));
      return {
        ...prev,
        activeDeepWork: {
          ...prev.activeDeepWork,
          isPaused: true,
          pauseStartedAt: now,
          lastTickTimestamp: now,
          elapsedSeconds: prev.activeDeepWork.elapsedSeconds + tickDelta
        }
      };
    });
  };

  const resumeDeepWork = () => {
    setState(prev => {
      if (!prev.activeDeepWork || !prev.activeDeepWork.isPaused) return prev;
      const now = Date.now();
      const pauseDuration = prev.activeDeepWork.pauseStartedAt 
        ? Math.max(0, Math.floor((now - prev.activeDeepWork.pauseStartedAt) / 1000))
        : 0;
      return {
        ...prev,
        activeDeepWork: {
          ...prev.activeDeepWork,
          isPaused: false,
          pauseStartedAt: undefined,
          lastTickTimestamp: now,
          totalPausedSeconds: (prev.activeDeepWork.totalPausedSeconds || 0) + pauseDuration
        }
      };
    });
  };

  const finishDeepWork = (notes?: string) => {
    // Duplicate click protection
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setTimeout(() => {
      isFinishingRef.current = false;
    }, 1200);

    setState(prev => {
      const active = prev.activeDeepWork;
      if (!active || !active.isRunning) return prev;

      const endedAt = Date.now();
      let totalProductiveSeconds = active.elapsedSeconds;
      if (!active.isPaused && active.lastTickTimestamp) {
        const delta = Math.max(0, Math.floor((endedAt - active.lastTickTimestamp) / 1000));
        totalProductiveSeconds += delta;
      }

      // Calculate duration: if at least 30s elapsed, round to minutes; minimum 1 min
      const durationMin = totalProductiveSeconds >= 30 
        ? Math.max(1, Math.round(totalProductiveSeconds / 60))
        : Math.max(1, Math.floor(totalProductiveSeconds / 60));

      // XP reward: 1 XP per minute, with 20% bonus if >= 60 minutes
      const bonus = durationMin >= 60 ? Math.floor(durationMin * 0.2) : 0;
      const earnedXP = durationMin + bonus;

      const sessionNotes = (notes && notes.trim()) ? notes.trim() : (active.notes || undefined);
      const sessionArea: TimeArea = active.area || 'Learning';
      const sessionCategory = active.category || 'Programming';

      // 1. DeepWorkSession record (existing system model)
      const newSession: DeepWorkSession = {
        id: `dw_${endedAt}`,
        date: todayKey,
        durationMinutes: durationMin,
        focusArea: active.focusArea,
        xpEarned: earnedXP,
        timestamp: endedAt,
        notes: sessionNotes
      };

      // 2. Automatic TimeEntry record for time analytics & history
      const newTimeEntry: TimeEntry = {
        id: `time_timer_${endedAt}_${Math.random().toString(36).substring(2, 6)}`,
        date: todayKey,
        durationMinutes: durationMin,
        durationSeconds: totalProductiveSeconds,
        area: sessionArea,
        category: sessionCategory,
        note: sessionNotes,
        missionId: active.missionId,
        habitId: active.habitId,
        taskId: active.taskId,
        startedAt: active.startedAt,
        endedAt,
        source: 'timer',
        status: 'completed',
        createdAt: endedAt
      };

      // If finished session >= 45m, auto-check Deep Work habit
      const currentCompleted = prev.completions[todayKey] || [];
      let updatedCompletions = [...currentCompleted];
      if (durationMin >= 45 && !updatedCompletions.includes('habit_deepwork')) {
        updatedCompletions.push('habit_deepwork');
      }

      // If finished session linked to a habit, auto-check that habit
      if (active.habitId && !updatedCompletions.includes(active.habitId)) {
        updatedCompletions.push(active.habitId);
      }

      // If finished session linked to mission, update status if not started
      let updatedMissions = { ...prev.missions };
      if (active.missionId && updatedMissions[todayKey]?.id === active.missionId) {
        if (updatedMissions[todayKey].status === 'not_started') {
          updatedMissions[todayKey] = {
            ...updatedMissions[todayKey],
            status: 'in_progress',
            startedAt: updatedMissions[todayKey].startedAt || active.startedAt
          };
        }
      }

      // Trigger lightweight confirmation toast
      const mins = Math.floor(totalProductiveSeconds / 60);
      const secs = totalProductiveSeconds % 60;
      const durationText = mins > 0 ? (secs > 0 ? `${mins}m ${secs}s` : `${mins}m`) : `${secs}s`;
      setTimeout(() => {
        setTimerToast({
          id: `toast_${endedAt}`,
          durationText,
          area: sessionArea,
          category: sessionCategory,
          timestamp: endedAt
        });
      }, 50);

      return {
        ...prev,
        activeDeepWork: null,
        deepWorkSessions: [newSession, ...prev.deepWorkSessions],
        timeEntries: [newTimeEntry, ...(prev.timeEntries || [])],
        missions: updatedMissions,
        completions: {
          ...prev.completions,
          [todayKey]: updatedCompletions
        },
        lifetimeXP: prev.lifetimeXP + earnedXP
      };
    });
  };

  const saveWeeklyReview = (weekKey: string, wentWell: string, needsAttention: string) => {
    setState(prev => ({
      ...prev,
      weeklyReviews: {
        ...(prev.weeklyReviews || {}),
        [weekKey]: {
          wentWell,
          needsAttention,
          updatedAt: Date.now()
        }
      }
    }));
  };

  const cancelDeepWork = () => {
    setState(prev => ({
      ...prev,
      activeDeepWork: null
    }));
  };

  // Minimum Viable Day & Recovery
  const activateMinimumViableDay = () => {
    setState(prev => ({
      ...prev,
      dayRecords: {
        ...prev.dayRecords,
        [todayKey]: {
          ...(prev.dayRecords[todayKey] || { date: todayKey }),
          state: 'minimum_viable'
        }
      }
    }));
  };

  const deactivateMinimumViableDay = () => {
    setState(prev => ({
      ...prev,
      dayRecords: {
        ...prev.dayRecords,
        [todayKey]: {
          ...(prev.dayRecords[todayKey] || { date: todayKey }),
          state: 'in_progress'
        }
      }
    }));
  };

  const triggerRecovery = (reason: string, microAction: string) => {
    setState(prev => {
      const recoveryEvent: RecoveryEvent = {
        id: `rec_${Date.now()}`,
        date: todayKey,
        timestamp: Date.now(),
        reason,
        microAction,
        completed: false
      };

      return {
        ...prev,
        recoveryEvents: [recoveryEvent, ...prev.recoveryEvents],
        dayRecords: {
          ...prev.dayRecords,
          [todayKey]: {
            ...(prev.dayRecords[todayKey] || { date: todayKey }),
            state: 'recovering',
            recoveryNote: `${reason} -> Action: ${microAction}`
          }
        },
        // Reward user 30 XP for choosing recovery over giving up
        lifetimeXP: prev.lifetimeXP + 30
      };
    });
  };

  const completeRecoveryMicroAction = (recoveryId: string) => {
    setState(prev => {
      const updatedEvents = prev.recoveryEvents.map(e => 
        e.id === recoveryId ? { ...e, completed: true } : e
      );

      return {
        ...prev,
        recoveryEvents: updatedEvents,
        dayRecords: {
          ...prev.dayRecords,
          [todayKey]: {
            ...(prev.dayRecords[todayKey] || { date: todayKey }),
            state: 'in_progress'
          }
        },
        lifetimeXP: prev.lifetimeXP + 25
      };
    });
  };

  // Rewards
  const redeemReward = (rewardId: string): boolean => {
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward || availableXP < reward.xpCost) {
      return false;
    }

    setState(prev => ({
      ...prev,
      totalSpentXP: prev.totalSpentXP + reward.xpCost,
      rewards: prev.rewards.map(r => 
        r.id === rewardId ? { ...r, redemptionsCount: r.redemptionsCount + 1 } : r
      ),
      redemptions: [
        {
          id: `red_${Date.now()}`,
          rewardId: reward.id,
          rewardTitle: reward.title,
          xpSpent: reward.xpCost,
          redeemedAt: Date.now()
        },
        ...prev.redemptions
      ]
    }));
    return true;
  };

  const saveReward = (reward: Reward) => {
    setState(prev => {
      const exists = prev.rewards.some(r => r.id === reward.id);
      return {
        ...prev,
        rewards: exists
          ? prev.rewards.map(r => r.id === reward.id ? reward : r)
          : [...prev.rewards, reward]
      };
    });
  };

  const deleteReward = (rewardId: string) => {
    setState(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== rewardId)
    }));
  };

  // Career & Finance
  const saveLearningItem = (item: LearningRoadmapItem) => {
    setState(prev => {
      const exists = prev.learningItems.some(i => i.id === item.id);
      return {
        ...prev,
        learningItems: exists
          ? prev.learningItems.map(i => i.id === item.id ? item : i)
          : [...prev.learningItems, item]
      };
    });
  };

  const saveFinance = (finance: FinancialProfile) => {
    setState(prev => ({
      ...prev,
      finance
    }));
  };

  // Time Tracking Actions
  const addTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    setState(prev => {
      const newEntry: TimeEntry = {
        ...entryData,
        id: `time_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now()
      };
      return {
        ...prev,
        timeEntries: [newEntry, ...(prev.timeEntries || [])]
      };
    });
  };

  const deleteTimeEntry = (id: string) => {
    setState(prev => ({
      ...prev,
      timeEntries: (prev.timeEntries || []).filter(e => e.id !== id)
    }));
  };

  const updateTimeEntry = (entry: TimeEntry) => {
    setState(prev => ({
      ...prev,
      timeEntries: (prev.timeEntries || []).map(e => e.id === entry.id ? entry : e)
    }));
  };

  const saveUserSettings = (userUpdates: Partial<UserConfig>) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...userUpdates
      }
    }));
  };

  const resetAllData = () => {
    const fresh = generateDefaultState();
    setState(fresh);
    saveState(fresh);
  };

  const exportJSON = () => {
    return JSON.stringify(state, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.user && parsed.habits) {
        setState(parsed);
        saveState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const dismissOpening = () => {
    setState(prev => ({
      ...prev,
      hasSeenOpening: true
    }));
  };

  return (
    <NourContext.Provider
      value={{
        state,
        screen,
        setScreen,
        todayKey,
        dayNumber,
        todayMission,
        completedMissions,
        saveTodayMission,
        setMissionStatus,
        todayCompletedHabitIds,
        todayCompletionVersions,
        toggleHabit,
        saveHabit,
        deleteHabit,
        reorderHabits,
        todayDeepWorkMinutes,
        weeklyDeepWorkHours,
        startDeepWork,
        pauseDeepWork,
        resumeDeepWork,
        finishDeepWork,
        cancelDeepWork,
        isMinimumViableDayActive,
        activateMinimumViableDay,
        deactivateMinimumViableDay,
        triggerRecovery,
        completeRecoveryMicroAction,
        availableXP,
        currentLevel,
        xpToNextLevel,
        levelProgressPercent,
        redeemReward,
        saveReward,
        deleteReward,
        saveLearningItem,
        saveFinance,
        timeEntries: state.timeEntries || [],
        addTimeEntry,
        deleteTimeEntry,
        updateTimeEntry,
        timerToast,
        dismissTimerToast,
        saveWeeklyReview,
        saveUserSettings,
        resetAllData,
        exportJSON,
        importJSON,
        dismissOpening,
        smartDayState,
        mentorPrompt,
        completionRatePercent
      }}
    >
      {children}
    </NourContext.Provider>
  );
};

export const useNour = (): NourContextType => {
  const ctx = useContext(NourContext);
  if (!ctx) {
    throw new Error('useNour must be used within a NourProvider');
  }
  return ctx;
};
