/**
 * 链接文本渲染工具
 * 检测文本中的URL并将其转换为可点击链接
 */
import React from 'react';

/** URL正则表达式 */
const URL_REGEX = /(https?:\/\/[^\s，。、；；,;]+)/g;

/**
 * 检测字符串是否是URL
 * @param text - 待检测文本
 * @returns 是否为URL
 */
export function isUrl(text: string): boolean {
  return /^https?:\/\/[^\s，。、；；,;]+$/.test(text.trim());
}

/**
 * 渲染可能包含URL的文本，将URL部分转为可点击链接
 * @param text - 文本内容
 * @returns React节点数组
 */
export function renderTextWithLinks(text: string): React.ReactNode {
  if (!text) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    // 添加链接前的普通文本
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // 添加链接
    const url = match[0];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#1890ff', textDecoration: 'none' }}
      >
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * 从文本中提取所有URL
 * @param text - 文本内容
 * @returns URL数组
 */
export function extractUrls(text: string): string[] {
  if (!text) return [];
  const urls: string[] = [];
  let match: RegExpExecArray | null;
  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    urls.push(match[0]);
  }
  return urls;
}
