import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    state, 
    saveUserSettings, 
    resetAllData, 
    exportJSON, 
    importJSON 
  } = useNour();

  const [name, setName] = useState(state.user.name);
  const [careerTrack, setCareerTrack] = useState(state.user.careerTrack);
  const [startDate, setStartDate] = useState(state.user.startDate);
  const [totalSeasonDays, setTotalSeasonDays] = useState(state.user.totalSeasonDays);
  
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserSettings({
      name: name.trim() || 'Nour',
      careerTrack: careerTrack.trim() || 'Software Engineering & AI',
      startDate: startDate || state.user.startDate,
      totalSeasonDays: Number(totalSeasonDays) || 180
    });
    setMessage('Settings updated successfully.');
    setTimeout(() => setMessage(null), 2500);
  };

  const handleExport = () => {
    const dataStr = exportJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded.');
    setTimeout(() => setMessage(null), 2500);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = importJSON(importText);
    if (ok) {
      setMessage('System state imported successfully.');
      setIsImporting(false);
      setImportText('');
      setTimeout(() => setMessage(null), 2500);
    } else {
      setMessage('Failed to parse JSON. Please verify schema.');
      setTimeout(() => setMessage(null), 3500);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset 6-Months System to initial baseline configuration?')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-black/10 p-6 sm:p-7 space-y-6 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
          <div>
            <div className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
              System Configuration
            </div>
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Settings & Data Management</h2>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className="p-3 rounded-xl bg-black/[0.04] text-xs font-medium text-center text-[#1d1d1f]">
            {message}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Operator & Season Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                Focus Track
              </label>
              <input
                type="text"
                value={careerTrack}
                onChange={(e) => setCareerTrack(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-4 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6e6e73] mb-1">
                Total Season Days
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={totalSeasonDays}
                onChange={(e) => setTotalSeasonDays(Number(e.target.value))}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none font-tabular-nums"
              />
            </div>
          </div>

          <button
            type="submit"
            className="apple-button-primary w-full py-2.5 text-xs font-medium"
          >
            Save Parameters
          </button>
        </form>

        {/* Data Persistence & Export/Import */}
        <div className="space-y-3 pt-4 border-t border-black/[0.06]">
          <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Data Portability & Backup
          </h3>
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            All missions, deep work logs, habits, and XP are stored locally. Export anytime to backup or migrate your data.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExport}
              className="apple-button-secondary flex items-center gap-2 px-3.5 py-2 text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <button
              onClick={() => setIsImporting(!isImporting)}
              className="apple-button-secondary flex items-center gap-2 px-3.5 py-2 text-xs font-medium"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
            </button>
          </div>

          {/* Import Textarea */}
          {isImporting && (
            <div className="space-y-2 pt-2">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste exported backup JSON here..."
                rows={4}
                className="w-full bg-black/[0.02] border border-black/[0.08] rounded-xl p-3 text-xs text-[#1d1d1f] focus:outline-none focus:border-black/30 font-mono"
              />
              <button
                onClick={handleImportSubmit}
                className="apple-button-primary px-4 py-2 text-xs font-medium"
              >
                Apply Import
              </button>
            </div>
          )}
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
          <div className="text-xs text-[#86868b]">
            Reset to sample defaults
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#86868b] hover:text-rose-600 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
