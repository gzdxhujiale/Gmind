/**
 * Unit tests for StorageService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './StorageService';
import { UserPreferences, Rectangle } from '../types/models';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storageService = new StorageService();
  });

  describe('Folder Path Operations', () => {
    it('should save and retrieve folder path', () => {
      const testPath = '/home/user/documents';
      
      storageService.saveFolderPath(testPath);
      const retrieved = storageService.getFolderPath();
      
      expect(retrieved).toBe(testPath);
    });

    it('should return null when no folder path is stored', () => {
      const retrieved = storageService.getFolderPath();
      expect(retrieved).toBeNull();
    });

    it('should update folder path when saved multiple times', () => {
      storageService.saveFolderPath('/path/one');
      storageService.saveFolderPath('/path/two');
      
      const retrieved = storageService.getFolderPath();
      expect(retrieved).toBe('/path/two');
    });
  });

  describe('Preferences Operations', () => {
    it('should save and retrieve preferences', () => {
      const testPrefs: UserPreferences = {
        toolbarVisible: false,
        toolbarPosition: 'bottom',
      };
      
      storageService.savePreferences(testPrefs);
      const retrieved = storageService.getPreferences();
      
      expect(retrieved).toEqual(testPrefs);
    });

    it('should return default preferences when none are stored', () => {
      const retrieved = storageService.getPreferences();
      
      expect(retrieved).toEqual({
        toolbarVisible: true,
        toolbarPosition: 'top',
      });
    });

    it('should update preferences when saved multiple times', () => {
      const prefs1: UserPreferences = {
        toolbarVisible: true,
        toolbarPosition: 'left',
      };
      const prefs2: UserPreferences = {
        toolbarVisible: false,
        toolbarPosition: 'right',
      };
      
      storageService.savePreferences(prefs1);
      storageService.savePreferences(prefs2);
      
      const retrieved = storageService.getPreferences();
      expect(retrieved).toEqual(prefs2);
    });

    it('should handle preferences with window bounds', () => {
      const testPrefs: UserPreferences = {
        toolbarVisible: true,
        toolbarPosition: 'top',
        windowBounds: { x: 100, y: 100, width: 800, height: 600 },
      };
      
      storageService.savePreferences(testPrefs);
      const retrieved = storageService.getPreferences();
      
      expect(retrieved).toEqual(testPrefs);
    });
  });

  describe('Window Bounds Operations', () => {
    it('should save and retrieve window bounds', () => {
      const testBounds: Rectangle = {
        x: 50,
        y: 50,
        width: 1024,
        height: 768,
      };
      
      storageService.saveWindowBounds(testBounds);
      const retrieved = storageService.getWindowBounds();
      
      expect(retrieved).toEqual(testBounds);
    });

    it('should return null when no window bounds are stored', () => {
      const retrieved = storageService.getWindowBounds();
      expect(retrieved).toBeNull();
    });

    it('should update window bounds when saved multiple times', () => {
      const bounds1: Rectangle = { x: 0, y: 0, width: 800, height: 600 };
      const bounds2: Rectangle = { x: 100, y: 100, width: 1200, height: 900 };
      
      storageService.saveWindowBounds(bounds1);
      storageService.saveWindowBounds(bounds2);
      
      const retrieved = storageService.getWindowBounds();
      expect(retrieved).toEqual(bounds2);
    });
  });

  describe('Clear Operations', () => {
    it('should clear all stored data', () => {
      // Store some data
      storageService.saveFolderPath('/test/path');
      storageService.savePreferences({
        toolbarVisible: false,
        toolbarPosition: 'bottom',
      });
      storageService.saveWindowBounds({ x: 0, y: 0, width: 800, height: 600 });
      
      // Clear all
      storageService.clearAll();
      
      // Verify all data is cleared
      expect(storageService.getFolderPath()).toBeNull();
      expect(storageService.getPreferences()).toEqual({
        toolbarVisible: true,
        toolbarPosition: 'top',
      });
      expect(storageService.getWindowBounds()).toBeNull();
    });
  });
});

