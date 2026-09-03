import React, { useState, useEffect } from 'react';
import { useNour } from '../context/NourContext';
import { MoodType } from '../types';
import { 
  Zap, 
  Sparkles, 
  Activity, 
  Moon, 
  Flame, 
  Battery, 
  BatteryCharging, 
  CheckCircle2, 
  Edit3, 
  Check, 
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MoodOption {
  type: MoodType;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  activeBorder: string;
  activeBg: string;
  badgeColor: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    type: 'great',
    label: 'High Flow',
    sublabel: 'Sharp & energized',
    icon: Zap,
    activeBorder: 'border-amber-400/80',
    activeBg: 'bg-amber-400/10 text-amber-300',
    badgeColor: 'text-amber-300 bg-amber-400/10 border-amber-400/30'
  },
  {
    type: 'good',
    label: 'Grounded',
    sublabel: 'Steady & focused',
    icon: Sparkles,
    activeBorder: 'border-emerald-400/80',
    activeBg: 'bg-emerald-400/10 text-emerald-300',
    badgeColor: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30'
  },
  {
    type: 'neutral',
    label: 'Neutral',
    sublabel: 'Even & balanced',
    icon: Activity,
    activeBorder: 'border-zinc-300',
    activeBg: 'bg-zinc-800 text-zinc-100',
    badgeColor: 'text-zinc-300 bg-zinc-800 border-zinc-700'
  },
  {
    type: 'low',
    label: 'Low Energy',
    sublabel: 'Sluggish or fatigued',
    icon: Moon,
    activeBorder: 'border-sky-400/80',
    activeBg: 'bg-sky-400/10 text-sky-300',
    badgeColor: 'text-sky-300 bg-sky-400/10 border-sky-400/30'
  },
  {
    type: 'drained',
    label: 'Drained',
    sublabel: 'Stressed or depleted',
    icon: Flame,
    activeBorder: 'border-rose-400/80',
    activeBg: 'bg-rose-400/10 text-rose-300',
    badgeColor: 'text-rose-300 bg-rose-400/10 border-rose-400/30'
  }
];

const ENERGY_LEVELS = [
  { level: 1, label: 'Depleted', hint: 'Critical rest required', color: 'bg-rose-500' },
  { level: 2, label: 'Low', hint: 'Reserve mode / MVD', color: 'bg-amber-500' },
  { level: 3, label: 'Steady', hint: 'Sustained pacing', color: 'bg-zinc-300' },
  { level: 4, label: 'Strong', hint: 'High cognitive drive', color: 'bg-emerald-400' },
  { level: 5, label: 'Peak', hint: 'Maximum flow', color: 'bg-white' }
];

