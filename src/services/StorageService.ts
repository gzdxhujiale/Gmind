/**
 * StorageService - Handles persistence of application data using localStorage
 * 
 * This service provides methods to save and retrieve:
 * - Folder paths
 * - User preferences (toolbar settings)
 * - Window bounds
 */

import { UserPreferences, Rectangle } from '../types/models';

/**
 * Storage keys used in localStorage
 */
const STORAGE_KEYS = {
  FOLDER_PATH: 'markdown-mindmap-viewer:folder-path',
  PREFERENCES: 'markdown-mindmap-viewer:preferences',
  WINDOW_BOUNDS: 'markdown-mindmap-viewer:window-bounds',
} as const;

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  toolbarVisible: true,
  toolbarPosition: 'top',
  hideOutlineTitle: true,
  outlineMode: 'preview',
};

/**
 * StorageService class for managing localStorage operations
 */
export class StorageService {
  /**
   * Save folder path to localStorage
   * @param path - The folder path to persist
   */
  saveFolderPath(path: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDER_PATH, path);
    } catch (error) {
      console.error('Failed to save folder path:', error);
      throw new Error('Failed to save folder path to storage');
    }
  }

  /**
   * Retrieve folder path from localStorage
   * @returns The persisted folder path or null if not found
   */
  getFolderPath(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.FOLDER_PATH);
    } catch (error) {
      console.error('Failed to get folder path:', error);
      return null;
    }
  }

  /**
   * Save user preferences to localStorage
   * @param prefs - The user preferences to persist
   */
  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw new Error('Failed to save preferences to storage');
    }
  }

  /**
   * Retrieve user preferences from localStorage
   * @returns The persisted preferences or default preferences if not found
   */
  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!stored) {
        return DEFAULT_PREFERENCES;
      }

      const parsed = JSON.parse(stored) as UserPreferences;

      // Validate the parsed preferences
      if (typeof parsed.toolbarVisible !== 'boolean') {
        return DEFAULT_PREFERENCES;
      }

      const validPositions = ['top', 'bottom', 'left', 'right'];
      if (!validPositions.includes(parsed.toolbarPosition)) {
        return DEFAULT_PREFERENCES;
      }

      const validOutlineModes = ['preview', 'edit'];
      if (parsed.outlineMode && !validOutlineModes.includes(parsed.outlineMode)) {
        return DEFAULT_PREFERENCES;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save window bounds to localStorage
   * @param bounds - The window bounds to persist
   */
  saveWindowBounds(bounds: Rectangle): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WINDOW_BOUNDS, JSON.stringify(bounds));
    } catch (error) {
      console.error('Failed to save window bounds:', error);
      throw new Error('Failed to save window bounds to storage');
    }
  }

  /**
   * Retrieve window bounds from localStorage
   * @returns The persisted window bounds or null if not found
   */
  getWindowBounds(): Rectangle | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WINDOW_BOUNDS);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as Rectangle;

      // Validate the parsed bounds
      if (
        typeof parsed.x !== 'number' ||
        typeof parsed.y !== 'number' ||
        typeof parsed.width !== 'number' ||
        typeof parsed.height !== 'number'
      ) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to get window bounds:', error);
      return null;
    }
  }

  /**
   * Clear all stored data (useful for testing or reset)
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FOLDER_PATH);
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      localStorage.removeItem(STORAGE_KEYS.WINDOW_BOUNDS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

/**
 * Singleton instance of StorageService
 */
export const storageService = new StorageService();

