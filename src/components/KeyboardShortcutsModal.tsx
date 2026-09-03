import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Command, 
  Home, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Award, 
  RotateCcw, 
  Settings, 
  HelpCircle,
  CornerDownLeft
} from 'lucide-react';
import { ScreenType } from '../types';

interface ShortcutItem {
  keyLabel: string;
  alternateKey?: string;
  description: string;
  screenId?: ScreenType;
  actionType?: 'screen' | 'settings' | 'help' | 'escape';
  icon: React.ElementType;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenSettings: () => void;
}

const SHORTCUT_GROUPS: { groupName: string; items: ShortcutItem[] }[] = [
  {
    groupName: 'Screen Navigation',
    items: [
      {
        keyLabel: 'H',
        alternateKey: '1',
        description: 'Today / Home Screen',
        screenId: 'today',
        actionType: 'screen',
        icon: Home
      },
      {
        keyLabel: 'B',
        alternateKey: '2',
        description: 'Habits System',
        screenId: 'habits',
        actionType: 'screen',
        icon: CheckSquare
      },
      {
        keyLabel: 'D',
        alternateKey: '3',
        description: 'Deep Work Timer',
        screenId: 'deep_work',
        actionType: 'screen',
        icon: Clock
      },
      {
        keyLabel: 'P',
        alternateKey: '4',
        description: 'Progress & Season Analytics',
        screenId: 'progress',
        actionType: 'screen',
        icon: TrendingUp
      },
      {
        keyLabel: 'L',
        alternateKey: '5',
        description: 'Learning Roadmap',
        screenId: 'learning',
        actionType: 'screen',
        icon: BookOpen
      },
      {
        keyLabel: 'R',
        alternateKey: '6',
        description: 'Rewards & Financial Profile',
        screenId: 'rewards',
        actionType: 'screen',
        icon: Award
      },
      {
        keyLabel: 'C',
        alternateKey: '7',
        description: 'Recovery Protocol',
        screenId: 'recovery',
        actionType: 'screen',
        icon: RotateCcw
      }
    ]
  },
  {
    groupName: 'Controls & Modals',
    items: [
      {
        keyLabel: 'S',
        description: 'Toggle Settings & Backup',
        actionType: 'settings',
        icon: Settings
      },
      {
        keyLabel: '?',
        alternateKey: '/',
        description: 'Keyboard Shortcuts Legend',
        actionType: 'help',
        icon: HelpCircle
      },
      {
        keyLabel: 'Esc',
        description: 'Close Active Modal / Cheatsheet',
        actionType: 'escape',
        icon: CornerDownLeft
      }
    ]
  }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenSettings
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-7 z-10 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <Command className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-serif-display font-semibold text-white tracking-wide">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-xs font-mono text-zinc-400">
                    Instant single-key navigation across Nour OS
                  </p>
                </div>
              </div>

              <button
                id="close-shortcuts-modal-btn"
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Groups */}
            <div className="space-y-6">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.groupName} className="space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                    {group.groupName}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const handleClick = () => {
                        if (item.actionType === 'screen' && item.screenId) {
                          onNavigate(item.screenId);
                          onClose();
                        } else if (item.actionType === 'settings') {
                          onClose();
                          onOpenSettings();
                        } else if (item.actionType === 'escape') {
                          onClose();
                        }
                      };

                      return (
                        <button
                          key={item.keyLabel}
                          type="button"
                          onClick={handleClick}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/70 hover:border-zinc-700 text-left transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
                            <span className="text-xs text-zinc-300 group-hover:text-white truncate">
                              {item.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <kbd className="px-2 py-0.5 min-w-[24px] text-center rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] font-semibold text-zinc-200 shadow-xs">
                              {item.keyLabel}
                            </kbd>
                            {item.alternateKey && (
                              <>
                                <span className="text-[10px] font-mono text-zinc-500">/</span>
                                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60 font-mono text-[10px] text-zinc-400">
                                  {item.alternateKey}
                                </kbd>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Shortcuts are disabled while typing in text inputs</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                Press Esc to dismiss
              </kbd>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
