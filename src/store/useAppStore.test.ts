/**
 * Unit tests for Zustand application store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import { MarkdownFile } from '../types/models';

describe('useAppStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useAppStore.setState({
      selectedFolder: null,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'top',
      popupVisible: false,
      popupContent: null,
    });
  });

  describe('setSelectedFolder', () => {
    it('should set the selected folder path', () => {
      const testPath = '/test/folder/path';
      
      useAppStore.getState().setSelectedFolder(testPath);
      
      expect(useAppStore.getState().selectedFolder).toBe(testPath);
    });
  });

  describe('loadMarkdownFiles', () => {
    it('should load markdown files and create tabs', () => {
      const files: MarkdownFile[] = [
        { name: 'file1.md', path: '/path/file1.md', content: '# Test 1' },
        { name: 'file2.md', path: '/path/file2.md', content: '# Test 2' },
      ];

      useAppStore.getState().loadMarkdownFiles(files);

      const state = useAppStore.getState();
      expect(state.markdownFiles).toEqual(files);
      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[0].filename).toBe('file1'); // .md removed
      expect(state.tabs[1].filename).toBe('file2'); // .md removed
      expect(state.activeTabIndex).toBe(0);
      expect(state.tabs[0].isActive).toBe(true);
      expect(state.tabs[1].isActive).toBe(false);
    });

    it('should handle empty file list', () => {
      useAppStore.getState().loadMarkdownFiles([]);

      const state = useAppStore.getState();
      expect(state.markdownFiles).toEqual([]);
      expect(state.tabs).toEqual([]);
      expect(state.activeTabIndex).toBe(-1);
    });
  });

  describe('setActiveTab', () => {
    beforeEach(() => {
      const files: MarkdownFile[] = [
        { name: 'file1.md', path: '/path/file1.md', content: '# Test 1' },
        { name: 'file2.md', path: '/path/file2.md', content: '# Test 2' },
        { name: 'file3.md', path: '/path/file3.md', content: '# Test 3' },
      ];
      useAppStore.getState().loadMarkdownFiles(files);
    });

    it('should set the active tab by index', () => {
      useAppStore.getState().setActiveTab(1);

      const state = useAppStore.getState();
      expect(state.activeTabIndex).toBe(1);
      expect(state.tabs[0].isActive).toBe(false);
      expect(state.tabs[1].isActive).toBe(true);
      expect(state.tabs[2].isActive).toBe(false);
    });

    it('should ignore invalid tab index (negative)', () => {
      useAppStore.getState().setActiveTab(-1);

      const state = useAppStore.getState();
      expect(state.activeTabIndex).toBe(0); // Should remain unchanged
      expect(state.tabs[0].isActive).toBe(true);
    });

    it('should ignore invalid tab index (out of bounds)', () => {
      useAppStore.getState().setActiveTab(10);

      const state = useAppStore.getState();
      expect(state.activeTabIndex).toBe(0); // Should remain unchanged
      expect(state.tabs[0].isActive).toBe(true);
    });
  });

  describe('toggleToolbar', () => {
    it('should toggle toolbar visibility from true to false', () => {
      expect(useAppStore.getState().toolbarVisible).toBe(true);
      
      useAppStore.getState().toggleToolbar();
      
      expect(useAppStore.getState().toolbarVisible).toBe(false);
    });

    it('should toggle toolbar visibility from false to true', () => {
      useAppStore.setState({ toolbarVisible: false });
      
      useAppStore.getState().toggleToolbar();
      
      expect(useAppStore.getState().toolbarVisible).toBe(true);
    });
  });

  describe('setToolbarPosition', () => {
    it('should set toolbar position to top', () => {
      useAppStore.getState().setToolbarPosition('top');
      expect(useAppStore.getState().toolbarPosition).toBe('top');
    });

    it('should set toolbar position to bottom', () => {
      useAppStore.getState().setToolbarPosition('bottom');
      expect(useAppStore.getState().toolbarPosition).toBe('bottom');
    });

    it('should set toolbar position to left', () => {
      useAppStore.getState().setToolbarPosition('left');
      expect(useAppStore.getState().toolbarPosition).toBe('left');
    });

    it('should set toolbar position to right', () => {
      useAppStore.getState().setToolbarPosition('right');
      expect(useAppStore.getState().toolbarPosition).toBe('right');
    });
  });

  describe('showPopup', () => {
    it('should show popup with heading and content', () => {
      const heading = 'Test Heading';
      const content = 'Test content for the popup';

      useAppStore.getState().showPopup(heading, content);

      const state = useAppStore.getState();
      expect(state.popupVisible).toBe(true);
      expect(state.popupContent).toEqual({ heading, content });
    });
  });

  describe('hidePopup', () => {
    it('should hide popup and clear content', () => {
      // First show a popup
      useAppStore.getState().showPopup('Test', 'Content');
      expect(useAppStore.getState().popupVisible).toBe(true);

      // Then hide it
      useAppStore.getState().hidePopup();

      const state = useAppStore.getState();
      expect(state.popupVisible).toBe(false);
      expect(state.popupContent).toBe(null);
    });
  });
});
