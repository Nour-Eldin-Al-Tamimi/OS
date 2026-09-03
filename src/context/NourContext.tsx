import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  RecoveryEvent
} from '../types';
import { loadState, saveState, getTodayKey, generateDefaultState, getDayNumberInSeason } from '../utils/defaults';

interface NourContextType {
  state: NourOSState;
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  todayKey: string;
  dayNumber: number;
  
  // Mission
  todayMission: Mission | null;
  saveTodayMission: (title: string, description?: string, category?: Mission['category']) => void;
  setMissionStatus: (status: Mission['status']) => void;
  
  // Habits
  todayCompletedHabitIds: string[];
  todayCompletionVersions: Record<string, 'full' | 'minimum'>;
  toggleHabit: (habitId: string, version?: 'full' | 'minimum') => void;
  saveHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  reorderHabits: (habits: Habit[]) => void;
  
  // Deep Work
  todayDeepWorkMinutes: number;
  weeklyDeepWorkHours: number;
  startDeepWork: (focusArea: string) => void;
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
        return {
          ...prev,
          activeDeepWork: {
            ...prev.activeDeepWork,
            elapsedSeconds: prev.activeDeepWork.elapsedSeconds + 1
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

  // Deep Work Actions
  const startDeepWork = (focusArea: string) => {
    setState(prev => ({
      ...prev,
      activeDeepWork: {
        isRunning: true,
        isPaused: false,
        startedAt: Date.now(),
        elapsedSeconds: 0,
        focusArea: focusArea.trim() || 'Software Engineering Flow'
      }
    }));
  };

  const pauseDeepWork = () => {
    setState(prev => {
      if (!prev.activeDeepWork) return prev;
      return {
        ...prev,
        activeDeepWork: {
          ...prev.activeDeepWork,
          isPaused: true
        }
      };
    });
  };

  const resumeDeepWork = () => {
    setState(prev => {
      if (!prev.activeDeepWork) return prev;
      return {
        ...prev,
        activeDeepWork: {
          ...prev.activeDeepWork,
          isPaused: false
        }
      };
    });
  };

  const finishDeepWork = (notes?: string) => {
    setState(prev => {
      if (!prev.activeDeepWork) return prev;
      const durationMin = Math.max(1, Math.floor(prev.activeDeepWork.elapsedSeconds / 60));
      // XP reward: 1 XP per minute, with 20% bonus if >= 60 minutes
      const bonus = durationMin >= 60 ? Math.floor(durationMin * 0.2) : 0;
      const earnedXP = durationMin + bonus;

      const newSession: DeepWorkSession = {
        id: `dw_${Date.now()}`,
        date: todayKey,
        durationMinutes: durationMin,
        focusArea: prev.activeDeepWork.focusArea,
        xpEarned: earnedXP,
        timestamp: Date.now(),
        notes
      };

      // If finished session >= 45m, auto-check Deep Work habit
      const currentCompleted = prev.completions[todayKey] || [];
      let updatedCompletions = [...currentCompleted];
      if (durationMin >= 45 && !updatedCompletions.includes('habit_deepwork')) {
        updatedCompletions.push('habit_deepwork');
      }

      return {
        ...prev,
        activeDeepWork: null,
        deepWorkSessions: [newSession, ...prev.deepWorkSessions],
        completions: {
          ...prev.completions,
          [todayKey]: updatedCompletions
        },
        lifetimeXP: prev.lifetimeXP + earnedXP
      };
    });
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
