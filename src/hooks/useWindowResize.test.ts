/**
 * Tests for useWindowResize hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { storageService } from '../services/StorageService';

describe('useWindowResize', () => {
  let mockIpcRenderer: any;

  beforeEach(() => {
    // Clear storage before each test
    storageService.clearAll();
    
    // Mock ipcRenderer
    mockIpcRenderer = {
      on: vi.fn(),
      off: vi.fn(),
    };
    
    (global as any).window = {
      ...global.window,
      ipcRenderer: mockIpcRenderer,
    };
  });

  afterEach(() => {
    // Clean up
    delete (global as any).window.ipcRenderer;
  });

  it('should save window bounds to storage when provided', () => {
    const bounds = { x: 100, y: 100, width: 800, height: 600 };
    storageService.saveWindowBounds(bounds);

    const savedBounds = storageService.getWindowBounds();
    expect(savedBounds).toEqual(bounds);
  });

  it('should retrieve saved window bounds from storage', () => {
    const bounds = { x: 200, y: 200, width: 1024, height: 768 };
    storageService.saveWindowBounds(bounds);

    const retrievedBounds = storageService.getWindowBounds();
    expect(retrievedBounds).toEqual(bounds);
  });

  it('should return null when no bounds are saved', () => {
    const bounds = storageService.getWindowBounds();
    expect(bounds).toBeNull();
  });

  it('should update bounds when new bounds are saved', () => {
    const initialBounds = { x: 100, y: 100, width: 800, height: 600 };
    storageService.saveWindowBounds(initialBounds);

    const newBounds = { x: 300, y: 300, width: 1200, height: 900 };
    storageService.saveWindowBounds(newBounds);

    const savedBounds = storageService.getWindowBounds();
    expect(savedBounds).toEqual(newBounds);
  });
});
