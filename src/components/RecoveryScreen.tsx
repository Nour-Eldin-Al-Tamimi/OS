import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { 
  RotateCcw, 
  Check, 
  Sparkles
} from 'lucide-react';

export const RecoveryScreen: React.FC = () => {
  const { 
    state, 
    triggerRecovery, 
    completeRecoveryMicroAction, 
    activateMinimumViableDay, 
    setScreen 
  } = useNour();

  const [reason, setReason] = useState('Doomscrolling & dopamine loop');
  const [selectedMicroAction, setSelectedMicroAction] = useState('10-minute walk outside with zero phone / headphones');
  const [customMicroAction, setCustomMicroAction] = useState('');

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
  };

  const activeRecovery = state.recoveryEvents.find(e => !e.completed);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-black/[0.06] pb-4">
        <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
          Reset Protocol
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
          Guilt-Free Recovery
        </h1>
        <p className="text-xs text-[#6e6e73] mt-1.5">
          "A bad day is allowed. A zero day is avoidable. What is the smallest useful action I can take now?"
        </p>
      </div>

      {/* Active Recovery Ongoing */}
      {activeRecovery && !activeRecovery.completed ? (
        <div className="apple-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              RECOVERY IN PROGRESS
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Your Single Micro-Action:</h2>
            <p className="text-sm text-[#1d1d1f] mt-2.5 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 font-medium">
              {activeRecovery.microAction}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/[0.06]">
            <span className="text-xs text-[#86868b]">
              Minimum Viable Day is currently active.
            </span>

            <button
              id="complete-recovery-btn"
              onClick={() => {
                completeRecoveryMicroAction(activeRecovery.id);
                setScreen('today');
              }}
              className="apple-button-primary flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Mark Micro-Action Done (+25 XP)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Recovery Initiation Flow */
        <div className="apple-card p-6 sm:p-8 space-y-7">
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
              Step 01 &bull; Stop the Bleed
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1d1d1f]">
              Acknowledge the moment without guilt.
            </h2>
            <p className="text-xs text-[#6e6e73] leading-relaxed">
              Discipline is not about never slipping; it is about how rapidly you interrupt the slip. Close distracting windows, take one slow breath, and lower your cognitive load.
            </p>
          </div>

          {/* Trigger selector */}
          <div className="space-y-2.5 pt-1">
            <label className="block text-xs font-medium text-[#6e6e73]">
              What caused the friction today?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
                      ? 'bg-black/[0.04] text-[#1d1d1f] font-medium border-black/20 shadow-xs'
                      : 'bg-white text-[#6e6e73] border-black/[0.06] hover:bg-black/[0.02]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose smallest useful action */}
          <div className="space-y-2.5 pt-4 border-t border-black/[0.06]">
            <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
              Step 02 &bull; Pick ONE Micro-Action (under 15 minutes)
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
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedMicroAction === opt && !customMicroAction
                      ? 'bg-black/[0.04] text-[#1d1d1f] font-medium border-black/20 shadow-xs'
                      : 'bg-white text-[#6e6e73] border-black/[0.06] hover:bg-black/[0.02]'
                  }`}
                >
                  <span>{opt}</span>
                  {selectedMicroAction === opt && !customMicroAction && (
                    <Check className="w-4 h-4 text-[#1d1d1f] shrink-0" />
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
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white"
              />
            </div>
          </div>

          {/* Step 3: Launch Recovery */}
          <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#6e6e73]">
              Enables <strong className="text-[#1d1d1f]">Minimum Viable Day</strong> (+30 XP).
            </div>

            <button
              id="activate-recovery-btn"
              onClick={handleTrigger}
              className="apple-button-primary flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Lock Recovery & Start Micro-Action</span>
            </button>
          </div>
        </div>
      )}

      {/* Recovery History */}
      {state.recoveryEvents.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Past Recovery Events ({state.recoveryEvents.length})
          </h3>
          <p className="text-xs text-[#86868b]">
            Every recovery log is proof that you interrupted a slide instead of letting the week collapse.
          </p>

          <div className="space-y-2">
            {state.recoveryEvents.slice(0, 5).map((evt) => (
              <div
                key={evt.id}
                className="apple-card p-3.5 text-xs flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[#1d1d1f] font-medium">{evt.microAction}</span>
                  <p className="text-[#86868b] mt-0.5 text-[11px]">{evt.reason || 'Momentum reset'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-emerald-700 font-medium">Recovered</span>
                  <div className="text-[#86868b] font-tabular-nums text-[10px]">{new Date(evt.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
