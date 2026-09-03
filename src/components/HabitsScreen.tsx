import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { Habit, HabitCategory } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  Star, 
  Check, 
  X, 
  ArrowUpDown,
  Sparkles,
  Sliders
} from 'lucide-react';

export const HabitsScreen: React.FC = () => {
  const { state, saveHabit, deleteHabit, reorderHabits } = useNour();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            Habit Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
            Keystone & Core Habits
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Small set of high-leverage habits with pre-defined Minimum Versions.
          </p>
        </div>

        <button
          id="add-new-habit-btn"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-xl tracking-wide uppercase transition-all shadow"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Keystone Habits Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-zinc-300" />
          <h2 className="text-xs font-mono tracking-widest text-zinc-300 uppercase">
            Keystone Habits ({keystoneHabits.length})
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          The non-negotiable anchors of your routine. These create positive cascading effects on the rest of your day.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {keystoneHabits.map((habit) => (
            <div
              key={habit.id}
              className="rounded-xl bg-zinc-950 border border-zinc-700/80 p-5 space-y-3 subtle-glow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-white">{habit.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                      KEYSTONE
                    </span>
                    {habit.isMinimumViable && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-amber-950/40 text-amber-300 border border-amber-500/30">
                        MVD READY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{habit.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-zinc-300 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded">
                    +{habit.xp} XP
                  </span>
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                    title="Edit habit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Versions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800/80 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase">Standard Version:</span>
                  <span className="text-zinc-200 mt-0.5 block">{habit.fullVersion}</span>
                </div>
                <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase">Minimum Viable Version:</span>
                  <span className="text-amber-200/90 mt-0.5 block">{habit.minimumVersion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supporting Core Habits Section */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono tracking-widest text-zinc-300 uppercase">
            Supporting Core Habits ({coreHabits.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {coreHabits.map((habit) => (
            <div
              key={habit.id}
              className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-zinc-200">{habit.name}</h3>
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    &bull; {habit.category}
                  </span>
                  {habit.isMinimumViable && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                      MVD
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{habit.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-zinc-400">
                  +{habit.xp} XP
                </span>
                <button
                  onClick={() => openEditModal(habit)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                  title="Edit habit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-700 p-6 space-y-5 subtle-glow">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-medium text-white">
                {editingHabit ? 'Edit Habit Specification' : 'Add New Habit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily LeetCode / Algorithmic Problem"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Purpose / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sharpens data structure intuition before interviews"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="discipline">Discipline</option>
                    <option value="engineering">Engineering / Code</option>
                    <option value="health">Health & Body</option>
                    <option value="mind">Mind & Reset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                    XP Weight (10–200)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Standard (Full) Version
                </label>
                <input
                  type="text"
                  value={fullVersion}
                  onChange={(e) => setFullVersion(e.target.value)}
                  placeholder="e.g. 1 medium LeetCode problem solved + tested"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Minimum Viable Version (For low-energy days)
                </label>
                <input
                  type="text"
                  value={minimumVersion}
                  onChange={(e) => setMinimumVersion(e.target.value)}
                  placeholder="e.g. 10 minutes reading an editorial solution"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isKeystone}
                    onChange={(e) => setIsKeystone(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-white"
                  />
                  <span>Keystone Priority</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMinimumViable}
                    onChange={(e) => setIsMinimumViable(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-white"
                  />
                  <span>Include in MVD</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg transition-all"
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
