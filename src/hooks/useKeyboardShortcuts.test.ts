/**
 * Tests for useKeyboardShortcuts hook
 * Requirements: 6.1, 6.3, 6.4, 7.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useAppStore } from '../store/useAppStore';
import { IPC_CHANNELS } from '../types/ipc';

// Mock the window.ipcRenderer
const mockIpcRenderer = {
  on: vi.fn(),
  off: vi.fn(),
  invoke: vi.fn(),
  send: vi.fn(),
};

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window.ipcRenderer
    (window as any).ipcRenderer = mockIpcRenderer;
    
    // Reset store
    useAppStore.setState({
      tabs: [
        { id: 'tab-1', filename: 'file1', filePath: '/path/file1.md', headingTree: null, isActive: true },
        { id: 'tab-2', filename: 'file2', filePath: '/path/file2.md', headingTree: null, isActive: false },
        { id: 'tab-3', filename: 'file3', filePath: '/path/file3.md', headingTree: null, isActive: false },
      ],
      activeTabIndex: 0,
    });
  });

  it('should register IPC listener on mount', () => {
    renderHook(() => useKeyboardShortcuts());
    
    expect(mockIpcRenderer.on).toHaveBeenCalledWith(
      IPC_CHANNELS.KEYBOARD_SHORTCUT,
      expect.any(Function)
    );
  });

  it('should unregister IPC listener on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    
    unmount();
    
    expect(mockIpcRenderer.off).toHaveBeenCalledWith(
      IPC_CHANNELS.KEYBOARD_SHORTCUT,
      expect.any(Function)
    );
  });

  it('should handle tab switch shortcut', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Get the registered callback
    const callback = mockIpcRenderer.on.mock.calls[0][1];
    
    // Simulate tab switch event (Ctrl+2)
    callback({}, { action: 'tab-switch', tabIndex: 2, shortcut: 'Ctrl+2' });
    
    // Verify active tab changed
    const state = useAppStore.getState();
    expect(state.activeTabIndex).toBe(1); // 0-based index
  });

  it('should ignore tab switch for non-existent tabs', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const callback = mockIpcRenderer.on.mock.calls[0][1];
    
    // Simulate tab switch event for non-existent tab (Ctrl+9)
    callback({}, { action: 'tab-switch', tabIndex: 9, shortcut: 'Ctrl+9' });
    
    // Verify active tab did not change
    const state = useAppStore.getState();
    expect(state.activeTabIndex).toBe(0); // Still on first tab
  });

  it('should handle hide to tray shortcut', () => {
    mockIpcRenderer.invoke.mockResolvedValue(undefined);
    
    renderHook(() => useKeyboardShortcuts());
    
    const callback = mockIpcRenderer.on.mock.calls[0][1];
    
    // Simulate hide to tray event (Ctrl+0)
    callback({}, { action: 'hide-to-tray', shortcut: 'Ctrl+0' });
    
    // Verify hide window was invoked
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.HIDE_WINDOW);
  });

  it('should not register listener if ipcRenderer is not available', () => {
    // Remove ipcRenderer
    delete (window as any).ipcRenderer;
    
    renderHook(() => useKeyboardShortcuts());
    
    // Should not have called on
    expect(mockIpcRenderer.on).not.toHaveBeenCalled();
  });
});
