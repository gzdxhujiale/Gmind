/**
 * TabNavigation - 用于显示和在 markdown 文件选项卡之间导航的组件
 * 需求: 2.2, 2.3, 2.4, 6.4
 */

import React, { useRef, useEffect } from 'react';
import { Button, Tooltip } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import { useAppStore } from '../store/useAppStore';
import './TabNavigation.css';

/**
 * 选项卡导航组件
 * 
 * 为每个 markdown 文件显示选项卡并处理选项卡切换
 * - 将不带 .md 扩展名的文件名显示为标签 (需求 2.3)
 * - 处理选项卡点击以切换活动选项卡 (需求 2.4)
 * - 视觉上突出显示活动选项卡 (需求 6.4)
 * - 右侧的设置图标
 */
export const TabNavigation: React.FC = React.memo(() => {
  const tabs = useAppStore((state) => state.tabs);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const showSettings = useAppStore((state) => state.showSettings);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Enable horizontal scrolling with vertical mouse wheel
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Only translate vertical scroll if we aren't already scrolling horizontally
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 如果没有选项卡则不渲染
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="tab-navigation" data-tauri-drag-region>
      <div className="tab-list" ref={scrollContainerRef}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`tab-button ${tab.isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
            aria-selected={tab.isActive}
            role="tab"
          >
            {tab.filename}
          </button>
        ))}
      </div>
      <div className="tab-actions">
        <Tooltip content="设置" position="bottom">
          <Button
            shape="square"
            type="text"
            onClick={showSettings}
            icon={<IconSettings />}
          />
        </Tooltip>
      </div>
    </div>
  );
});
