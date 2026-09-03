import React, { useState, useEffect } from 'react';
import { useNour } from '../context/NourContext';
import { getPreMigrationBackup } from '../utils/migration';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  FileText, 
  ShieldCheck,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  LogIn,
  Copy,
  CheckCheck
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
    importJSON,
    currentUser,
    syncStatus,
    syncError,
    lastSyncedAt,
    signInWithCloud,
    signOutCloud,
    forceCloudSync,
    restorePreMigrationBackup
  } = useNour();

  const [name, setName] = useState(state.user.name);
  const [careerTrack, setCareerTrack] = useState(state.user.careerTrack);
  const [startDate, setStartDate] = useState(state.user.startDate);
  const [totalSeasonDays, setTotalSeasonDays] = useState(state.user.totalSeasonDays);
  
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasBackup, setHasBackup] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setHasBackup(!!getPreMigrationBackup());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleCopyJSON = async () => {
    try {
      const data = exportJSON();
      await navigator.clipboard.writeText(data);
      setIsCopied(true);
      setMessage('State JSON copied to clipboard.');
      setTimeout(() => setIsCopied(false), 2500);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('Could not copy to clipboard.');
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleRestorePreMigration = () => {
    if (window.confirm('Restore your pre-cloud migration safety snapshot? This will reload your saved local state.')) {
      const success = restorePreMigrationBackup();
      if (success) {
        setMessage('Safety snapshot restored successfully.');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('No pre-migration snapshot available.');
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleCloudSignIn = async () => {
    try {
      await signInWithCloud();
      setMessage('Authenticated with Google. Cloud sync initialized.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setMessage(`Authentication error: ${msg}`);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleCloudSignOut = async () => {
    try {
      await signOutCloud();
      setMessage('Signed out of cloud account. Operating in local mode.');
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage('Sign out failed.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCloudForceSync = async () => {
    setMessage('Synchronizing with Firestore...');
    await forceCloudSync();
    setMessage('Synced to Cloud Firestore.');
    setTimeout(() => setMessage(null), 2500);
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
            <h2 className="text-xl font-medium text-white">Settings & Persistence</h2>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            title="Close (Esc)"
            className="flex items-center gap-1.5 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400">
              Esc
            </kbd>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-center text-zinc-200">
            {message}
          </div>
        )}

        {/* Cloud Persistence & Multi-Device Sync */}
        <div className="space-y-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono tracking-widest text-zinc-200 uppercase font-semibold">
                Cloud Sync & Storage (Firestore)
              </h3>
            </div>
            {currentUser && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                syncStatus === 'synced' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                syncStatus === 'syncing' ? 'bg-sky-950 text-sky-300 border border-sky-800/60 animate-pulse' :
                syncStatus === 'offline' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                'bg-rose-950 text-rose-300 border border-rose-800/60'
              }`}>
                {syncStatus}
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-950/80 border border-zinc-850 rounded-lg text-xs font-mono">
                <div>
                  <div className="text-zinc-400">Authenticated as:</div>
                  <div className="text-white font-medium truncate max-w-xs">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  {lastSyncedAt && (
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Last synchronized: {lastSyncedAt.toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="cloud-force-sync-btn"
                    onClick={handleCloudForceSync}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-mono transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Now</span>
                  </button>
                  <button
                    id="cloud-sign-out-btn"
                    onClick={handleCloudSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-300 rounded-lg text-xs font-mono transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {syncError && (
                <div className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect your Google account to sync your missions, habits, deep work logs, and XP across all your computers and devices in real-time via Cloud Firestore.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="cloud-sign-in-btn"
                  onClick={handleCloudSignIn}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
                <div className="text-[11px] font-mono text-zinc-400">
                  Existing local data will be safely migrated.
                </div>
              </div>
            </div>
          )}
        </div>

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
            Export a full JSON snapshot anytime for physical backups or manual archival.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition-colors"
            >
              {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={() => setIsImporting(!isImporting)}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-mono transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
            </button>

            {hasBackup && (
              <button
                onClick={handleRestorePreMigration}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-850 border border-amber-900/50 text-amber-300 rounded-xl text-xs font-mono transition-colors"
                title="Restore snapshot created before cloud synchronization"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Rollback Pre-Cloud Snapshot</span>
              </button>
            )}
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
            Reset all state to initial baseline configuration
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
