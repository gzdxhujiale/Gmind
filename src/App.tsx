/**
 * Main App component
 * Handles routing between HomePage and MindMapPage based on folder selection
 * Requirements: 1.3, 1.5, 10.5
 */

import { useEffect, useState } from 'react';
import { HomePage } from './components/HomePage';
import { MindMapPage } from './components/MindMapPage';
import { Toolbar } from './components/Toolbar';
import { ToolbarToggle } from './components/ToolbarToggle';
import { useAppStore } from './store/useAppStore';
import { storageService } from './services/StorageService';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useWindowResize } from './hooks/useWindowResize';
import { IPC_CHANNELS } from './types/ipc';
import type { ReadMarkdownFilesResponse, FileChangedEvent } from './types/ipc';
import './App.css';

function App() {
  const selectedFolder = useAppStore((state) => state.selectedFolder);
  const setSelectedFolder = useAppStore((state) => state.setSelectedFolder);
  const loadMarkdownFiles = useAppStore((state) => state.loadMarkdownFiles);
  const toolbarVisible = useAppStore((state) => state.toolbarVisible);
  const toolbarPosition = useAppStore((state) => state.toolbarPosition);
  const setToolbarPosition = useAppStore((state) => state.setToolbarPosition);
  const toggleToolbar = useAppStore((state) => state.toggleToolbar);
  const tabs = useAppStore((state) => state.tabs);
  const isLoading = useAppStore((state) => state.isLoading);
  const setLoading = useAppStore((state) => state.setLoading);
  const setHideOutlineTitle = useAppStore((state) => state.setHideOutlineTitle);

  const [isInitialized, setIsInitialized] = useState(false);

  // Set up keyboard shortcut listeners (Requirements 6.1, 6.3, 6.4, 7.1)
  useKeyboardShortcuts();

  // Set up window resize listeners (Requirements 8.1, 8.2, 8.4)
  useWindowResize();

  // Initialize application on startup (Requirements 1.3, 1.5, 9.5, 8.4)
  useEffect(() => {
    const initializeApp = async () => {
      // Load persisted preferences (Requirement 9.5)
      const preferences = storageService.getPreferences();
      if (preferences) {
        // Apply toolbar settings
        if (preferences.toolbarVisible !== toolbarVisible) {
          toggleToolbar();
        }
        if (preferences.toolbarPosition !== toolbarPosition) {
          setToolbarPosition(preferences.toolbarPosition);
        }
        // Apply outline title visibility setting
        if (preferences.hideOutlineTitle !== undefined) {
          setHideOutlineTitle(preferences.hideOutlineTitle);
        }
      }

      // Load persisted folder path on startup (Requirement 1.3)
      const savedFolder = storageService.getFolderPath();
      if (savedFolder) {
        try {
          setLoading(true);
          // Validate folder path by attempting to read markdown files (Requirement 1.5)
          const response: ReadMarkdownFilesResponse = await window.ipcRenderer.invoke(
            IPC_CHANNELS.READ_MARKDOWN_FILES,
            { folderPath: savedFolder }
          );

          if (response.error) {
            // Invalid folder path - clear it and show home page (Requirement 1.5)
            console.warn('Saved folder path is invalid:', response.error);
            storageService.saveFolderPath('');
            setSelectedFolder('');
            setLoading(false);
          } else {
            // Valid folder path - load files and show mind map page (Requirement 10.5)
            setSelectedFolder(savedFolder);
            loadMarkdownFiles(response.files);
          }
        } catch (error) {
          // Error validating folder - clear it and show home page (Requirement 1.5)
          console.error('Failed to validate saved folder:', error);
          storageService.saveFolderPath('');
          setSelectedFolder('');
          setLoading(false);
        }
      }

      setIsInitialized(true);
    };

    initializeApp();
  }, []);

  // Listen for file watcher changes from main process (Requirement: auto-sync)
  useEffect(() => {
    if (!selectedFolder) return;

    let timeoutId: NodeJS.Timeout;

    // Create listener function
    const handleFileChange = async (_event: any, _message: FileChangedEvent) => {
      // Debounce the reload to prevent spamming on bulk changes
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const response: ReadMarkdownFilesResponse = await window.ipcRenderer.invoke(
            IPC_CHANNELS.READ_MARKDOWN_FILES,
            { folderPath: selectedFolder }
          );

          if (!response.error) {
            // Reload files without dropping user's currently focused tab index
            loadMarkdownFiles(response.files);
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }, 500); // 500ms debounce
    };

    window.ipcRenderer.on(IPC_CHANNELS.FILE_CHANGED, handleFileChange);

    return () => {
      clearTimeout(timeoutId);
      // Our preload type for `on` returns `this` (which is `typeof ipcRenderer`),
      // so we use the `off` method instead of treating `cleanup` as a function.
      if (window.ipcRenderer.off) {
        window.ipcRenderer.off(IPC_CHANNELS.FILE_CHANGED, handleFileChange);
      }
    };
  }, [selectedFolder, loadMarkdownFiles]);

  // Determine layout based on toolbar position (Requirements 10.2, 10.3)
  const isVerticalLayout = toolbarPosition === 'top' || toolbarPosition === 'bottom';
  const layoutClass = isVerticalLayout ? 'app-layout-vertical' : 'app-layout-horizontal';
  const toolbarFirst = toolbarPosition === 'top' || toolbarPosition === 'left';

  // Determine which page to show (Requirements 1.5, 10.5)
  // Show HomePage if:
  // - No folder selected, OR
  // - Folder selected but no tabs loaded (empty folder or error)
  const showHomePage = !selectedFolder || tabs.length === 0;

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="app app-layout-vertical">
        <div className="app-content">
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${layoutClass}`}>
      {toolbarVisible && toolbarFirst && <Toolbar />}

      <div className="app-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading markdown files...</p>
          </div>
        ) : (
          <div className={`page-transition ${showHomePage ? 'home-page' : 'mindmap-page'}`}>
            {showHomePage ? <HomePage /> : <MindMapPage />}
          </div>
        )}
      </div>

      {toolbarVisible && !toolbarFirst && <Toolbar />}

      {/* Floating button to show toolbar when hidden */}
      <ToolbarToggle />
    </div>
  );
}

export default App;
