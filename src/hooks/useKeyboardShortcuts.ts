/**
 * Custom hook for handling keyboard shortcuts via IPC
 * Listens for keyboard shortcut events from the main process
 * Requirements: 6.1, 6.3, 6.4, 7.1
 */

import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook to set up IPC listeners for keyboard shortcuts
 * 
 * Handles:
 * - Tab switching (Ctrl+1 to Ctrl+9)
 * - Hide to tray (Ctrl+0)
 * - Updates application state based on shortcuts
 * - Provides visual feedback for active tab
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    // We replace the Electron IPC shortcuts with standard web KeyboardEvent listeners
    // Alternatively, this could be done via tauri-plugin-global-shortcut if background listening is needed
    // But since these are app-specific (tabs, toolbar), window listener is sufficient.

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Check for Ctrl or Cmd key
      if (!e.ctrlKey && !e.metaKey) return;

      const key = e.key.toLowerCase();
      const num = parseInt(key);

      // Hide to tray: Ctrl+0
      if (key === '0') {
        e.preventDefault();
        console.log('Hide to tray triggered');
        const { Window } = await import('@tauri-apps/api/window');
        Window.getCurrent().hide().catch(console.error);
        return;
      }

      // Tab switching: Ctrl+1 to Ctrl+9
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        const tabIndex = num - 1;
        const tabs = useAppStore.getState().tabs;
        const setActiveTab = useAppStore.getState().setActiveTab;

        if (tabIndex >= 0 && tabIndex < tabs.length) {
          setActiveTab(tabIndex);
          console.log(`Switched to tab ${num} (index ${tabIndex})`);
        }
        return;
      }

      // Toolbar position: Ctrl+Arrow keys
      if (key.startsWith('arrow')) {
        e.preventDefault();
        const setToolbarPosition = useAppStore.getState().setToolbarPosition;

        switch (key) {
          case 'arrowup': setToolbarPosition('top'); break;
          case 'arrowdown': setToolbarPosition('bottom'); break;
          case 'arrowleft': setToolbarPosition('left'); break;
          case 'arrowright': setToolbarPosition('right'); break;
        }
        return;
      }

      // Toolbar visibility: Ctrl+- (hide) or Ctrl+= (show)
      if (key === '-' || key === '_' || key === '=' || key === '+') {
        e.preventDefault();
        const { toolbarVisible, toggleToolbar } = useAppStore.getState();

        const shouldHide = key === '-' || key === '_';
        if ((shouldHide && toolbarVisible) || (!shouldHide && !toolbarVisible)) {
          toggleToolbar();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    console.log('Keyboard shortcuts listener registered');

    // Cleanup: Remove listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log('Keyboard shortcuts listener unregistered');
    };
  }, []); // Only register once on mount
}
