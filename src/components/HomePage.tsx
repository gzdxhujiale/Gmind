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
import { IPC_CHANNELS } from '../types/ipc';
import type { SelectFolderResponse, ReadMarkdownFilesResponse } from '../types/ipc';
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
      // 清除之前的错误消息
      setErrorMessage('');

      // 调用 IPC 显示文件夹选择对话框
      const response: SelectFolderResponse = await window.ipcRenderer.invoke(
        IPC_CHANNELS.SELECT_FOLDER
      );

      if (response.folderPath) {
        // 更新状态
        setSelectedFolder(response.folderPath);
        
        // 持久化到存储 (需求 1.2)
        storageService.saveFolderPath(response.folderPath);

        // 读取文件时显示加载状态
        setLoading(true);

        // 从选定的文件夹加载 markdown 文件
        const filesResponse: ReadMarkdownFilesResponse = await window.ipcRenderer.invoke(
          IPC_CHANNELS.READ_MARKDOWN_FILES,
          { folderPath: response.folderPath }
        );

        if (filesResponse.error) {
          // 显示用户友好的错误消息 (需求 1.5, 2.5)
          console.error('Error reading markdown files:', filesResponse.error);
          setErrorMessage(filesResponse.error);
          loadMarkdownFiles([]);
          setLoading(false);
        } else {
          loadMarkdownFiles(filesResponse.files);
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
