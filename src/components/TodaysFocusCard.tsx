import React, { useMemo } from 'react';
import { useNour } from '../context/NourContext';
import { getPlannedActivitiesAndNext } from '../utils/systemAnalytics';
import { AREA_COLORS, formatTimer } from '../utils/timeAnalytics';
import { 
  Target, 
  Play, 
  Pause, 
  Check, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Flame,
  ArrowRight
} from 'lucide-react';

export const TodaysFocusCard: React.FC = () => {
  const { 
    state, 
    todayKey, 
    startDeepWork, 
    pauseDeepWork, 
    resumeDeepWork, 
    finishDeepWork,
    setScreen,
    isMinimumViableDayActive,
    smartDayState
  } = useNour();

  const { plannedActivities, nextActivity, hasActivities, allCompleted } = useMemo(() => {
    return getPlannedActivitiesAndNext(state, todayKey);
  }, [state, todayKey]);

  const activeTimer = state.activeDeepWork;

  const handleStartNext = () => {
    if (!nextActivity) return;

    startDeepWork({
      focusArea: nextActivity.title,
      area: nextActivity.area,
      category: nextActivity.category,
      missionId: nextActivity.missionId,
      habitId: nextActivity.habitId
    });
  };

  const handleStartSpecific = (act: typeof plannedActivities[0]) => {
    startDeepWork({
      focusArea: act.title,
      area: act.area,
      category: act.category,
      missionId: act.missionId,
      habitId: act.habitId
    });
  };

  const isStruggling = isMinimumViableDayActive || smartDayState === 'recovering';

  return (
    <div 
      id="section-todays-focus-card" 
      className="apple-card p-6 sm:p-7 space-y-5 transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            <Target className="w-3.5 h-3.5 text-[#1d1d1f]" />
            <span>Today's Focus</span>
          </div>
          <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-tight mt-0.5">
            What should I do now?
          </h2>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {allCompleted ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Day Won
            </span>
          ) : activeTimer?.isRunning ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-black/[0.05] text-[#1d1d1f] border border-black/[0.08] rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Focus In Progress
            </span>
          ) : nextActivity ? (
            <span className="px-3 py-1 bg-black/[0.04] text-[#6e6e73] border border-black/[0.06] rounded-full text-xs font-medium">
              Ready
            </span>
          ) : null}
        </div>
      </div>

      {/* Recovery / Bad Day presentation layer */}
      {isStruggling && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Recovery Mode Active</span>
          </div>
          <p className="text-xs text-amber-950/80 leading-relaxed font-normal">
            Today isn't lost. Complete one important mission and one key habit to keep your momentum. Win the day, don't perfect the day.
          </p>
        </div>
      )}

      {/* Active Timer Live Strip (if timer is currently running) */}
      {activeTimer?.isRunning && (
        <div className="p-5 rounded-2xl bg-[#1d1d1f] text-white space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Clock className="w-5 h-5 animate-pulse text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                    Active Session
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-white/15 text-neutral-200 font-medium">
                    {activeTimer.area} &bull; {activeTimer.category}
                  </span>
                </div>
                <div className="text-base font-semibold text-white mt-0.5 truncate max-w-md">
                  {activeTimer.focusArea}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="font-tabular-nums text-2xl font-semibold tracking-tight text-white px-3.5 py-1 rounded-xl bg-white/10">
                {formatTimer(activeTimer.elapsedSeconds)}
              </div>

              {activeTimer.isPaused ? (
                <button
                  id="focus-resume-timer-btn"
                  onClick={resumeDeepWork}
                  className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-colors"
                  title="Resume Timer"
                >
                  <Play className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  id="focus-pause-timer-btn"
                  onClick={pauseDeepWork}
                  className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-colors"
                  title="Pause Timer"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}

              <button
                id="focus-finish-timer-btn"
                onClick={() => finishDeepWork()}
                className="px-4 py-2 bg-white hover:bg-neutral-100 text-[#1d1d1f] font-semibold text-xs rounded-xl tracking-tight transition-all shadow"
              >
                Finish Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Planned Activities List */}
      {!hasActivities ? (
        <div className="py-8 px-4 text-center border border-dashed border-black/[0.08] rounded-2xl bg-black/[0.015] space-y-2">
          <p className="text-sm font-medium text-[#1d1d1f]">Nothing planned today.</p>
          <p className="text-xs text-[#86868b]">
            Add a Mission or Habit to begin building your 6-month momentum.
          </p>
          <button
            onClick={() => setScreen('habits')}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] bg-black/[0.04] hover:bg-black/[0.08] rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configure Activities</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {plannedActivities.map((act) => {
            const isNext = nextActivity?.id === act.id && !activeTimer?.isRunning;
            const areaColor = AREA_COLORS[act.area] || AREA_COLORS['Learning'];

            return (
              <div
                key={act.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  act.isCompleted
                    ? 'bg-black/[0.015] border-black/[0.04] opacity-50'
                    : isNext
                    ? 'bg-black/[0.025] border-black/[0.12] shadow-sm'
                    : 'bg-white border-black/[0.06] hover:border-black/[0.1]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${areaColor.bar}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${act.isCompleted ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'}`}>
                        {act.title}
                      </span>
                      {act.isMission && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/[0.05] text-[#1d1d1f] shrink-0">
                          #1 Mission
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#86868b] mt-0.5">
                      {act.area} &bull; {act.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-tabular-nums text-[#6e6e73] font-medium">
                    {act.estimatedMinutes} min
                  </span>

                  {act.isCompleted ? (
                    <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-700">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  ) : !activeTimer?.isRunning && (
                    <button
                      onClick={() => handleStartSpecific(act)}
                      className="p-1.5 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] transition-colors"
                      title={`Start ${act.title}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary Action Button: [ Start Next ] */}
      {!activeTimer?.isRunning && (
        <div className="pt-1">
          {allCompleted ? (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center space-y-1">
              <div className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today's core targets are completed.</span>
              </div>
              <p className="text-xs text-[#86868b]">
                Win the day, don't perfect the day. Rest and reset for tomorrow.
              </p>
            </div>
          ) : nextActivity ? (
            <button
              id="start-next-activity-btn"
              onClick={handleStartNext}
              className="apple-button-primary w-full flex items-center justify-center gap-2 px-5 py-3 text-sm tracking-tight shadow-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Next: {nextActivity.title} ({nextActivity.estimatedMinutes}m)</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
