import React from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { 
  CheckCircle2, 
  Target
} from 'lucide-react';

export const ProgressScreen: React.FC = () => {
  const { state, dayNumber, weeklyDeepWorkHours, completedMissions } = useNour();

  // Calculate stats from state
  const totalDaysInSeason = state.user.totalSeasonDays;
  const currentDay = dayNumber;
  const seasonProgressPercent = Math.min(100, Math.round((currentDay / totalDaysInSeason) * 100));

  // Compute metrics across logged history
  const allSessions = state.deepWorkSessions;
  const totalDeepWorkHours = Math.round((allSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60) * 10) / 10;

  // Calculate past 28 days for visual consistency block
  const past28Days: { dateStr: string; status: 'completed' | 'partial' | 'mvd' | 'rest' }[] = [];
  const today = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const record = state.dayRecords[dateStr];
    const completions = state.completions[dateStr] || [];
    const mission = state.missions[dateStr];

    if (record?.state === 'minimum_viable') {
      past28Days.push({ dateStr, status: 'mvd' });
    } else if (mission?.status === 'completed' && completions.length >= 4) {
      past28Days.push({ dateStr, status: 'completed' });
    } else if (completions.length >= 2 || allSessions.some(s => s.date === dateStr)) {
      past28Days.push({ dateStr, status: 'partial' });
    } else {
      past28Days.push({ dateStr, status: 'rest' });
    }
  }

  const completedOrMvdCount = past28Days.filter(d => d.status === 'completed' || d.status === 'mvd' || d.status === 'partial').length;
  const consistencyRate = Math.round((completedOrMvdCount / 28) * 100);

  // Six-Month Chapters definition
  const months = [
    {
      monthNum: 1,
      title: 'Foundations & Momentum Lock',
      focus: 'CS50 fundamentals, 2.5h daily deep work lock, zero doomscrolling.',
      status: currentDay <= 30 ? 'current' : 'completed',
      days: 'Days 1–30'
    },
    {
      monthNum: 2,
      title: 'Backend Systems & Python Fluency',
      focus: 'FastAPI, asynchronous I/O, relational databases, Docker setup.',
      status: currentDay > 30 && currentDay <= 60 ? 'current' : currentDay > 60 ? 'completed' : 'upcoming',
      days: 'Days 31–60'
    },
    {
      monthNum: 3,
      title: 'Full-Stack Software Architecture',
      focus: 'Production web app, automated testing, cloud deployment pipeline.',
      status: currentDay > 60 && currentDay <= 90 ? 'current' : currentDay > 90 ? 'completed' : 'upcoming',
      days: 'Days 61–90'
    },
    {
      monthNum: 4,
      title: 'Applied AI & Practical Models',
      focus: 'Vector embeddings, LLM agent workflows, specialized tooling.',
      status: currentDay > 90 && currentDay <= 120 ? 'current' : currentDay > 120 ? 'completed' : 'upcoming',
      days: 'Days 91–120'
    },
    {
      monthNum: 5,
      title: 'Commercial Projects & Revenue',
      focus: 'First paid client software deliverables, freelance pipeline ($1k target).',
      status: currentDay > 120 && currentDay <= 150 ? 'current' : currentDay > 150 ? 'completed' : 'upcoming',
      days: 'Days 121–150'
    },
    {
      monthNum: 6,
      title: 'Financial Independence & Transformation Review',
      focus: 'Recurring software income, personal sovereignty, Season Two roadmap.',
      status: currentDay > 150 ? 'current' : 'upcoming',
      days: 'Days 151–180'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9">
      {/* Header */}
      <div className="border-b border-black/[0.06] pb-4">
        <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
          Transformation Trajectory
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
          Season One &bull; 6-Month Progress
        </h1>
        <p className="text-xs text-[#6e6e73] mt-1.5">
          "Become a more disciplined, capable, healthy, independent version of yourself."
        </p>
      </div>

      {/* Season Progress Hero Card */}
      <div className="apple-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
              Season Timeline
            </span>
            <div className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] mt-1">
              Day {currentDay} of {totalDaysInSeason}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">Season Completion</span>
            <div className="text-xl font-semibold font-tabular-nums text-[#1d1d1f] mt-0.5">
              {seasonProgressPercent}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-black/[0.05] overflow-hidden">
          <div 
            className="h-full bg-[#1d1d1f] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${seasonProgressPercent}%` }}
          />
        </div>

        {/* Key Aggregate Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-black/[0.06]">
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase">Consistency (28d)</div>
            <div className="text-lg font-semibold font-tabular-nums text-[#1d1d1f] mt-0.5">{consistencyRate}%</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase">Deep Work Total</div>
            <div className="text-lg font-semibold font-tabular-nums text-[#1d1d1f] mt-0.5">{totalDeepWorkHours}h</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase">Weekly Deep Work</div>
            <div className="text-lg font-semibold font-tabular-nums text-[#1d1d1f] mt-0.5">{weeklyDeepWorkHours}h</div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase">Zero Days Avoided</div>
            <div className="text-lg font-semibold font-tabular-nums text-emerald-700 mt-0.5">{completedOrMvdCount} / 28</div>
          </div>
        </div>
      </div>

      {/* 28-Day Consistency Matrix */}
      <div className="apple-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              28-Day Execution Rhythm
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Progress over streak obsession. A bad day is allowed; a zero day is avoidable.
            </p>
          </div>
          <span className="text-xs text-[#86868b]">Past 4 Weeks</span>
        </div>

        {/* Monochromatic Block Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {past28Days.map((item) => {
            let bgClass = 'bg-black/[0.02] border-black/[0.05] text-[#86868b]';
            let label = 'Rest';

            if (item.status === 'completed') {
              bgClass = 'bg-[#1d1d1f] text-white border-transparent';
              label = 'High Execution';
            } else if (item.status === 'mvd') {
              bgClass = 'bg-amber-500/15 text-amber-900 border-amber-500/25';
              label = 'MVD Preserved';
            } else if (item.status === 'partial') {
              bgClass = 'bg-black/[0.06] text-[#1d1d1f] border-black/[0.08]';
              label = 'Action Taken';
            }

            return (
              <div
                key={item.dateStr}
                className={`h-12 rounded-xl border flex flex-col justify-between p-2 text-[10px] transition-all ${bgClass}`}
                title={`${item.dateStr} - ${label}`}
              >
                <span className="opacity-60 font-tabular-nums">{item.dateStr.slice(8)}</span>
                <span className="font-medium truncate">{label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#86868b] pt-3 border-t border-black/[0.06]">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#1d1d1f]" /> Full Execution</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500/50" /> Minimum Viable Day</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-black/[0.06]" /> Rest / Reset</span>
          </div>
          <span>Execution Over Perfection</span>
        </div>
      </div>

      {/* Accomplished Missions History */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1d1d1f]" />
              Completed Missions & Accomplishments ({completedMissions.length})
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Every completed #1 Mission represents a concrete deliverable logged to your career trajectory.
            </p>
          </div>
          <span className="text-xs text-[#86868b] font-tabular-nums hidden sm:inline">+150 XP each</span>
        </div>

        {completedMissions.length === 0 ? (
          <div className="py-8 px-4 text-center border border-dashed border-black/[0.08] rounded-2xl bg-black/[0.01] space-y-2">
            <Target className="w-6 h-6 text-[#86868b] mx-auto stroke-[1.5]" />
            <p className="text-xs font-medium text-[#1d1d1f]">No completed missions yet</p>
            <p className="text-xs text-[#86868b] max-w-sm mx-auto">
              Define today's #1 Mission on the Today screen and execute it to build your accomplishment log.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {completedMissions.map((mission) => (
              <div
                key={mission.id}
                className="apple-card p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-[#1d1d1f] truncate">
                      {mission.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/[0.04] text-[#6e6e73]">
                      {mission.category === 'cs_study' 
                        ? 'CS & Algorithms' 
                        : mission.category === 'ai_project' 
                        ? 'AI Project' 
                        : 'Software Engineering'}
                    </span>
                    {mission.date && (
                      <span className="text-xs text-[#86868b]">
                        &bull; {formatDateDisplay(mission.date)}
                      </span>
                    )}
                  </div>
                  {mission.description && (
                    <p className="text-xs text-[#86868b] truncate pl-6">
                      {mission.description}
                    </p>
                  )}
                </div>

                <div className="text-xs font-semibold font-tabular-nums text-emerald-700 shrink-0">
                  +150 XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Six-Month Transformation Roadmap */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
          Six-Month Strategic Roadmap
        </h3>

        <div className="space-y-2.5">
          {months.map((m) => {
            const isCurrent = m.status === 'current';
            const isDone = m.status === 'completed';

            return (
              <div
                key={m.monthNum}
                className={`apple-card p-5 space-y-2.5 transition-all ${
                  isCurrent
                    ? 'border-black/20 shadow-md ring-1 ring-black/5'
                    : isDone
                    ? 'opacity-85'
                    : 'opacity-65'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#1d1d1f] px-2 py-0.5 rounded-md bg-black/[0.04]">
                      M{m.monthNum} &bull; {m.days}
                    </span>
                    <h4 className="text-sm font-semibold text-[#1d1d1f]">{m.title}</h4>
                  </div>

                  <div className="text-xs">
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-[#1d1d1f] text-white font-medium text-[11px]">
                        ACTIVE CHAPTER
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[#6e6e73] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Complete
                      </span>
                    )}
                    {!isCurrent && !isDone && (
                      <span className="text-[#86868b]">Upcoming</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  {m.focus}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
