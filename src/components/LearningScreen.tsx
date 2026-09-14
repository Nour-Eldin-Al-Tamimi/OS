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
  ArrowUpRight,
  BookOpen,
  X
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
        return <Terminal className="w-4 h-4 text-[#1d1d1f]" />;
      case 'python_mastery':
        return <Code className="w-4 h-4 text-[#1d1d1f]" />;
      case 'backend_systems':
        return <Database className="w-4 h-4 text-[#1d1d1f]" />;
      case 'ai_engineering':
        return <Cpu className="w-4 h-4 text-[#1d1d1f]" />;
      case 'production_projects':
        return <FolderGit2 className="w-4 h-4 text-[#1d1d1f]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#1d1d1f]" />;
    }
  };

  const totalLearningHours = state.learningItems.reduce((acc, i) => acc + i.hoursInvested, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
            Technical Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Software Engineering & AI Roadmap
          </h1>
          <p className="text-xs text-[#6e6e73] mt-1.5">
            Know what you are learning and keep moving. Total technical investment: <strong className="font-tabular-nums text-[#1d1d1f]">{totalLearningHours}h</strong>.
          </p>
        </div>

        <button
          id="add-learning-track-btn"
          onClick={openCreateModal}
          className="apple-button-primary flex items-center gap-2 px-4 py-2.5 text-xs font-medium self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Module</span>
        </button>
      </div>

      {/* Active Focus Card */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
            CURRENT PRIORITY
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-black/[0.05] text-[#1d1d1f]">
            ACTIVE ROTATION
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            CS50: Memory Management, Pointers & System Architecture
          </h2>
          <p className="text-xs text-[#6e6e73] mt-1.5">
            Milestone: Week 4 memory allocation, pointer arithmetic in C, Valgrind leak tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-tabular-nums text-[#86868b]">48 / 70 Hours Completed</span>
            <div className="w-32 h-2 rounded-full bg-black/[0.06] overflow-hidden">
              <div className="h-full bg-[#1d1d1f] rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          <button
            onClick={() => {
              startDeepWork({
                focusArea: 'CS50 Pointers & Memory Execution',
                area: 'Learning',
                category: 'CS50'
              });
              setScreen('deep_work');
            }}
            className="apple-button-secondary flex items-center gap-2 px-4 py-2 text-xs font-medium"
          >
            <span>Launch Study Session</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Roadmap Items List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
          Roadmap Modules ({state.learningItems.length})
        </h3>

        <div className="space-y-2.5">
          {state.learningItems.map((item) => {
            const percent = Math.min(100, Math.round((item.hoursInvested / item.totalEstimatedHours) * 100));

            return (
              <div
                key={item.id}
                className="apple-card p-5 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-black/[0.03] text-[#1d1d1f] shrink-0 mt-0.5">
                      {getTrackIcon(item.track)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">{item.title}</h4>
                      <p className="text-xs text-[#86868b] mt-0.5">
                        Current: {item.currentMilestone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] px-3 py-1.5 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Progress bar & hours */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-tabular-nums text-[#86868b]">
                    <span>{item.hoursInvested} / {item.totalEstimatedHours} hours</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.05] overflow-hidden">
                    <div 
                      className="h-full bg-[#1d1d1f] rounded-full transition-all duration-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-black/10 p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">
                {editingItem ? 'Update Roadmap Module' : 'Add Roadmap Module'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#86868b] hover:text-[#1d1d1f] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Course or Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Docker Deployment"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Technical Track
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value as any)}
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none"
                >
                  <option value="cs_fundamentals">CS Fundamentals (Algorithms & Memory)</option>
                  <option value="python_mastery">Python Mastery (OOP & Async)</option>
                  <option value="backend_systems">Backend Engineering (FastAPI, Postgres)</option>
                  <option value="ai_engineering">AI Engineering (LLMs, Embeddings, Agents)</option>
                  <option value="production_projects">Production Software Projects</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                  Current Milestone / Deliverable
                </label>
                <input
                  type="text"
                  value={currentMilestone}
                  onChange={(e) => setCurrentMilestone(e.target.value)}
                  placeholder="e.g. Completing Section 3 test suite"
                  className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                    Hours Invested
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hoursInvested}
                    onChange={(e) => setHoursInvested(Number(e.target.value))}
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none font-tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                    Target Total Hours
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={totalEstimatedHours}
                    onChange={(e) => setTotalEstimatedHours(Number(e.target.value))}
                    className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none font-tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/[0.06]">
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
