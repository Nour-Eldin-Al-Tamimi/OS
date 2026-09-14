import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { TimeArea } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/timeAnalytics';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target
} from 'lucide-react';

const TIME_AREAS: TimeArea[] = ['Learning', 'University', 'Fitness', 'Career', 'Personal', 'Other'];

export const DeepWorkScreen: React.FC = () => {
  const { 
    state, 
    todayMission,
    todayDeepWorkMinutes, 
    weeklyDeepWorkHours, 
    startDeepWork, 
    pauseDeepWork, 
    resumeDeepWork, 
    finishDeepWork, 
    cancelDeepWork 
  } = useNour();

  const [customFocus, setCustomFocus] = useState('Python Algorithms & Backend');
  const [selectedArea, setSelectedArea] = useState<TimeArea>('Learning');
  const [selectedCategory, setSelectedCategory] = useState<string>('Python');
  const [linkMission, setLinkMission] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState('');

  const active = state.activeDeepWork;

  const quickPresets = [
    { title: 'Python OOP & Concurrency', area: 'Learning' as TimeArea, cat: 'Python' },
    { title: 'FastAPI Microservice Engine', area: 'Learning' as TimeArea, cat: 'FastAPI' },
    { title: 'CS50 Memory & Pointer Allocation', area: 'University' as TimeArea, cat: 'Computer Science' },
    { title: 'Applied AI & Vector Embeddings', area: 'Learning' as TimeArea, cat: 'AI' },
    { title: 'Strength Training & Core', area: 'Fitness' as TimeArea, cat: 'Workout' },
    { title: 'Client Milestone Deliverable', area: 'Career' as TimeArea, cat: 'Projects' }
  ];

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const focus = customFocus.trim() || `${selectedCategory} Session`;
    startDeepWork({
      focusArea: focus,
      area: selectedArea,
      category: selectedCategory || (DEFAULT_CATEGORIES[selectedArea]?.[0] || 'Work'),
      missionId: (linkMission && todayMission) ? todayMission.id : undefined,
      notes: sessionNotes.trim() || undefined
    });
  };

  const handleFinish = () => {
    finishDeepWork(sessionNotes.trim() || undefined);
    setSessionNotes('');
  };

  const deepWorkHours = Math.floor(todayDeepWorkMinutes / 60);
  const deepWorkMins = todayDeepWorkMinutes % 60;

  const allTimeMinutes = state.deepWorkSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const allTimeHours = Math.round((allTimeMinutes / 60) * 10) / 10;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Philosophy */}
      <div className="border-b border-black/[0.06] pb-4">
        <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
          Focus Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
          Deep Work & Automatic Time Tracking
        </h1>
        <p className="text-xs text-[#6e6e73] mt-1.5">
          The timer is your source of truth. Start working, stop when done, and your time history logs automatically.
        </p>
      </div>

      {/* Main Focus Console */}
      <div className="apple-card p-6 sm:p-10 text-center space-y-7">
        {active?.isRunning ? (
          /* Active Session View */
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/[0.04] border border-black/[0.06] rounded-full text-xs font-medium text-[#1d1d1f]">
                <span className={`w-2 h-2 rounded-full ${active.isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span>{active.isPaused ? 'Session Paused' : 'Deep Work Running'}</span>
              </div>

              {active.area && (
                <span className="px-2.5 py-1 bg-black/[0.03] border border-black/[0.05] rounded-full text-xs text-[#6e6e73]">
                  {active.area} &bull; <strong className="text-[#1d1d1f] font-medium">{active.category}</strong>
                </span>
              )}

              {active.missionId && (
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-800 flex items-center gap-1 font-medium">
                  <Target className="w-3 h-3 text-emerald-600" /> Linked to #1 Mission
                </span>
              )}
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-[#86868b]">
                Focus Subject
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
                {active.focusArea}
              </h2>
            </div>

            {/* Apple Clean Timer Numerals */}
            <div className="font-tabular-nums text-5xl sm:text-7xl font-semibold tracking-tight text-[#1d1d1f] py-3">
              {formatTimer(active.elapsedSeconds)}
            </div>

            <p className="text-xs text-[#86868b]">
              {active.isPaused 
                ? 'Timer paused — pause duration will be excluded from productive records.' 
                : 'Active productive time accumulating. Safe across page refreshes and tab switches.'}
            </p>

            {/* Session Notes input */}
            <div className="text-left pt-1">
              <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                Session Log / Notes (Optional)
              </label>
              <input
                id="deepwork-session-notes-input"
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Implemented recursive BST traversal and Valgrind tests"
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white transition-colors"
              />
            </div>

            {/* Timer Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {active.isPaused ? (
                <button
                  id="deepwork-resume-btn"
                  onClick={resumeDeepWork}
                  className="apple-button-primary flex items-center gap-2 px-6 py-2.5 text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  id="deepwork-pause-btn"
                  onClick={pauseDeepWork}
                  className="apple-button-secondary flex items-center gap-2 px-5 py-2.5 text-xs"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              <button
                id="deepwork-finish-btn"
                onClick={handleFinish}
                className="apple-button-primary flex items-center gap-2 px-6 py-2.5 text-xs"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Finish Session</span>
              </button>

              <button
                id="deepwork-cancel-btn"
                onClick={cancelDeepWork}
                className="px-3 py-2 text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                title="Discard session"
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          /* Idle Session Launcher */
          <div className="max-w-lg mx-auto space-y-6 text-left">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-black/[0.04] flex items-center justify-center text-[#1d1d1f]">
                <Clock className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] pt-1">Start Focus Session</h3>
              <p className="text-xs text-[#86868b]">
                Choose what you're working on. Finishing the timer automatically records your time into analytics.
              </p>
            </div>

            {/* Quick Context Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#6e6e73]">
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickPresets.map((p) => {
                  const isSelected = customFocus === p.title;
                  return (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => {
                        setCustomFocus(p.title);
                        setSelectedArea(p.area);
                        setSelectedCategory(p.cat);
                      }}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-black/[0.05] border-black/20 text-[#1d1d1f] font-medium shadow-xs'
                          : 'bg-white border-black/[0.06] text-[#6e6e73] hover:text-[#1d1d1f] hover:border-black/15'
                      }`}
                    >
                      <div className="font-semibold text-[#1d1d1f] truncate">{p.title}</div>
                      <div className="text-[11px] text-[#86868b] mt-0.5">{p.area} &bull; {p.cat}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What are you working on */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#6e6e73]">
                What are you working on?
              </label>
              <input
                id="custom-focus-input"
                type="text"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="e.g. Python Async Engine, LeetCode Trees, CS50 Pointers..."
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white transition-colors"
              />
            </div>

            {/* Area and Category Pickers */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#6e6e73]">
                Domain
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TIME_AREAS.map((area) => {
                  const isSelected = selectedArea === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        setSelectedArea(area);
                        const cats = DEFAULT_CATEGORIES[area] || [];
                        if (cats.length > 0 && !cats.includes(selectedCategory)) {
                          setSelectedCategory(cats[0]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#1d1d1f] text-white shadow-xs'
                          : 'bg-black/[0.04] text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#6e6e73]">
                  Category ({selectedArea})
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(DEFAULT_CATEGORIES[selectedArea] || ['General']).map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                        isSelected
                          ? 'bg-black/[0.08] text-[#1d1d1f] font-semibold'
                          : 'bg-black/[0.02] text-[#86868b] hover:text-[#1d1d1f] border border-black/[0.04]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Mission Link */}
            {todayMission && todayMission.status !== 'completed' && (
              <div className="p-3.5 rounded-xl bg-black/[0.02] border border-black/[0.06] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-[#86868b] uppercase flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#1d1d1f]" />
                    Link to #1 Mission
                  </div>
                  <div className="text-xs font-medium text-[#1d1d1f] truncate mt-0.5">
                    {todayMission.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkMission(!linkMission)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    linkMission
                      ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20'
                      : 'bg-black/[0.04] text-[#6e6e73]'
                  }`}
                >
                  {linkMission ? 'Linked' : 'Do not link'}
                </button>
              </div>
            )}

            {/* Start Execution Button */}
            <button
              id="start-deepwork-session-btn"
              onClick={handleStart}
              className="apple-button-primary w-full flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium mt-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Timer ({selectedArea} &bull; {selectedCategory})</span>
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-card p-5">
          <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Today's Deep Work</div>
          <div className="text-2xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1">
            {deepWorkHours}h {deepWorkMins}m
          </div>
          <div className="text-xs text-[#86868b] mt-1">Target: 3.0h / day</div>
        </div>

        <div className="apple-card p-5">
          <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Past 7 Days Total</div>
          <div className="text-2xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1">
            {weeklyDeepWorkHours}h
          </div>
          <div className="text-xs text-[#86868b] mt-1">Target: 18h / week</div>
        </div>

        <div className="apple-card p-5">
          <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Season 01 Total</div>
          <div className="text-2xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1">
            {allTimeHours}h
          </div>
          <div className="text-xs text-[#86868b] mt-1">Goal: 300h in 6 months</div>
        </div>
      </div>

      {/* Session History */}
      <div className="apple-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
          <h3 className="text-sm font-semibold text-[#1d1d1f]">
            Recent Focus Sessions ({state.deepWorkSessions.length})
          </h3>
          <span className="text-xs text-[#86868b]">Automatic audit log</span>
        </div>

        <div className="space-y-2">
          {state.deepWorkSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#86868b]">
              No deep work recorded yet. Start the timer above to log your first session.
            </div>
          ) : (
            state.deepWorkSessions.slice(0, 10).map((session) => {
              const hrs = Math.floor(session.durationMinutes / 60);
              const mins = session.durationMinutes % 60;
              const matchingEntry = state.timeEntries.find(
                e => e.date === session.date && Math.abs((e.createdAt || 0) - (session.timestamp || 0)) < 60000
              );

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.015] border border-black/[0.04] hover:border-black/[0.08] transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[#1d1d1f] truncate">
                        {session.focusArea}
                      </span>
                      {matchingEntry && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-black/[0.05] text-[#6e6e73] font-medium">
                          {matchingEntry.area} &bull; {matchingEntry.category}
                        </span>
                      )}
                      <span className="text-xs text-[#86868b]">
                        &bull; {formatDateDisplay(session.date)}
                      </span>
                    </div>
                    {session.notes && (
                      <p className="text-xs text-[#6e6e73] truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div className="font-tabular-nums text-sm font-semibold text-[#1d1d1f]">
                      {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                    </div>
                    <div className="text-xs font-tabular-nums text-[#86868b]">
                      +{session.xpEarned} XP
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
