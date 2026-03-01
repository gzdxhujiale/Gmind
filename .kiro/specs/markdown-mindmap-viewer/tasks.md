# Implementation Plan

- [x] 1. Set up project dependencies and configuration





  - Install required npm packages: zustand, remark, remark-parse, unist-util-visit, react-flow-renderer (or cytoscape), fast-check
  - Configure TypeScript for strict mode
  - Set up Vitest testing configuration
  - _Requirements: All_

- [x] 2. Implement core data models and types





  - Create TypeScript interfaces for HeadingNode, MarkdownFile, TabInfo, AppState
  - Define IPC channel types for type-safe communication
  - Create UserPreferences and Rectangle interfaces
  - _Requirements: 1.2, 2.1, 3.2_

- [x] 3. Implement StorageService for persistence




- [x] 3.1 Create StorageService with localStorage wrapper


  - Implement saveFolderPath, getFolderPath methods
  - Implement savePreferences, getPreferences methods
  - Implement saveWindowBounds, getWindowBounds methods
  - _Requirements: 1.2, 1.3, 1.4, 9.5_

- [ ]* 3.2 Write property test for folder path persistence
  - **Property 1: Folder path persistence round-trip**
  - **Validates: Requirements 1.2, 1.3**

- [ ]* 3.3 Write property test for folder path updates
  - **Property 2: Folder path update persistence**
  - **Validates: Requirements 1.4**

- [ ]* 3.4 Write property test for window bounds persistence
  - **Property 21: Window size persistence**
  - **Validates: Requirements 8.4**

- [ ]* 3.5 Write property test for toolbar settings persistence
  - **Property 27: Toolbar settings persistence**
  - **Validates: Requirements 9.5**

- [ ] 4. Implement Markdown parser


- [x] 4.1 Create MarkdownParser using remark



  - Implement parse method that converts markdown to HeadingNode tree
  - Extract heading levels, text, and content
  - Build parent-child relationships based on heading hierarchy
  - Mark leaf nodes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 4.2 Write property test for heading extraction completeness
  - **Property 7: Heading extraction completeness**
  - **Validates: Requirements 3.2**

- [ ]* 4.3 Write property test for parent-child relationships
  - **Property 8: Parent-child relationship preservation**
  - **Validates: Requirements 3.3**

- [ ]* 4.4 Write property test for content association
  - **Property 9: Content association**
  - **Validates: Requirements 3.4**

- [ ]* 4.5 Write unit tests for edge cases
  - Test empty markdown files
  - Test markdown with no headings
  - Test malformed markdown handling
  - _Requirements: 3.5_

- [x] 5. Implement Electron main process services





- [x] 5.1 Create FileSystemService in main process


  - Implement selectFolder using Electron dialog
  - Implement readMarkdownFiles to scan folder for .md files
  - Implement readFileContent for individual files
  - Set up IPC handlers for file operations
  - _Requirements: 1.1, 2.1_

- [ ]* 5.2 Write property test for markdown file discovery
  - **Property 3: Markdown file discovery completeness**
  - **Validates: Requirements 2.1**

- [x] 5.3 Create WindowManager in main process


  - Implement createWindow with configuration
  - Implement showWindow and hideWindow methods
  - Implement window bounds save/restore
  - Handle window resize events
  - _Requirements: 7.1, 7.3, 8.1, 8.4_

- [x] 5.4 Create SystemTrayManager in main process


  - Implement createTray with icon
  - Set up tray click handlers (show window)
  - Set up tray context menu (show, quit)
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ]* 5.5 Write property test for tray hide and restore
  - **Property 18: System tray hide and restore**
  - **Validates: Requirements 7.1, 7.3**

- [x] 5.6 Implement keyboard shortcut handler in main process


  - Register global shortcuts for Ctrl+0 (hide to tray)
  - Register shortcuts for Ctrl+1 through Ctrl+9 (tab switching)
  - Send IPC messages to renderer on shortcut trigger
  - _Requirements: 6.1, 7.1_

- [-] 6. Implement state management with Zustand


