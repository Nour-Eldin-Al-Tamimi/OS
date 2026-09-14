import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { Reward } from '../types';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  X
} from 'lucide-react';

export const FinanceRewardsScreen: React.FC = () => {
  const { 
    state, 
    availableXP, 
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. FINANCIAL INDEPENDENCE TRACKER */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
              Financial Sovereignty
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
              Independence Target
            </h1>
            <p className="text-xs text-[#6e6e73] mt-1">
              Gradually reduce financial dependence and cover personal expenses from software skills.
            </p>
          </div>

          <button
            onClick={() => setIsFinanceModalOpen(true)}
            className="apple-button-secondary text-xs font-medium px-3.5 py-1.5 self-start sm:self-auto"
          >
            Update Metrics
          </button>
        </div>

        <div className="apple-card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-[11px] font-medium uppercase text-[#86868b]">Monthly Target</span>
              <div className="text-2xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1">
                ${state.finance.monthlyTarget.toLocaleString()} <span className="text-xs text-[#86868b] font-normal">/ mo</span>
              </div>
              <p className="text-xs text-[#86868b] mt-1">Basic living expenses</p>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase text-[#86868b]">Current Month Earned</span>
              <div className="text-2xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1">
                ${state.finance.currentMonthIncome.toLocaleString()}
              </div>
              <p className="text-xs text-[#86868b] mt-1">{incomePercent}% of monthly goal</p>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase text-[#86868b]">Cash Reserve / Runway</span>
              <div className="text-2xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1">
                ${state.finance.savingsTotal.toLocaleString()}
              </div>
              <p className="text-xs text-[#86868b] mt-1">Student buffer</p>
            </div>
          </div>

          {/* Progress towards independence */}
          <div className="space-y-2 pt-4 border-t border-black/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#6e6e73]">
              <span>Progress to Monthly Target</span>
              <span className="text-[#1d1d1f] font-semibold font-tabular-nums">${state.finance.currentMonthIncome} / ${state.finance.monthlyTarget}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/[0.05] overflow-hidden">
              <div 
                className="h-full bg-[#1d1d1f] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${incomePercent}%` }}
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {state.finance.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/[0.015] border border-black/[0.04] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={m.achieved ? 'text-emerald-600' : 'text-black/20'}>
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className={m.achieved ? 'text-[#1d1d1f] font-medium' : 'text-[#86868b]'}>{m.label}</span>
                </div>
                <span className="font-tabular-nums text-[#86868b]">${m.target}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MATURE XP REWARDS STORE */}
      <section className="space-y-5 pt-4 border-t border-black/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
              Gamification
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] mt-1">
              XP Rewards Store
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Redeem earned XP for guilt-free leisure, rest, or personal upgrades.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.035] border border-black/[0.06] text-xs text-[#1d1d1f]">
              <Sparkles className="w-3.5 h-3.5 text-[#1d1d1f]" />
              <span className="text-[#6e6e73]">Balance:</span>
              <span className="font-semibold font-tabular-nums text-[#1d1d1f]">{availableXP} XP</span>
            </div>

            <button
              onClick={openCreateReward}
              className="apple-button-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Reward</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {redeemFeedback && (
          <div className="p-3 rounded-xl bg-black/[0.04] text-xs font-medium text-[#1d1d1f] text-center">
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
                className="apple-card p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1d1d1f]">{reward.title}</h3>
                    <span className="font-tabular-nums text-xs font-semibold text-[#1d1d1f] px-2 py-0.5 rounded-md bg-black/[0.04]">
                      {reward.xpCost} XP
                    </span>
                  </div>
                  <p className="text-xs text-[#6e6e73] mt-1.5 leading-relaxed">{reward.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] text-xs">
                  <span className="text-[#86868b] font-tabular-nums">
                    Redeemed {reward.redemptionsCount}x
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="p-1.5 text-[#86868b] hover:text-rose-600 rounded-lg hover:bg-black/[0.04] transition-colors"
                      title="Delete reward"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        canAfford
                          ? 'apple-button-primary'
                          : 'bg-black/[0.03] text-[#86868b] cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem' : 'Need More XP'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Finance Edit Modal */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-black/10 p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">
                Update Financial Metrics
              </h3>
              <button
                onClick={() => setIsFinanceModalOpen(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFinance} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Monthly Target ($)
                </label>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white font-tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Current Month Income ($)
                </label>
                <input
                  type="number"
                  value={currentMonthIncome}
                  onChange={(e) => setCurrentMonthIncome(Number(e.target.value))}
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white font-tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Total Savings / Runway ($)
                </label>
                <input
                  type="number"
                  value={savingsTotal}
                  onChange={(e) => setSavingsTotal(Number(e.target.value))}
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white font-tabular-nums"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsFinanceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-button-primary px-5 py-2 text-xs font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-black/10 p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">
                Define Custom Reward
              </h3>
              <button
                onClick={() => setIsRewardModalOpen(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReward} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Reward Title
                </label>
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="e.g. Afternoon Off-Grid Walk"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  placeholder="e.g. 2 hours in a cafe reading fiction"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  XP Cost (50–3000)
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={rewardCost}
                  onChange={(e) => setRewardCost(Number(e.target.value))}
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white font-tabular-nums"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-button-primary px-5 py-2 text-xs font-medium"
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
