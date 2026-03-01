/**
 * MindMapRenderer - 用于将标题树可视化为交互式思维导图的组件
 * 需求: 4.1, 4.2, 4.3, 4.4, 8.2
 */

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { HeadingNode } from '../types/models';
import './MindMapRenderer.css';

interface MindMapRendererProps {
  headingTree: HeadingNode | null;
  onNodeClick?: (node: HeadingNode) => void;
  filename?: string;
}

// 不同标题级别的颜色调色板
const LEVEL_COLORS = [
  '#667eea', // Level 1 - Purple
  '#f093fb', // Level 2 - Pink
  '#4facfe', // Level 3 - Blue
  '#43e97b', // Level 4 - Green
  '#fa709a', // Level 5 - Rose
  '#feca57', // Level 6 - Yellow
];

/**
 * 思维导图节点的自定义组件
 * 已记忆化以防止不必要的重新渲染
 */
const MindMapNode: React.FC<{ 
  data: { 
    label: string; 
    headingNode: HeadingNode; 
    onClick?: (node: HeadingNode) => void;
    onToggle?: (nodeId: string) => void;
    level: number;
    isCollapsed?: boolean;
    hasChildren?: boolean;
    isHighlighted?: boolean;
  } 
}> = React.memo(({ data }) => {
  const handleClick = useCallback(() => {
    if (data.onClick) {
      data.onClick(data.headingNode);
    }
  }, [data.onClick, data.headingNode]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onToggle && data.hasChildren) {
      data.onToggle(data.headingNode.id);
    }
  }, [data.onToggle, data.hasChildren, data.headingNode.id]);

  const backgroundColor = data.level > 0 
    ? LEVEL_COLORS[(data.level - 1) % LEVEL_COLORS.length]
    : '#4a5568';

  return (
    <div
      className={`mind-map-node ${data.headingNode.isLeaf ? 'leaf-node' : ''} ${data.isHighlighted ? 'highlighted' : ''}`}
      onClick={handleClick}
      style={{ 
        cursor: 'pointer',
        backgroundColor,
        borderColor: data.isHighlighted ? '#feca57' : backgroundColor,
        boxShadow: data.isHighlighted ? '0 0 0 3px rgba(254, 202, 87, 0.5)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} id="left" className="mind-map-handle" />
      <div className="node-content">
        {data.hasChildren && (
          <button 
            className="collapse-button"
            onClick={handleToggle}
            title={data.isCollapsed ? 'Expand' : 'Collapse'}
          >
            {data.isCollapsed ? '+' : '−'}
          </button>
        )}
        <div className="node-label">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} id="right" className="mind-map-handle" />
    </div>
  );
});

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
};

/**
 * MindMapRenderer 组件
 * 
 * 使用 React Flow 将标题树可视化为交互式思维导图
 * - 将 HeadingNode 树转换为思维导图布局 (需求 4.1)
 * - 用标题文本渲染节点 (需求 4.2)
 * - 渲染显示父子关系的边 (需求 4.3)
 * - 支持缩放和平移交互 (需求 4.4)
 * 
 * 已记忆化以防止不必要的重新渲染
 */
export const MindMapRenderer: React.FC<MindMapRendererProps> = React.memo(({
  headingTree,
  onNodeClick,
  filename = '文件',
}) => {
  // 折叠状态
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // 切换节点折叠
  const handleToggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // 将标题树转换为 React Flow 节点和边
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!headingTree) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const LEVEL_X_SPACING = 280; // 层级之间的水平间距
    const NODE_Y_SPACING = 100; // 节点之间的垂直间距

    // 计算子树的总高度（叶节点数量）
    const calculateSubtreeHeight = (node: HeadingNode): number => {
      if (node.children.length === 0) return 1;
      return node.children.reduce((sum, child) => sum + calculateSubtreeHeight(child), 0);
    };

    // 获取所有一级子节点（H1 标题）
    const rootChildren = headingTree.id === 'root' ? headingTree.children : [headingTree];
    
    if (rootChildren.length === 0) {
      return { nodes, edges };
    }

    // 为文件名创建中心节点
    const totalHeight = rootChildren.reduce((sum, child) => sum + calculateSubtreeHeight(child), 0);
    const centerY = (totalHeight * NODE_Y_SPACING) / 2;

    nodes.push({
      id: 'center',
      type: 'mindMapNode',
      position: { x: 50, y: centerY - 20 },
      data: {
        label: filename,
        headingNode: headingTree,
        onClick: undefined,
        onToggle: handleToggleCollapse,
        level: 0,
        hasChildren: rootChildren.length > 0,
        isCollapsed: collapsedNodes.has('center'),
        isHighlighted: false,
      },
      style: {
        backgroundColor: '#4a5568',
        borderColor: '#4a5568',
        fontSize: '16px',
        fontWeight: 'bold',
      },
    });

    // 从左到右水平布局节点
    const layoutHorizontal = (
      node: HeadingNode,
      level: number,
      startY: number,
      parentId: string,
      parentCollapsed: boolean
    ): number => {
      // 如果父节点已折叠则跳过
      if (parentCollapsed) {
        return startY;
      }

      // 根据层级计算 X 位置
      const x = level * LEVEL_X_SPACING + 50;
      
      // 检查此节点是否已折叠
      const isCollapsed = collapsedNodes.has(node.id);
      
      // 计算此节点在树中的高度（考虑折叠状态）
      const treeHeight = isCollapsed ? 1 : calculateSubtreeHeight(node);
      
      // 计算此节点的 Y 位置（其子树的中心）
      const nodeY = startY + (treeHeight - 1) * NODE_Y_SPACING / 2;

      // 获取此层级的颜色
      const levelColor = LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];

      // 创建节点
      nodes.push({
        id: node.id,
        type: 'mindMapNode',
        position: { x, y: nodeY },
        data: {
          label: node.text,
          headingNode: node,
          onClick: onNodeClick,
          onToggle: handleToggleCollapse,
          level: level,
          hasChildren: node.children.length > 0,
          isCollapsed: isCollapsed,
          isHighlighted: false,
        },
        style: {
          backgroundColor: levelColor,
          borderColor: levelColor,
        },
      });

      // 从父节点创建边
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: levelColor,
          strokeWidth: 3,
        },
        sourceHandle: 'right',
        targetHandle: 'left',
      });

      // 如果未折叠则处理子节点
      let currentY = startY;
      if (!isCollapsed) {
        node.children.forEach((child) => {
          currentY = layoutHorizontal(child, level + 1, currentY, node.id, false);
        });
      }

      // 返回下一个可用的 Y 位置
      return startY + treeHeight * NODE_Y_SPACING;
    };

    // 布局所有根子节点（如果中心折叠则跳过）
    const centerCollapsed = collapsedNodes.has('center');
    let currentY = 0;
    if (!centerCollapsed) {
      rootChildren.forEach((child) => {
        currentY = layoutHorizontal(child, 1, currentY, 'center', false);
      });
    }

    return { nodes, edges };
  }, [headingTree, onNodeClick, filename, collapsedNodes, handleToggleCollapse]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 当 initialNodes 或 initialEdges 改变时更新节点和边（例如选项卡切换）
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  if (!headingTree) {
    return (
      <div className="mind-map-empty">
        <p>No content to display</p>
      </div>
    );
  }

  return (
    <div className="mind-map-renderer">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
});
