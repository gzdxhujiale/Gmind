/**
 * OutlineView - 用于将 markdown 标题显示为分层大纲的组件
 * 默认视图模式，具有可折叠部分和 Markdown 渲染
 */

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { HeadingNode } from '../types/models';
import { useAppStore } from '../store/useAppStore';
import './OutlineView.css';

interface OutlineViewProps {
  headingTree: HeadingNode | null;
  filename?: string;
}

interface OutlineItemProps {
  node: HeadingNode;
  level: number;
}

/**
 * 具有可折叠内容的单个大纲项
 */
const OutlineItem: React.FC<OutlineItemProps> = React.memo(({ node, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRowClick = useCallback(() => {
    // 切换所有项目的展开（子节点或内容）
    setIsExpanded(prev => !prev);
  }, []);

  const handleContentRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // 右键点击内容区域以折叠它
    setIsExpanded(false);
  }, []);

  const hasChildren = node.children.length > 0;
  const hasContent = node.content && node.content.trim().length > 0;
  const isExpandable = hasChildren || hasContent;

  return (
    <div className={`outline-item outline-level-${level}`}>
      <div 
        className={`outline-header ${isExpandable ? 'expandable' : ''}`} 
        onClick={isExpandable ? handleRowClick : undefined}
      >
        {isExpandable && (
          <span className="outline-toggle">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!isExpandable && <span className="outline-toggle-placeholder" />}
        <span className="outline-title">
          {node.text}
        </span>
      </div>

      {/* 内容部分 - 展开且有内容时显示 */}
      {isExpanded && hasContent && (
        <div className="outline-content" onContextMenu={handleContentRightClick}>
          <ReactMarkdown>{node.content}</ReactMarkdown>
        </div>
      )}

      {/* 子节点 - 展开且有子节点时显示 */}
      {isExpanded && hasChildren && (
        <div className="outline-children">
          {node.children.map((child) => (
            <OutlineItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * OutlineView 组件
 * 
 * 将 markdown 标题显示为分层大纲
 * - 点击标题以展开/折叠子节点
 * - 点击 + 按钮以显示/隐藏内容
 * - Markdown 内容以适当的格式渲染
 */
export const OutlineView: React.FC<OutlineViewProps> = React.memo(({
  headingTree,
  filename = '文件',
}) => {
  const hideOutlineTitle = useAppStore((state) => state.hideOutlineTitle);
  if (!headingTree) {
    return (
      <div className="outline-view-empty">
        <p>没有内容可显示</p>
      </div>
    );
  }

  // 获取根子节点（H1 标题）
  const rootChildren = headingTree.id === 'root' ? headingTree.children : [headingTree];

  if (rootChildren.length === 0) {
    return (
      <div className="outline-view-empty">
        <p>没有标题可显示</p>
      </div>
    );
  }

  return (
    <div className="outline-view">
      {!hideOutlineTitle && (
        <div className="outline-header-title">
          <span className="outline-filename">{filename}</span>
        </div>
      )}
      <div className="outline-content-wrapper">
        {rootChildren.map((child) => (
          <OutlineItem key={child.id} node={child} level={1} />
        ))}
      </div>
    </div>
  );
});
