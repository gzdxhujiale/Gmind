/**
 * IPC channel types for type-safe communication between main and renderer processes
 */

import { MarkdownFile, Rectangle } from './models';

/**
 * IPC channel names
 */
export const IPC_CHANNELS = {
  // File system operations
  SELECT_FOLDER: 'select-folder',
  READ_MARKDOWN_FILES: 'read-markdown-files',
  READ_FILE_CONTENT: 'read-file-content',
  FILE_CHANGED: 'file-changed',

  // Window management
  HIDE_WINDOW: 'hide-window',
  SHOW_WINDOW: 'show-window',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',
  GET_WINDOW_BOUNDS: 'get-window-bounds',
  SAVE_WINDOW_BOUNDS: 'save-window-bounds',
  WINDOW_RESIZED: 'window-resized',
  IS_MAXIMIZED: 'is-maximized',

  // Keyboard shortcuts (main -> renderer)
  KEYBOARD_SHORTCUT: 'keyboard-shortcut',
  TAB_SWITCH: 'tab-switch',
  HIDE_TO_TRAY: 'hide-to-tray',
} as const;

/**
 * Request/Response types for each IPC channel
 */

// File system operations
export interface SelectFolderRequest {
  // No parameters needed
}

export interface SelectFolderResponse {
  folderPath: string | null;
}

export interface ReadMarkdownFilesRequest {
  folderPath: string;
}

export interface ReadMarkdownFilesResponse {
  files: MarkdownFile[];
  error?: string;
}

export interface ReadFileContentRequest {
  filePath: string;
}

export interface ReadFileContentResponse {
  content: string;
  error?: string;
}

// Window management
export interface HideWindowRequest {
  // No parameters needed
}

export interface ShowWindowRequest {
  // No parameters needed
}

export interface GetWindowBoundsResponse {
  bounds: Rectangle | null;
}

export interface SaveWindowBoundsRequest {
  bounds: Rectangle;
}

// Keyboard shortcuts (main -> renderer events)
export interface KeyboardShortcutEvent {
  shortcut: string; // e.g., 'Ctrl+1', 'Ctrl+0', 'Ctrl+Arrow'
  action: 'tab-switch' | 'hide-to-tray' | 'toolbar-position' | 'toolbar-visibility';
  tabIndex?: number; // For tab-switch actions (1-9)
  position?: 'top' | 'bottom' | 'left' | 'right'; // For toolbar-position actions
  visibility?: 'show' | 'hide'; // For toolbar-visibility actions
}

// File watcher event
export interface FileChangedEvent {
  action: 'add' | 'change' | 'unlink';
  filePath: string;
}

// Window resize event
export interface WindowResizedEvent {
  bounds: Rectangle;
}

/**
 * Type-safe IPC invoke handlers
 */
export interface IPCHandlers {
  [IPC_CHANNELS.SELECT_FOLDER]: () => Promise<SelectFolderResponse>;
  [IPC_CHANNELS.READ_MARKDOWN_FILES]: (request: ReadMarkdownFilesRequest) => Promise<ReadMarkdownFilesResponse>;
  [IPC_CHANNELS.READ_FILE_CONTENT]: (request: ReadFileContentRequest) => Promise<ReadFileContentResponse>;
  [IPC_CHANNELS.GET_WINDOW_BOUNDS]: () => Promise<GetWindowBoundsResponse>;
  [IPC_CHANNELS.SAVE_WINDOW_BOUNDS]: (request: SaveWindowBoundsRequest) => Promise<void>;
  [IPC_CHANNELS.HIDE_WINDOW]: () => Promise<void>;
  [IPC_CHANNELS.SHOW_WINDOW]: () => Promise<void>;
  [IPC_CHANNELS.MINIMIZE_WINDOW]: () => Promise<void>;
  [IPC_CHANNELS.MAXIMIZE_WINDOW]: () => Promise<void>;
  [IPC_CHANNELS.CLOSE_WINDOW]: () => Promise<void>;
  [IPC_CHANNELS.IS_MAXIMIZED]: () => Promise<boolean>;
}

/**
 * Type-safe IPC event listeners
 */
export interface IPCEvents {
  [IPC_CHANNELS.KEYBOARD_SHORTCUT]: (event: KeyboardShortcutEvent) => void;
  [IPC_CHANNELS.TAB_SWITCH]: (tabIndex: number) => void;
  [IPC_CHANNELS.HIDE_TO_TRAY]: () => void;
  [IPC_CHANNELS.WINDOW_RESIZED]: (event: WindowResizedEvent) => void;
  [IPC_CHANNELS.FILE_CHANGED]: (event: FileChangedEvent) => void;
}
