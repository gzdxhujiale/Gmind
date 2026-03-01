import { dialog } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { MarkdownFile } from '../src/types/models';
import { FileChangedEvent } from '../src/types/ipc';

/**
 * FileSystemService handles all file system operations for the application
 */
export class FileSystemService {
  private watcher: chokidar.FSWatcher | null = null;
  private onFileChangeCallback: ((event: FileChangedEvent) => void) | null = null;

  /**
   * Sets the callback to be triggered when a watched file changes
   */
  onFileChanged(callback: (event: FileChangedEvent) => void) {
    this.onFileChangeCallback = callback;
  }

  /**
   * Opens a native folder selection dialog
   * @returns The selected folder path or null if cancelled
   */
  async selectFolder(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Markdown Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  }

  /**
   * Scans a folder for all .md files
   * @param folderPath The folder path to scan
   * @returns Array of MarkdownFile objects
   * @throws Error with user-friendly message for various failure scenarios
   */
  async readMarkdownFiles(folderPath: string): Promise<MarkdownFile[]> {
    try {
      // Handle missing folder path (Requirement 1.5)
      if (!folderPath || folderPath.trim() === '') {
        throw new Error('No folder path provided. Please select a folder containing Markdown files.');
      }

      // Check if folder exists (Requirement 1.5)
      let stats;
      try {
        stats = await fs.stat(folderPath);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          throw new Error(`The folder "${folderPath}" does not exist. It may have been moved or deleted.`);
        } else if (error.code === 'EACCES') {
          throw new Error(`Permission denied accessing folder "${folderPath}". Please check folder permissions.`);
        }
        throw new Error(`Unable to access folder "${folderPath}": ${error.message}`);
      }

      if (!stats.isDirectory()) {
        throw new Error(`"${folderPath}" is not a folder. Please select a valid folder.`);
      }

      // Read directory contents (Requirement 2.5)
      let entries;
      try {
        entries = await fs.readdir(folderPath, { withFileTypes: true });
      } catch (error: any) {
        if (error.code === 'EACCES') {
          throw new Error(`Permission denied reading folder "${folderPath}". Please check folder permissions.`);
        }
        throw new Error(`Unable to read folder contents: ${error.message}`);
      }

      // Filter for .md files
      const markdownFiles: MarkdownFile[] = [];
      const failedFiles: string[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const filePath = path.join(folderPath, entry.name);

          try {
            // Handle file read errors (Requirement 2.5)
            const content = await this.readFileContent(filePath);
            const fileStats = await fs.stat(filePath);

            markdownFiles.push({
              name: entry.name,
              path: filePath,
              content,
              lastModified: fileStats.mtimeMs,
            });
          } catch (error: any) {
            // Log failed file but continue with others
            console.error(`Failed to read file ${entry.name}:`, error.message);
            failedFiles.push(entry.name);
          }
        }
      }

      // Handle empty folders (Requirement 2.5)
      if (markdownFiles.length === 0 && failedFiles.length === 0) {
        throw new Error(`No Markdown files (.md) found in "${folderPath}". Please select a folder containing .md files.`);
      }

      // Warn about failed files but return successful ones
      if (failedFiles.length > 0) {
        console.warn(`Successfully loaded ${markdownFiles.length} file(s), but failed to read ${failedFiles.length} file(s): ${failedFiles.join(', ')}`);
      }

      return markdownFiles;
    } catch (error) {
      console.error('Error reading markdown files:', error);
      throw error;
    }
  }

  /**
   * Reads the content of a single file
   * @param filePath The file path to read
   * @returns The file content as a string
   * @throws Error with user-friendly message for various failure scenarios
   */
  async readFileContent(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error: any) {
      // Handle file read errors with user-friendly messages (Requirement 2.5)
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: "${filePath}". It may have been moved or deleted.`);
      } else if (error.code === 'EACCES') {
        throw new Error(`Permission denied reading file: "${filePath}". Please check file permissions.`);
      } else if (error.code === 'EISDIR') {
        throw new Error(`"${filePath}" is a directory, not a file.`);
      }

      console.error('Error reading file content:', error);
      throw new Error(`Unable to read file "${filePath}": ${error.message}`);
    }
  }

  /**
   * Watches a folder for markdown file changes (.md files only)
   * @param folderPath The folder path to watch. Call with null/empty to stop watching.
   */
  async watchFolder(folderPath: string | null) {
    // Stop any existing watcher
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    if (!folderPath || folderPath.trim() === '') {
      return;
    }

    try {
      // Initialize chokidar to watch .md files in this directory (non-recursive by default implementation)
      this.watcher = chokidar.watch('*.md', {
        cwd: folderPath,
        depth: 0,
        ignoreInitial: true, // We don't want 'add' events for already existing files on launch
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100
        }
      });

      this.watcher
        .on('add', (filename) => {
          if (this.onFileChangeCallback) {
            this.onFileChangeCallback({ action: 'add', filePath: path.join(folderPath, filename) });
          }
        })
        .on('change', (filename) => {
          if (this.onFileChangeCallback) {
            this.onFileChangeCallback({ action: 'change', filePath: path.join(folderPath, filename) });
          }
        })
        .on('unlink', (filename) => {
          if (this.onFileChangeCallback) {
            this.onFileChangeCallback({ action: 'unlink', filePath: path.join(folderPath, filename) });
          }
        });

      console.log(`Started watching folder: ${folderPath}`);
    } catch (error) {
      console.error(`Failed to start watching folder: ${folderPath}`, error);
    }
  }
}
