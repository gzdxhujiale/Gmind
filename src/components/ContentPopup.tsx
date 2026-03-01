/**
 * ContentPopup - 用于显示叶节点内容的模态组件
 * 
 * 需求:
 * - 5.1: 点击叶节点时显示内容弹出窗口
 * - 5.2: 显示标题文本和相关内容
 * - 5.3: 点击外部时关闭弹出窗口
 * - 5.4: 处理空内容情况
 * - 5.5: 防止与弹出窗口后面的思维导图交互
 */

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store/useAppStore';
import './ContentPopup.css';

/**
 * ContentPopup 组件
 * 
 * 显示带有叶节点标题和内容的模态弹出窗口
 * 实现模态覆盖以阻止背景交互
 * 点击弹出窗口外部时关闭
 * 
 * 已记忆化以防止不必要的重新渲染
 */
export const ContentPopup: React.FC = React.memo(() => {
  const popupVisible = useAppStore((state) => state.popupVisible);
  const popupContent = useAppStore((state) => state.popupContent);
  const hidePopup = useAppStore((state) => state.hidePopup);
  
  const popupRef = useRef<HTMLDivElement>(null);

  /**
   * 处理覆盖点击（弹出窗口外部）
   * 需求 5.3: 点击外部时关闭弹出窗口
   */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 只在点击覆盖本身时关闭，而不是弹出窗口内容
    if (e.target === e.currentTarget) {
      hidePopup();
    }
  };

  /**
   * 处理 Escape 键以关闭弹出窗口
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popupVisible) {
        hidePopup();
      }
    };

    if (popupVisible) {
      document.addEventListener('keydown', handleEscape);
      // 弹出窗口打开时防止主体滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [popupVisible, hidePopup]);

  // 如果不可见则不渲染
  if (!popupVisible || !popupContent) {
    return null;
  }

  const { heading, content } = popupContent;

  return (
    <div 
      className="content-popup-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-heading"
    >
      <div className="content-popup" ref={popupRef}>
        <div className="content-popup-header">
          <h2 id="popup-heading" className="content-popup-heading">
            {heading}
          </h2>
          <button
            className="content-popup-close"
            onClick={hidePopup}
            aria-label="Close popup"
          >
            ×
          </button>
        </div>
        <div className="content-popup-body">
          {content ? (
            <div className="content-popup-content markdown-content">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="content-popup-empty">
              No content available for this heading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
