import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { 
  Check, 
  Play, 
  CheckCircle2, 
  Pause, 
  RotateCcw, 
  Flame, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Plus, 
  Edit3, 
  ArrowRight,
  Code,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { Habit } from '../types';
import { DailyCheckInCard } from './DailyCheckInCard';

export const TodayScreen: React.FC = () => {
  const { 
    todayKey, 
    dayNumber, 
    state, 
    todayMission, 
    saveTodayMission, 
    setMissionStatus, 
    todayCompletedHabitIds,
    todayCompletionVersions,
    toggleHabit,
    todayDeepWorkMinutes,
    weeklyDeepWorkHours,
    startDeepWork,
    pauseDeepWork,
    resumeDeepWork,
    finishDeepWork,
    isMinimumViableDayActive,
    activateMinimumViableDay,
    deactivateMinimumViableDay,
    setScreen,
    mentorPrompt,
    completionRatePercent,
    availableXP,
    currentLevel
  } = useNour();

  const [isEditingMission, setIsEditingMission] = useState(false);
  const [missionInput, setMissionInput] = useState(todayMission?.title || '');
  const [missionCategory, setMissionCategory] = useState(todayMission?.category || 'software_dev');
  const [activeDeepWorkFocus, setActiveDeepWorkFocus] = useState('High-Leverage Execution');
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  // Active deep work state from context
  const activeDeepWork = state.activeDeepWork;

  // Filter habits: if MVD active, only show isMinimumViable
  const displayedHabits = state.habits.filter(h => {
    if (!h.active) return false;
    if (isMinimumViableDayActive) return h.isMinimumViable;
    return true;
  });

  const handleSaveMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionInput.trim()) return;
    saveTodayMission(missionInput, undefined, missionCategory);
    setIsEditingMission(false);
  };

  const handleOpenMissionEdit = () => {
    setMissionInput(todayMission?.title || '');
    setMissionCategory(todayMission?.category || 'software_dev');
    setIsEditingMission(true);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const deepWorkHours = Math.floor(todayDeepWorkMinutes / 60);
  const deepWorkMins = todayDeepWorkMinutes % 60;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. ORIENTATION HEADER & QUIET MENTOR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
              Season 01 &bull; Day {dayNumber} of {state.user.totalSeasonDays}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
              {formatDateDisplay(todayKey)}
            </h1>
          </div>

          {/* Quiet Mentor Guidance (State + Data + Action) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            <span>{mentorPrompt}</span>
          </div>
        </div>
      </div>

      {/* 2. THE #1 MISSION (VISUALLY DOMINANT) */}
      <section id="section-number-one-mission" className="relative group">
        <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-700/80 p-6 sm:p-8 subtle-glow">
          {/* Header pill & label */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-950 font-mono text-[11px] font-bold tracking-widest uppercase">
                #1 MISSION
              </span>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider hidden sm:inline">
                Highest-Leverage Task
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">+150 XP</span>
              <button
                id="edit-mission-toggle-btn"
                onClick={handleOpenMissionEdit}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800/70 transition-colors"
                title="Edit #1 Mission"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mission Content / Editing State */}
          {isEditingMission || !todayMission ? (
            <form onSubmit={handleSaveMissionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Define Today's Highest Leverage Objective
                </label>
                <input
                  id="mission-title-input"
                  type="text"
                  value={missionInput}
                  onChange={(e) => setMissionInput(e.target.value)}
                  placeholder="e.g. Complete CS50 Memory Management lecture and problem set"
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span>Category:</span>
                  <select
                    value={missionCategory}
                    onChange={(e) => setMissionCategory(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1 text-xs focus:outline-none"
                  >
                    <option value="software_dev">Software Engineering</option>
                    <option value="cs_study">CS & Algorithms</option>
                    <option value="ai_project">AI Project</option>
                    <option value="career_deliverable">Career Deliverable</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {todayMission && (
                    <button
                      type="button"
                      onClick={() => setIsEditingMission(false)}
                      className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    id="save-mission-btn"
                    type="submit"
                    className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-lg tracking-wide transition-all shadow"
                  >
                    Lock Mission
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-snug">
                  {todayMission.title}
                </h2>
                {todayMission.description && (
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    {todayMission.description}
                  </p>
                )}
              </div>

              {/* Mission Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Status:</span>
                  {todayMission.status === 'completed' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      COMPLETED
                    </span>
                  )}
                  {todayMission.status === 'in_progress' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-200 border border-zinc-600 rounded-full text-xs font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      IN PROGRESS
                    </span>
                  )}
                  {todayMission.status === 'not_started' && (
                    <span className="px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-full text-xs font-mono">
                      NOT STARTED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {todayMission.status !== 'completed' ? (
                    <>
                      {todayMission.status === 'not_started' ? (
                        <button
                          id="start-mission-btn"
                          onClick={() => {
                            setMissionStatus('in_progress');
                            if (!activeDeepWork?.isRunning) {
                              startDeepWork(todayMission.title);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-medium text-xs tracking-wider uppercase transition-all shadow hover:shadow-lg"
                        >
                          <Play className="w-3.5 h-3.5 fill-zinc-950" />
                          <span>Start Mission</span>
                        </button>
                      ) : (
                        <button
                          id="in-progress-deepwork-btn"
                          onClick={() => setScreen('deep_work')}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-mono transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Deep Work Active</span>
                        </button>
                      )}

                      <button
                        id="complete-mission-btn"
                        onClick={() => setMissionStatus('completed')}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-500 rounded-xl text-xs font-medium tracking-wide transition-all"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Complete</span>
                      </button>
                    </>
                  ) : (
                    <button
                      id="reopen-mission-btn"
                      onClick={() => setMissionStatus('in_progress')}
                      className="text-xs font-mono text-zinc-400 hover:text-zinc-300 underline"
                    >
                      Reopen Mission
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. ACTIVE DEEP WORK TIMER WIDGET (UNOBTRUSIVE FLOW) */}
      <section id="section-deepwork-widget" className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${activeDeepWork?.isRunning ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-900 border-zinc-800'}`}>
              <Clock className={`w-5 h-5 ${activeDeepWork?.isRunning ? 'text-white' : 'text-zinc-500'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Deep Work Engine
                </span>
                {activeDeepWork?.isRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="text-sm font-medium text-zinc-200 mt-0.5">
                {activeDeepWork?.isRunning 
                  ? activeDeepWork.focusArea 
                  : `Today: ${deepWorkHours}h ${deepWorkMins}m uninterrupted`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeDeepWork?.isRunning ? (
              <div className="flex items-center gap-3">
                <div className="font-mono text-lg font-bold text-white tracking-widest px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                  {formatTimer(activeDeepWork.elapsedSeconds)}
                </div>
                {activeDeepWork.isPaused ? (
                  <button
                    id="resume-timer-btn"
                    onClick={resumeDeepWork}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors"
                    title="Resume Session"
                  >
                    <Play className="w-4 h-4 fill-white" />
                  </button>
                ) : (
                  <button
                    id="pause-timer-btn"
                    onClick={pauseDeepWork}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors"
                    title="Pause Session"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="finish-timer-btn"
                  onClick={() => finishDeepWork()}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-lg tracking-wide transition-all shadow"
                >
                  Finish Session
                </button>
              </div>
            ) : (
              <button
                id="launch-deepwork-quick-btn"
                onClick={() => setScreen('deep_work')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-mono tracking-wide border border-zinc-700 hover:border-zinc-500 transition-all"
              >
                <Play className="w-3 h-3 fill-zinc-300" />
                <span>Launch Deep Work</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. TODAY'S PROGRESS & MINIMUM VIABLE DAY CONTROLS */}
      <section id="section-progress-overview" className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 uppercase tracking-wider">
            {isMinimumViableDayActive ? 'Minimum Viable Progress' : "Today's Core Progress"}
          </span>
          <span className="text-white font-semibold">{completionRatePercent}%</span>
        </div>

        {/* Progress track */}
        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800/80">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${completionRatePercent}%` }}
          />
        </div>

        {/* Action Toggles: Minimum Viable Day & Recovery */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {isMinimumViableDayActive ? (
              <button
                id="disable-mvd-btn"
                onClick={deactivateMinimumViableDay}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono hover:bg-amber-900/40 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>MVD Active &bull; Return to Full Day</span>
              </button>
            ) : (
              <button
                id="activate-mvd-btn"
                onClick={activateMinimumViableDay}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
                title="Reduces day to the highest-priority momentum preservers"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                <span>Switch to Minimum Viable Day</span>
              </button>
            )}
          </div>

          <button
            id="today-trigger-recovery-btn"
            onClick={() => setScreen('recovery')}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Off track? Enter Recovery</span>
          </button>
        </div>
      </section>

      {/* 5. CORE & KEYSTONE HABITS CHECKLIST */}
      <section id="section-core-habits" className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono tracking-widest text-zinc-300 uppercase">
              {isMinimumViableDayActive ? 'MVD Essential Actions' : 'Daily Keystone & Core Habits'}
            </h3>
            <span className="text-xs font-mono text-zinc-400">
              ({todayCompletedHabitIds.length}/{displayedHabits.length})
            </span>
          </div>

          <button
            id="manage-habits-shortcut-btn"
            onClick={() => setScreen('habits')}
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Habits</span>
          </button>
        </div>

        {/* Habits list */}
        <div className="space-y-2.5">
          {displayedHabits.map((habit) => {
            const isCompleted = todayCompletedHabitIds.includes(habit.id);
            const currentVersion = todayCompletionVersions[habit.id] || 'full';
            const isExpanded = expandedHabitId === habit.id;

            return (
              <div
                key={habit.id}
                className={`group rounded-xl border transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-zinc-950/40 border-zinc-800/60' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between p-4 gap-4">
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      id={`habit-check-${habit.id}`}
                      onClick={() => toggleHabit(habit.id, currentVersion)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 focus:outline-none cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-white border-white text-zinc-950'
                          : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'
                      }`}
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium transition-colors ${
                          isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-100'
                        }`}>
                          {habit.name}
                        </span>

                        {habit.isKeystone && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                            KEYSTONE
                          </span>
                        )}

                        {isCompleted && currentVersion === 'minimum' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-300 border border-amber-500/30">
                            MIN VERSION
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {currentVersion === 'minimum' ? habit.minimumVersion : habit.fullVersion || habit.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: XP & Expand details toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-zinc-400">
                      +{currentVersion === 'minimum' ? Math.round(habit.xp * 0.6) : habit.xp} XP
                    </span>

                    <button
                      onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                      className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors"
                      title="Toggle version and details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Drawer: choose Full vs Minimum version */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-800/60 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                    <div className="space-y-1">
                      <div><span className="text-zinc-300 font-semibold">Full:</span> {habit.fullVersion}</div>
                      <div><span className="text-zinc-300 font-semibold">Min (MVD):</span> {habit.minimumVersion}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (isCompleted && currentVersion !== 'minimum') {
                            toggleHabit(habit.id, 'full');
                            toggleHabit(habit.id, 'minimum');
                          } else if (!isCompleted) {
                            toggleHabit(habit.id, 'minimum');
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                          isCompleted && currentVersion === 'minimum'
                            ? 'bg-zinc-800 text-white border-zinc-600'
                            : 'text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        Use Min Version
                      </button>

                      <button
                        onClick={() => {
                          if (isCompleted && currentVersion !== 'full') {
                            toggleHabit(habit.id, 'minimum');
                            toggleHabit(habit.id, 'full');
                          } else if (!isCompleted) {
                            toggleHabit(habit.id, 'full');
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                          isCompleted && currentVersion === 'full'
                            ? 'bg-zinc-800 text-white border-zinc-600'
                            : 'text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        Use Full Version
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. DAILY CHECK-IN (MOOD, ENERGY LEVEL, KEY WIN) */}
      <DailyCheckInCard />

      {/* 7. STATUS STRIP (XP, STREAK, DEEP WORK, COMPOSITE) */}
      <section id="section-status-strip" className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80">
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/70">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Level & Bank</div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            LVL {currentLevel} <span className="text-xs font-normal text-zinc-400 font-sans">({availableXP} XP)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/70">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Deep Work Today</div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            {deepWorkHours}h {deepWorkMins}m
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/70">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Weekly Deep Work</div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            {weeklyDeepWorkHours}h
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/70">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Discipline Focus</div>
          <div className="text-lg font-bold text-zinc-200 mt-1 font-mono">
            Clean Flow
          </div>
        </div>
      </section>
    </div>
  );
};
