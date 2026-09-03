import React, { useState } from 'react';
import { useNour } from '../context/NourContext';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  FileText, 
  ShieldCheck 
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
    link.download = `nour_os_backup_${new Date().toISOString().slice(0, 10)}.json`;
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
    if (window.confirm('Reset NOUR OS to initial baseline configuration?')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-700 p-6 sm:p-8 space-y-6 subtle-glow my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              System Control
            </div>
            <h2 className="text-xl font-medium text-white">Settings & Data Integrity</h2>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-center text-zinc-200">
            {message}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            User & Season Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Operator Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Career Track
              </label>
              <input
                type="text"
                value={careerTrack}
                onChange={(e) => setCareerTrack(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Season 01 Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Total Season Days
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={totalSeasonDays}
                onChange={(e) => setTotalSeasonDays(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-xs font-mono uppercase tracking-wider rounded-xl transition-all"
          >
            Save Parameters
          </button>
        </form>

        {/* Data Persistence & Export/Import */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            Data Portability & Backup
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            NOUR OS stores all missions, deep work logs, habits, and XP locally in your browser. Export anytime to back up your progress.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <button
              onClick={() => setIsImporting(!isImporting)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition-colors"
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
                placeholder="Paste exported NOUR OS JSON here..."
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
              />
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-mono font-semibold hover:bg-white transition-all"
              >
                Apply Import
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone: Reset */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-400">
            Reset all state to realistic sample defaults
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
