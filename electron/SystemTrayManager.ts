import { Tray, Menu, nativeImage, app } from 'electron';

/**
 * SystemTrayManager handles system tray icon and menu
 */
export class SystemTrayManager {
  private tray: Tray | null = null;
  private onShowCallback: (() => void) | null = null;
  private onQuitCallback: (() => void) | null = null;

  /**
   * Creates the system tray icon with menu
   * @param iconPath Path to the tray icon image
   */
  createTray(iconPath: string): void {
    // Create tray icon
    const icon = nativeImage.createFromPath(iconPath);
    this.tray = new Tray(icon);

    this.tray.setToolTip('Markdown Mind Map Viewer');

    // Set up click handler (show window)
    this.tray.on('click', () => {
      if (this.onShowCallback) {
        this.onShowCallback();
      }
    });

    // Set up context menu
    this.updateContextMenu();
  }

  /**
   * Updates the tray context menu
   */
  private updateContextMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show',
        click: () => {
          if (this.onShowCallback) {
            this.onShowCallback();
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        click: () => {
          if (this.onQuitCallback) {
            this.onQuitCallback();
          } else {
            app.quit();
          }
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  /**
   * Sets the callback for when the tray icon is clicked or "Show" is selected
   * @param callback Function to call when showing the window
   */
  onShow(callback: () => void): void {
    this.onShowCallback = callback;
  }

  /**
   * Sets the callback for when "Quit" is selected from the tray menu
   * @param callback Function to call when quitting
   */
  onQuit(callback: () => void): void {
    this.onQuitCallback = callback;
  }

  /**
   * Destroys the tray icon
   */
  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  /**
   * Gets the Tray instance
   * @returns The tray instance or null
   */
  getTray(): Tray | null {
    return this.tray;
  }
}
