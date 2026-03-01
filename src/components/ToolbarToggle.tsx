/**
 * ToolbarToggle - 隐藏工具栏时显示工具栏的浮动按钮
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import './ToolbarToggle.css';

export const ToolbarToggle: React.FC = React.memo(() => {
  const toolbarVisible = useAppStore((state) => state.toolbarVisible);
  const toggleToolbar = useAppStore((state) => state.toggleToolbar);

  // 只在工具栏隐藏时显示
  if (toolbarVisible) {
    return null;
  }

  return (
    <button
      className="toolbar-toggle-button"
      onClick={toggleToolbar}
      title="Show toolbar (Ctrl++)"
      aria-label="Show toolbar"
    >
      <span className="toggle-icon">☰</span>
    </button>
  );
});

ToolbarToggle.displayName = 'ToolbarToggle';
