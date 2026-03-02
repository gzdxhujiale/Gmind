/**
 * Tests for useWindowResize hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { storageService } from '../services/StorageService';

// Mock Tauri window API
const mockOnResized = vi.fn();
const mockInnerPosition = vi.fn().mockResolvedValue({ x: 0, y: 0 });

vi.mock('@tauri-apps/api/window', () => ({
  Window: {
    getCurrent: () => ({
      onResized: mockOnResized,
      innerPosition: mockInnerPosition
    })
  }
}));

describe('useWindowResize', () => {
  beforeEach(() => {
    // Clear storage before each test
    storageService.clearAll();
    mockOnResized.mockClear();
    mockInnerPosition.mockClear();
  });

  afterEach(() => {
    // Clean up
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
