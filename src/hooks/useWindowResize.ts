/**
 * useWindowResize hook
 * Listens for window resize events from the main process and handles:
 * - Saving window bounds to storage
 * - Triggering mind map reflow
 * 
 * Requirements: 8.1, 8.2, 8.4
 */

import { useEffect, useState } from 'react';
import { IPC_CHANNELS, WindowResizedEvent } from '../types/ipc';
import { storageService } from '../services/StorageService';
import { Rectangle } from '../types/models';

/**
 * Hook to handle window resize events with debouncing
 * 
 * @returns Current window bounds
 */
export const useWindowResize = () => {
  const [windowBounds, setWindowBounds] = useState<Rectangle | null>(null);

  useEffect(() => {
    // Check if we're in Electron environment
    if (!window.ipcRenderer) {
      return;
    }

    let debounceTimer: NodeJS.Timeout | null = null;

    // Handler for window resize events with debouncing
    const handleWindowResize = (_event: any, data: WindowResizedEvent) => {
      const { bounds } = data;
      
      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Debounce the state update and storage save (300ms delay)
      debounceTimer = setTimeout(() => {
        // Update local state (triggers reflow in components that use this)
        setWindowBounds(bounds);
        
        // Save bounds to storage (Requirement 8.4)
        storageService.saveWindowBounds(bounds);
      }, 300);
    };

    // Listen for window resize events from main process
    window.ipcRenderer.on(IPC_CHANNELS.WINDOW_RESIZED, handleWindowResize);

    // Load initial window bounds
    const savedBounds = storageService.getWindowBounds();
    if (savedBounds) {
      setWindowBounds(savedBounds);
    }

    // Cleanup listener on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.ipcRenderer.off(IPC_CHANNELS.WINDOW_RESIZED, handleWindowResize);
    };
  }, []);

  return windowBounds;
};
