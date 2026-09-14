import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { TimeArea } from '../types';
import { TIME_AREAS, DEFAULT_CATEGORIES } from '../utils/timeAnalytics';
import { X, Clock, Plus, Check } from 'lucide-react';

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArea?: TimeArea;
}

export const LogTimeModal: React.FC<LogTimeModalProps> = ({
  isOpen,
  onClose,
  initialArea = 'Learning'
}) => {
  const { todayKey, state, addTimeEntry, todayMission } = useNour();

  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [area, setArea] = useState<TimeArea>(initialArea);
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[initialArea][0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [date, setDate] = useState(todayKey);
  const [note, setNote] = useState('');
  const [linkedMission, setLinkedMission] = useState(false);
  const [linkedHabitId, setLinkedHabitId] = useState<string>('');

  if (!isOpen) return null;

  const currentPresetCategories = DEFAULT_CATEGORIES[area] || ['Other'];

  const handleAreaChange = (newArea: TimeArea) => {
    setArea(newArea);
    const presets = DEFAULT_CATEGORIES[newArea];
    if (presets && presets.length > 0) {
      setCategory(presets[0]);
      setIsCustomCategory(false);
    }
  };

  const handleQuickAddDuration = (addHours: number, addMins: number) => {
    let total = hours * 60 + minutes + addHours * 60 + addMins;
    if (total < 5) total = 5;
    setHours(Math.floor(total / 60));
    setMinutes(total % 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 0) return;

    const finalCategory = isCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category || 'Other';

    addTimeEntry({
      date,
      durationMinutes: totalMinutes,
      area,
      category: finalCategory,
      note: note.trim() ? note.trim() : undefined,
      missionId: linkedMission && todayMission ? todayMission.id : undefined,
      habitId: linkedHabitId ? linkedHabitId : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/[0.04] text-[#1d1d1f] rounded-xl">
              <Clock className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">Log Time</h2>
              <p className="text-xs text-[#86868b]">Record activity duration and domain</p>
            </div>
          </div>

          <button
            id="close-log-time-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.04] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Duration (Hours & Minutes + Quick Adjustments) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#6e6e73]">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 focus-within:border-black/30 focus-within:bg-white transition-colors">
                <input
                  id="time-duration-hours"
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-xl font-semibold font-tabular-nums text-[#1d1d1f] focus:outline-none"
                />
                <span className="text-xs text-[#86868b] shrink-0 ml-2 font-medium">hours</span>
              </div>

              <div className="flex items-center bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 focus-within:border-black/30 focus-within:bg-white transition-colors">
                <input
                  id="time-duration-minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-transparent text-xl font-semibold font-tabular-nums text-[#1d1d1f] focus:outline-none"
                />
                <span className="text-xs text-[#86868b] shrink-0 ml-2 font-medium">mins</span>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { label: '30m', h: 0, m: 30 },
                { label: '45m', h: 0, m: 45 },
                { label: '1h 00m', h: 1, m: 0 },
                { label: '1h 30m', h: 1, m: 30 },
                { label: '2h 00m', h: 2, m: 0 },
                { label: '+15m', add: true, h: 0, m: 15 }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (chip.add) {
                      handleQuickAddDuration(chip.h, chip.m);
                    } else {
                      setHours(chip.h);
                      setMinutes(chip.m);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-[#6e6e73] bg-black/[0.03] hover:bg-black/[0.06] hover:text-[#1d1d1f] rounded-lg transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Area Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#6e6e73]">
              Domain
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_AREAS.map((a) => {
                const isSelected = area === a;
                return (
                  <button
                    key={a}
                    type="button"
                    id={`area-select-${a.toLowerCase()}`}
                    onClick={() => handleAreaChange(a)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white shadow-xs'
                        : 'bg-black/[0.02] border-black/[0.06] text-[#6e6e73] hover:bg-black/[0.04] hover:text-[#1d1d1f]'
                    }`}
                  >
                    <span>{a}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Category Selection + Custom Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#6e6e73]">
                Category ({area})
              </label>
              {!isCustomCategory && (
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(true)}
                  className="text-xs text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom</span>
                </button>
              )}
            </div>

            {isCustomCategory ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="custom-category-input"
                    type="text"
                    placeholder="e.g. Distributed Systems, Calisthenics, Calculus..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="px-3 py-2 bg-black/[0.04] text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] rounded-xl transition-colors shrink-0"
                  >
                    Presets
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {currentPresetCategories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
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
            )}
          </div>

          {/* 4. Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1.5">
                Date
              </label>
              <input
                id="time-entry-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1.5">
                Note (Optional)
              </label>
              <input
                id="time-entry-note"
                type="text"
                placeholder="What did you focus on?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black/30 focus:bg-white"
              />
            </div>
          </div>

          {/* 5. Optional Connection to #1 Mission or Habit */}
          <div className="pt-2 border-t border-black/[0.06] space-y-2">
            <span className="block text-xs font-medium text-[#6e6e73]">
              Optional Association
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {todayMission && (
                <label className="flex items-center gap-2 text-xs text-[#1d1d1f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedMission}
                    onChange={(e) => setLinkedMission(e.target.checked)}
                    className="rounded border-black/20 text-[#1d1d1f] focus:ring-0"
                  />
                  <span className="truncate max-w-xs">Connect to #1 Mission: {todayMission.title}</span>
                </label>
              )}

              <select
                value={linkedHabitId}
                onChange={(e) => setLinkedHabitId(e.target.value)}
                className="bg-black/[0.02] border border-black/[0.08] text-xs text-[#1d1d1f] rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="">No Habit linked</option>
                {state.habits.filter(h => h.active).map(h => (
                  <option key={h.id} value={h.id}>Link to Habit: {h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] rounded-xl hover:bg-black/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-time-entry-submit-btn"
              type="submit"
              className="apple-button-primary px-5 py-2.5 text-xs font-medium"
            >
              Save Time Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
