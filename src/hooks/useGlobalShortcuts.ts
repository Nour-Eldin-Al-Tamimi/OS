import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { ScreenType } from '../types';

interface UseGlobalShortcutsOptions {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: Dispatch<SetStateAction<boolean>>;
}

export interface ShortcutToast {
  message: string;
  keyLabel: string;
}

export const useGlobalShortcuts = ({
  currentScreen,
  onNavigate,
  isSettingsOpen,
  setIsSettingsOpen,
  isShortcutsOpen,
  setIsShortcutsOpen
}: UseGlobalShortcutsOptions) => {
  const [toast, setToast] = useState<ShortcutToast | null>(null);

  const showToast = useCallback((message: string, keyLabel: string) => {
    setToast({ message, keyLabel });
    const timer = setTimeout(() => {
      setToast(null);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Never intercept when typing inside text inputs, textareas, or editable elements
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      // Handle Escape even if focused in an input to blur/dismiss
      if (e.key === 'Escape') {
        if (isInput && target) {
          target.blur();
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
          return;
        }
        return;
      }

      if (isInput) return;

      // 2. Do not intercept if browser modifier keys (Cmd, Ctrl, Alt) are active
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // 3. Navigation shortcuts
      switch (key) {
        // Home / Today Screen
        case 'h':
        case '1': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('today');
          showToast('Today / Home Screen', key.toUpperCase());
          break;
        }

        // Progress Screen
        case 'p':
        case '4': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('progress');
          showToast('Season Progress & Trajectory', key.toUpperCase());
          break;
        }

        // Settings Modal
        case 's': {
          e.preventDefault();
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          setIsSettingsOpen(prev => !prev);
          showToast(isSettingsOpen ? 'Closed Settings' : 'Settings & Backup', 'S');
          break;
        }

        // Habits Screen
        case 'b':
        case '2': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('habits');
          showToast('Habits System', key.toUpperCase());
          break;
        }

        // Deep Work Screen
        case 'd':
        case '3': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('deep_work');
          showToast('Deep Work Chamber', key.toUpperCase());
          break;
        }

        // Learning Roadmap Screen
        case 'l':
        case '5': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('learning');
          showToast('Learning Roadmap', key.toUpperCase());
          break;
        }

        // Rewards & Finance Screen
        case 'r':
        case '6': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('rewards');
          showToast('Rewards & Financial Profile', key.toUpperCase());
          break;
        }

        // Recovery Protocol Screen
        case 'c':
        case '7': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          if (isShortcutsOpen) setIsShortcutsOpen(false);
          onNavigate('recovery');
          showToast('Recovery Protocol', key.toUpperCase());
          break;
        }

        // Cheatsheet Help Modal
        case '?':
        case '/': {
          e.preventDefault();
          if (isSettingsOpen) setIsSettingsOpen(false);
          setIsShortcutsOpen(prev => !prev);
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentScreen,
    onNavigate,
    isSettingsOpen,
    setIsSettingsOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    showToast
  ]);

  return {
    toast
  };
};
