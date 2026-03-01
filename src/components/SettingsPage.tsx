/**
 * SettingsPage - 应用程序配置的设置面板
 * 包括视图模式切换、文件夹选择和工具栏位置
 */

import React from 'react';
import { Button, Space, Radio, Switch, Drawer, Empty } from '@arco-design/web-react';
const RadioGroup = Radio.Group;
import {
  IconFolder,
  IconApps,
  IconList,
} from '@arco-design/web-react/icon';
import { useAppStore } from '../store/useAppStore';
import { storageService } from '../services/StorageService';
import { IPC_CHANNELS } from '../types/ipc';
import { ViewMode } from '../types/models';
import './SettingsPage.css';

export const SettingsPage: React.FC = React.memo(() => {
  const {
    settingsVisible,
    hideSettings,
    viewMode,
    setViewMode,
    toolbarVisible,
    toggleToolbar,
    toolbarPosition,
    setToolbarPosition,
    selectedFolder,
    setSelectedFolder,
    loadMarkdownFiles,
    setLoading,
    hideOutlineTitle,
    setHideOutlineTitle,
  } = useAppStore();

  if (!settingsVisible) {
    return null;
  }

  const handleViewModeChange = (value: ViewMode) => {
    setViewMode(value);
  };

  const handlePositionChange = (position: 'top' | 'bottom' | 'left' | 'right') => {
    setToolbarPosition(position);
  };

  const handleToolbarVisibilityChange = (value: boolean) => {
    if (value !== toolbarVisible) {
      toggleToolbar();
      const preferences = storageService.getPreferences();
      storageService.savePreferences({
        ...preferences,
        toolbarVisible: value,
      });
    }
  };

  const handleHideOutlineTitleChange = (value: boolean) => {
    setHideOutlineTitle(value);
  };

  const handleSelectFolder = async () => {
    try {
      const response = await window.ipcRenderer.invoke(IPC_CHANNELS.SELECT_FOLDER);

      if (response.folderPath) {
        setSelectedFolder(response.folderPath);
        storageService.saveFolderPath(response.folderPath);
        setLoading(true);

        const filesResponse = await window.ipcRenderer.invoke(
          IPC_CHANNELS.READ_MARKDOWN_FILES,
          { folderPath: response.folderPath }
        );

        if (filesResponse.error) {
          console.error('Error reading markdown files:', filesResponse.error);
          loadMarkdownFiles([]);
          setLoading(false);
        } else {
          loadMarkdownFiles(filesResponse.files);
        }
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    hideSettings();
  };

  return (
    <Drawer
      title="设置"
      visible={settingsVisible}
      onCancel={handleClose}
      footer={null}
      width={360}
      className="settings-drawer"
    >
      <div className="settings-content">
        {/* 视图模式 */}
        <div className="settings-section">
          <h3>视图模式</h3>
          <div className="settings-option">
            <RadioGroup
              value={viewMode}
              onChange={(value) => handleViewModeChange(value as ViewMode)}
            >
              <Radio value="outline">
                <span className="radio-label">
                  <IconList />
                  大纲模式
                </span>
              </Radio>
              <Radio value="mindmap">
                <span className="radio-label">
                  <IconApps />
                  思维导图
                </span>
              </Radio>
            </RadioGroup>
          </div>
        </div>

        {/* 大纲视图设置 */}
        <div className="settings-section">
          <h3>大纲视图</h3>
          <div className="settings-option">
            <div className="toolbar-visibility-row">
              <span>隐藏文件名标题</span>
              <Switch
                checked={hideOutlineTitle}
                onChange={handleHideOutlineTitleChange}
              />
            </div>
          </div>
        </div>

        {/* 文件夹选择 */}
        <div className="settings-section">
          <h3>文件夹</h3>
          <div className="settings-option">
            <div className="folder-info">
              {selectedFolder ? (
                <span className="folder-path" title={selectedFolder}>
                  {selectedFolder}
                </span>
              ) : (
                <Empty description="尚未选择对应文件夹" />
              )}
            </div>
            <Button
              icon={<IconFolder />}
              onClick={handleSelectFolder}
              type="outline"
            >
              选择文件夹
            </Button>
          </div>
        </div>

        {/* 工具栏设置 */}
        <div className="settings-section">
          <h3>工具栏</h3>
          <div className="settings-option">
            <div className="toolbar-visibility-row">
              <span>显示工具栏</span>
              <Switch
                checked={toolbarVisible}
                onChange={handleToolbarVisibilityChange}
              />
            </div>
          </div>
          <div className="settings-option position-buttons">
            <span className="position-label">位置</span>
            <Space size="small">
              <Button
                shape="square"
                type={toolbarPosition === 'top' ? 'primary' : 'outline'}
                onClick={() => handlePositionChange('top')}
                title="顶部"
              >
                ↑
              </Button>
              <Button
                shape="square"
                type={toolbarPosition === 'bottom' ? 'primary' : 'outline'}
                onClick={() => handlePositionChange('bottom')}
                title="底部"
              >
                ↓
              </Button>
              <Button
                shape="square"
                type={toolbarPosition === 'left' ? 'primary' : 'outline'}
                onClick={() => handlePositionChange('left')}
                title="左侧"
              >
                ←
              </Button>
              <Button
                shape="square"
                type={toolbarPosition === 'right' ? 'primary' : 'outline'}
                onClick={() => handlePositionChange('right')}
                title="右侧"
              >
                →
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Drawer>
  );
});

SettingsPage.displayName = 'SettingsPage';
