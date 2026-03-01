# Manual Testing Guide - System Tray Functionality

## Overview

This guide provides step-by-step instructions for manually testing the system tray functionality of the Markdown Mind Map Viewer application.

## Prerequisites

- Application must be built and running
- System tray must be visible on your operating system

## Test Cases

### Test Case 1: Tray Icon Visibility

**Objective**: Verify that the tray icon appears when the application starts

**Steps**:
1. Start the application using `npm run dev` or run the built executable
2. Look for the application icon in the system tray
   - **Windows**: Bottom-right corner (notification area)
   - **macOS**: Top-right corner (menu bar)
   - **Linux**: Varies by desktop environment

**Expected Result**:
- ✓ Tray icon is visible in the system tray
- ✓ Icon displays correctly (not broken or missing)
- ✓ Hovering over the icon shows "Markdown Mind Map Viewer" tooltip

**Status**: [ ] Pass [ ] Fail

---

### Test Case 2: Hide to Tray with Keyboard Shortcut

**Objective**: Verify that Ctrl+0 (Cmd+0 on Mac) hides the window to the tray

**Steps**:
1. Ensure the application window is visible and focused
2. Press `Ctrl+0` (or `Cmd+0` on macOS)
3. Observe the application window

**Expected Result**:
- ✓ Application window disappears from the screen
- ✓ Application window is removed from the taskbar
- ✓ Tray icon remains visible
- ✓ Application process continues running (check Task Manager/Activity Monitor)

**Status**: [ ] Pass [ ] Fail

---

### Test Case 3: Restore Window with Tray Click

**Objective**: Verify that clicking the tray icon restores the window

**Prerequisites**: Application window must be hidden (use Test Case 2)

**Steps**:
1. Locate the tray icon in the system tray
2. Click the tray icon once (left-click)
3. Observe the application window

**Expected Result**:
- ✓ Application window reappears on screen
- ✓ Window is brought to the foreground and focused
- ✓ Window appears in the same position and size as before hiding
- ✓ Application state is preserved (same folder, same tab, etc.)

**Status**: [ ] Pass [ ] Fail

---

### Test Case 4: Tray Context Menu - Show Option

**Objective**: Verify that the "Show" option in the context menu works

**Prerequisites**: Application window must be hidden

**Steps**:
1. Locate the tray icon in the system tray
2. Right-click the tray icon
3. Observe the context menu
4. Click "Show" option

**Expected Result**:
- ✓ Context menu appears with options
- ✓ "Show" option is visible
- ✓ Clicking "Show" restores the application window
- ✓ Window is brought to the foreground and focused

**Status**: [ ] Pass [ ] Fail

---

### Test Case 5: Tray Context Menu - Quit Option

**Objective**: Verify that the "Quit" option in the context menu works

**Steps**:
1. Locate the tray icon in the system tray
2. Right-click the tray icon
3. Observe the context menu
4. Click "Quit" option
5. Check if the application process is still running

**Expected Result**:
- ✓ Context menu appears with options
- ✓ "Quit" option is visible
- ✓ Clicking "Quit" closes the application completely
- ✓ Tray icon disappears
- ✓ Application process terminates (verify in Task Manager/Activity Monitor)

**Status**: [ ] Pass [ ] Fail

---

### Test Case 6: Context Menu Structure

**Objective**: Verify the context menu has the correct structure

**Steps**:
1. Right-click the tray icon
2. Examine the context menu structure

**Expected Result**:
- ✓ Menu contains "Show" option
- ✓ Menu contains a separator line
- ✓ Menu contains "Quit" option
- ✓ Options are in the correct order: Show, Separator, Quit

**Status**: [ ] Pass [ ] Fail

---

### Test Case 7: Background Process Continuity

**Objective**: Verify that the application continues running when hidden

**Prerequisites**: Application window must be hidden

**Steps**:
1. Hide the application window (Ctrl+0 or click tray icon)
2. Open Task Manager (Windows) or Activity Monitor (macOS)
3. Look for the application process
4. Wait 30 seconds
5. Check if the process is still running

**Expected Result**:
- ✓ Application process is visible in the process list
- ✓ Process continues running while window is hidden
- ✓ Process does not consume excessive CPU or memory
- ✓ Tray icon remains responsive

