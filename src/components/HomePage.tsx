/**
 * HomePage 组件
 * 
 * 当未选择文件夹时显示文件夹选择界面
 * 允许用户选择包含 markdown 文件的文件夹
 * 
 * 需求: 1.1, 10.1, 10.4
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { storageService } from '../services/StorageService';
import './HomePage.css';

export const HomePage = React.memo(() => {
  const { selectedFolder, setSelectedFolder, loadMarkdownFiles, setLoading } = useAppStore();
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * 处理文件夹选择
   * 
   * 需求:
   * - 1.1: 显示文件夹选择功能
   * - 1.2: 将文件夹路径持久化到本地存储
   * - 10.4: 在主页显示文件夹选择控件
   * - 1.5, 2.5: 显示用户友好的错误消息
   */
  const handleSelectFolder = async () => {
    try {
      setErrorMessage('');

      // Dynamic import for Tauri to avoid SSR issues if ever applicable
      const { invoke } = await import('@tauri-apps/api/core');
      const { open } = await import('@tauri-apps/plugin-dialog');

      // Use Tauri dialog plugin to select a folder
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'Select Markdown Folder',
      });

      // User cancelled
      if (folderPath === null) {
        // Stop watching if user cancelled (to match original behavior)
        await invoke('watch_folder', { folderPath: null });
        return;
      }

      const selectedPath = Array.isArray(folderPath) ? folderPath[0] : folderPath;

      if (selectedPath) {
        setSelectedFolder(selectedPath);
        storageService.saveFolderPath(selectedPath);
        setLoading(true);

        try {
          // Read markdown files using Tauri command
          const files = await invoke('read_markdown_files', { folderPath: selectedPath });

          // Start watching folder
          await invoke('watch_folder', { folderPath: selectedPath });

          loadMarkdownFiles(files as any[]);
        } catch (err: any) {
          console.error('Error reading markdown files:', err);
          setErrorMessage(err as string);
          loadMarkdownFiles([]);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      // 显示用户友好的错误消息 (需求 1.5, 2.5)
      console.error('Failed to select folder:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred while selecting the folder.';
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <h1>Markdown Mind Map Viewer</h1>

        {/* 如果可用，显示当前文件夹路径 (需求 10.1) */}
        {selectedFolder && (
          <div className="current-folder">
            <p className="folder-label">Current Folder:</p>
            <p className="folder-path">{selectedFolder}</p>
          </div>
        )}

        {/* 未选择文件夹时显示适当的消息 (需求 1.1) */}
        {!selectedFolder && !errorMessage && (
          <p className="welcome-message">
            Select a folder containing Markdown files to get started
          </p>
        )}

        {/* 显示错误消息 (需求 1.5, 2.5) */}
        {errorMessage && (
          <div className="error-message">
            <p className="error-title">Error</p>
            <p className="error-text">{errorMessage}</p>
          </div>
        )}

        {/* 文件夹选择按钮 (需求 1.1, 10.4) */}
        <button
          className="select-folder-button"
          onClick={handleSelectFolder}
        >
          {selectedFolder ? 'Change Folder' : 'Select Folder'}
        </button>
      </div>
    </div>
  );
});
