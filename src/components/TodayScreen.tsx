import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { 
  Check, 
  Play, 
  CheckCircle2, 
  Pause, 
  RotateCcw, 
  Clock, 
  ShieldAlert, 
  Edit3, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProgressTrendChart } from './ProgressTrendChart';
import { TimeTrackingSection } from './TimeTrackingSection';
import { JourneyIndicator } from './JourneyIndicator';
import { TodaysFocusCard } from './TodaysFocusCard';
import { ConsistencyCard } from './ConsistencyCard';
import { DriftInsightCard } from './DriftInsightCard';
import { DailyCheckInCard } from './DailyCheckInCard';
import { WeeklyReviewCard } from './WeeklyReviewCard';

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
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const activeDeepWork = state.activeDeepWork;

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. ORIENTATION HEADER & QUIET MENTOR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-black/[0.06] pb-4">
          <div>
            <div className="text-[11px] font-medium tracking-tight text-[#86868b] uppercase">
              Day {dayNumber} / {state.user.totalSeasonDays || 180} &bull; Month {Math.min(6, Math.ceil(dayNumber / 30))} / 6
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                Hey, {state.user.name || 'Nour'} 👋
              </h1>
              <span className="text-xs text-[#86868b] font-medium hidden sm:inline">
                &bull; {formatDateDisplay(todayKey)}
              </span>
            </div>
          </div>

          {/* Quiet Mentor Guidance */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.035] border border-black/[0.05] rounded-full text-xs text-[#6e6e73] font-medium self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f] animate-pulse" />
            <span>{mentorPrompt}</span>
          </div>
        </div>

        {/* 6-Month Transformation Journey Tracker */}
        <JourneyIndicator />

        {/* Smart Drift Detection Insights */}
        <DriftInsightCard />

        {/* Daily Command Center: Today's Focus & Start Next */}
        <TodaysFocusCard />
      </div>

      {/* 2. THE #1 MISSION (VISUALLY DOMINANT) */}
      <section id="section-number-one-mission" className="relative group">
        <div className="apple-card p-6 sm:p-8 space-y-5">
          {/* Header pill & label */}
          <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#1d1d1f] text-white text-[11px] font-semibold tracking-wider uppercase">
                #1 MISSION
              </span>
              <span className="text-xs text-[#86868b] font-medium hidden sm:inline">
                Highest-Leverage Task
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-tabular-nums text-[#86868b] font-medium">+150 XP</span>
              <button
                id="edit-mission-toggle-btn"
                onClick={handleOpenMissionEdit}
                className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.04] transition-colors"
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
                <label className="block text-xs font-medium text-[#6e6e73] mb-1.5">
                  Define Today's Highest Leverage Objective
                </label>
                <input
                  id="mission-title-input"
                  type="text"
                  value={missionInput}
                  onChange={(e) => setMissionInput(e.target.value)}
                  placeholder="e.g. Complete CS50 Memory Management lecture and problem set"
                  autoFocus
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-3 text-base text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
                  <span>Category:</span>
                  <select
                    value={missionCategory}
                    onChange={(e) => setMissionCategory(e.target.value as any)}
                    className="bg-black/[0.03] border border-black/[0.08] text-[#1d1d1f] rounded-lg px-2.5 py-1 text-xs focus:outline-none"
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
                      className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.04] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    id="save-mission-btn"
                    type="submit"
                    className="apple-button-primary px-5 py-2 text-xs font-medium"
                  >
                    Lock Mission
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f] leading-snug">
                  {todayMission.title}
                </h2>
                {todayMission.description && (
                  <p className="text-sm text-[#6e6e73] mt-2 leading-relaxed">
                    {todayMission.description}
                  </p>
                )}
              </div>

              {/* Mission Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#86868b] font-medium">Status:</span>
                  {todayMission.status === 'completed' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </span>
                  )}
                  {todayMission.status === 'in_progress' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-black/[0.05] text-[#1d1d1f] border border-black/[0.08] rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Progress
                    </span>
                  )}
                  {todayMission.status === 'not_started' && (
                    <span className="px-3 py-1 bg-black/[0.03] text-[#86868b] border border-black/[0.06] rounded-full text-xs font-medium">
                      Not Started
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
                              const cat = todayMission.category === 'cs_study' ? 'CS50' : todayMission.category === 'ai_project' ? 'AI' : 'Software Engineering';
                              startDeepWork({
                                focusArea: todayMission.title,
                                area: 'Learning',
                                category: cat,
                                missionId: todayMission.id
                              });
                            }
                          }}
                          className="apple-button-primary flex items-center gap-2 px-5 py-2.5 text-xs font-medium"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Mission</span>
                        </button>
                      ) : (
                        <button
                          id="in-progress-deepwork-btn"
                          onClick={() => setScreen('deep_work')}
                          className="apple-button-secondary flex items-center gap-2 px-4 py-2 text-xs font-medium"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#1d1d1f]" />
                          <span>Deep Work Active</span>
                        </button>
                      )}

                      <button
                        id="complete-mission-btn"
                        onClick={() => setMissionStatus('completed')}
                        className="apple-button-secondary flex items-center gap-1.5 px-4 py-2 text-xs font-medium hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Complete</span>
                      </button>
                    </>
                  ) : (
                    <button
                      id="reopen-mission-btn"
                      onClick={() => setMissionStatus('in_progress')}
                      className="text-xs text-[#86868b] hover:text-[#1d1d1f] underline font-medium"
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

      {/* 3. CORE & KEYSTONE HABITS CHECKLIST */}
      <section id="section-core-habits" className="apple-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight">
              {isMinimumViableDayActive ? 'MVD Essential Actions' : 'Daily Keystone & Core Habits'}
            </h3>
            <span className="text-xs font-tabular-nums text-[#86868b]">
              ({todayCompletedHabitIds.length}/{displayedHabits.length})
            </span>
          </div>

          <button
            id="manage-habits-shortcut-btn"
            onClick={() => setScreen('habits')}
            className="text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] flex items-center gap-1 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
        </div>

        {/* Habits list */}
        <div className="space-y-2">
          {displayedHabits.map((habit) => {
            const isCompleted = todayCompletedHabitIds.includes(habit.id);
            const currentVersion = todayCompletionVersions[habit.id] || 'full';
            const isExpanded = expandedHabitId === habit.id;

            return (
              <div
                key={habit.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-black/[0.015] border-black/[0.04]' 
                    : 'bg-white border-black/[0.06] hover:border-black/[0.12] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between p-4 gap-4">
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      id={`habit-check-${habit.id}`}
                      onClick={() => toggleHabit(habit.id, currentVersion)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 focus:outline-none cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white'
                          : 'bg-white border-black/20 hover:border-black/50'
                      }`}
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium transition-colors ${
                          isCompleted ? 'text-[#86868b] line-through' : 'text-[#1d1d1f]'
                        }`}>
                          {habit.name}
                        </span>

                        {habit.isKeystone && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/[0.05] text-[#1d1d1f]">
                            Keystone
                          </span>
                        )}

                        {isCompleted && currentVersion === 'minimum' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-800">
                            Min
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#86868b] truncate mt-0.5">
                        {currentVersion === 'minimum' ? habit.minimumVersion : habit.fullVersion || habit.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timer Quick-Launch, XP & Expand details toggle */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {!isCompleted && !activeDeepWork?.isRunning && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const area = habit.category === 'health' ? 'Fitness' : habit.category === 'engineering' ? 'Learning' : 'Personal';
                          const cat = habit.category === 'health' ? 'Workout' : habit.category === 'engineering' ? 'Software Engineering' : habit.category === 'mind' ? 'Reading' : 'Habit';
                          startDeepWork({
                            focusArea: habit.name,
                            area,
                            category: cat,
                            habitId: habit.id
                          });
                        }}
                        className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] rounded-lg transition-colors"
                        title={`Start timer for ${habit.name}`}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    <span className="text-xs font-tabular-nums text-[#86868b]">
                      +{currentVersion === 'minimum' ? Math.round(habit.xp * 0.6) : habit.xp} XP
                    </span>

                    <button
                      onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                      className="p-1 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                      title="Toggle version and details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Drawer: choose Full vs Minimum version */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6e6e73]">
                    <div className="space-y-1">
                      <div><strong className="text-[#1d1d1f]">Full:</strong> {habit.fullVersion}</div>
                      <div><strong className="text-[#1d1d1f]">Min (MVD):</strong> {habit.minimumVersion}</div>
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
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isCompleted && currentVersion === 'minimum'
                            ? 'bg-black text-white border-black'
                            : 'text-[#6e6e73] border-black/[0.1] hover:border-black/30'
                        }`}
                      >
                        Use Min
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
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isCompleted && currentVersion === 'full'
                            ? 'bg-black text-white border-black'
                            : 'text-[#6e6e73] border-black/[0.1] hover:border-black/30'
                        }`}
                      >
                        Use Full
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TODAY'S PROGRESS & CONSISTENCY */}
      <section id="section-progress-overview" className="space-y-3">
        <ConsistencyCard />

        {/* Action Toggles: Minimum Viable Day & Recovery */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {isMinimumViableDayActive ? (
              <button
                id="disable-mvd-btn"
                onClick={deactivateMinimumViableDay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-900 border border-amber-500/20 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>MVD Active &bull; Return to Full Day</span>
              </button>
            ) : (
              <button
                id="activate-mvd-btn"
                onClick={activateMinimumViableDay}
                className="text-xs text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors flex items-center gap-1.5"
                title="Reduces day to the highest-priority momentum preservers"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#86868b]" />
                <span>Switch to Minimum Viable Day</span>
              </button>
            )}
          </div>

          <button
            id="today-trigger-recovery-btn"
            onClick={() => setScreen('recovery')}
            className="text-xs text-[#86868b] hover:text-[#1d1d1f] font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#86868b]" />
            <span>Off track? Enter Recovery Protocol</span>
          </button>
        </div>
      </section>

      {/* 5. PROGRESS OVERVIEW & MARKET-STYLE TREND CHART */}
      <ProgressTrendChart />

      {/* 6. TIME INVESTED & TIME ANALYTICS */}
      <TimeTrackingSection />

      {/* 7. DAILY CHECK-IN & MINDSET WIN */}
      <DailyCheckInCard />

      {/* 8. WEEKLY REVIEW & REFLECTION */}
      <WeeklyReviewCard />
    </div>
  );
};
