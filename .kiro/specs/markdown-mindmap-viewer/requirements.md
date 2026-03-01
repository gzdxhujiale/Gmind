# Requirements Document

## Introduction

This document specifies the requirements for a Markdown Mind Map Viewer, an Electron-based desktop application that reads Markdown files from a selected folder and visualizes their heading structure as interactive mind maps. The application provides tab-based navigation, keyboard shortcuts, system tray integration, and customizable UI layout.

## Glossary

- **Application**: The Markdown Mind Map Viewer desktop application
- **User**: The person operating the Application
- **Folder Path**: A directory location on the file system containing Markdown files
- **Markdown File**: A text file with .md extension containing formatted text with headings
- **Tab**: A UI element representing one Markdown File in the Application
- **Mind Map**: A visual tree representation of heading hierarchy from a Markdown File
- **Heading**: A Markdown heading element (H1, H2, H3, etc.) that defines document structure
- **Leaf Node**: The lowest-level Heading in a branch of the Mind Map hierarchy
- **Content Popup**: A modal dialog displaying a Heading and its associated text content
- **Toolbar**: A UI panel containing application controls and navigation elements
- **System Tray**: The operating system's notification area where applications can be minimized

## Requirements

### Requirement 1

**User Story:** As a user, I want to select a folder containing Markdown files and have the application remember my choice, so that I can quickly access my documents on subsequent launches.

#### Acceptance Criteria

1. WHEN the Application starts for the first time, THE Application SHALL display a home page with folder selection functionality
2. WHEN the User selects a Folder Path, THE Application SHALL persist the Folder Path to local storage
3. WHEN the Application starts after initial configuration, THE Application SHALL automatically load the previously selected Folder Path
4. WHEN the User changes the Folder Path, THE Application SHALL update the persisted Folder Path immediately
5. WHERE the persisted Folder Path no longer exists, THE Application SHALL display the folder selection interface

### Requirement 2

**User Story:** As a user, I want to see all Markdown files in my selected folder as separate tabs, so that I can easily navigate between different documents.

#### Acceptance Criteria

1. WHEN a Folder Path is selected, THE Application SHALL scan the directory for all Markdown Files
2. WHEN Markdown Files are found, THE Application SHALL create one Tab for each Markdown File
3. WHEN displaying Tabs, THE Application SHALL show the filename without the .md extension as the Tab label
4. WHEN the User clicks a Tab, THE Application SHALL display the corresponding Mind Map
5. WHEN no Markdown Files exist in the Folder Path, THE Application SHALL display an appropriate message

### Requirement 3

**User Story:** As a user, I want the application to parse Markdown files and extract all heading levels, so that the structure can be visualized as a mind map.

#### Acceptance Criteria

1. WHEN a Markdown File is loaded, THE Application SHALL parse the file content using a Markdown parsing library
2. WHEN parsing completes, THE Application SHALL extract all Headings with their hierarchy levels
3. WHEN extracting Headings, THE Application SHALL preserve the parent-child relationships between heading levels
4. WHEN a Heading has associated content, THE Application SHALL store the content text linked to that Heading
5. WHEN parsing encounters malformed Markdown, THE Application SHALL handle errors gracefully and display available content

### Requirement 4

**User Story:** As a user, I want to see the heading structure visualized as an interactive mind map, so that I can understand the document organization at a glance.

#### Acceptance Criteria

1. WHEN Headings are extracted from a Markdown File, THE Application SHALL render them as a Mind Map visualization
2. WHEN rendering the Mind Map, THE Application SHALL display all heading levels from root to Leaf Node
3. WHEN displaying Mind Map nodes, THE Application SHALL show parent-child relationships with visual connections
4. WHEN the Mind Map is displayed, THE Application SHALL support zooming and panning interactions
5. WHEN the Mind Map layout is calculated, THE Application SHALL arrange nodes to minimize overlap and maximize readability

### Requirement 5

**User Story:** As a user, I want to click on leaf nodes in the mind map to view their content, so that I can read the detailed text without leaving the visualization.

#### Acceptance Criteria

1. WHEN the User clicks a Leaf Node, THE Application SHALL display a Content Popup
2. WHEN the Content Popup is displayed, THE Application SHALL show the Heading text and its associated content
3. WHEN the User clicks outside the Content Popup, THE Application SHALL close the Content Popup
4. WHEN a Leaf Node has no associated content, THE Application SHALL display the Heading text only
5. WHEN the Content Popup is open, THE Application SHALL prevent interaction with the Mind Map behind it

### Requirement 6

**User Story:** As a user, I want to use keyboard shortcuts to switch between tabs quickly, so that I can navigate efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN the User presses Ctrl+1 through Ctrl+9, THE Application SHALL switch to the corresponding Tab by index
2. WHEN the User presses a Tab shortcut for a non-existent Tab, THE Application SHALL ignore the input
3. WHEN the Application switches Tabs via keyboard, THE Application SHALL display the corresponding Mind Map immediately
4. WHEN keyboard shortcuts are triggered, THE Application SHALL provide visual feedback of the active Tab

### Requirement 7

**User Story:** As a user, I want to hide the application to the system tray with a keyboard shortcut, so that I can quickly access it without cluttering my taskbar.

#### Acceptance Criteria

1. WHEN the User presses Ctrl+0, THE Application SHALL minimize to the System Tray
2. WHEN the Application is in the System Tray, THE Application SHALL display a tray icon
3. WHEN the User clicks the System Tray icon, THE Application SHALL restore the window to its previous state
4. WHEN the Application is hidden, THE Application SHALL continue running in the background
5. WHEN the User right-clicks the System Tray icon, THE Application SHALL display a context menu with show and quit options

### Requirement 8

**User Story:** As a user, I want to resize the application window freely, so that I can adjust it to fit my screen and workflow.

#### Acceptance Criteria

1. WHEN the User drags the window edges, THE Application SHALL resize responsively
2. WHEN the window is resized, THE Application SHALL reflow the Mind Map to fit the available space
3. WHEN the window size changes, THE Application SHALL maintain the aspect ratio of UI elements appropriately
4. WHEN the Application starts, THE Application SHALL restore the previous window size if available

### Requirement 9

**User Story:** As a user, I want to show, hide, and reposition the toolbar, so that I can customize the interface to my preferences.

#### Acceptance Criteria

1. WHEN the User toggles toolbar visibility, THE Application SHALL show or hide the Toolbar
2. WHEN the Toolbar is hidden, THE Application SHALL expand the main content area to fill the space
3. WHEN the User changes Toolbar position, THE Application SHALL move the Toolbar to the specified edge (top, bottom, left, or right)
4. WHEN the Toolbar position changes, THE Application SHALL adjust the layout to accommodate the new position
5. WHEN the Application restarts, THE Application SHALL restore the previous Toolbar visibility and position settings

### Requirement 10

**User Story:** As a user, I want the home page to have a clear layout with a toolbar and main functional area, so that I can easily understand and use the application.

#### Acceptance Criteria

1. WHEN the home page is displayed, THE Application SHALL show the Toolbar and main functional area in vertical layout
2. WHEN the Toolbar is positioned at top or bottom, THE Application SHALL use vertical stacking layout
3. WHEN the Toolbar is positioned at left or right, THE Application SHALL use horizontal layout
4. WHEN the main functional area is displayed, THE Application SHALL show folder selection controls on the home page
5. WHEN a Folder Path is selected, THE Application SHALL transition from home page to mind map page
