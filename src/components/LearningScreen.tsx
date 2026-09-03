import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { LearningRoadmapItem } from '../types';
import { 
  Code, 
  Terminal, 
  Database, 
  Cpu, 
  FolderGit2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

export const LearningScreen: React.FC = () => {
  const { state, saveLearningItem, setScreen, startDeepWork } = useNour();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningRoadmapItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState<LearningRoadmapItem['track']>('backend_systems');
  const [currentMilestone, setCurrentMilestone] = useState('');
  const [hoursInvested, setHoursInvested] = useState(10);
  const [totalEstimatedHours, setTotalEstimatedHours] = useState(50);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setTrack('backend_systems');
    setCurrentMilestone('');
    setHoursInvested(0);
    setTotalEstimatedHours(40);
    setIsModalOpen(true);
  };

  const openEditModal = (item: LearningRoadmapItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setTrack(item.track);
    setCurrentMilestone(item.currentMilestone);
    setHoursInvested(item.hoursInvested);
    setTotalEstimatedHours(item.totalEstimatedHours);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const item: LearningRoadmapItem = {
      id: editingItem ? editingItem.id : `learn_${Date.now()}`,
      title: title.trim(),
      track,
      status: hoursInvested >= totalEstimatedHours ? 'completed' : hoursInvested > 0 ? 'in_progress' : 'not_started',
      currentMilestone: currentMilestone.trim() || 'Active Study & Code Execution',
      hoursInvested: Number(hoursInvested) || 0,
      totalEstimatedHours: Number(totalEstimatedHours) || 40
    };

    saveLearningItem(item);
    setIsModalOpen(false);
  };

  const getTrackIcon = (t: LearningRoadmapItem['track']) => {
    switch (t) {
      case 'cs_fundamentals':
        return <Terminal className="w-5 h-5 text-zinc-300" />;
      case 'python_mastery':
        return <Code className="w-5 h-5 text-zinc-300" />;
      case 'backend_systems':
        return <Database className="w-5 h-5 text-zinc-300" />;
      case 'ai_engineering':
        return <Cpu className="w-5 h-5 text-zinc-300" />;
      case 'production_projects':
        return <FolderGit2 className="w-5 h-5 text-zinc-300" />;
      default:
        return <BookOpen className="w-5 h-5 text-zinc-300" />;
    }
  };

  const totalLearningHours = state.learningItems.reduce((acc, i) => acc + i.hoursInvested, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            Technical Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-display font-semibold tracking-wide text-white mt-1">
            Software Engineering & AI Roadmap
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            "Know what I'm learning and keep moving." Total technical investment: {totalLearningHours} hours.
          </p>
        </div>

        <button
          id="add-learning-track-btn"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-xl tracking-wide uppercase transition-all shadow"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Roadmap Item</span>
        </button>
      </div>

      {/* Active Focus Card */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-700/80 p-6 sm:p-8 subtle-glow">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            CURRENT LEARNING PRIORITY
          </span>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
            IN ACTIVE ROTATION
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
          CS50: Memory Management, Pointers & System Architecture
        </h2>
        <p className="text-xs font-mono text-zinc-400 mt-2">
          Milestone: Week 4 memory allocation, pointer arithmetic in C, Valgrind leak tests.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">48 / 70 Hours Completed</span>
            <div className="w-32 h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="h-full bg-white" style={{ width: '68%' }} />
            </div>
          </div>

          <button
            onClick={() => {
              startDeepWork('CS50 Pointers & Memory Execution');
              setScreen('deep_work');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs font-mono rounded-lg transition-all"
          >
            <span>Launch Study Session</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Roadmap Items List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
          Roadmap Modules ({state.learningItems.length})
        </h3>

        <div className="space-y-3">
          {state.learningItems.map((item) => {
            const percent = Math.min(100, Math.round((item.hoursInvested / item.totalEstimatedHours) * 100));

            return (
              <div
                key={item.id}
                className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-5 space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0 mt-0.5">
                      {getTrackIcon(item.track)}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white">{item.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        Current: {item.currentMilestone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Progress bar & hours */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>{item.hoursInvested} / {item.totalEstimatedHours} hours</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-950 border border-zinc-800/80 overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-700 p-6 space-y-4 subtle-glow">
            <h3 className="text-lg font-medium text-white border-b border-zinc-800 pb-3">
              {editingItem ? 'Update Roadmap Module' : 'Add Roadmap Module'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Course or Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Docker Deployment"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Technical Track
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="cs_fundamentals">CS Fundamentals (Algorithms & Memory)</option>
                  <option value="python_mastery">Python Mastery (OOP & Async)</option>
                  <option value="backend_systems">Backend Engineering (FastAPI, Postgres)</option>
                  <option value="ai_engineering">AI Engineering (LLMs, Embeddings, Agents)</option>
                  <option value="production_projects">Production Software Projects</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Current Milestone / Deliverable
                </label>
                <input
                  type="text"
                  value={currentMilestone}
                  onChange={(e) => setCurrentMilestone(e.target.value)}
                  placeholder="e.g. Completing Section 3 test suite"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                    Hours Invested
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hoursInvested}
                    onChange={(e) => setHoursInvested(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                    Target Total Hours
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={totalEstimatedHours}
                    onChange={(e) => setTotalEstimatedHours(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
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
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
