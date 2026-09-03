import { NourOSState, DeepWorkSession, Habit, Mission, DayRecord, LearningRoadmapItem, Reward, RewardRedemption, RecoveryEvent } from '../types';

export const LOCAL_STORAGE_KEY = 'nour_os_v2_data';
export const PRE_MIGRATION_BACKUP_KEY = 'nour_os_v2_pre_migration_backup';
export const BACKUP_HISTORY_KEY = 'nour_os_v2_backup_history';

/**
 * Creates an immutable snapshot in localStorage before any cloud migration or merge
 */
export function createLocalBackupSnapshot(label = 'pre_migration'): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;

    const backupPayload = {
      label,
      timestamp: Date.now(),
      isoDate: new Date().toISOString(),
      stateJson: raw
    };

    // Store immediate pre-migration key
    localStorage.setItem(PRE_MIGRATION_BACKUP_KEY, JSON.stringify(backupPayload));

    // Append to rolling backup history (keeps last 5 snapshots)
    try {
      const historyRaw = localStorage.getItem(BACKUP_HISTORY_KEY);
      const history: Array<typeof backupPayload> = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(backupPayload);
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
    } catch {
      // Ignore history array failures
    }

    return raw;
  } catch (err) {
    console.error('Failed to create local safety backup snapshot:', err);
    return null;
  }
}

/**
 * Retrieves the safety backup if recovery is ever needed
 */
export function getPreMigrationBackup(): NourOSState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(PRE_MIGRATION_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return JSON.parse(parsed.stateJson);
  } catch (err) {
    console.error('Failed to read pre-migration backup:', err);
    return null;
  }
}

/**
 * Checks if a state object represents an unedited/virgin state with no real user activity
 */
export function isDefaultVirginState(s: NourOSState): boolean {
  const hasNoSessions = !s.deepWorkSessions || s.deepWorkSessions.length === 0;
  const hasNoXP = !s.lifetimeXP || s.lifetimeXP === 0;
  const hasZeroCompletions = Object.values(s.completions || {}).every(arr => !arr || arr.length === 0);
  const hasNoCheckIns = Object.values(s.dayRecords || {}).every(r => !r.checkIn && !r.reflectionNotes);
  return hasNoSessions && hasNoXP && hasZeroCompletions && hasNoCheckIns;
}

/**
 * Merges local and remote states safely without data loss.
 */
