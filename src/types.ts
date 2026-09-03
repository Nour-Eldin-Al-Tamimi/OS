export type ScreenType = 
  | 'today' 
  | 'habits' 
  | 'deep_work' 
  | 'progress' 
  | 'learning' 
  | 'rewards' 
  | 'recovery' 
  | 'settings';

export type SmartDayState = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'minimum_viable' 
  | 'recovering' 
  | 'rest_day';

export type HabitCategory = 'discipline' | 'engineering' | 'health' | 'mind';

export interface UserConfig {
  name: string;
  season: number;
  chapter: number;
  startDate: string; // ISO date string YYYY-MM-DD
  totalSeasonDays: number;
  careerTrack: string;
}

export interface Mission {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  xp: number;
  category: 'cs_study' | 'software_dev' | 'ai_project' | 'career_deliverable' | 'exam';
  startedAt?: number;
  completedAt?: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  xp: number;
  isKeystone: boolean;
  isMinimumViable: boolean;
  minimumVersion: string;
  fullVersion: string;
  active: boolean;
  order: number;
}

export interface DeepWorkSession {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  focusArea: string;
  xpEarned: number;
  timestamp: number;
  notes?: string;
}

export interface ActiveDeepWork {
  isRunning: boolean;
  isPaused: boolean;
  startedAt: number; // unix timestamp
  elapsedSeconds: number;
  focusArea: string;
}

export type MoodType = 'great' | 'good' | 'neutral' | 'low' | 'drained';

export interface DailyCheckIn {
  mood: MoodType;
  energyLevel: number; // 1 to 5
  keyWin: string;
  loggedAt?: number;
}

export interface DayRecord {
  date: string;
  state: SmartDayState;
  reflectionNotes?: string;
  recoveryNote?: string;
  distractionLevel?: 'clean' | 'moderate' | 'slipped';
  sleepHours?: number;
  workoutDone?: boolean;
  checkIn?: DailyCheckIn;
  mood?: MoodType;
  energyLevel?: number;
  keyWin?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  xpCost: number;
  category: 'rest' | 'personal' | 'gear';
  redemptionsCount: number;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  xpSpent: number;
  redeemedAt: number;
}

export interface LearningRoadmapItem {
  id: string;
  title: string;
  track: 'cs_fundamentals' | 'python_mastery' | 'backend_systems' | 'ai_engineering' | 'production_projects';
  status: 'not_started' | 'in_progress' | 'completed';
  currentMilestone: string;
  hoursInvested: number;
  totalEstimatedHours: number;
}

export interface FinancialProfile {
  monthlyTarget: number;
  currentMonthIncome: number;
  sideIncome: number;
  savingsTotal: number;
  currency: string;
  milestones: {
    id: string;
    target: number;
    label: string;
    achieved: boolean;
  }[];
}

export interface RecoveryEvent {
  id: string;
  date: string;
  timestamp: number;
  reason?: string;
  microAction: string;
  completed: boolean;
}

export interface NourOSState {
  user: UserConfig;
  missions: Record<string, Mission>; // keyed by date YYYY-MM-DD
  habits: Habit[];
  completions: Record<string, string[]>; // date -> habit IDs
  completionVersions: Record<string, Record<string, 'full' | 'minimum'>>;
  deepWorkSessions: DeepWorkSession[];
  activeDeepWork: ActiveDeepWork | null;
  dayRecords: Record<string, DayRecord>;
  rewards: Reward[];
  redemptions: RewardRedemption[];
  learningItems: LearningRoadmapItem[];
  finance: FinancialProfile;
  lifetimeXP: number;
  totalSpentXP: number;
  recoveryEvents: RecoveryEvent[];
  hasSeenOpening: boolean;
}
