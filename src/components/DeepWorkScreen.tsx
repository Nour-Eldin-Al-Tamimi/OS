import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Code, 
  Brain, 
  Laptop, 
  Calendar 
} from 'lucide-react';

export const DeepWorkScreen: React.FC = () => {
  const { 
    state, 
    todayDeepWorkMinutes, 
    weeklyDeepWorkHours, 
    startDeepWork, 
    pauseDeepWork, 
    resumeDeepWork, 
    finishDeepWork, 
    cancelDeepWork 
  } = useNour();

  const [customFocus, setCustomFocus] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedTag, setSelectedTag] = useState('Software Engineering');

  const active = state.activeDeepWork;

  const presetTags = [
    'CS50 / Algorithmic Problem Set',
    'Backend Systems / FastAPI',
    'Python OOP & Concurrency',
    'AI & Model Integration',
    'Software Architecture & Refactor'
  ];

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = (focus: string) => {
    startDeepWork(focus.trim() || 'Software Engineering Session');
  };

  const handleFinish = () => {
    finishDeepWork(sessionNotes.trim() || undefined);
    setSessionNotes('');
  };

  const deepWorkHours = Math.floor(todayDeepWorkMinutes / 60);
  const deepWorkMins = todayDeepWorkMinutes % 60;

  // Calculate all-time deep work hours
  const allTimeMinutes = state.deepWorkSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const allTimeHours = Math.round((allTimeMinutes / 60) * 10) / 10;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title & Philosophy */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Deep Work Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
          Uninterrupted Focus
        </h1>
        <p className="text-xs font-mono text-zinc-400 mt-2">
          "When I say I'm working, I want to actually work for hours."
        </p>
      </div>

      {/* Main Focus Console */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-10 subtle-glow text-center space-y-8">
        {active?.isRunning ? (
          /* Active Session View */
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs font-mono text-zinc-300">
              <span className={`w-2 h-2 rounded-full ${active.isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{active.isPaused ? 'SESSION PAUSED' : 'DEEP WORK ACTIVE'}</span>
            </div>

            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Focus Subject:
            </div>
            <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
              {active.focusArea}
            </h2>

            {/* Huge Monospace Timer */}
            <div className="font-mono text-5xl sm:text-7xl font-bold tracking-widest text-white py-4 subtle-text-glow">
              {formatTimer(active.elapsedSeconds)}
            </div>

            {/* Session Notes input */}
            <div className="text-left pt-2">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Session Log / Deliverable Notes (Optional)
              </label>
              <input
                id="deepwork-session-notes-input"
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Implemented auth middleware and unit tests"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-4 pt-4">
              {active.isPaused ? (
                <button
                  id="deepwork-resume-btn"
                  onClick={resumeDeepWork}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-medium text-xs font-mono uppercase tracking-wider transition-all shadow"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  id="deepwork-pause-btn"
                  onClick={pauseDeepWork}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-medium text-xs font-mono uppercase tracking-wider border border-zinc-700 transition-all"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              <button
                id="deepwork-finish-btn"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-lg"
              >
                <Square className="w-4 h-4 fill-zinc-950" />
                <span>Finish & Save Session</span>
              </button>

              <button
                id="deepwork-cancel-btn"
                onClick={cancelDeepWork}
                className="px-3 py-3 text-xs font-mono text-zinc-400 hover:text-zinc-300 transition-colors"
                title="Discard session"
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          /* Idle Session Launcher */
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Clock className="w-6 h-6 text-zinc-300" />
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">Enter Flow State</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Close unnecessary browser tabs, put phone away, work for uninterrupted hours.
              </p>
            </div>

            {/* Focus presets */}
            <div className="space-y-2 text-left">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Select Focus Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {presetTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setCustomFocus(tag);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      customFocus === tag
                        ? 'bg-zinc-200 text-zinc-950 font-medium'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="text-left">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Or Enter Custom Focus Area
              </label>
              <input
                id="custom-focus-input"
                type="text"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="e.g. Building backend REST API in FastAPI"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Start Execution Button */}
            <button
              id="start-deepwork-session-btn"
              onClick={() => handleStart(customFocus || selectedTag)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-medium text-xs font-mono uppercase tracking-widest transition-all shadow-md"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Begin Deep Work</span>
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Today's Deep Work</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {deepWorkHours}h {deepWorkMins}m
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">Target: 3.0h / day</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Past 7 Days Total</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {weeklyDeepWorkHours}h
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">Target: 18h / week</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Season 01 Total</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {allTimeHours}h
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-1">Goal: 300h in 6 months</div>
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono tracking-widest text-zinc-300 uppercase">
            Recent Work Sessions ({state.deepWorkSessions.length})
          </h3>
          <span className="text-xs font-mono text-zinc-400">1 XP / min + bonuses</span>
        </div>

        {state.deepWorkSessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-zinc-500 font-mono text-xs">
            No focus sessions logged yet. Begin your first deep work block above.
          </div>
        ) : (
          <div className="space-y-2">
            {state.deepWorkSessions.slice(0, 10).map((session) => {
              const hrs = Math.floor(session.durationMinutes / 60);
              const mins = session.durationMinutes % 60;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200 truncate">
                        {session.focusArea}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        &bull; {formatDateDisplay(session.date)}
                      </span>
                    </div>
                    {session.notes && (
                      <p className="text-xs text-zinc-400 truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div className="font-mono text-sm font-semibold text-white">
                      {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      +{session.xpEarned} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
