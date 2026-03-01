import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { FileSystemService } from './FileSystemService'
import { WindowManager } from './WindowManager'
import { SystemTrayManager } from './SystemTrayManager'
import { KeyboardShortcutHandler } from './KeyboardShortcutHandler'
import { IPC_CHANNELS } from '../src/types/ipc'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Initialize services
const fileSystemService = new FileSystemService()
const windowManager = new WindowManager()
const trayManager = new SystemTrayManager()
const keyboardHandler = new KeyboardShortcutHandler()

function createWindow() {
  const win = windowManager.createWindow(
    {
      width: 1200,
      height: 800,
      // No minimum size restrictions - allow any window size
    },
    path.join(__dirname, 'preload.mjs'),
    process.env.VITE_PUBLIC
  )

  // Set window for keyboard handler
  keyboardHandler.setWindow(win)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Setup keyboard shortcuts after window is created
  setupKeyboardShortcuts()

  return win
}

function setupIpcHandlers() {
  // File system operations
  ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async () => {
    try {
      const folderPath = await fileSystemService.selectFolder()
      if (folderPath) {
        // Start watching the newly selected folder
        await fileSystemService.watchFolder(folderPath)
      } else {
        // User cancelled, stop watching
        await fileSystemService.watchFolder(null)
      }
      return { folderPath }
    } catch (error) {
      console.error('Error selecting folder:', error)
      return { folderPath: null }
    }
  })

  ipcMain.handle(IPC_CHANNELS.READ_MARKDOWN_FILES, async (_, request) => {
    try {
      const files = await fileSystemService.readMarkdownFiles(request.folderPath)

      // Also start watching this folder if not already watching
      await fileSystemService.watchFolder(request.folderPath)

      return { files }
    } catch (error) {
      console.error('Error reading markdown files:', error)
      return { files: [], error: (error as Error).message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.READ_FILE_CONTENT, async (_, request) => {
    try {
      const content = await fileSystemService.readFileContent(request.filePath)
      return { content }
    } catch (error) {
      console.error('Error reading file content:', error)
      return { content: '', error: (error as Error).message }
    }
  })

  // Window management
  ipcMain.handle(IPC_CHANNELS.HIDE_WINDOW, async () => {
    windowManager.hideWindow()
  })

  ipcMain.handle(IPC_CHANNELS.SHOW_WINDOW, async () => {
    windowManager.showWindow()
  })

  ipcMain.handle(IPC_CHANNELS.MINIMIZE_WINDOW, async () => {
    windowManager.minimizeWindow()
  })

  ipcMain.handle(IPC_CHANNELS.MAXIMIZE_WINDOW, async () => {
    windowManager.maximizeWindow()
  })

  ipcMain.handle(IPC_CHANNELS.CLOSE_WINDOW, async () => {
    windowManager.closeWindow()
  })

  ipcMain.handle(IPC_CHANNELS.IS_MAXIMIZED, async () => {
    return windowManager.isMaximized()
  })

  ipcMain.handle(IPC_CHANNELS.GET_WINDOW_BOUNDS, async () => {
    const bounds = windowManager.getCurrentWindowBounds()
    return { bounds }
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_WINDOW_BOUNDS, async (_, request) => {
    windowManager.saveWindowBounds(request.bounds)
  })
}

function setupSystemTray() {
  // Use the tray icon (SVG for now, should be replaced with PNG for production)
  const iconPath = path.join(process.env.VITE_PUBLIC, 'tray-icon.svg')

  trayManager.createTray(iconPath)

  // Set up tray callbacks
  trayManager.onShow(() => {
    windowManager.showWindow()
  })

  trayManager.onQuit(() => {
    app.quit()
  })
}

function setupKeyboardShortcuts() {
  keyboardHandler.registerShortcuts()

  // Set up hide to tray callback
  keyboardHandler.onHideToTray(() => {
    windowManager.hideWindow()
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts
  keyboardHandler.unregisterAll()
})

app.whenReady().then(() => {
  setupIpcHandlers()
  const win = createWindow()

  // Setup file system watcher callbacks to notify renderer
  fileSystemService.onFileChanged((event) => {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.FILE_CHANGED, event)
    }
  })

  setupSystemTray()
})
