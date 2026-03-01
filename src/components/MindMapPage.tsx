/**
 * MindMapPage - 用于将 markdown 文件显示为思维导图或大纲的主页面组件
 * 结合选项卡导航、视图渲染和内容弹出窗口
 */

import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { TabNavigation } from './TabNavigation';
import { MindMapRenderer } from './MindMapRenderer';
import { OutlineView } from './OutlineView';
import { ContentPopup } from './ContentPopup';
import { SettingsPage } from './SettingsPage';
import { markdownParser } from '../services/MarkdownParser';
import { HeadingNode } from '../types/models';
import './MindMapPage.css';

/**
 * MindMapPage 组件
 * 
 * 用于将 markdown 文件显示为思维导图的主页面
 * - 显示选项卡导航以在文件之间切换
 * - 为活动选项卡渲染思维导图
 * - 处理叶节点点击以显示内容弹出窗口 (需求 5.1)
 * 
 * 已记忆化以防止不必要的重新渲染
 */
export const MindMapPage: React.FC = React.memo(() => {
  const tabs = useAppStore((state) => state.tabs);
  const activeTabIndex = useAppStore((state) => state.activeTabIndex);
  const markdownFiles = useAppStore((state) => state.markdownFiles);
  const showPopup = useAppStore((state) => state.showPopup);
  const viewMode = useAppStore((state) => state.viewMode);

  // 获取活动选项卡
  const activeTab = useMemo(() => {
    if (activeTabIndex >= 0 && activeTabIndex < tabs.length) {
      return tabs[activeTabIndex];
    }
    return null;
  }, [tabs, activeTabIndex]);

  // 为活动选项卡解析 markdown 内容
  const { headingTree, parseError, isParsing } = useMemo(() => {
    if (!activeTab) return { headingTree: null, parseError: null, isParsing: false };

    // 查找对应的 markdown 文件
    const markdownFile = markdownFiles.find(
      (file) => file.path === activeTab.filePath
    );

    if (!markdownFile) return { headingTree: null, parseError: null, isParsing: false };

    // 解析 markdown 内容 (需求 3.5)
    try {
      const tree = markdownParser.parse(markdownFile.content);
      return { headingTree: tree, parseError: null, isParsing: false };
    } catch (error) {
      // 在解析错误时显示可用内容 (需求 3.5)
      console.error('Error parsing markdown:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse markdown file';
      return { headingTree: null, parseError: errorMessage, isParsing: false };
    }
  }, [activeTab, markdownFiles]);

  /**
   * 处理节点点击 - 显示带有标题和内容的弹出窗口
   * 需求 5.1: 点击任何节点时显示内容弹出窗口
   * 已记忆化以防止不必要的重新渲染
   */
  const handleNodeClick = React.useCallback((node: HeadingNode) => {
    // 为具有内容或为叶节点的任何节点显示弹出窗口
    if (node.content || node.isLeaf) {
      showPopup(node.text, node.content);
    }
  }, [showPopup]);

  // 如果没有选项卡则显示消息 (需求 2.5)
  if (tabs.length === 0) {
    return (
      <div className="mind-map-page">
        <div className="no-files-message">
          <p>No Markdown files (.md) found in the selected folder.</p>
          <p className="help-text">Please select a folder containing .md files to view them as mind maps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mind-map-page">
      <TabNavigation />
      <div className="mind-map-container">
        {isParsing ? (
          // 解析时显示加载状态
          <div className="parsing-state">
            <div className="parsing-spinner"></div>
            <p>Parsing markdown file...</p>
          </div>
        ) : parseError ? (
          // 显示解析错误消息 (需求 3.5)
          <div className="parse-error-message">
            <p className="error-title">解析错误</p>
            <p className="error-text">{parseError}</p>
            <p className="help-text">Markdown 文件可能包含无效语法或已损坏。</p>
          </div>
        ) : viewMode === 'outline' ? (
          <OutlineView
            headingTree={headingTree}
            filename={activeTab?.filename || '文件'}
          />
        ) : (
          <MindMapRenderer
            headingTree={headingTree}
            onNodeClick={handleNodeClick}
            filename={activeTab?.filename || '文件'}
          />
        )}
      </div>
      <ContentPopup />
      <SettingsPage />
    </div>
  );
});
