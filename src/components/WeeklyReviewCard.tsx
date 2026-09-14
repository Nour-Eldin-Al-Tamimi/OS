import React, { useState, useEffect } from 'react';
import { useNour } from '../context/NourContext';
import { getWeeklyReviewStats } from '../utils/systemAnalytics';
import { Calendar, CheckCircle2, Save } from 'lucide-react';

export const WeeklyReviewCard: React.FC = () => {
  const { state, todayKey, saveWeeklyReview } = useNour();
  const stats = getWeeklyReviewStats(state, todayKey);

  const existingReview = state.weeklyReviews?.[stats.weekKey];
  const [wentWell, setWentWell] = useState(existingReview?.wentWell || '');
  const [needsAttention, setNeedsAttention] = useState(existingReview?.needsAttention || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setWentWell(existingReview.wentWell || '');
      setNeedsAttention(existingReview.needsAttention || '');
    }
  }, [existingReview]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWeeklyReview(stats.weekKey, wentWell.trim(), needsAttention.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <section 
      id="section-weekly-review" 
      className="apple-card p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            <Calendar className="w-3.5 h-3.5 text-[#1d1d1f]" />
            <span>Weekly Review</span>
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight mt-0.5">
            Your Week in Review &bull; <span className="font-tabular-nums text-[#86868b] text-sm font-normal">{stats.weekKey}</span>
          </h3>
        </div>

        <span className="text-xs font-tabular-nums text-[#6e6e73] self-start sm:self-auto font-medium">
          {stats.totalMinutes > 0 ? `${stats.totalHoursFormatted} total focused` : 'Building weekly history'}
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05]">
          <div className="text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            Time Invested
          </div>
          <div className="text-xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1 tracking-tight">
            {stats.totalHoursFormatted}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05]">
          <div className="text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            Top Domain
          </div>
          <div className="text-sm font-semibold text-[#1d1d1f] mt-1 truncate">
            {stats.topArea ? `${stats.topArea.area}: ${stats.topArea.formatted}` : 'None logged'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05]">
          <div className="text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            Missions
          </div>
          <div className="text-xl font-semibold font-tabular-nums text-[#1d1d1f] mt-1 tracking-tight">
            {stats.missionsCompleted} <span className="text-xs font-normal text-[#86868b]">/ {stats.missionsPlanned}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.05]">
          <div className="text-[11px] font-medium text-[#86868b] tracking-tight uppercase">
            Habits
          </div>
          <div className="text-xl font-semibold font-tabular-nums text-emerald-700 mt-1 tracking-tight">
            {stats.habitCompletionPercent}%
          </div>
        </div>
      </div>

      {/* Reflection Form */}
      <form onSubmit={handleSave} className="pt-1 space-y-4">
        <div className="text-xs font-medium text-[#6e6e73]">
          Weekly Reflection (Optional)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs text-[#1d1d1f] font-medium">
              What went well this week?
            </label>
            <textarea
              id="weekly-review-went-well"
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="e.g. Mastered pointer arithmetic in C, maintained morning waking anchor..."
              rows={3}
              className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl p-3 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[#1d1d1f] font-medium">
              What needs attention next week?
            </label>
            <textarea
              id="weekly-review-needs-attention"
              value={needsAttention}
              onChange={(e) => setNeedsAttention(e.target.value)}
              placeholder="e.g. Deep work dropped on Thursday; tighten evening shutdown routine..."
              rows={3}
              className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl p-3 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs">
            {isSaved && (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Reflection saved for {stats.weekKey}
              </span>
            )}
          </div>

          <button
            type="submit"
            id="save-weekly-review-btn"
            className="apple-button-secondary flex items-center gap-2 px-4 py-2 text-xs font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Reflection</span>
          </button>
        </div>
      </form>
    </section>
  );
};
