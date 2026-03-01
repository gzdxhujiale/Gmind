/**
 * Toolbar 组件
 * 
 * 提供具有可自定义位置和可见性的应用程序控件
 * 支持在顶部、底部、左侧或右侧边缘定位
 * 包括窗口控件（最小化、最大化、关闭）
 * 
 * 需求: 9.1, 9.3, 9.4, 10.2, 10.3
 */

import React, { useState, useEffect } from 'react';
import { Button, Space, Tooltip } from '@arco-design/web-react';
import {
  IconMinus,
  IconFullscreen,
  IconClose,
  IconFullscreenExit
} from '@arco-design/web-react/icon';
import { useAppStore } from '../store/useAppStore';
import { IPC_CHANNELS } from '../types/ipc';
import './Toolbar.css';

export const Toolbar = React.memo(() => {
  const {
    toolbarVisible,
    toolbarPosition,
  } = useAppStore();
  const [isMaximized, setIsMaximized] = useState(false);

  // 加载时检查窗口是否最大化
  useEffect(() => {
    const checkMaximized = async () => {
      if (window.ipcRenderer) {
        const maximized = await window.ipcRenderer.invoke(IPC_CHANNELS.IS_MAXIMIZED);
        setIsMaximized(maximized);
      }
    };
    checkMaximized();
  }, []);

  /**
   * 窗口控件处理程序
   */
  const handleMinimize = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke(IPC_CHANNELS.MINIMIZE_WINDOW);
    }
  };

  const handleMaximize = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke(IPC_CHANNELS.MAXIMIZE_WINDOW);
      const maximized = await window.ipcRenderer.invoke(IPC_CHANNELS.IS_MAXIMIZED);
      setIsMaximized(maximized);
    }
  };

  const handleClose = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke(IPC_CHANNELS.CLOSE_WINDOW);
    }
  };

  const handleHideToTray = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke(IPC_CHANNELS.HIDE_WINDOW);
    }
  };

  // 如果工具栏隐藏则不渲染
  if (!toolbarVisible) {
    return null;
  }

  /**
   * 根据位置确定布局方向
   * 需求 10.2, 10.3: 顶部/底部为垂直布局，左侧/右侧为水平布局
   */
  const isHorizontalPosition = toolbarPosition === 'left' || toolbarPosition === 'right';

  return (
    <div
      className={`toolbar toolbar-${toolbarPosition}`}
      data-position={toolbarPosition}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className={`toolbar-content ${isHorizontalPosition ? 'toolbar-content-vertical' : 'toolbar-content-horizontal'}`}>
        {/* 窗口控件 */}
        <div className="toolbar-section window-controls" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <Space size="small">
            <Tooltip content="最小化" position="bottom">
              <Button
                shape="square"
                type="text"
                onClick={handleMinimize}
                icon={<IconMinus />}
              />
            </Tooltip>
            <Tooltip content={isMaximized ? "还原" : "最大化"} position="bottom">
              <Button
                shape="square"
                type="text"
                onClick={handleMaximize}
                icon={isMaximized ? <IconFullscreenExit /> : <IconFullscreen />}
              />
            </Tooltip>
            <Tooltip content="隐藏到托盘 (Ctrl+0)" position="bottom">
              <Button
                shape="square"
                type="text"
                onClick={handleHideToTray}
              >
                ▼
              </Button>
            </Tooltip>
            <Tooltip content="关闭" position="bottom">
              <Button
                shape="square"
                type="text"
                onClick={handleClose}
                status="danger"
                icon={<IconClose />}
              />
            </Tooltip>
          </Space>
        </div>
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';