- [x] 6.1 Create Zustand store for application state



  - Define AppState interface with all state properties
  - Implement actions: setSelectedFolder, loadMarkdownFiles, setActiveTab
  - Implement actions: toggleToolbar, setToolbarPosition
  - Implement actions: showPopup, hidePopup
  - _Requirements: 1.2, 2.2, 2.4, 9.1, 9.3, 5.1_

- [ ]* 6.2 Write property test for tab switching
  - **Property 6: Active tab display**
  - **Validates: Requirements 2.4**

- [ ]* 6.3 Write property test for toolbar visibility toggle
  - **Property 23: Toolbar visibility toggle**
  - **Validates: Requirements 9.1**

- [ ]* 6.4 Write property test for toolbar position change
  - **Property 25: Toolbar position change**
  - **Validates: Requirements 9.3**

- [x] 7. Create React UI components - HomePage




- [x] 7.1 Implement HomePage component


  - Create folder selection button
  - Display current folder path if available
  - Handle folder selection via IPC
  - Show appropriate message when no folder selected
  - _Requirements: 1.1, 10.1, 10.4_

- [ ]* 7.2 Write unit test for HomePage
  - Test folder selection button renders
  - Test folder path display
  - _Requirements: 1.1_

- [x] 8. Create React UI components - Toolbar




- [x] 8.1 Implement Toolbar component


  - Support positioning at top, bottom, left, right
  - Include toggle visibility button
  - Include position change controls
  - Apply appropriate styling based on position
  - _Requirements: 9.1, 9.3, 9.4, 10.2, 10.3_

- [ ]* 8.2 Write property test for layout direction
  - **Property 28: Layout direction based on toolbar position**
  - **Validates: Requirements 10.2, 10.3**

- [ ]* 8.3 Write property test for layout adjustment
  - **Property 26: Layout adjustment for toolbar**
  - **Validates: Requirements 9.4**

- [x] 9. Create React UI components - MindMapPage





- [x] 9.1 Implement Tab navigation component


  - Display tabs for each markdown file
  - Show filename without .md extension as label
  - Handle tab click to switch active tab
  - Highlight active tab visually
  - _Requirements: 2.2, 2.3, 2.4, 6.4_

- [ ]* 9.2 Write property test for tab label transformation
  - **Property 5: Tab label transformation**
  - **Validates: Requirements 2.3**

- [ ]* 9.3 Write property test for tab count
  - **Property 4: Tab count matches file count**
  - **Validates: Requirements 2.2**



- [x] 9.4 Implement MindMapRenderer component





  - Integrate React Flow or Cytoscape for visualization
  - Convert HeadingNode tree to mind map layout
  - Render nodes with heading text
  - Render edges showing parent-child relationships
  - Support zoom and pan interactions
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 9.5 Write property test for node completeness
  - **Property 10: Mind map node completeness**
  - **Validates: Requirements 4.2**

- [ ]* 9.6 Write property test for visual connections
  - **Property 11: Visual connection completeness**
  - **Validates: Requirements 4.3**

- [ ]* 9.7 Write property test for zoom and pan
  - **Property 12: Zoom and pan state**


  - **Validates: Requirements 4.4**

- [x] 9.8 Implement leaf node click handler




  - Detect clicks on leaf nodes
  - Trigger popup display with heading and content
  - _Requirements: 5.1_

- [ ]* 9.9 Write property test for leaf node popup
  - **Property 13: Leaf node popup display**
  - **Validates: Requirements 5.1, 5.2**

- [x] 10. Create React UI components - ContentPopup




- [x] 10.1 Implement ContentPopup modal component

  - Display heading text and content
  - Position popup over mind map
  - Implement modal overlay to block background interactions
  - Handle click outside to close
  - Handle empty content case
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 10.2 Write property test for popup close behavior
  - **Property 14: Popup close on outside click**
  - **Validates: Requirements 5.3**

- [ ]* 10.3 Write property test for modal behavior
  - **Property 15: Modal behavior**
  - **Validates: Requirements 5.5**

- [ ]* 10.4 Write unit test for empty content case
  - Test popup displays heading only when no content
  - _Requirements: 5.4_

