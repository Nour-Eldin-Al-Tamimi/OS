import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
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
  DailyCheckIn,
  MoodType,
  DayRecord
} from '../types';
import { loadState, saveState, clearAllStorage, getTodayKey, generateDefaultState, getDayNumberInSeason } from '../utils/defaults';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  fetchRemoteState, 
  saveRemoteState, 
  subscribeToRemoteState 
} from '../lib/firebase';
import { 
  createLocalBackupSnapshot, 
  mergeLocalAndRemoteStates, 
  getPreMigrationBackup 
} from '../utils/migration';

export type CloudSyncStatus = 'local_only' | 'syncing' | 'synced' | 'error' | 'offline';

interface NourContextType {
  state: NourOSState;
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  todayKey: string;
  dayNumber: number;
  
  // Cloud Authentication & Sync
  currentUser: User | null;
  isAuthLoading: boolean;
  isCloudSyncing: boolean;
  syncStatus: CloudSyncStatus;
  syncError: string | null;
  lastSyncedAt: Date | null;
  signInWithCloud: () => Promise<void>;
  signOutCloud: () => Promise<void>;
  forceCloudSync: () => Promise<void>;
  restorePreMigrationBackup: () => boolean;

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
  
  // Daily Check-In
  todayCheckIn: DailyCheckIn | null;
  saveDailyCheckIn: (checkIn: { mood: MoodType; energyLevel: number; keyWin: string }) => void;

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

