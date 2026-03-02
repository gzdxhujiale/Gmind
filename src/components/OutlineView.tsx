/**
 * OutlineView - 用于将 markdown 标题显示为分层大纲的组件
 * 默认视图模式，具有可折叠部分和 Markdown 渲染
 */

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Input, Button, Message, Space } from '@arco-design/web-react';
import { HeadingNode } from '../types/models';
import { useAppStore } from '../store/useAppStore';
import { markdownStringifier } from '../services/MarkdownStringifier';
import './OutlineView.css';

interface OutlineViewProps {
  headingTree: HeadingNode | null;
  filename?: string;
}

interface OutlineItemProps {
  node: HeadingNode;
  level: number;
  onUpdate: (id: string, text: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
}

/**
 * 具有可折叠内容的单个大纲项
 */
const OutlineItem: React.FC<OutlineItemProps> = React.memo(({ node, level, onUpdate, onDelete, onAddChild }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.text);
  const [editContent, setEditContent] = useState(node.content);

  // Sync state if node changes externally
  React.useEffect(() => {
    setEditTitle(node.text);
    setEditContent(node.content);
  }, [node.text, node.content]);

  const handleRowClick = useCallback(() => {
    // 切换所有项目的展开（子节点或内容）
    setIsExpanded(prev => !prev);
  }, []);

  const handleContentRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // 右键点击内容区域以折叠它
    setIsExpanded(false);
  }, []);

  const handleSave = () => {
    onUpdate(node.id, editTitle, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(node.text);
    setEditContent(node.content);
    setIsEditing(false);
  };

  const hasChildren = node.children.length > 0;
  const hasContent = node.content && node.content.trim().length > 0;
  const isExpandable = hasChildren || hasContent;

  if (isEditing) {
    return (
      <div className={`outline-item outline-level-${level} outline-item-editing`}>
        <div style={{ padding: '12px', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '6px', marginBottom: '8px' }}>
          <Input
            value={editTitle}
            onChange={setEditTitle}
            placeholder="标题"
            style={{ marginBottom: '8px', fontWeight: 'bold' }}
          />
          <Input.TextArea
            value={editContent}
            onChange={setEditContent}
            placeholder="内容 (Markdown)"
            autoSize={{ minRows: 2, maxRows: 10 }}
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleCancel}>取消</Button>
            <Button size="small" type="primary" onClick={handleSave}>保存</Button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="outline-actions" onClick={e => e.stopPropagation()}>
          <Space size="mini">
            <Button size="mini" type="text" onClick={() => setIsEditing(true)}>编辑</Button>
            <Button size="mini" type="text" onClick={() => { setIsExpanded(true); onAddChild(node.id); }}>加子项</Button>
            <Button size="mini" type="text" status="danger" onClick={() => onDelete(node.id)}>删除</Button>
          </Space>
        </div>
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
            <OutlineItem
              key={child.id}
              node={child}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
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
  const { hideOutlineTitle, outlineMode, activeTabIndex, tabs, markdownFiles } = useAppStore();

  const activeTab = activeTabIndex >= 0 && activeTabIndex < tabs.length ? tabs[activeTabIndex] : null;
  const markdownFile = activeTab ? markdownFiles.find(f => f.path === activeTab.filePath) : null;

  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync editText when file changes globally (e.g. switching tabs)
  React.useEffect(() => {
    if (markdownFile && outlineMode === 'edit') {
      setEditText(markdownFile.content);
    }
  }, [markdownFile?.path, outlineMode, markdownFile?.lastModified]);

  const handleSave = useCallback(async (newText?: string) => {
    if (!markdownFile) return;
    setIsSaving(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('save_file_content', {
        filePath: markdownFile.path,
        content: typeof newText === 'string' ? newText : editText
      });
      Message.success('保存成功');
    } catch (error) {
      console.error('Save failed:', error);
      Message.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [markdownFile, editText]);

  const handleUpdateNode = useCallback((id: string, text: string, content: string) => {
    if (!headingTree || !markdownFile) return;

    // Deep clone tree
    const cloneTree = (node: HeadingNode): HeadingNode => ({
      ...node,
      children: node.children.map(cloneTree),
    });

    const newTree = cloneTree(headingTree);

    const update = (node: HeadingNode): boolean => {
      if (node.id === id) {
        node.text = text;
        node.content = content;
        return true;
      }
      for (const child of node.children) {
        if (update(child)) return true;
      }
      return false;
    };

    update(newTree);
    handleSave(markdownStringifier.stringify(newTree));
  }, [headingTree, markdownFile, handleSave]);

  const handleDeleteNode = useCallback((id: string) => {
    if (!headingTree || !markdownFile || id === 'root') return;

    const cloneTree = (node: HeadingNode): HeadingNode => ({
      ...node,
      children: node.children.map(cloneTree),
    });

    const newTree = cloneTree(headingTree);

    const remove = (node: HeadingNode): boolean => {
      const idx = node.children.findIndex(c => c.id === id);
      if (idx !== -1) {
        node.children.splice(idx, 1);
        return true;
      }
      for (const child of node.children) {
        if (remove(child)) return true;
      }
      return false;
    };

    remove(newTree);
    handleSave(markdownStringifier.stringify(newTree));
  }, [headingTree, markdownFile, handleSave]);

  const handleAddChild = useCallback((id: string) => {
    if (!headingTree || !markdownFile) return;

    const cloneTree = (node: HeadingNode): HeadingNode => ({
      ...node,
      children: node.children.map(cloneTree),
    });

    const newTree = cloneTree(headingTree);

    const add = (node: HeadingNode): boolean => {
      if (node.id === id) {
        node.children.push({
          id: `heading-new-${Date.now()}`,
          level: node.level + 1,
          text: '新节点',
          content: '',
          children: [],
          isLeaf: true,
        });
        return true;
      }
      for (const child of node.children) {
        if (add(child)) return true;
      }
      return false;
    };

    add(newTree);
    handleSave(markdownStringifier.stringify(newTree));
  }, [headingTree, markdownFile, handleSave]);

  if (outlineMode === 'edit') {
    return (
      <div className="outline-view outline-view-edit-mode">
        {!hideOutlineTitle && (
          <div className="outline-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="outline-filename">{filename}</span>
            <Button type="primary" size="small" onClick={() => handleSave()} loading={isSaving}>保存</Button>
          </div>
        )}
        {hideOutlineTitle && (
          <div style={{ padding: '8px 16px', textAlign: 'right', borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
            <Button type="primary" size="small" onClick={() => handleSave()} loading={isSaving}>保存</Button>
          </div>
        )}
        <div className="outline-content-wrapper" style={{ padding: 0 }}>
          <Input.TextArea
            value={editText}
            onChange={setEditText}
            style={{ height: '100%', resize: 'none', border: 'none', backgroundColor: '#fff', padding: '16px', fontSize: '14px', fontFamily: 'monospace' }}
            placeholder="在此编辑 Markdown 内容..."
          />
        </div>
      </div>
    );
  }

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
          <OutlineItem
            key={child.id}
            node={child}
            level={1}
            onUpdate={handleUpdateNode}
            onDelete={handleDeleteNode}
            onAddChild={handleAddChild}
          />
        ))}
      </div>
    </div>
  );
});
