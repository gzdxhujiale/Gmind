/**
 * MindMapRenderer 组件的测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MindMapRenderer } from './MindMapRenderer';
import { HeadingNode } from '../types/models';

describe('MindMapRenderer', () => {
  it('should render empty state when no heading tree provided', () => {
    render(<MindMapRenderer headingTree={null} />);
    expect(screen.getByText('No content to display')).toBeInTheDocument();
  });

  it('should render React Flow when heading tree is provided', () => {
    const mockTree: HeadingNode = {
      id: 'root',
      level: 0,
      text: 'Root',
      content: '',
      children: [
        {
          id: '1',
          level: 1,
          text: 'Heading 1',
          content: 'Content 1',
          children: [],
          isLeaf: true,
        },
      ],
      isLeaf: false,
    };

    const { container } = render(<MindMapRenderer headingTree={mockTree} />);
    
    // 应该渲染 React Flow
    expect(container.querySelector('.react-flow')).toBeInTheDocument();
  });

  it('should call onNodeClick when node is clicked', () => {
    const mockOnNodeClick = vi.fn();
    const mockTree: HeadingNode = {
      id: 'root',
      level: 0,
      text: 'Root',
      content: '',
      children: [
        {
          id: '1',
          level: 1,
          text: 'Clickable Node',
          content: 'Node content',
          children: [],
          isLeaf: true,
        },
      ],
      isLeaf: false,
    };

    render(
      <MindMapRenderer
        headingTree={mockTree}
        onNodeClick={mockOnNodeClick}
      />
    );

    // 查找并点击节点
    const node = screen.getByText('Clickable Node');
    expect(node).toBeInTheDocument();
    
    node.click();
    
    // 验证使用正确的节点调用了回调
    expect(mockOnNodeClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        text: 'Clickable Node',
        isLeaf: true,
      })
    );
  });

  it('should render multiple nodes with parent-child relationships', () => {
    const mockTree: HeadingNode = {
      id: 'root',
      level: 0,
      text: 'Root',
      content: '',
      children: [
        {
          id: '1',
          level: 1,
          text: 'Parent',
          content: '',
          children: [
            {
              id: '1-1',
              level: 2,
              text: 'Child 1',
              content: 'Content 1',
              children: [],
              isLeaf: true,
            },
            {
              id: '1-2',
              level: 2,
              text: 'Child 2',
              content: 'Content 2',
              children: [],
              isLeaf: true,
            },
          ],
          isLeaf: false,
        },
      ],
      isLeaf: false,
    };

    render(<MindMapRenderer headingTree={mockTree} />);

    // 所有节点应该被渲染
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
