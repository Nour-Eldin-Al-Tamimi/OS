import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { Reward } from '../types';
import { formatDateDisplay } from '../utils/defaults';
import { 
  DollarSign, 
  Sparkles, 
  Plus, 
  Gift, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Coins, 
  ShieldCheck, 
  Trash2, 
  Edit2 
} from 'lucide-react';

export const FinanceRewardsScreen: React.FC = () => {
  const { 
    state, 
    availableXP, 
    currentLevel, 
    redeemReward, 
    saveReward, 
    deleteReward, 
    saveFinance 
  } = useNour();

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);

  // Reward Form state
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [rewardCost, setRewardCost] = useState(300);
  const [rewardCategory, setRewardCategory] = useState<Reward['category']>('personal');

  // Finance Form state
  const [monthlyTarget, setMonthlyTarget] = useState(state.finance.monthlyTarget);
  const [currentMonthIncome, setCurrentMonthIncome] = useState(state.finance.currentMonthIncome);
  const [savingsTotal, setSavingsTotal] = useState(state.finance.savingsTotal);

  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);

  const openCreateReward = () => {
    setEditingReward(null);
    setRewardTitle('');
    setRewardDescription('');
    setRewardCost(300);
    setRewardCategory('personal');
    setIsRewardModalOpen(true);
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    const rew: Reward = {
      id: editingReward ? editingReward.id : `rew_${Date.now()}`,
      title: rewardTitle.trim(),
      description: rewardDescription.trim(),
      xpCost: Number(rewardCost) || 100,
      category: rewardCategory,
      redemptionsCount: editingReward ? editingReward.redemptionsCount : 0
    };

    saveReward(rew);
    setIsRewardModalOpen(false);
  };

  const handleRedeem = (reward: Reward) => {
    if (availableXP < reward.xpCost) {
      setRedeemFeedback(`Insufficient XP. Need ${reward.xpCost - availableXP} more XP.`);
      setTimeout(() => setRedeemFeedback(null), 3000);
      return;
    }

    const success = redeemReward(reward.id);
    if (success) {
      setRedeemFeedback(`Redeemed "${reward.title}" for ${reward.xpCost} XP. Enjoy guilt-free.`);
      setTimeout(() => setRedeemFeedback(null), 3500);
    }
  };

  const handleSaveFinance = (e: React.FormEvent) => {
    e.preventDefault();
    saveFinance({
      ...state.finance,
      monthlyTarget: Number(monthlyTarget) || 1200,
      currentMonthIncome: Number(currentMonthIncome) || 0,
      savingsTotal: Number(savingsTotal) || 0
    });
    setIsFinanceModalOpen(false);
  };

  const incomePercent = Math.min(100, Math.round((state.finance.currentMonthIncome / state.finance.monthlyTarget) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. FINANCIAL INDEPENDENCE TRACKER */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Financial Sovereignty
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
              Independence Target
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              "Gradually reduce financial dependence and cover personal expenses from software skills."
            </p>
          </div>

          <button
            onClick={() => setIsFinanceModalOpen(true)}
            className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            Update Metrics
          </button>
        </div>

        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 subtle-glow space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase">Monthly Income Target</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${state.finance.monthlyTarget.toLocaleString()} <span className="text-xs font-normal text-zinc-400">/ mo</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-1">Basic living expenses</p>
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase">Current Month Earned</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${state.finance.currentMonthIncome.toLocaleString()}
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-1">{incomePercent}% of monthly goal</p>
            </div>

            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase">Cash Reserve / Savings</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${state.finance.savingsTotal.toLocaleString()}
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-1">Emergency student buffer</p>
            </div>
          </div>

          {/* Progress towards independence */}
          <div className="space-y-2 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Progress to Monthly Target</span>
              <span className="text-white font-semibold">${state.finance.currentMonthIncome} / ${state.finance.monthlyTarget}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${incomePercent}%` }}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {state.finance.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className={m.achieved ? 'text-emerald-400' : 'text-zinc-500'}>
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className={m.achieved ? 'text-zinc-200' : 'text-zinc-400'}>{m.label}</span>
                </div>
                <span className="text-zinc-400">${m.target}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MATURE XP REWARDS STORE */}
      <section className="space-y-6 pt-4 border-t border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              Mature Gamification
            </div>
            <h2 className="text-2xl font-serif-display font-semibold text-white mt-1">
              XP Rewards Store
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Redeem earned XP for guilt-free leisure, rest, or personal upgrades.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Available Balance:</span>
              <span className="font-bold text-white">{availableXP} XP</span>
            </div>

            <button
              onClick={openCreateReward}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Reward</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {redeemFeedback && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 text-center animate-fade-in">
            {redeemFeedback}
          </div>
        )}

        {/* Rewards List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.rewards.map((reward) => {
            const canAfford = availableXP >= reward.xpCost;

            return (
              <div
                key={reward.id}
                className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-medium text-white">{reward.title}</h3>
                    <span className="font-mono text-xs font-semibold text-zinc-200 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                      {reward.xpCost} XP
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{reward.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs font-mono">
                  <span className="text-zinc-400">
                    Redeemed: {reward.redemptionsCount} times
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete reward"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                        canAfford
                          ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem Reward' : 'Need More XP'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redemption History */}
        {state.redemptions.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
              Recent Redemptions Log ({state.redemptions.length})
            </h3>
            <div className="space-y-2">
              {state.redemptions.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/80 text-xs font-mono"
                >
                  <span className="text-zinc-300">{r.rewardTitle}</span>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span>-{r.xpSpent} XP</span>
                    <span>&bull;</span>
                    <span>{new Date(r.redeemedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Finance Edit Modal */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-700 p-6 space-y-4 subtle-glow">
            <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-3">
              Update Financial Metrics
            </h3>
            <form onSubmit={handleSaveFinance} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Monthly Target ($)
                </label>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Current Month Income ($)
                </label>
                <input
                  type="number"
                  value={currentMonthIncome}
                  onChange={(e) => setCurrentMonthIncome(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Total Savings / Runway ($)
                </label>
                <input
                  type="number"
                  value={savingsTotal}
                  onChange={(e) => setSavingsTotal(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFinanceModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reward Edit Modal */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-700 p-6 space-y-4 subtle-glow">
            <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-3">
              Define Custom XP Reward
            </h3>
            <form onSubmit={handleSaveReward} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="e.g. Afternoon Off-Grid Walk"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  placeholder="e.g. 2 hours in a cafe reading fiction"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  XP Cost (50–3000)
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg"
                >
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
