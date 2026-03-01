import { BrowserWindow } from 'electron';
import { IPC_CHANNELS, KeyboardShortcutEvent } from '../src/types/ipc';

/**
 * KeyboardShortcutHandler manages keyboard shortcuts using webContents
 */
export class KeyboardShortcutHandler {
  private window: BrowserWindow | null = null;
  private onHideToTrayCallback: (() => void) | null = null;

  /**
   * Sets the window to send IPC messages to
   * @param window The BrowserWindow instance
   */
  setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  /**
   * Registers all keyboard shortcuts using webContents
   */
  registerShortcuts(): void {
    if (!this.window) {
      console.warn('Cannot register shortcuts: window not set');
      return;
    }

    // Register keyboard event listener
    this.window.webContents.on('before-input-event', (event, input) => {
      // Check for Ctrl/Cmd key combinations
      if (input.control || input.meta) {
        // Ctrl+0 for hide to tray
        if (input.key === '0' && input.type === 'keyDown') {
          console.log('Ctrl+0 pressed - hiding to tray');
          event.preventDefault();
          this.handleHideToTray();
          return;
        }

        // Ctrl+1 through Ctrl+9 for tab switching
        const num = parseInt(input.key);
        if (num >= 1 && num <= 9 && input.type === 'keyDown') {
          console.log(`Ctrl+${num} pressed - switching tab`);
          event.preventDefault();
          this.handleTabSwitch(num);
          return;
        }

        // Ctrl+Arrow keys for toolbar position
        if (input.type === 'keyDown') {
          if (input.key === 'ArrowUp') {
            console.log('Ctrl+↑ pressed - toolbar to top');
            event.preventDefault();
            this.handleToolbarPosition('top');
            return;
          }
          if (input.key === 'ArrowDown') {
            console.log('Ctrl+↓ pressed - toolbar to bottom');
            event.preventDefault();
            this.handleToolbarPosition('bottom');
            return;
          }
          if (input.key === 'ArrowLeft') {
            console.log('Ctrl+← pressed - toolbar to left');
            event.preventDefault();
            this.handleToolbarPosition('left');
            return;
          }
          if (input.key === 'ArrowRight') {
            console.log('Ctrl+→ pressed - toolbar to right');
            event.preventDefault();
            this.handleToolbarPosition('right');
            return;
          }
        }

        // Ctrl+- for hide toolbar
        if ((input.key === '-' || input.key === '_') && input.type === 'keyDown') {
          console.log('Ctrl+- pressed - hiding toolbar');
          event.preventDefault();
          this.handleToolbarVisibility('hide');
          return;
        }

        // Ctrl++ for show toolbar
        if ((input.key === '=' || input.key === '+') && input.type === 'keyDown') {
          console.log('Ctrl++ pressed - showing toolbar');
          event.preventDefault();
          this.handleToolbarVisibility('show');
          return;
        }
      }
    });

    console.log('Keyboard shortcuts registered using webContents');
  }

  /**
   * Handles the hide to tray shortcut
   */
  private handleHideToTray(): void {
    console.log('handleHideToTray called');
    
    // Send IPC message to renderer
    if (this.window && !this.window.isDestroyed()) {
      const event: KeyboardShortcutEvent = {
        shortcut: 'Ctrl+0',
        action: 'hide-to-tray',
      };
      this.window.webContents.send(IPC_CHANNELS.KEYBOARD_SHORTCUT, event);
      console.log('Sent hide-to-tray event to renderer');
    } else {
      console.warn('Window not available for hide-to-tray');
    }

    // Call the callback if set
    if (this.onHideToTrayCallback) {
      console.log('Calling hide-to-tray callback');
      this.onHideToTrayCallback();
    } else {
      console.warn('No hide-to-tray callback set');
    }
  }

  /**
   * Handles tab switch shortcuts
   * @param tabIndex The tab index (1-9)
   */
  private handleTabSwitch(tabIndex: number): void {
    console.log(`handleTabSwitch called for tab ${tabIndex}`);
    
    // Send IPC message to renderer
    if (this.window && !this.window.isDestroyed()) {
      const event: KeyboardShortcutEvent = {
        shortcut: `Ctrl+${tabIndex}`,
        action: 'tab-switch',
        tabIndex,
      };
      this.window.webContents.send(IPC_CHANNELS.KEYBOARD_SHORTCUT, event);
      console.log(`Sent tab-switch event to renderer for tab ${tabIndex}`);
    } else {
      console.warn('Window not available for tab-switch');
    }
  }

  /**
   * Handles toolbar position change shortcuts
   * @param position The toolbar position
   */
  private handleToolbarPosition(position: 'top' | 'bottom' | 'left' | 'right'): void {
    console.log(`handleToolbarPosition called for ${position}`);
    
    // Send IPC message to renderer
    if (this.window && !this.window.isDestroyed()) {
      const event: KeyboardShortcutEvent = {
        shortcut: `Ctrl+Arrow`,
        action: 'toolbar-position',
        position,
      };
      this.window.webContents.send(IPC_CHANNELS.KEYBOARD_SHORTCUT, event);
      console.log(`Sent toolbar-position event to renderer: ${position}`);
    } else {
      console.warn('Window not available for toolbar-position');
    }
  }

  /**
   * Handles toolbar visibility shortcuts
   * @param visibility 'show' or 'hide'
   */
  private handleToolbarVisibility(visibility: 'show' | 'hide'): void {
    console.log(`handleToolbarVisibility called: ${visibility}`);
    
    // Send IPC message to renderer
    if (this.window && !this.window.isDestroyed()) {
      const event: KeyboardShortcutEvent = {
        shortcut: visibility === 'hide' ? 'Ctrl+-' : 'Ctrl++',
        action: 'toolbar-visibility',
        visibility,
      };
      this.window.webContents.send(IPC_CHANNELS.KEYBOARD_SHORTCUT, event);
      console.log(`Sent toolbar-visibility event to renderer: ${visibility}`);
    } else {
      console.warn('Window not available for toolbar-visibility');
    }
  }

  /**
   * Sets the callback for hide to tray action
   * @param callback Function to call when Ctrl+0 is pressed
   */
  onHideToTray(callback: () => void): void {
    this.onHideToTrayCallback = callback;
  }

  /**
   * Unregisters all shortcuts
   */
  unregisterAll(): void {
    // No need to unregister webContents listeners as they're cleaned up with the window
    console.log('Keyboard shortcuts cleanup');
  }
}