export function mergeLocalAndRemoteStates(local: NourOSState, remote: NourOSState): NourOSState {
  // If local is virgin, remote is the absolute truth
  if (isDefaultVirginState(local)) {
    return remote;
  }

  // If remote is virgin, local is the absolute truth
  if (isDefaultVirginState(remote)) {
    return local;
  }

  // Both have real progress: Merge intelligently and conservatively
  // 1. Deep Work Sessions (Union by id)
  const sessionMap = new Map<string, DeepWorkSession>();
  for (const s of remote.deepWorkSessions || []) sessionMap.set(s.id, s);
  for (const s of local.deepWorkSessions || []) sessionMap.set(s.id, s);
  const mergedSessions = Array.from(sessionMap.values()).sort((a, b) => b.timestamp - a.timestamp);

  // 2. Habits (Union by id, preserving custom additions)
  const habitMap = new Map<string, Habit>();
  for (const h of remote.habits || []) habitMap.set(h.id, h);
  for (const h of local.habits || []) habitMap.set(h.id, h);
  const mergedHabits = Array.from(habitMap.values()).sort((a, b) => (a.order || 0) - (b.order || 0));

  // 3. Missions (Union by date, preferring completed or more detailed)
  const mergedMissions: Record<string, Mission> = { ...(remote.missions || {}) };
  for (const [date, localMission] of Object.entries(local.missions || {})) {
    const remoteMission = mergedMissions[date];
    if (!remoteMission) {
      mergedMissions[date] = localMission;
    } else if (localMission.status === 'completed' && remoteMission.status !== 'completed') {
      mergedMissions[date] = localMission;
    }
  }

  // 4. Completions (Union habit IDs per date)
  const mergedCompletions: Record<string, string[]> = { ...(remote.completions || {}) };
  for (const [date, localList] of Object.entries(local.completions || {})) {
    const remoteList = mergedCompletions[date] || [];
    const combinedSet = new Set([...remoteList, ...localList]);
    mergedCompletions[date] = Array.from(combinedSet);
  }

  // 5. Completion Versions
  const mergedVersions: Record<string, Record<string, 'full' | 'minimum'>> = { ...(remote.completionVersions || {}) };
  for (const [date, localHabitMap] of Object.entries(local.completionVersions || {})) {
    mergedVersions[date] = {
      ...(mergedVersions[date] || {}),
      ...localHabitMap
    };
  }

  // 6. Day Records (Union by date, combining checkIns & reflections)
  const mergedDayRecords: Record<string, DayRecord> = { ...(remote.dayRecords || {}) };
  for (const [date, localRecord] of Object.entries(local.dayRecords || {})) {
    const remoteRecord = mergedDayRecords[date];
    if (!remoteRecord) {
      mergedDayRecords[date] = localRecord;
    } else {
      mergedDayRecords[date] = {
        ...remoteRecord,
        ...localRecord,
        checkIn: localRecord.checkIn || remoteRecord.checkIn,
        reflectionNotes: localRecord.reflectionNotes || remoteRecord.reflectionNotes,
        recoveryNote: localRecord.recoveryNote || remoteRecord.recoveryNote
      };
    }
  }

  // 7. Rewards and Redemptions
  const rewardMap = new Map<string, Reward>();
  for (const r of remote.rewards || []) rewardMap.set(r.id, r);
  for (const r of local.rewards || []) rewardMap.set(r.id, r);

  const redemptionMap = new Map<string, RewardRedemption>();
  for (const r of remote.redemptions || []) redemptionMap.set(r.id, r);
  for (const r of local.redemptions || []) redemptionMap.set(r.id, r);

  // 8. Learning Roadmap
  const learningMap = new Map<string, LearningRoadmapItem>();
  for (const l of remote.learningItems || []) learningMap.set(l.id, l);
  for (const l of local.learningItems || []) {
    const rem = learningMap.get(l.id);
    if (!rem) {
      learningMap.set(l.id, l);
    } else {
      learningMap.set(l.id, {
        ...rem,
        ...l,
        hoursInvested: Math.max(l.hoursInvested || 0, rem.hoursInvested || 0),
        status: (l.status === 'completed' || rem.status === 'completed') ? 'completed' : l.status
      });
    }
  }

  // 9. Recovery Events
  const recoveryMap = new Map<string, RecoveryEvent>();
  for (const r of remote.recoveryEvents || []) recoveryMap.set(r.id, r);
  for (const r of local.recoveryEvents || []) recoveryMap.set(r.id, r);

  // 10. Maximize XP and spend counters
  const lifetimeXP = Math.max(local.lifetimeXP || 0, remote.lifetimeXP || 0);
  const totalSpentXP = Math.max(local.totalSpentXP || 0, remote.totalSpentXP || 0);

  return {
    user: {
      ...remote.user,
      ...local.user,
      // If remote has a custom name, preserve it
      name: (remote.user.name && remote.user.name !== 'Nour') ? remote.user.name : local.user.name
    },
    missions: mergedMissions,
    habits: mergedHabits,
    completions: mergedCompletions,
    completionVersions: mergedVersions,
    deepWorkSessions: mergedSessions,
    activeDeepWork: local.activeDeepWork || remote.activeDeepWork,
    dayRecords: mergedDayRecords,
    rewards: Array.from(rewardMap.values()),
    redemptions: Array.from(redemptionMap.values()),
    learningItems: Array.from(learningMap.values()),
    finance: {
      ...remote.finance,
      ...local.finance
    },
    lifetimeXP,
    totalSpentXP,
    recoveryEvents: Array.from(recoveryMap.values()),
    hasSeenOpening: local.hasSeenOpening || remote.hasSeenOpening
  };
}
