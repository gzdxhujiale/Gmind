/**
 * HomePage 组件测试
 * 
 * HomePage 组件功能的测试
 * 需求: 1.1, 10.1, 10.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { useAppStore } from '../store/useAppStore';
import { storageService } from '../services/StorageService';

// 模拟 store
vi.mock('../store/useAppStore');

// 模拟存储服务
vi.mock('../services/StorageService', () => ({
  storageService: {
    saveFolderPath: vi.fn(),
    getFolderPath: vi.fn(),
  },
}));

// 模拟 Tauri API
const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke
}));

const mockOpen = vi.fn();
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: mockOpen
}));

describe('HomePage', () => {
  const mockSetSelectedFolder = vi.fn();
  const mockLoadMarkdownFiles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认的 store mock
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: null,
      setSelectedFolder: mockSetSelectedFolder,
      loadMarkdownFiles: mockLoadMarkdownFiles,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'top',
      popupVisible: false,
      popupContent: null,
      isLoading: false,
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
    });
  });

  it('should render the folder selection button', () => {
    render(<HomePage />);

    const button = screen.getByRole('button', { name: /select folder/i });
    expect(button).toBeDefined();
  });

  it('should display welcome message when no folder is selected', () => {
    render(<HomePage />);

    const message = screen.getByText(/select a folder containing markdown files/i);
    expect(message).toBeDefined();
  });

  it('should display current folder path when folder is selected', () => {
    // Mock store with selected folder
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: '/path/to/folder',
      setSelectedFolder: mockSetSelectedFolder,
      loadMarkdownFiles: mockLoadMarkdownFiles,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'top',
      popupVisible: false,
      popupContent: null,
      isLoading: false,
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText('Current Folder:')).toBeDefined();
    expect(screen.getByText('/path/to/folder')).toBeDefined();
  });

  it('should change button text when folder is selected', () => {
    // Mock store with selected folder
    vi.mocked(useAppStore).mockReturnValue({
      selectedFolder: '/path/to/folder',
      setSelectedFolder: mockSetSelectedFolder,
      loadMarkdownFiles: mockLoadMarkdownFiles,
      markdownFiles: [],
      activeTabIndex: 0,
      tabs: [],
      toolbarVisible: true,
      toolbarPosition: 'top',
      popupVisible: false,
      popupContent: null,
      isLoading: false,
      setActiveTab: vi.fn(),
      toggleToolbar: vi.fn(),
      setToolbarPosition: vi.fn(),
      showPopup: vi.fn(),
      hidePopup: vi.fn(),
      setLoading: vi.fn(),
    });

    render(<HomePage />);

    const button = screen.getByRole('button', { name: /change folder/i });
    expect(button).toBeDefined();
  });

  it('should call IPC and update state when folder is selected', async () => {
    // 模拟 IPC 响应
    mockOpen.mockResolvedValueOnce('/selected/folder'); // open
    mockInvoke.mockResolvedValueOnce([]); // read_markdown_files

    render(<HomePage />);

    const button = screen.getByRole('button', { name: /select folder/i });
    fireEvent.click(button);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('select-folder');
    });

    await vi.waitFor(() => {
      expect(mockSetSelectedFolder).toHaveBeenCalledWith('/selected/folder');
    });

    await vi.waitFor(() => {
      expect(storageService.saveFolderPath).toHaveBeenCalledWith('/selected/folder');
    });
  });

  it('should load markdown files after folder selection', async () => {
    const mockFiles = [
      { name: 'file1.md', path: '/selected/folder/file1.md', content: '# Test' },
      { name: 'file2.md', path: '/selected/folder/file2.md', content: '# Test 2' },
    ];

    // 模拟 Tauri 响应
    mockOpen.mockResolvedValueOnce('/selected/folder'); // open
    mockInvoke.mockResolvedValueOnce(mockFiles); // read_markdown_files

    render(<HomePage />);

    const button = screen.getByRole('button', { name: /select folder/i });
    fireEvent.click(button);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockLoadMarkdownFiles).toHaveBeenCalledWith(mockFiles);
    });
  });

  it('should handle folder selection cancellation', async () => {
    // 模拟 Tauri 响应为 null (用户取消)
    mockOpen.mockResolvedValueOnce(null);

    render(<HomePage />);

    const button = screen.getByRole('button', { name: /select folder/i });
    fireEvent.click(button);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // 如果取消则不应更新状态
    expect(mockSetSelectedFolder).not.toHaveBeenCalled();
    expect(storageService.saveFolderPath).not.toHaveBeenCalled();
  });

  it('should handle errors when reading markdown files', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    // 模拟 Tauri 响应
    mockOpen.mockResolvedValueOnce('/selected/folder'); // open
    mockInvoke.mockRejectedValueOnce('Failed to read files'); // read_markdown_files

    render(<HomePage />);

    const button = screen.getByRole('button', { name: /select folder/i });
    fireEvent.click(button);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error reading markdown files:',
        'Failed to read files'
      );
    });

    // 仍应更新文件夹路径但加载空文件
    await vi.waitFor(() => {
      expect(mockSetSelectedFolder).toHaveBeenCalledWith('/selected/folder');
    });

    await vi.waitFor(() => {
      expect(mockLoadMarkdownFiles).toHaveBeenCalledWith([]);
    });

    consoleErrorSpy.mockRestore();
  });
});
