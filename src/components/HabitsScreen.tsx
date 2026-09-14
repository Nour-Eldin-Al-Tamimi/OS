import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { Habit, HabitCategory } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  X
} from 'lucide-react';

export const HabitsScreen: React.FC = () => {
  const { state, saveHabit, deleteHabit } = useNour();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('discipline');
  const [xp, setXp] = useState(40);
  const [isKeystone, setIsKeystone] = useState(false);
  const [isMinimumViable, setIsMinimumViable] = useState(true);
  const [minimumVersion, setMinimumVersion] = useState('');
  const [fullVersion, setFullVersion] = useState('');

  const openCreateModal = () => {
    setEditingHabit(null);
    setName('');
    setDescription('');
    setCategory('discipline');
    setXp(40);
    setIsKeystone(false);
    setIsMinimumViable(true);
    setMinimumVersion('');
    setFullVersion('');
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description);
    setCategory(habit.category);
    setXp(habit.xp);
    setIsKeystone(habit.isKeystone);
    setIsMinimumViable(habit.isMinimumViable);
    setMinimumVersion(habit.minimumVersion);
    setFullVersion(habit.fullVersion);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const habitToSave: Habit = {
      id: editingHabit ? editingHabit.id : `habit_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      xp: Number(xp) || 30,
      isKeystone,
      isMinimumViable,
      minimumVersion: minimumVersion.trim() || 'Smallest executable unit',
      fullVersion: fullVersion.trim() || name.trim(),
      active: true,
      order: editingHabit ? editingHabit.order : state.habits.length + 1
    };

    saveHabit(habitToSave);
    setIsModalOpen(false);
  };

  const keystoneHabits = state.habits.filter(h => h.isKeystone);
  const coreHabits = state.habits.filter(h => !h.isKeystone);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
            Habit Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Keystone & Core Habits
          </h1>
          <p className="text-xs text-[#6e6e73] mt-1.5">
            Focused set of high-leverage habits with pre-defined Minimum Versions.
          </p>
        </div>

        <button
          id="add-new-habit-btn"
          onClick={openCreateModal}
          className="apple-button-primary flex items-center gap-2 px-4 py-2.5 text-xs font-medium self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Keystone Habits Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#1d1d1f]" />
          <h2 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Keystone Habits ({keystoneHabits.length})
          </h2>
        </div>
        <p className="text-xs text-[#86868b]">
          The non-negotiable anchors of your routine. These create positive cascading effects on the rest of your day.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {keystoneHabits.map((habit) => (
            <div
              key={habit.id}
              className="apple-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[#1d1d1f]">{habit.name}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/[0.05] text-[#1d1d1f]">
                      KEYSTONE
                    </span>
                    {habit.isMinimumViable && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-800 border border-amber-500/20">
                        MVD READY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">{habit.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-tabular-nums text-[#86868b] px-2.5 py-1 bg-black/[0.03] rounded-lg">
                    +{habit.xp} XP
                  </span>
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.04] transition-colors"
                    title="Edit habit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Versions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-black/[0.06] text-xs">
                <div className="p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <span className="text-[#86868b] block text-[10px] uppercase font-medium">Standard Version:</span>
                  <span className="text-[#1d1d1f] mt-0.5 block font-medium">{habit.fullVersion}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
                  <span className="text-amber-800 block text-[10px] uppercase font-medium">Minimum Viable Version:</span>
                  <span className="text-amber-900 mt-0.5 block font-medium">{habit.minimumVersion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supporting Core Habits Section */}
      <div className="space-y-4 pt-4 border-t border-black/[0.06]">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Supporting Core Habits ({coreHabits.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {coreHabits.map((habit) => (
            <div
              key={habit.id}
              className="apple-card p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-[#1d1d1f]">{habit.name}</h3>
                  <span className="text-xs text-[#86868b] uppercase font-medium">
                    &bull; {habit.category}
                  </span>
                  {habit.isMinimumViable && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/[0.04] text-[#6e6e73]">
                      MVD
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#86868b] mt-0.5">{habit.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-tabular-nums text-[#86868b]">
                  +{habit.xp} XP
                </span>
                <button
                  onClick={() => openEditModal(habit)}
                  className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-black/[0.04] transition-colors"
                  title="Edit habit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1.5 text-[#86868b] hover:text-rose-600 rounded-lg hover:bg-black/[0.04] transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-black/10 p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">
                {editingHabit ? 'Edit Habit Specification' : 'Add New Habit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily LeetCode / Algorithmic Problem"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Purpose / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sharpens data structure intuition before interviews"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none"
                  >
                    <option value="discipline">Discipline</option>
                    <option value="engineering">Engineering / Code</option>
                    <option value="health">Health & Body</option>
                    <option value="mind">Mind & Reset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                    XP Weight (10–200)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white font-tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Standard (Full) Version
                </label>
                <input
                  type="text"
                  value={fullVersion}
                  onChange={(e) => setFullVersion(e.target.value)}
                  placeholder="e.g. 1 medium LeetCode problem solved + tested"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Minimum Viable Version (For low-energy days)
                </label>
                <input
                  type="text"
                  value={minimumVersion}
                  onChange={(e) => setMinimumVersion(e.target.value)}
                  placeholder="e.g. 10 minutes reading an editorial solution"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#1d1d1f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isKeystone}
                    onChange={(e) => setIsKeystone(e.target.checked)}
                    className="rounded border-black/20 text-[#1d1d1f]"
                  />
                  <span>Keystone Priority</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#1d1d1f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMinimumViable}
                    onChange={(e) => setIsMinimumViable(e.target.checked)}
                    className="rounded border-black/20 text-[#1d1d1f]"
                  />
                  <span>Include in MVD</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-button-primary px-5 py-2 text-xs font-medium"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
