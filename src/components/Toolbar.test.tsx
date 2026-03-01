/**
 * Toolbar 组件测试
 * 
 * Toolbar 组件功能的测试
 * 需求: 9.1, 10.2, 10.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useAppStore } from '../store/useAppStore';

// 模拟 store
vi.mock('../store/useAppStore');

describe('Toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 设置默认的 store mock
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: null,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'top',
      viewMode: 'outline',
      popupVisible: false,
      popupContent: null,
      settingsVisible: false,
      isLoading: false,
      setSelectedFolder: vi.fn(),
      loadMarkdownFiles: vi.fn(),
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      setViewMode: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
      showSettings: vi.fn(),
      hideSettings: vi.fn(),
    });
  });

  it('should render toolbar when visible', () => {
    render(<Toolbar />);
    
    // 检查窗口控件按钮
    expect(screen.getByRole('button', { name: /最小化/i })).toBeDefined();
  });

  it('should not render when toolbar is hidden', () => {
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: null,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: false,
      toolbarPosition: 'top',
      viewMode: 'outline',
      popupVisible: false,
      popupContent: null,
      settingsVisible: false,
      isLoading: false,
      setSelectedFolder: vi.fn(),
      loadMarkdownFiles: vi.fn(),
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      setViewMode: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
      showSettings: vi.fn(),
      hideSettings: vi.fn(),
    });

    const { container } = render(<Toolbar />);
    expect(container.firstChild).toBeNull();
  });

  it('should render hide to tray button', () => {
    render(<Toolbar />);
    
    expect(screen.getByRole('button', { name: /▼/i })).toBeDefined();
  });

  it('should render window control buttons', () => {
    render(<Toolbar />);
    
    expect(screen.getByRole('button', { name: /最小化/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /最大化/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /关闭/i })).toBeDefined();
  });

  it('should apply correct CSS class for toolbar position', () => {
    const { container } = render(<Toolbar />);
    
    const toolbar = container.querySelector('.toolbar');
    expect(toolbar?.className).toContain('toolbar-top');
  });

  it('should apply horizontal layout for top position', () => {
    const { container } = render(<Toolbar />);
    
    const content = container.querySelector('.toolbar-content');
    expect(content?.className).toContain('toolbar-content-horizontal');
  });

  it('should apply vertical layout for left position', () => {
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: null,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'left',
      viewMode: 'outline',
      popupVisible: false,
      popupContent: null,
      settingsVisible: false,
      isLoading: false,
      setSelectedFolder: vi.fn(),
      loadMarkdownFiles: vi.fn(),
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      setViewMode: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
      showSettings: vi.fn(),
      hideSettings: vi.fn(),
    });

    const { container } = render(<Toolbar />);
    
    const content = container.querySelector('.toolbar-content');
    expect(content?.className).toContain('toolbar-content-vertical');
  });

  it('should apply vertical layout for right position', () => {
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: null,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'right',
      viewMode: 'outline',
      popupVisible: false,
      popupContent: null,
      settingsVisible: false,
      isLoading: false,
      setSelectedFolder: vi.fn(),
      loadMarkdownFiles: vi.fn(),
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      setViewMode: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
      showSettings: vi.fn(),
      hideSettings: vi.fn(),
    });

    const { container } = render(<Toolbar />);
    
    const content = container.querySelector('.toolbar-content');
    expect(content?.className).toContain('toolbar-content-vertical');
  });
});
