/**
 * Core data models for the Markdown Mind Map Viewer
 */

/**
 * Represents a heading node in the markdown document hierarchy
 */
export interface HeadingNode {
  id: string;              // Unique identifier
  level: number;           // 1-6 (H1-H6)
  text: string;            // Heading text
  content: string;         // Content between this heading and next
  children: HeadingNode[]; // Child headings
  isLeaf: boolean;         // True if no children
  parent?: HeadingNode;    // Reference to parent (for traversal)
}

/**
 * Represents a markdown file with its metadata
 */
export interface MarkdownFile {
  name: string;      // Filename without path
  path: string;      // Full file path
  content: string;   // Raw markdown content
  lastModified?: number; // Timestamp (optional)
}

/**
 * Represents a tab in the application
 */
export interface TabInfo {
  id: string;                    // Unique tab identifier
  filename: string;              // Display name
  filePath: string;              // Full path
  headingTree: HeadingNode | null; // Parsed tree (null if not loaded)
  isActive: boolean;             // Currently displayed
}

/**
 * User preferences for UI customization
 */
export interface UserPreferences {
  toolbarVisible: boolean;
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
  viewMode?: ViewMode;
  outlineMode?: OutlineMode;
  windowBounds?: Rectangle;
  hideOutlineTitle?: boolean;
}

/**
 * Rectangle for window bounds
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * View mode type
 */
export type ViewMode = 'outline' | 'mindmap';

/**
 * Outline mode type
 */
export type OutlineMode = 'preview' | 'edit';

/**
 * Application state
 */
export interface AppState {
  // Folder and files
  selectedFolder: string | null;
  markdownFiles: MarkdownFile[];

  // Tab management
  activeTabIndex: number;
  tabs: TabInfo[];

  // UI state
  toolbarVisible: boolean;
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
  viewMode: ViewMode;
  outlineMode: OutlineMode;
  hideOutlineTitle: boolean;

  // Popup state
  popupVisible: boolean;
  popupContent: { heading: string; content: string } | null;

  // Loading state
  isLoading: boolean;

  // Settings page
  settingsVisible: boolean;
}

/**
 * Actions for updating application state
 */
export interface AppActions {
  setSelectedFolder(path: string): void;
  loadMarkdownFiles(files: MarkdownFile[]): void;
  setActiveTab(index: number): void;
  toggleToolbar(): void;
  setToolbarPosition(position: 'top' | 'bottom' | 'left' | 'right'): void;
  setViewMode(mode: ViewMode): void;
  setOutlineMode(mode: OutlineMode): void;
  showPopup(heading: string, content: string): void;
  hidePopup(): void;
  setLoading(isLoading: boolean): void;
  showSettings(): void;
  hideSettings(): void;
  setHideOutlineTitle(hide: boolean): void;
}