- [x] 11. Implement keyboard shortcut handling in renderer




- [x] 11.1 Set up IPC listeners for keyboard shortcuts

  - Listen for tab switch shortcuts (Ctrl+1 to Ctrl+9)
  - Listen for hide to tray shortcut (Ctrl+0)
  - Update application state based on shortcuts
  - Provide visual feedback for active tab
  - _Requirements: 6.1, 6.3, 6.4, 7.1_

- [ ]* 11.2 Write property test for keyboard tab switching
  - **Property 16: Keyboard tab switching**
  - **Validates: Requirements 6.1, 6.3**

- [ ]* 11.3 Write property test for active tab visual feedback
  - **Property 17: Active tab visual feedback**
  - **Validates: Requirements 6.4**

- [x] 12. Implement window resize handling




- [x] 12.1 Add window resize listeners


  - Detect window resize events
  - Trigger mind map reflow
  - Save window bounds to storage
  - _Requirements: 8.1, 8.2, 8.4_

- [ ]* 12.2 Write property test for mind map reflow
  - **Property 22: Mind map reflow on resize**
  - **Validates: Requirements 8.2**

- [x] 13. Implement application initialization





- [x] 13.1 Create App component with routing logic


  - Load persisted folder path on startup
  - Show HomePage if no folder path or path invalid
  - Show MindMapPage if folder path exists
  - Handle page transitions
  - _Requirements: 1.3, 1.5, 10.5_

- [ ]* 13.2 Write property test for page transition
  - **Property 29: Page transition on folder selection**
  - **Validates: Requirements 10.5**

- [ ]* 13.3 Write unit test for first launch
  - Test that home page displays on first launch
  - _Requirements: 1.1_

- [x] 13.4 Load and apply persisted preferences


  - Load toolbar visibility and position
  - Load window bounds
  - Apply settings to UI
  - _Requirements: 9.5, 8.4_

- [x] 14. Implement error handling





- [x] 14.1 Add error handling for file system operations


  - Handle missing folder paths
  - Handle file read errors
  - Handle empty folders
  - Display user-friendly error messages
  - _Requirements: 1.5, 2.5_

- [x] 14.2 Add error handling for markdown parsing


  - Handle malformed markdown gracefully
  - Display available content on parse errors
  - Log errors for debugging
  - _Requirements: 3.5_

- [ ]* 14.3 Write unit tests for error scenarios
  - Test empty folder message display
  - Test invalid folder path handling
  - Test malformed markdown handling
  - _Requirements: 1.5, 2.5, 3.5_

- [x] 15. Implement content area expansion




- [x] 15.1 Add layout logic for toolbar visibility


  - Expand content area when toolbar hidden
  - Adjust content area when toolbar shown
  - _Requirements: 9.2_

- [ ]* 15.2 Write property test for content area expansion
  - **Property 24: Content area expansion**
  - **Validates: Requirements 9.2**

- [x] 16. Add system tray functionality




- [x] 16.1 Implement tray icon and menu

  - Create tray icon asset
  - Set up tray click to restore window
  - Set up tray context menu
  - _Requirements: 7.2, 7.3, 7.5_

- [ ]* 16.2 Write property test for tray icon presence
  - **Property 19: Tray icon presence**
  - **Validates: Requirements 7.2**

- [ ]* 16.3 Write property test for background process
  - **Property 20: Background process continuity**
  - **Validates: Requirements 7.4**

- [ ]* 16.4 Write unit test for tray context menu
  - Test menu contains show and quit options
  - _Requirements: 7.5_

- [ ] 17. Polish and optimize






- [x] 17.1 Add loading states and transitions

  - Show loading indicator while parsing files
  - Add smooth transitions between pages
  - Add animations for popup open/close


- [x] 17.2 Optimize performance

  - Implement lazy loading for markdown files
  - Memoize expensive calculations
  - Debounce resize events
  - Use React.memo for components



- [ ] 17.3 Add styling and theming
  - Apply consistent styling with Tailwind CSS
  - Ensure responsive layout
  - Add hover states and visual feedback

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
