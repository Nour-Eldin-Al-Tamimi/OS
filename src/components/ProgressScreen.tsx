import React from 'react';
import { useNour } from '../context/NourContext';
import { formatDateDisplay } from '../utils/defaults';
import { 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Code, 
  Brain 
} from 'lucide-react';

export const ProgressScreen: React.FC = () => {
  const { state, dayNumber, weeklyDeepWorkHours } = useNour();

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Transformation Trajectory
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
          Season One &bull; 6-Month Progress
        </h1>
        <p className="text-xs font-mono text-zinc-400 mt-2">
          "Become a more disciplined, capable, healthy, independent version of yourself."
        </p>
      </div>

      {/* Season Progress Hero Card */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 subtle-glow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Season Timeline
            </span>
            <div className="text-xl sm:text-2xl font-serif-display font-semibold text-white mt-1">
              Day {currentDay} of {totalDaysInSeason}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-zinc-400 uppercase">Season Completion</span>
            <div className="text-xl font-mono font-bold text-white mt-0.5">
              {seasonProgressPercent}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${seasonProgressPercent}%` }}
          />
        </div>

        {/* Key Aggregate Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Consistency (28d)</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">{consistencyRate}%</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Deep Work Total</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">{totalDeepWorkHours}h</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Weekly Deep Work</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">{weeklyDeepWorkHours}h</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Zero Days Avoided</div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">24 / 24</div>
          </div>
        </div>
      </div>

      {/* 28-Day Consistency Matrix */}
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-mono tracking-widest text-zinc-200 uppercase">
              28-Day Execution Rhythm
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Progress over streak obsession. A bad day is allowed; a zero day is avoidable.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Past 4 Weeks</span>
        </div>

        {/* Monochromatic Block Grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {past28Days.map((item, idx) => {
            let bgClass = 'bg-zinc-900 border-zinc-800';
            let label = 'Rest';

            if (item.status === 'completed') {
              bgClass = 'bg-white text-zinc-950 border-white';
              label = 'High Execution';
            } else if (item.status === 'mvd') {
              bgClass = 'bg-zinc-700 text-white border-zinc-600';
              label = 'MVD Preserved';
            } else if (item.status === 'partial') {
              bgClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';
              label = 'Action Taken';
            }

            return (
              <div
                key={item.dateStr}
                className={`h-12 rounded-lg border flex flex-col justify-between p-1.5 text-[10px] font-mono transition-all ${bgClass}`}
                title={`${item.dateStr} - ${label}`}
              >
                <span className="opacity-60">{item.dateStr.slice(8)}</span>
                <span className="font-semibold truncate">{label.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-white" /> Full Execution</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-700" /> Minimum Viable Day</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-900 border border-zinc-700" /> Rest / Reset</span>
          </div>
          <span>Execution Over Perfection</span>
        </div>
      </div>

      {/* Six-Month Transformation Roadmap */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono tracking-widest text-zinc-300 uppercase">
          Six-Month Strategic Roadmap
        </h3>

        <div className="space-y-3">
          {months.map((m) => {
            const isCurrent = m.status === 'current';
            const isDone = m.status === 'completed';

            return (
              <div
                key={m.monthNum}
                className={`p-5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-zinc-950 border-zinc-600 subtle-glow-sm'
                    : isDone
                    ? 'bg-zinc-900/30 border-zinc-800/80 opacity-70'
                    : 'bg-zinc-900/20 border-zinc-800/50 opacity-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700">
                      M{m.monthNum} &bull; {m.days}
                    </span>
                    <h4 className="text-base font-medium text-white">{m.title}</h4>
                  </div>

                  <div className="text-xs font-mono">
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-white border border-zinc-600">
                        ACTIVE CHAPTER
                      </span>
                    )}
                    {isDone && (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </span>
                    )}
                    {!isCurrent && !isDone && (
                      <span className="text-zinc-400">Upcoming</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-2.5 font-sans leading-relaxed">
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