export const DailyCheckInCard: React.FC = () => {
  const { todayCheckIn, saveDailyCheckIn } = useNour();

  const [isEditing, setIsEditing] = useState<boolean>(!todayCheckIn);
  const [selectedMood, setSelectedMood] = useState<MoodType>(todayCheckIn?.mood || 'good');
  const [energyLevel, setEnergyLevel] = useState<number>(todayCheckIn?.energyLevel || 3);
  const [keyWin, setKeyWin] = useState<string>(todayCheckIn?.keyWin || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Sync state if todayCheckIn changes externally or on day swap
  useEffect(() => {
    if (todayCheckIn) {
      setSelectedMood(todayCheckIn.mood);
      setEnergyLevel(todayCheckIn.energyLevel);
      setKeyWin(todayCheckIn.keyWin);
    } else {
      setIsEditing(true);
      setSelectedMood('good');
      setEnergyLevel(3);
      setKeyWin('');
    }
  }, [todayCheckIn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyWin.trim()) {
      setErrorMsg('Please enter at least one key win or breakthrough for today.');
      return;
    }

    setErrorMsg(null);
    saveDailyCheckIn({
      mood: selectedMood,
      energyLevel,
      keyWin: keyWin.trim()
    });

    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleStartEditing = () => {
    if (todayCheckIn) {
      setSelectedMood(todayCheckIn.mood);
      setEnergyLevel(todayCheckIn.energyLevel);
      setKeyWin(todayCheckIn.keyWin);
    }
    setErrorMsg(null);
    setIsEditing(true);
  };

  const activeMoodConfig = MOOD_OPTIONS.find(m => m.type === (todayCheckIn?.mood || selectedMood)) || MOOD_OPTIONS[1];
  const activeEnergyConfig = ENERGY_LEVELS.find(e => e.level === (todayCheckIn?.energyLevel || energyLevel)) || ENERGY_LEVELS[2];

  const formatLoggedTime = (timestamp?: number) => {
    if (!timestamp) return 'Today';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section id="section-daily-check-in" className="relative">
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/90 p-6 sm:p-7 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/70">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] font-semibold tracking-widest uppercase border border-zinc-700">
              DAILY CHECK-IN
            </span>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider hidden sm:inline">
              Mindset &amp; Key Win
            </span>
            {todayCheckIn && !isEditing && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Logged ({formatLoggedTime(todayCheckIn.loggedAt)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!todayCheckIn && (
              <span className="text-xs font-mono text-emerald-400 font-medium">
                +25 XP Available
              </span>
            )}

            {todayCheckIn && !isEditing && (
              <button
                id="edit-checkin-btn"
                type="button"
                onClick={handleStartEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-mono border border-zinc-700 transition-colors"
                title="Update check-in details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Win</span>
              </button>
            )}

            {todayCheckIn && isEditing && (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsEditing(false);
                }}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* 1. VIEW MODE (WHEN ALREADY LOGGED & NOT EDITING) */}
        {!isEditing && todayCheckIn && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mood Badge */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl border ${activeMoodConfig.badgeColor}`}>
                  <activeMoodConfig.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    State of Mind
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-2">
                    <span>{activeMoodConfig.label}</span>
                    <span className="text-xs font-normal text-zinc-400">&bull; {activeMoodConfig.sublabel}</span>
                  </div>
                </div>
              </div>

              {/* Energy Level Badge */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl border bg-zinc-900 border-zinc-700 text-zinc-200">
                  <BatteryCharging className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Energy Level
                    </span>
                    <span className="text-xs font-mono text-zinc-300">
                      {todayCheckIn.energyLevel}/5 &bull; {activeEnergyConfig.label}
                    </span>
                  </div>
                  {/* Visual 5-segment indicator */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[1, 2, 3, 4, 5].map((idx) => {
                      const filled = idx <= todayCheckIn.energyLevel;
                      return (
                        <div
                          key={idx}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            filled ? activeEnergyConfig.color : 'bg-zinc-800'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Win Display */}
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Today's #1 Key Win</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-100 font-sans leading-relaxed pl-1 italic border-l-2 border-zinc-600 pl-3">
                &ldquo;{todayCheckIn.keyWin}&rdquo;
              </p>
            </div>

            {justSaved && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Daily check-in updated successfully. +25 XP credited to bank.</span>
              </div>
            )}
          </div>
        )}

        {/* 2. FORM EDIT MODE (WHEN EDITING OR NOT YET LOGGED) */}
        {(isEditing || !todayCheckIn) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step A: Mood Selection */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                1. How are you experiencing today? (Mood / Tone)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood === mood.type;
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.type}
                      type="button"
                      id={`checkin-mood-${mood.type}`}
                      onClick={() => setSelectedMood(mood.type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected 
                          ? `${mood.activeBorder} ${mood.activeBg} ring-1 ring-zinc-500` 
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'scale-110' : 'opacity-80'}`} />
                      <span className="text-xs font-medium">{mood.label}</span>
                      <span className="text-[10px] font-mono opacity-60 mt-0.5">{mood.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step B: Energy Level (1-5) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  2. Current Energy Level (1 to 5)
                </label>
                <span className="text-xs font-mono text-zinc-300">
                  Level {energyLevel}: <span className="text-white font-medium">{ENERGY_LEVELS[energyLevel - 1].label}</span> ({ENERGY_LEVELS[energyLevel - 1].hint})
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {ENERGY_LEVELS.map((levelItem) => {
                  const isSelected = energyLevel === levelItem.level;
                  return (
                    <button
                      key={levelItem.level}
                      type="button"
                      id={`checkin-energy-${levelItem.level}`}
                      onClick={() => setEnergyLevel(levelItem.level)}
                      className={`py-2.5 px-2 rounded-xl border text-center font-mono text-xs transition-all ${
                        isSelected
                          ? 'bg-zinc-100 text-zinc-950 border-white font-bold shadow-sm'
                          : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-sm font-bold">{levelItem.level}</div>
                      <div className="text-[10px] truncate">{levelItem.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step C: Key Win */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="daily-key-win-input" className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                  3. One Key Win for the Day
                </label>
                <span className="text-[11px] font-mono text-zinc-500">
                  The primary victory or disciplined needle-mover
                </span>
              </div>

              <div className="relative">
                <input
                  id="daily-key-win-input"
                  type="text"
                  value={keyWin}
                  onChange={(e) => {
                    setKeyWin(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="e.g., Shipped the refactored data pipeline without dropping focus"
                  maxLength={160}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-mono text-rose-400 mt-1">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Submit & Action row */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Persisted in local season record</span>
              </div>

              <div className="flex items-center gap-3">
                {todayCheckIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setIsEditing(false);
                    }}
                    className="px-3.5 py-2 text-xs font-mono text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  id="submit-daily-checkin-btn"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-xl tracking-wide transition-all shadow"
                >
                  <Check className="w-4 h-4 text-zinc-950" />
                  <span>{todayCheckIn ? 'Update Check-In' : 'Lock Daily Check-In (+25 XP)'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
