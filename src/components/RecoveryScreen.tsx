import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Compass, 
  Check, 
  Sparkles, 
  ChevronRight,
  Heart
} from 'lucide-react';

export const RecoveryScreen: React.FC = () => {
  const { 
    state, 
    triggerRecovery, 
    completeRecoveryMicroAction, 
    activateMinimumViableDay, 
    isMinimumViableDayActive,
    setScreen 
  } = useNour();

  const [reason, setReason] = useState('Lost momentum / Doomscrolling');
  const [selectedMicroAction, setSelectedMicroAction] = useState('10-minute walk without phone');
  const [customMicroAction, setCustomMicroAction] = useState('');
  const [stepCompleted, setStepCompleted] = useState(false);

  const microActionOptions = [
    '10-minute walk outside with zero phone / headphones',
    'Open IDE and read 1 function or write 1 unit test',
    'Drink 500ml cold water and wipe desk clean',
    'Do 20 bodyweight squats and 10 pushups to reset dopamine',
    'Close all browser tabs and write tomorrow’s #1 Mission'
  ];

  const handleTrigger = () => {
    const action = customMicroAction.trim() || selectedMicroAction;
    triggerRecovery(reason, action);
    activateMinimumViableDay();
    setStepCompleted(true);
  };

  const activeRecovery = state.recoveryEvents.find(e => !e.completed);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Reset Protocol
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
          Guilt-Free Recovery
        </h1>
        <p className="text-xs font-mono text-zinc-400 mt-2">
          "A bad day is allowed. A zero day is avoidable. What is the smallest useful action I can take now?"
        </p>
      </div>

      {/* Active Recovery Ongoing */}
      {activeRecovery && !activeRecovery.completed ? (
        <div className="rounded-2xl bg-zinc-950 border border-zinc-700/80 p-6 sm:p-8 subtle-glow space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono text-amber-300 uppercase tracking-wider">
              RECOVERY IN PROGRESS
            </span>
          </div>

          <div>
            <h2 className="text-xl font-medium text-white">Your Single Micro-Action:</h2>
            <p className="text-base text-zinc-200 mt-2 font-mono p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              {activeRecovery.microAction}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">
              Minimum Viable Day is currently active.
            </span>

            <button
              id="complete-recovery-btn"
              onClick={() => {
                completeRecoveryMicroAction(activeRecovery.id);
                setScreen('today');
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-medium text-xs font-mono tracking-wider uppercase transition-all shadow"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Mark Micro-Action Done (+25 XP)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Recovery Initiation Flow */
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 subtle-glow space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Step 01 // Stop the Bleed
            </span>
            <h2 className="text-xl font-medium text-white">
              Acknowledge the moment without guilt.
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Discipline is not about never slipping; it is about how rapidly you interrupt the slip. Close distracting windows, take one slow breath, and lower your cognitive load.
            </p>
          </div>

          {/* Trigger selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
              What caused the friction today?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                'Doomscrolling & dopamine loop',
                'Feeling overwhelmed by too many tasks',
                'Procrastinated starting important work',
                'Mental fatigue & lack of sleep',
                'Unexpected disruption / low energy'
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reason === r
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose smallest useful action */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Step 02 // Pick ONE Micro-Action (under 15 minutes)
            </span>

            <div className="space-y-2">
              {microActionOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedMicroAction(opt);
                    setCustomMicroAction('');
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                    selectedMicroAction === opt && !customMicroAction
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span>{opt}</span>
                  {selectedMicroAction === opt && !customMicroAction && (
                    <Check className="w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={customMicroAction}
                onChange={(e) => setCustomMicroAction(e.target.value)}
                placeholder="Or type a custom micro-action..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Step 3: Launch Recovery */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-zinc-400">
              Automatically enables <span className="text-zinc-200">Minimum Viable Day</span> (+30 XP).
            </div>

            <button
              id="activate-recovery-btn"
              onClick={handleTrigger}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-medium text-xs font-mono tracking-widest uppercase transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Lock Recovery & Start Micro-Action</span>
            </button>
          </div>
        </div>
      )}

      {/* Recovery History */}
      {state.recoveryEvents.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            Past Recovery Events ({state.recoveryEvents.length})
          </h3>
          <p className="text-xs text-zinc-400">
            Every recovery log is proof that you interrupted a slide instead of letting the week collapse.
          </p>

          <div className="space-y-2">
            {state.recoveryEvents.slice(0, 5).map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs font-mono flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-zinc-300 font-medium">{evt.microAction}</span>
                  <p className="text-zinc-400 mt-0.5 text-[11px]">{evt.reason || 'Momentum reset'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-emerald-400 font-semibold">Recovered</span>
                  <div className="text-zinc-400 text-[10px]">{new Date(evt.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
