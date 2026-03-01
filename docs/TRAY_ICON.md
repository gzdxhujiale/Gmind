# System Tray Icon Documentation

## Overview

The Markdown Mind Map Viewer includes system tray functionality that allows the application to be minimized to the system tray instead of the taskbar.

## Features

### Tray Icon
- The application displays an icon in the system tray when running
- The icon remains visible even when the main window is hidden
- Located in: `public/tray-icon.svg`

### Tray Click Behavior
- **Left Click**: Restores the application window from the tray
- **Right Click**: Opens a context menu with options

### Context Menu
The tray context menu includes:
- **Show**: Restores and focuses the application window
- **Quit**: Completely exits the application

### Keyboard Shortcut
- **Ctrl+0** (or Cmd+0 on Mac): Hides the application to the system tray

## Implementation Details

### Components

1. **SystemTrayManager** (`electron/SystemTrayManager.ts`)
   - Manages the system tray icon and menu
   - Handles tray click events
   - Provides callbacks for show and quit actions

2. **WindowManager** (`electron/WindowManager.ts`)
   - Handles window visibility (show/hide)
   - Manages window state restoration

3. **KeyboardShortcutHandler** (`electron/KeyboardShortcutHandler.ts`)
   - Registers Ctrl+0 global shortcut
   - Triggers hide to tray action

### Setup Flow

1. Application starts (`main.ts`)
2. `setupSystemTray()` is called
3. Tray icon is created with the icon from `public/tray-icon.svg`
4. Callbacks are registered:
   - `onShow()`: Calls `windowManager.showWindow()`
   - `onQuit()`: Calls `app.quit()`
5. Context menu is built with "Show" and "Quit" options

## Creating a Custom Tray Icon

### Current Icon
The current tray icon is a simple SVG placeholder located at `public/tray-icon.svg`.

### Recommended Icon Specifications

For optimal display across all platforms:

- **Format**: PNG (preferred) or ICO for Windows
- **Size**: 16x16 pixels (standard) or 32x32 pixels (high-DPI)
- **Color**: Monochrome or simple 2-3 color design
- **Background**: Transparent
- **Style**: Simple, recognizable at small sizes

### Design Guidelines

1. **Simplicity**: Use a simple design that's recognizable at 16x16 pixels
2. **Contrast**: Ensure good contrast for visibility on both light and dark backgrounds
3. **Consistency**: Match your application's branding
4. **Platform Considerations**:
   - Windows: Supports PNG, ICO
   - macOS: Supports PNG, ICNS (template images recommended)
   - Linux: Supports PNG, SVG

### Creating the Icon

#### Option 1: Using Design Tools
1. Create a 16x16 or 32x32 pixel canvas
2. Design your icon (consider a mind map or tree symbol)
3. Export as PNG with transparent background
4. Save to `public/tray-icon.png`

#### Option 2: Using the Generator Script
```bash
node scripts/generate-tray-icon.js
```

This creates a placeholder SVG icon. Replace it with your custom design.

#### Option 3: Online Tools
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [IconGenerator](https://www.icongenerator.com/)

### Updating the Icon

1. Create your icon file (PNG recommended)
2. Save it as `public/tray-icon.png`
3. Update `electron/main.ts` if needed:
   ```typescript
   const iconPath = path.join(process.env.VITE_PUBLIC, 'tray-icon.png')
   ```
4. Rebuild the application

## Testing

### Manual Testing

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Test tray icon visibility**
   - Check that the tray icon appears in the system tray

3. **Test hide to tray**
   - Press Ctrl+0 (or Cmd+0 on Mac)
   - Verify the window hides
   - Verify the tray icon remains visible

4. **Test tray click**
   - Click the tray icon
   - Verify the window restores and focuses

5. **Test context menu**
   - Right-click the tray icon
   - Verify "Show" and "Quit" options appear
   - Test "Show" option
   - Test "Quit" option

### Platform-Specific Considerations

#### Windows
- Tray icons appear in the notification area (bottom-right)
- May be hidden in the overflow area
- PNG and ICO formats work best

#### macOS
- Tray icons appear in the menu bar (top-right)
- Template images (monochrome) are recommended
- Use PNG format

#### Linux
- Tray icon location varies by desktop environment
- PNG and SVG formats supported
- Some environments may not support system tray

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 7.1**: Ctrl+0 minimizes to system tray ✓
- **Requirement 7.2**: Tray icon is displayed ✓
- **Requirement 7.3**: Clicking tray icon restores window ✓
- **Requirement 7.4**: Application continues running in background ✓
- **Requirement 7.5**: Right-click shows context menu with show and quit options ✓

## Troubleshooting

### Tray Icon Not Appearing
- Verify the icon file exists at the specified path
- Check console for errors
- Ensure the icon format is supported on your platform

### Tray Icon Not Clickable
- Verify event handlers are properly registered
- Check that callbacks are set before creating the tray

### Window Not Restoring
- Verify `WindowManager.showWindow()` is called
- Check that the window instance is not destroyed

### Keyboard Shortcut Not Working
- Verify global shortcuts are registered
- Check for conflicts with system shortcuts
- Ensure the application has focus or global shortcut permissions
