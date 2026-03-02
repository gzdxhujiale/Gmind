import { useEffect, useState } from 'react';
import { Rectangle } from '../types/models';
import { storageService } from '../services/StorageService';

/**
 * Hook to handle window resize events with debouncing
 * 
 * @returns Current window bounds
 */
export const useWindowResize = () => {
  const [windowBounds, setWindowBounds] = useState<Rectangle | null>(null);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let unlisten: () => void;

    const setupListener = async () => {
      const { Window } = await import('@tauri-apps/api/window');
      const appWindow = Window.getCurrent();

      // Listen for window resize events
      unlisten = await appWindow.onResized(({ payload: size }) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          try {
            const pos = await appWindow.innerPosition();
            const bounds = {
              width: size.width,
              height: size.height,
              x: pos.x,
              y: pos.y
            };

            setWindowBounds(bounds);
            // Storage sync is handled automatically by tauri-plugin-window-state, 
            // but we can still save to our own storage if needed
            storageService.saveWindowBounds(bounds);
          } catch (e) {
            console.error("Failed to get window bounds", e);
          }
        }, 300);
      });
    };

    setupListener();

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
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return windowBounds;
};
