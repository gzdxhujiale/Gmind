/**
 * Zustand store for application state management
 * Manages folder selection, markdown files, tabs, toolbar, and popup state
 */

import { create } from 'zustand';
import { AppState, AppActions, MarkdownFile, TabInfo } from '../types/models';
import { storageService } from '../services/StorageService';

/**
 * Combined store type with state and actions
 */
type AppStore = AppState & AppActions;

/**
 * Initial state for the application
 */
const initialState: AppState = {
  // Folder and files
  selectedFolder: null,
  markdownFiles: [],
  
  // Tab management
  activeTabIndex: 0,
  tabs: [],
  
  // UI state
  toolbarVisible: true,
  toolbarPosition: 'top',
  viewMode: 'outline',
  hideOutlineTitle: true,
  
  // Popup state
  popupVisible: false,
  popupContent: null,
  
  // Loading state
  isLoading: false,
  
  // Settings page
  settingsVisible: false,
};

/**
 * Zustand store for application state
 * 
 * Provides centralized state management for:
 * - Folder selection and markdown file loading
 * - Tab management and navigation
 * - Toolbar visibility and positioning
 * - Content popup display
 * 
 * Requirements: 1.2, 2.2, 2.4, 9.1, 9.3, 5.1
 */
export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  /**
   * Set the selected folder path
   * Requirement 1.2: Persist folder path selection
   */
  setSelectedFolder: (path: string) => {
    set({ selectedFolder: path });
  },

  /**
   * Load markdown files and create tabs
   * Requirements 2.2: Create tabs for each markdown file
   */
  loadMarkdownFiles: (files: MarkdownFile[]) => {
    // Create tabs from markdown files
    const tabs: TabInfo[] = files.map((file, index) => ({
      id: `tab-${index}-${file.name}`,
      filename: file.name.replace(/\.md$/, ''), // Remove .md extension for display
      filePath: file.path,
      headingTree: null, // Will be loaded lazily when tab is activated
      isActive: index === 0, // First tab is active by default
    }));

    set({
      markdownFiles: files,
      tabs,
      activeTabIndex: tabs.length > 0 ? 0 : -1,
      isLoading: false,
    });
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Set the active tab by index
   * Requirement 2.4: Switch between tabs
   * Implements lazy loading - only parse markdown when tab is activated
   */
  setActiveTab: (index: number) => {
    set((state) => {
      // Validate index
      if (index < 0 || index >= state.tabs.length) {
        return state; // No change if index is invalid
      }

      // Update tabs to mark the selected one as active
      const updatedTabs = state.tabs.map((tab, i) => ({
        ...tab,
        isActive: i === index,
      }));

      return {
        activeTabIndex: index,
        tabs: updatedTabs,
      };
    });
  },

  /**
   * Toggle toolbar visibility
   * Requirement 9.1: Show/hide toolbar
   * Requirement 9.5: Persist toolbar settings
   */
  toggleToolbar: () => {
    set((state) => {
      const newVisibility = !state.toolbarVisible;
      
      // Persist preferences (Requirement 9.5)
      storageService.savePreferences({
        toolbarVisible: newVisibility,
        toolbarPosition: state.toolbarPosition,
      });
      
      return { toolbarVisible: newVisibility };
    });
  },

  /**
   * Set toolbar position
   * Requirement 9.3: Change toolbar position
   * Requirement 9.5: Persist toolbar settings
   */
  setToolbarPosition: (position: 'top' | 'bottom' | 'left' | 'right') => {
    set((state) => {
      // Persist preferences (Requirement 9.5)
      storageService.savePreferences({
        toolbarVisible: state.toolbarVisible,
        toolbarPosition: position,
      });
      
      return { toolbarPosition: position };
    });
  },

  /**
   * Show content popup with heading and content
   * Requirement 5.1: Display leaf node content in popup
   */
  showPopup: (heading: string, content: string) => {
    set({
      popupVisible: true,
      popupContent: { heading, content },
    });
  },

  /**
   * Hide content popup
   * Requirement 5.1: Close content popup
   */
  hidePopup: () => {
    set({
      popupVisible: false,
      popupContent: null,
    });
  },

  /**
   * Set view mode (outline or mindmap)
   */
  setViewMode: (mode) => {
    set({ viewMode: mode });
    // Persist preference
    const preferences = storageService.getPreferences();
    storageService.savePreferences({
      ...preferences,
      viewMode: mode,
    });
  },

  /**
   * Show settings page
   */
  showSettings: () => {
    set({ settingsVisible: true });
  },

  /**
   * Hide settings page
   */
  hideSettings: () => {
    set({ settingsVisible: false });
  },

  /**
   * Set hide outline title preference
   */
  setHideOutlineTitle: (hide: boolean) => {
    set({ hideOutlineTitle: hide });
    // Persist preference
    const preferences = storageService.getPreferences();
    storageService.savePreferences({
      ...preferences,
      hideOutlineTitle: hide,
    });
  },
}));
