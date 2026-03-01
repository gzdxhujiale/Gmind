import { BrowserWindow } from 'electron';
import { Rectangle } from '../src/types/models';
import * as path from 'path';

export interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

/**
 * WindowManager handles window creation, visibility, and bounds management
 */
export class WindowManager {
  private window: BrowserWindow | null = null;
  private savedBounds: Rectangle | null = null;

  /**
   * Creates and configures the main application window
   * @param config Window configuration
   * @param preloadPath Path to the preload script
   * @param publicPath Path to public assets
   * @returns The created BrowserWindow
   */
  createWindow(config: WindowConfig, preloadPath: string, publicPath: string): BrowserWindow {
    // Use saved bounds if available, otherwise use config
    const bounds = this.savedBounds || {
      width: config.width,
      height: config.height,
      x: undefined,
      y: undefined,
    };

    this.window = new BrowserWindow({
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      // No minimum size restrictions
      frame: false, // Remove default window frame
      titleBarStyle: 'hidden', // Hide title bar
      icon: path.join(publicPath, 'electron-vite.svg'),
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
      },
      show: false, // Don't show until ready
    });

    // Show window when ready
    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    // Handle window resize events
    this.window.on('resize', () => {
      if (this.window && !this.window.isMaximized() && !this.window.isMinimized()) {
        const bounds = this.window.getBounds();
        this.savedBounds = bounds;
        
        // Send resize event to renderer
        this.window.webContents.send('window-resized', { bounds });
      }
    });

    // Handle window move events
    this.window.on('move', () => {
      if (this.window && !this.window.isMaximized() && !this.window.isMinimized()) {
        const bounds = this.window.getBounds();
        this.savedBounds = bounds;
      }
    });

    return this.window;
  }

  /**
   * Shows the window (restores from tray)
   */
  showWindow(): void {
    if (this.window) {
      if (this.window.isMinimized()) {
        this.window.restore();
      }
      this.window.show();
      this.window.focus();
    }
  }

  /**
   * Hides the window (to tray)
   */
  hideWindow(): void {
    if (this.window) {
      this.window.hide();
    }
  }

  /**
   * Saves the current window bounds
   * @param bounds The bounds to save
   */
  saveWindowBounds(bounds: Rectangle): void {
    this.savedBounds = bounds;
  }

  /**
   * Gets the saved window bounds
   * @returns The saved bounds or null if none saved
   */
  getWindowBounds(): Rectangle | null {
    return this.savedBounds;
  }

  /**
   * Gets the current window bounds from the actual window
   * @returns The current window bounds or null if window doesn't exist
   */
  getCurrentWindowBounds(): Rectangle | null {
    if (this.window && !this.window.isDestroyed()) {
      return this.window.getBounds();
    }
    return null;
  }

  /**
   * Gets the BrowserWindow instance
   * @returns The window instance or null
   */
  getWindow(): BrowserWindow | null {
    return this.window;
  }

  /**
   * Loads saved bounds to be used when creating the window
   * @param bounds The bounds to restore
   */
  loadSavedBounds(bounds: Rectangle): void {
    this.savedBounds = bounds;
  }

  /**
   * Minimizes the window
   */
  minimizeWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.minimize();
    }
  }

  /**
   * Maximizes or restores the window
   */
  maximizeWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      if (this.window.isMaximized()) {
        this.window.restore();
      } else {
        this.window.maximize();
      }
    }
  }

  /**
   * Closes the window
   */
  closeWindow(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.close();
    }
  }

  /**
   * Checks if window is maximized
   */
  isMaximized(): boolean {
    if (this.window && !this.window.isDestroyed()) {
      return this.window.isMaximized();
    }
    return false;
  }
}
