/**
 * PDF导出工具
 * 使用html2canvas和jspdf将简历预览导出为PDF
 * - 按A4高度逐页裁剪canvas，避免整图平移导致的截断
 * - 根据精确页数生成页面，避免while多加一页导致的末尾空白
 * - 保留文本中的超链接为可点击链接
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/** 链接信息接口 */
interface LinkInfo {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A4 纸尺寸（单位：mm） */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * 收集DOM元素中所有<a>标签的位置信息（相对于导出根元素左上角）
 * @param element - 导出的根DOM元素
 * @returns 链接位置信息数组
 */
function collectLinks(element: HTMLElement): LinkInfo[] {
  const links: LinkInfo[] = [];
  const elementRect = element.getBoundingClientRect();
  const anchorTags = element.querySelectorAll('a[href]');

  anchorTags.forEach((anchor) => {
    const rect = anchor.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      links.push({
        url: anchor.getAttribute('href') || '',
        x: rect.left - elementRect.left,
        y: rect.top - elementRect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  });

  return links;
}

/**
 * 导出简历为PDF文件（按A4分页裁剪 + 精确页数控制）
 * @param elementId - 要导出的DOM元素ID
 * @param filename - 导出的文件名
 */
export async function exportToPdf(elementId: string, filename: string = '简历'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('未找到要导出的元素');
  }

  // 显示加载提示
  const loadingEl = document.createElement('div');
  loadingEl.className = 'export-loading';
  loadingEl.textContent = '正在生成PDF...';
  document.body.appendChild(loadingEl);

  try {
    // 1. 截图前收集链接像素坐标
    const links = collectLinks(element);

    // 2. 将整个DOM渲染成一张完整的canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      // 强制展开滚动区域，避免内容被截断
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // 3. 计算 像素 -> mm 的缩放比例，以及 A4 分页参数
    const imgWidthMm = A4_WIDTH_MM;
    const totalImageHeightPx = canvas.height;
    const totalImageWidthPx = canvas.width;
    // mm/px
    const scaleX = imgWidthMm / totalImageWidthPx;
    const scaleY = scaleX; // 保持比例
    const imgHeightMm = totalImageHeightPx * scaleY;

    // A4 一页对应的像素高度
    const pageHeightPx = A4_HEIGHT_MM / scaleY;

    // 空白页检测阈值（像素）：最后一页内容小于此高度则视为空白页
    const BLANK_PAGE_THRESHOLD_PX = 20;

    // 计算精确总页数（向上取整，避免少页）
    let totalPages = Math.max(1, Math.ceil(totalImageHeightPx / pageHeightPx));

    // 预检查：如果最后一页内容高度小于阈值，则减少一页（避免空白页）
    if (totalPages > 1) {
      const lastPageHeightPx = totalImageHeightPx - (totalPages - 1) * pageHeightPx;
      if (lastPageHeightPx <= BLANK_PAGE_THRESHOLD_PX) {
        totalPages -= 1;
      }
    }

    // 4. 创建 PDF 文档（A4 纵向）
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    // 5. 逐页绘制（每页裁剪对应 canvas 区域，避免整图平移造成的截断）
    // 记录每一页的实际内容高度，用于事后检测空白页
    const pageContentHeightsPx: number[] = [];

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      // 当前页在原始 canvas 中的 Y 范围（像素）
      const srcY = pageIndex * pageHeightPx;
      // 最后一页可能不足一整页
      const srcHeight = Math.min(pageHeightPx, totalImageHeightPx - srcY);
      pageContentHeightsPx.push(srcHeight);

      // 创建一个只包含本页内容的临时 canvas 进行裁剪
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = totalImageWidthPx;
      pageCanvas.height = srcHeight;
      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx) {
        // 白底填充（避免最后一页下方透明）
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        // 从完整canvas中裁出本页区域
        pageCtx.drawImage(
          canvas,
          0, srcY, totalImageWidthPx, srcHeight,
          0, 0, totalImageWidthPx, srcHeight
        );
      }
      const pageDataUrl = pageCanvas.toDataURL('image/png');
      const pageHeightMm = srcHeight * scaleY;

      // 不是第一页则新建一页
      if (pageIndex > 0) {
        pdf.addPage();
      }
      // 将裁剪后的页图像绘制到当前PDF页顶部
      pdf.addImage(pageDataUrl, 'PNG', 0, 0, imgWidthMm, pageHeightMm);

      // 6. 给落在本页范围内的链接添加可点击注解
      const thisPageTopPx = pageIndex * pageHeightPx;
      links.forEach((link) => {
        // 链接整体 Y 范围（相对完整画布 px）
        const linkTopPx = link.y;
        const linkBottomPx = link.y + link.height;
        // 与本页区间是否有重叠
        if (linkBottomPx <= thisPageTopPx) return; // 在上一页之前
        if (linkTopPx >= thisPageTopPx + pageHeightPx) return; // 在下一页之后

        // 计算重叠部分在本页内的范围（px）
        const visibleTopPx = Math.max(linkTopPx, thisPageTopPx);
        const visibleBottomPx = Math.min(linkBottomPx, thisPageTopPx + pageHeightPx);
        // 转换为 PDF 页面内的 mm 坐标
        const xMm = link.x * scaleX;
        const yMm = (visibleTopPx - thisPageTopPx) * scaleY;
        const wMm = link.width * scaleX;
        const hMm = (visibleBottomPx - visibleTopPx) * scaleY;
        if (wMm <= 0 || hMm <= 0) return;
        try {
          pdf.link(xMm, yMm, wMm, hMm, { url: link.url });
        } catch {
          // 忽略无效链接
        }
      });
    }

    // 5.1 二次检查并删除空白最后一页（双重保障：检测最后一页是否仅有空白像素）
    if (pageContentHeightsPx.length >= 2) {
      const lastPageContentHeight = pageContentHeightsPx[pageContentHeightsPx.length - 1];
      if (lastPageContentHeight <= BLANK_PAGE_THRESHOLD_PX) {
        const pageCount = pdf.getNumberOfPages();
        if (pageCount >= 2) {
          pdf.deletePage(pageCount);
        }
      }
    }

    // 7. 保存文件
    pdf.save(`${filename}.pdf`);
  } finally {
    document.body.removeChild(loadingEl);
  }
}