  // Cloud Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('local_only');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Refs to avoid circular updates and debounce writes
  const isRemoteUpdateRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const pendingSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Firebase Auth and initial Cloud Migration / Sync
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(false);
      setCurrentUser(firebaseUser);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!firebaseUser) {
        setSyncStatus('local_only');
        setSyncError(null);
        return;
      }

      // User signed in - begin safe sync and migration workflow
      setSyncStatus('syncing');
      setSyncError(null);

      try {
        // 1. Always create a local safety snapshot before interacting with cloud
        createLocalBackupSnapshot('pre_cloud_sync');

        // 2. Fetch remote document for this user
        const remoteState = await fetchRemoteState(firebaseUser.uid);

        if (!remoteState) {
          // FIRST-TIME MIGRATION: User has no cloud record yet.
          // Migrate existing local state to Firestore as initial baseline
          console.log('[Cloud Sync] First-time login: Migrating local state to Firestore');
          await saveRemoteState(firebaseUser.uid, stateRef.current);
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        } else {
          // CLOUD HAS RECORD: Safely merge local and remote states
          console.log('[Cloud Sync] Existing user record found: Merging local and cloud states');
          const mergedState = mergeLocalAndRemoteStates(stateRef.current, remoteState);
          
          isRemoteUpdateRef.current = true;
          setState(mergedState);
          saveState(mergedState);
          await saveRemoteState(firebaseUser.uid, mergedState);
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        }

        // 3. Subscribe to real-time updates from other tabs or devices
        unsubscribeSnapshot = subscribeToRemoteState(
          firebaseUser.uid,
          (incomingRemoteState) => {
            if (isRemoteUpdateRef.current) {
              isRemoteUpdateRef.current = false;
              return;
            }
            console.log('[Cloud Sync] Incoming remote update received');
            setState((currentLocal) => {
              const merged = mergeLocalAndRemoteStates(currentLocal, incomingRemoteState);
              saveState(merged);
              return merged;
            });
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
          },
          (err) => {
            console.error('[Cloud Sync] Listener error:', err);
            setSyncStatus('error');
            setSyncError(err.message);
          }
        );
      } catch (err: any) {
        console.error('[Cloud Sync] Initialization/migration error:', err);
        setSyncStatus('error');
        setSyncError(err?.message || 'Failed to sync with cloud');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Save changes to localStorage immediately and debounce cloud writes
  useEffect(() => {
    // Immediate local persistence
    saveState(state);

    if (!currentUser) return;

    // Debounce cloud write (650ms) to batch rapid UI actions (ticking habits, etc.)
    if (pendingSaveTimeoutRef.current) {
      clearTimeout(pendingSaveTimeoutRef.current);
    }

    setIsCloudSyncing(true);
    pendingSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveRemoteState(currentUser.uid, state);
        setIsCloudSyncing(false);
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
        setSyncError(null);
      } catch (err: any) {
        console.error('[Cloud Sync] Failed to push state to Firestore:', err);
        setIsCloudSyncing(false);
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setSyncStatus('offline');
        } else {
          setSyncStatus('error');
          setSyncError(err?.message || 'Sync error');
        }
      }
    }, 650);

    return () => {
      if (pendingSaveTimeoutRef.current) {
        clearTimeout(pendingSaveTimeoutRef.current);
      }
    };
  }, [state, currentUser]);

  // Network online/offline listener
  useEffect(() => {
    const handleOnline = () => {
      if (currentUser) {
        setSyncStatus('syncing');
        saveRemoteState(currentUser.uid, stateRef.current)
          .then(() => {
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
            setSyncError(null);
          })
          .catch(() => setSyncStatus('error'));
      }
    };
    const handleOffline = () => {
      if (currentUser) {
        setSyncStatus('offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

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

  const todayCheckIn = useMemo(() => {
    return state.dayRecords[todayKey]?.checkIn || null;
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

  // Daily Check-In (Mood, Energy, Key Win)
  const saveDailyCheckIn = (checkInData: { mood: MoodType; energyLevel: number; keyWin: string }) => {
    setState(prev => {
      const existing = prev.dayRecords[todayKey] || { date: todayKey, state: 'in_progress' as SmartDayState };
      const hadExistingCheckIn = Boolean(existing.checkIn && existing.checkIn.keyWin);
      const xpBonus = hadExistingCheckIn ? 0 : 25;

      const newCheckIn: DailyCheckIn = {
        mood: checkInData.mood,
        energyLevel: checkInData.energyLevel,
        keyWin: checkInData.keyWin.trim(),
        loggedAt: Date.now()
      };

      const updatedRecord: DayRecord = {
        ...existing,
        checkIn: newCheckIn,
        mood: checkInData.mood,
        energyLevel: checkInData.energyLevel,
        keyWin: checkInData.keyWin.trim()
      };

      return {
        ...prev,
        dayRecords: {
          ...prev.dayRecords,
          [todayKey]: updatedRecord
        },
        lifetimeXP: prev.lifetimeXP + xpBonus
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
    createLocalBackupSnapshot('pre_reset');
    clearAllStorage();
    const fresh = generateDefaultState();
    setState(fresh);
    saveState(fresh);
    if (currentUser) {
      saveRemoteState(currentUser.uid, fresh).catch(console.error);
    }
  };

  const exportJSON = () => {
    return JSON.stringify({
      _exportedAt: new Date().toISOString(),
      _version: 2,
      ...state
    }, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      // Strip metadata if present
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _exportedAt, _version, _updatedAt, _schemaVersion, ...cleanState } = parsed;
      if (cleanState && cleanState.user && cleanState.habits) {
        createLocalBackupSnapshot('pre_json_import');
        setState(cleanState as NourOSState);
        saveState(cleanState as NourOSState);
        if (currentUser) {
          saveRemoteState(currentUser.uid, cleanState as NourOSState).catch(console.error);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const restorePreMigrationBackup = (): boolean => {
    const backup = getPreMigrationBackup();
    if (!backup) return false;
    setState(backup);
    saveState(backup);
    if (currentUser) {
      saveRemoteState(currentUser.uid, backup).catch(console.error);
    }
    return true;
  };

  const signInWithCloud = async () => {
    try {
      setSyncStatus('syncing');
      setSyncError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Sign-in failed:', err);
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setSyncError(msg);
      throw err;
    }
  };

  const signOutCloud = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setSyncStatus('local_only');
    } catch (err: unknown) {
      console.error('Sign-out failed:', err);
      throw err;
    }
  };

  const forceCloudSync = async () => {
    if (!currentUser) return;
    setSyncStatus('syncing');
    try {
      await saveRemoteState(currentUser.uid, state);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
    } catch (err: unknown) {
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Force sync failed';
      setSyncError(msg);
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
        currentUser,
        isAuthLoading,
        isCloudSyncing,
        syncStatus,
        syncError,
        lastSyncedAt,
        signInWithCloud,
        signOutCloud,
        forceCloudSync,
        restorePreMigrationBackup,
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
        completionRatePercent,
        todayCheckIn,
        saveDailyCheckIn
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