**Status**: [ ] Pass [ ] Fail

---

### Test Case 8: Multiple Hide/Restore Cycles

**Objective**: Verify that hiding and restoring works consistently

**Steps**:
1. Hide the window (Ctrl+0)
2. Restore the window (click tray icon)
3. Repeat steps 1-2 five times
4. Observe behavior on each cycle

**Expected Result**:
- ✓ Each hide operation works correctly
- ✓ Each restore operation works correctly
- ✓ No memory leaks or performance degradation
- ✓ Application state is preserved across cycles

**Status**: [ ] Pass [ ] Fail

---

### Test Case 9: Tray Icon with Window Visible

**Objective**: Verify tray icon behavior when window is already visible

**Prerequisites**: Application window must be visible

**Steps**:
1. Ensure the application window is visible
2. Click the tray icon
3. Observe the window behavior

**Expected Result**:
- ✓ Window remains visible (does not hide)
- ✓ Window is brought to the foreground if it was behind other windows
- ✓ Window receives focus

**Status**: [ ] Pass [ ] Fail

---

### Test Case 10: Keyboard Shortcut with Invalid Tab Index

**Objective**: Verify that Ctrl+0 only hides to tray (not tab switching)

**Steps**:
1. Ensure the application window is visible
2. Press Ctrl+0
3. Observe the behavior

**Expected Result**:
- ✓ Window hides to tray (does not attempt to switch to tab 0)
- ✓ No error messages appear
- ✓ Tray icon remains visible

**Status**: [ ] Pass [ ] Fail

---

## Platform-Specific Tests

### Windows-Specific Tests

#### Test: Tray Icon in Overflow Area
**Steps**:
1. If the tray icon is in the overflow area (hidden icons), click the up arrow
2. Verify the icon appears in the overflow menu
3. Click the icon from the overflow menu

**Expected Result**:
- ✓ Icon is accessible from overflow area
- ✓ Clicking from overflow works the same as clicking from main tray

---

### macOS-Specific Tests

#### Test: Menu Bar Icon
**Steps**:
1. Verify the icon appears in the menu bar (top-right)
2. Test with both light and dark mode

**Expected Result**:
- ✓ Icon is visible in both light and dark mode
- ✓ Icon has appropriate contrast

---

### Linux-Specific Tests

#### Test: Desktop Environment Compatibility
**Steps**:
1. Test on your specific desktop environment (GNOME, KDE, XFCE, etc.)
2. Verify tray icon appears and functions correctly

**Expected Result**:
- ✓ Icon appears in the system tray area
- ✓ All functionality works as expected

---

## Regression Tests

### After Code Changes

Run all test cases above after making changes to:
- SystemTrayManager.ts
- WindowManager.ts
- KeyboardShortcutHandler.ts
- main.ts (tray setup code)

### Before Release

Run all test cases on all supported platforms:
- [ ] Windows 10/11
- [ ] macOS (latest version)
- [ ] Linux (Ubuntu/Fedora)

---

## Troubleshooting

### Tray Icon Not Appearing
- Check console for errors
- Verify icon file exists at `public/tray-icon.svg`
- Try restarting the application

### Keyboard Shortcut Not Working
- Verify no other application is using Ctrl+0
- Check if global shortcuts are enabled
- Try clicking the tray icon instead

### Window Not Restoring
- Check if window is minimized vs hidden
- Verify WindowManager.showWindow() is being called
- Check console for errors

---

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Tray Icon Visibility | [ ] | |
| 2. Hide to Tray (Ctrl+0) | [ ] | |
| 3. Restore with Click | [ ] | |
| 4. Context Menu - Show | [ ] | |
| 5. Context Menu - Quit | [ ] | |
| 6. Menu Structure | [ ] | |
| 7. Background Process | [ ] | |
| 8. Multiple Cycles | [ ] | |
| 9. Tray with Visible Window | [ ] | |
| 10. Ctrl+0 Behavior | [ ] | |

**Overall Status**: [ ] All Pass [ ] Some Failures

**Tested By**: _______________
**Date**: _______________
**Platform**: _______________
**Version**: _______________

---

## Notes

Add any additional observations or issues here:

