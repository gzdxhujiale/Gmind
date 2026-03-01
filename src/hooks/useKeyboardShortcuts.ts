/**
 * Custom hook for handling keyboard shortcuts via IPC
 * Listens for keyboard shortcut events from the main process
 * Requirements: 6.1, 6.3, 6.4, 7.1
 */

import { useEffect } from 'react';
import { IPC_CHANNELS, KeyboardShortcutEvent } from '../types/ipc';
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
    // Check if we're in Electron environment
    if (!window.ipcRenderer) {
      console.warn('IPC not available - not running in Electron');
      return;
    }

    /**
     * Handle keyboard shortcut events from main process
     */
    const handleKeyboardShortcut = (_event: Electron.IpcRendererEvent, data: KeyboardShortcutEvent) => {
      console.log('Keyboard shortcut received:', data);

      if (data.action === 'tab-switch' && data.tabIndex !== undefined) {
        // Tab switching: Ctrl+1 to Ctrl+9
        // Convert 1-based index to 0-based
        const tabIndex = data.tabIndex - 1;

        // Get current tabs from store
        const tabs = useAppStore.getState().tabs;
        const setActiveTab = useAppStore.getState().setActiveTab;

        // Requirement 6.1: Switch to corresponding tab by index
        // Requirement 6.2: Ignore input for non-existent tabs (handled by setActiveTab)
        if (tabIndex >= 0 && tabIndex < tabs.length) {
          setActiveTab(tabIndex);
          console.log(`Switched to tab ${data.tabIndex} (index ${tabIndex})`);
        } else {
          console.log(`Tab ${data.tabIndex} does not exist (only ${tabs.length} tabs available)`);
        }
      } else if (data.action === 'hide-to-tray') {
        // Hide to tray: Ctrl+0
        // Requirement 7.1: Minimize to system tray
        console.log('Hide to tray triggered');
        
        // The main process already handles hiding via the callback
        // But we also invoke it here to ensure it works
        window.ipcRenderer.invoke(IPC_CHANNELS.HIDE_WINDOW).catch((error) => {
          console.error('Error hiding window:', error);
        });
      } else if (data.action === 'toolbar-position' && data.position) {
        // Toolbar position: Ctrl+Arrow keys
        const setToolbarPosition = useAppStore.getState().setToolbarPosition;
        setToolbarPosition(data.position);
        console.log(`Toolbar position changed to ${data.position}`);
      } else if (data.action === 'toolbar-visibility' && data.visibility) {
        // Toolbar visibility: Ctrl+- (hide) or Ctrl++ (show)
        const { toolbarVisible, toggleToolbar } = useAppStore.getState();
        
        if (data.visibility === 'hide' && toolbarVisible) {
          toggleToolbar();
          console.log('Toolbar hidden');
        } else if (data.visibility === 'show' && !toolbarVisible) {
          toggleToolbar();
          console.log('Toolbar shown');
        }
      }
    };

    // Register the listener
    window.ipcRenderer.on(IPC_CHANNELS.KEYBOARD_SHORTCUT, handleKeyboardShortcut);

    console.log('Keyboard shortcuts listener registered');

    // Cleanup: Remove listener on unmount
    return () => {
      window.ipcRenderer.off(IPC_CHANNELS.KEYBOARD_SHORTCUT, handleKeyboardShortcut);
      console.log('Keyboard shortcuts listener unregistered');
    };
  }, []); // Only register once on mount
}
