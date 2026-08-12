/**
 * Word导出工具
 * 使用docx库将简历数据导出为Word文档，支持modern/classic/minimal三种风格
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '../types/resume';

/** URL正则 - 匹配http/https链接 */
const URL_REGEX = /(https?:\/\/[^\s，。、；；,;]+)/g;

/** 邮箱正则 */
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

/** 手机号正则 */
const PHONE_REGEX = /(1[3-9]\d{9})/g;

/** 无边框设置 */
const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

/**
 * 检测文本片段的链接类型并生成对应的超链接或普通文本
 * @param text - 文本片段
 * @param options - 样式选项
 * @returns TextRun或ExternalHyperlink数组
 */
function createSmartLinkRuns(
  text: string,
  options: { bold?: boolean; size?: number; color?: string; font?: string } = {}
): (TextRun | ExternalHyperlink)[] {
  if (!text) return [new TextRun({ text: '', ...options })];

  const children: (TextRun | ExternalHyperlink)[] = [];
  let remaining = text;

  // 按优先级查找链接：URL > 邮箱 > 手机号
  const linkPatterns: { regex: RegExp; prefix: string }[] = [
    { regex: URL_REGEX, prefix: '' },
    { regex: EMAIL_REGEX, prefix: 'mailto:' },
    { regex: PHONE_REGEX, prefix: 'tel:' },
  ];

  let earliestMatch: { match: RegExpExecArray; prefix: string; patternIndex: number } | null = null;

  for (let i = 0; i < linkPatterns.length; i++) {
    const pattern = linkPatterns[i];
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(remaining);
    if (match) {
      if (!earliestMatch || match.index < earliestMatch.match.index) {
        earliestMatch = { match, prefix: pattern.prefix, patternIndex: i };
      }
    }
  }

  if (earliestMatch) {
    const { match, prefix } = earliestMatch;
    const beforeText = remaining.slice(0, match.index);
    const afterText = remaining.slice(match.index + match[0].length);

    if (beforeText) {
      children.push(...createSmartLinkRuns(beforeText, options));
    }

    const linkUrl = prefix + match[0];
    children.push(
      new ExternalHyperlink({
        link: linkUrl,
        children: [
          new TextRun({
            text: match[0],
            style: 'Hyperlink',
            color: '0563C1',
            underline: { type: 'single' },
            ...options,
          }),
        ],
      })
    );

    if (afterText) {
      children.push(...createSmartLinkRuns(afterText, options));
    }
  } else {
    children.push(new TextRun({ text: remaining, ...options }));
  }

  return children;
}

/**
 * 从base64图片中提取图片类型
 */
function getImageTypeFromBase64(base64: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  const match = base64.match(/^data:image\/(png|jpeg|jpg|gif|bmp);base64,/);
  const type = match ? match[1] : 'png';
  return type === 'jpeg' ? 'jpg' : (type as 'png' | 'jpg' | 'gif' | 'bmp');
}

/**
 * 将base64图片转换为Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const base64Data = base64.split(',')[1] || base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 获取联系方式的图标前缀和链接前缀
 */
function getContactMeta(type: string): { icon: string; linkPrefix: string; isLink: boolean } {
  const map: Record<string, { icon: string; linkPrefix: string; isLink: boolean }> = {
    phone: { icon: '📞 ', linkPrefix: 'tel:', isLink: true },
    email: { icon: '✉️ ', linkPrefix: 'mailto:', isLink: true },
    website: { icon: '🌐 ', linkPrefix: '', isLink: true },
    github: { icon: '🐙 ', linkPrefix: '', isLink: true },
    wechat: { icon: '💬 ', linkPrefix: '', isLink: false },
    qq: { icon: '🐧 ', linkPrefix: '', isLink: false },
    other: { icon: '📌 ', linkPrefix: '', isLink: false },
  };
  return map[type] || map.other;
}

/** ==========================================================================
 *  MODERN 风格（现代风格）
 *  - 蓝色 (#1890FF) 主题
 *  - 头像左侧 + 信息右侧（横向两列表格）
 *  - 蓝色底部边框分隔头部
 *  - 模块标题：蓝色文字 + 蓝色实线底边
 *  - 公司 | 职位  日期 一行展示
 *  ========================================================================== */

/** MODERN: 主题色 */
const MODERN_COLOR = '1890FF';

/** MODERN: 模块标题底边 */
const MODERN_HEADING_BORDER = {
  bottom: { style: BorderStyle.SINGLE, size: 8, color: MODERN_COLOR, space: 1 },
};

/** MODERN: 头部底边（蓝色实线分隔） */
const MODERN_HEADER_BOTTOM = {
  bottom: { style: BorderStyle.SINGLE, size: 12, color: MODERN_COLOR },
};

/**
 * MODERN: 构建模块标题
 */
function buildModernSectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: title, bold: true, size: 32, color: MODERN_COLOR })],
    spacing: { before: 160, after: 0 },
    border: MODERN_HEADING_BORDER,
  });
}

/**
 * MODERN: 构建头部
 */
function buildModernHeader(resume: ResumeData): Table[] {
  const { basicInfo } = resume;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  // 头像列
  let avatarCellContent: Paragraph[] = [];
  if (basicInfo.avatar) {
    try {
      const avatarBytes = base64ToUint8Array(basicInfo.avatar);
      const imageType = getImageTypeFromBase64(basicInfo.avatar);
      avatarCellContent = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              type: imageType,
              data: avatarBytes,
              transformation: { width: 80, height: 104 },
            }),
          ],
        }),
      ];
    } catch { /* ignore */ }
  }

  // 信息列
  const infoCellContent: Paragraph[] = [];

  // 姓名
  infoCellContent.push(
    new Paragraph({
      children: [new TextRun({ text: basicInfo.name || '', bold: true, size: 44, font: 'Microsoft YaHei' })],
      spacing: { after: 80 },
    })
  );

  // 职位
  if (basicInfo.jobTitle) {
    infoCellContent.push(
      new Paragraph({
        children: [new TextRun({ text: basicInfo.jobTitle, size: 28, color: '666666' })],
        spacing: { after: 60 },
      })
    );
  }

  // 联系信息行
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  contacts.forEach((contact, index) => {
    if (!contact.value?.trim()) return;
    if (index > 0 || contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', size: 22 }));
    const meta = getContactMeta(contact.type);
    if (meta.icon) contactRuns.push(new TextRun({ text: meta.icon, size: 22 }));
    if (meta.isLink) {
      contactRuns.push(
        new ExternalHyperlink({
          link: meta.linkPrefix + contact.value,
          children: [new TextRun({ text: contact.value, style: 'Hyperlink', color: '666666', underline: { type: 'single' }, size: 22 })],
        })
      );
    } else {
      contactRuns.push(new TextRun({ text: contact.value, size: 22, color: '666666' }));
    }
  });
  if (basicInfo.gender) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', size: 22 }));
    contactRuns.push(new TextRun({ text: basicInfo.gender, size: 22, color: '666666' }));
  }
  if (basicInfo.age) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', size: 22 }));
    contactRuns.push(new TextRun({ text: `${basicInfo.age}岁`, size: 22, color: '666666' }));
  }
  if (basicInfo.location) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ', size: 22 }));
    contactRuns.push(new TextRun({ text: '📍 ', size: 22 }));
    contactRuns.push(new TextRun({ text: basicInfo.location, size: 22, color: '666666' }));
  }
  if (contactRuns.length > 0) {
    infoCellContent.push(new Paragraph({ children: contactRuns, spacing: { after: 60 } }));
  }

  // 自定义字段
  if (customFields.length > 0) {
    const customRuns: (TextRun | ExternalHyperlink)[] = [];
    customFields.forEach((field, index) => {
      if (index > 0) customRuns.push(new TextRun({ text: '  ', size: 22 }));
      if (field.label) customRuns.push(new TextRun({ text: `${field.label}：`, size: 22, color: '666666' }));
      customRuns.push(...createSmartLinkRuns(field.value || '', { size: 22, color: '0563C1' }));
    });
    infoCellContent.push(new Paragraph({ children: customRuns }));
  }

  const avatarCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 1200, type: WidthType.DXA },
    borders: MODERN_HEADER_BOTTOM,
    children: avatarCellContent,
  });

  const infoCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: MODERN_HEADER_BOTTOM,
    children: infoCellContent,
  });

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows: [new TableRow({ children: [avatarCell, infoCell] })],
    }),
  ];
}

/**
 * MODERN: 构建工作/项目/教育条目标题行（公司 | 职位  日期）
 */
function buildModernEntryTitle(primary: string, secondary: string, dates: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: primary, bold: true, size: 26 }),
      new TextRun({ text: `  |  ${secondary}` }),
      new TextRun({ text: `  ${dates}`, color: '666666' }),
    ],
    spacing: { before: 100 },
  });
}

/** ==========================================================================
 *  CLASSIC 风格（经典风格）
 *  - 黑色 / 深灰色主题
 *  - 字体: Times New Roman / Microsoft YaHei
 *  - 头像+信息 居中布局
 *  - 模块标题：黑色加粗 + 双线底边
 *  - 条目：公司、职位、日期 两端对齐（左右两列）
 *  ========================================================================== */

/** CLASSIC: 模块标题双线底边 */
const CLASSIC_HEADING_BORDER = {
  bottom: { style: BorderStyle.DOUBLE, size: 12, color: '333333', space: 1 },
};

/**
 * CLASSIC: 构建模块标题
 */
function buildClassicSectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 32, font: 'Times New Roman' })],
    spacing: { before: 200, after: 0 },
    border: CLASSIC_HEADING_BORDER,
  });
}

/**
 * CLASSIC: 构建头部（居中布局）
 */
function buildClassicHeader(resume: ResumeData): Paragraph[] {
  const { basicInfo } = resume;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];
  const paragraphs: Paragraph[] = [];

  // 头像居中
  if (basicInfo.avatar) {
    try {
      const avatarBytes = base64ToUint8Array(basicInfo.avatar);
      const imageType = getImageTypeFromBase64(basicInfo.avatar);
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ type: imageType, data: avatarBytes, transformation: { width: 70, height: 90 } })],
          spacing: { after: 120 },
        })
      );
    } catch { /* ignore */ }
  }

  // 姓名 居中
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: basicInfo.name || '', bold: true, size: 56, font: 'Times New Roman' })],
      spacing: { after: 80 },
    })
  );

  // 联系信息 居中
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  contacts.forEach((contact, index) => {
    if (!contact.value?.trim()) return;
    if (index > 0) contactRuns.push(new TextRun({ text: '  |  ', size: 22 }));
    const meta = getContactMeta(contact.type);
    if (meta.icon) contactRuns.push(new TextRun({ text: meta.icon, size: 22 }));
    if (meta.isLink) {
      contactRuns.push(
        new ExternalHyperlink({
          link: meta.linkPrefix + contact.value,
          children: [new TextRun({ text: contact.value, style: 'Hyperlink', color: '333333', underline: { type: 'single' }, size: 22 })],
        })
      );
    } else {
      contactRuns.push(new TextRun({ text: contact.value, size: 22, color: '333333' }));
    }
  });
  if (basicInfo.location) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  |  ', size: 22 }));
    contactRuns.push(new TextRun({ text: '📍 ', size: 22 }));
    contactRuns.push(new TextRun({ text: basicInfo.location, size: 22, color: '333333' }));
  }
  if (basicInfo.gender) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  |  ', size: 22 }));
    contactRuns.push(new TextRun({ text: basicInfo.gender, size: 22, color: '333333' }));
  }
  if (basicInfo.age) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  |  ', size: 22 }));
    contactRuns.push(new TextRun({ text: `${basicInfo.age}岁`, size: 22, color: '333333' }));
  }
  if (contactRuns.length > 0) {
    paragraphs.push(new Paragraph({ alignment: AlignmentType.CENTER, children: contactRuns, spacing: { after: 60 } }));
  }

  // 职位 居中
  if (basicInfo.jobTitle) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: basicInfo.jobTitle, size: 26, color: '555555' })],
        spacing: { after: 60 },
      })
    );
  }

  // 自定义字段
  if (customFields.length > 0) {
    const customRuns: (TextRun | ExternalHyperlink)[] = [];
    customFields.forEach((field, index) => {
      if (index > 0) customRuns.push(new TextRun({ text: '  |  ', size: 22 }));
      if (field.label) customRuns.push(new TextRun({ text: `${field.label}：`, size: 22, color: '333333' }));
      customRuns.push(...createSmartLinkRuns(field.value || '', { size: 22, color: '0563C1' }));
    });
    paragraphs.push(new Paragraph({ alignment: AlignmentType.CENTER, children: customRuns }));
  }

  return paragraphs;
}

/**
 * CLASSIC: 构建条目标题行（两端对齐：公司+职位 左，日期 右）
 */
function buildClassicEntryTitle(primary: string, secondary: string, dates: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: 'right', position: 9500 }],
    children: [
      new TextRun({ text: primary, bold: true, size: 26 }),
      new TextRun({ text: `  ${secondary}` }),
      new TextRun({ text: `\t${dates}`, color: '666666' }),
    ],
    spacing: { before: 100 },
  });
}

/** ==========================================================================
 *  MINIMAL 风格（简约风格）
 *  - 留白充足
 *  - 模块标题：全大写 + 蓝色 + 细蓝线底边
 *  - 条目：职位/项目名(大字) + 公司/角色(小字灰) 左侧，日期 右侧
 *  - 字体偏小，色彩偏灰
 *  ========================================================================== */

/** MINIMAL: 主题色 */
const MINIMAL_COLOR = '1890FF';

/** MINIMAL: 模块标题细蓝底边 */
const MINIMAL_HEADING_BORDER = {
  bottom: { style: BorderStyle.SINGLE, size: 4, color: MINIMAL_COLOR, space: 1 },
};

/**
 * MINIMAL: 构建模块标题（全大写 + 蓝色细线）
 */
function buildMinimalSectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: MINIMAL_COLOR,
        font: 'Microsoft YaHei',
      }),
    ],
    spacing: { before: 260, after: 0 },
    border: MINIMAL_HEADING_BORDER,
  });
}

/**
 * MINIMAL: 构建头部
 */
function buildMinimalHeader(resume: ResumeData): Table[] {
  const { basicInfo } = resume;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  // 头像列
  let avatarCellContent: Paragraph[] = [];
  if (basicInfo.avatar) {
    try {
      const avatarBytes = base64ToUint8Array(basicInfo.avatar);
      const imageType = getImageTypeFromBase64(basicInfo.avatar);
      avatarCellContent = [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new ImageRun({ type: imageType, data: avatarBytes, transformation: { width: 70, height: 90 } })],
        }),
      ];
    } catch { /* ignore */ }
  }

  const infoCellContent: Paragraph[] = [];

  // 姓名
  infoCellContent.push(
    new Paragraph({
      children: [new TextRun({ text: basicInfo.name || '', bold: true, size: 40, font: 'Microsoft YaHei' })],
      spacing: { after: 60 },
    })
  );

  // 职位
  if (basicInfo.jobTitle) {
    infoCellContent.push(
      new Paragraph({
        children: [new TextRun({ text: basicInfo.jobTitle, size: 24, color: '555555' })],
        spacing: { after: 60 },
      })
    );
  }

  // 联系信息
  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  contacts.forEach((contact, index) => {
    if (!contact.value?.trim()) return;
    if (index > 0) contactRuns.push(new TextRun({ text: '  ·  ', size: 20, color: '888888' }));
    const meta = getContactMeta(contact.type);
    if (meta.isLink) {
      contactRuns.push(
        new ExternalHyperlink({
          link: meta.linkPrefix + contact.value,
          children: [new TextRun({ text: contact.value, style: 'Hyperlink', color: '888888', underline: { type: 'single' }, size: 20 })],
        })
      );
    } else {
      contactRuns.push(new TextRun({ text: contact.value, size: 20, color: '888888' }));
    }
  });
  if (basicInfo.location) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ·  ', size: 20, color: '888888' }));
    contactRuns.push(new TextRun({ text: basicInfo.location, size: 20, color: '888888' }));
  }
  if (basicInfo.gender) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ·  ', size: 20, color: '888888' }));
    contactRuns.push(new TextRun({ text: basicInfo.gender, size: 20, color: '888888' }));
  }
  if (basicInfo.age) {
    if (contactRuns.length > 0) contactRuns.push(new TextRun({ text: '  ·  ', size: 20, color: '888888' }));
    contactRuns.push(new TextRun({ text: `${basicInfo.age}岁`, size: 20, color: '888888' }));
  }
  if (contactRuns.length > 0) {
    infoCellContent.push(new Paragraph({ children: contactRuns, spacing: { after: 40 } }));
  }

  // 自定义字段
  if (customFields.length > 0) {
    const customRuns: (TextRun | ExternalHyperlink)[] = [];
    customFields.forEach((field, index) => {
      if (index > 0) customRuns.push(new TextRun({ text: '  ·  ', size: 20 }));
      if (field.label) customRuns.push(new TextRun({ text: `${field.label}：`, size: 20, color: '888888' }));
      customRuns.push(...createSmartLinkRuns(field.value || '', { size: 20, color: '555555' }));
    });
    infoCellContent.push(new Paragraph({ children: customRuns }));
  }

  const avatarCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 1100, type: WidthType.DXA },
    borders: NO_BORDERS,
    children: avatarCellContent,
  });

  const infoCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: NO_BORDERS,
    children: infoCellContent,
  });

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows: [new TableRow({ children: [avatarCell, infoCell] })],
    }),
  ];
}

/**
 * MINIMAL: 构建条目（左侧职位+公司大字小字两行，右侧日期右对齐）
 */
function buildMinimalEntryTitle(mainTitle: string, subTitle: string, dates: string): Paragraph[] {
  return [
    new Paragraph({
      tabStops: [{ type: 'right', position: 9500 }],
      children: [
        new TextRun({ text: mainTitle, bold: true, size: 26 }),
        new TextRun({ text: `\t${dates}`, color: '888888', size: 20 }),
      ],
      spacing: { before: 120, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subTitle, size: 22, color: '888888' })],
      spacing: { after: 40 },
    }),
  ];
}

/** ==========================================================================
 *  BILINGUAL 风格（商务双语标签）
 *  - 深蓝色 (#1e3a8a) 主题
 *  - 顶部居中标题：个人简历 Personal Resume
 *  - 模块标题：深蓝矩形填充 + 中文 + 英文小标题
 *  - 基本信息：左右布局（左信息+右头像）
 *  - 条目：公司 竖线 职位  日期
 *  ========================================================================== */

/** BILINGUAL: 主题色 */
const BILINGUAL_COLOR = '1E3A8A';
const BILINGUAL_EN_COLOR = '6B7280';

/** BILINGUAL: 模块标题深蓝填充（通过单元格背景色实现标签效果） */
function buildBilingualSectionHeading(cn: string, en: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    shading: { type: 'clear', fill: BILINGUAL_COLOR, color: 'auto' },
    indent: { left: 160, right: 160 },
    spacing: { before: 200, after: 40, line: 360 },
    children: [
      new TextRun({ text: cn, bold: true, size: 28, color: 'FFFFFF', font: 'Microsoft YaHei' }),
      new TextRun({ text: '   ' + (en || ''), size: 18, color: 'E5E7EB', font: 'Microsoft YaHei', italics: true }),
    ],
  });
}

/** BILINGUAL: 中英文映射（当用户自定义模块标题时使用默认英文） */
const BILINGUAL_SECTION_EN: Record<string, string> = {
  summary: 'Self Assessment',
  education: 'Education Background',
  workExperience: 'Work Experience',
  projects: 'Project Experience',
  skills: 'Personal Skills',
};

/**
 * BILINGUAL: 构建头部（顶部居中标题 + 基本信息两列表格）
 */
function buildBilingualHeader(resume: ResumeData): (Paragraph | Table)[] {
  const { basicInfo, sectionTitles } = resume;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];
  const children: (Paragraph | Table)[] = [];

  // 顶部居中大标题
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: '个人简历', bold: true, size: 52, color: BILINGUAL_COLOR, font: 'Microsoft YaHei' }),
        new TextRun({ text: '  Personal Resume', size: 22, color: '6B7280', font: 'Microsoft YaHei' }),
      ],
    })
  );
  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: BILINGUAL_COLOR } },
      spacing: { after: 160 },
      children: [],
    })
  );

  // 基本信息模块标题
  children.push(buildBilingualSectionHeading('基本信息', 'Basic Information'));

  // 基本信息内容（左列表格信息 + 右列头像）
  const phoneContact = contacts.find(c => c.type === 'phone');
  const emailContact = contacts.find(c => c.type === 'email');
  const otherContacts = contacts.filter(c => !['phone', 'email'].includes(c.type));

  const buildInfoRow = (pairs: Array<{ label: string; value: string; isLink?: boolean; linkPrefix?: string }>): TableRow => {
    const cells: TableCell[] = [];
    pairs.forEach((pair) => {
      const valueRuns: (TextRun | ExternalHyperlink)[] = [];
      if (pair.label) valueRuns.push(new TextRun({ text: pair.label, size: 22, color: '444444' }));
      if (pair.isLink && pair.value) {
        valueRuns.push(
          new ExternalHyperlink({
            link: (pair.linkPrefix || '') + pair.value,
            children: [new TextRun({ text: pair.value, size: 22, color: '111111', style: 'Hyperlink', underline: { type: 'none' } })],
          })
        );
      } else if (pair.value) {
        valueRuns.push(new TextRun({ text: pair.value, size: 22, color: '111111' }));
      }
      cells.push(
        new TableCell({
          borders: NO_BORDERS,
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: valueRuns, spacing: { before: 60, after: 60 } })],
        })
      );
    });
    if (cells.length === 1) {
      cells.push(new TableCell({ borders: NO_BORDERS, width: { size: 50, type: WidthType.PERCENTAGE }, children: [] }));
    }
    return new TableRow({ children: cells });
  };

  const infoRows: TableRow[] = [];
  infoRows.push(buildInfoRow([
    { label: '姓　名：', value: basicInfo.name || '' },
    { label: '出生年月：', value: basicInfo.age || '' },
  ]));
  infoRows.push(buildInfoRow([
    { label: '联系电话：', value: phoneContact?.value || '', isLink: true, linkPrefix: 'tel:' },
    { label: '求职意向：', value: basicInfo.jobTitle || '' },
  ]));
  infoRows.push(buildInfoRow([
    { label: '邮　箱：', value: emailContact?.value || '', isLink: true, linkPrefix: 'mailto:' },
    { label: basicInfo.gender ? '性　别：' : '', value: basicInfo.gender || '' },
  ]));
  infoRows.push(buildInfoRow([
    { label: basicInfo.location ? '所在地：' : '', value: basicInfo.location || '' },
    { label: customFields[0] ? `${customFields[0].label}：` : '', value: customFields[0]?.value || '' },
  ]));
  // 剩余自定义字段
  for (let i = 1; i < customFields.length; i += 2) {
    infoRows.push(buildInfoRow([
      { label: `${customFields[i].label}：`, value: customFields[i].value || '' },
      { label: customFields[i + 1] ? `${customFields[i + 1].label}：` : '', value: customFields[i + 1]?.value || '' },
    ]));
  }
  // 其他联系方式
  if (otherContacts.length > 0) {
    const labels: Record<string, string> = { wechat: '微　信：', qq: 'QQ：', github: 'GitHub：', website: '网　站：', other: '其他：' };
    for (let i = 0; i < otherContacts.length; i += 2) {
      const c1 = otherContacts[i];
      const c2 = otherContacts[i + 1];
      infoRows.push(buildInfoRow([
        { label: labels[c1.type] || '其他：', value: c1.value || '', isLink: ['github', 'website'].includes(c1.type), linkPrefix: '' },
        c2 ? { label: labels[c2.type] || '其他：', value: c2.value || '', isLink: ['github', 'website'].includes(c2.type), linkPrefix: '' } : { label: '', value: '' },
      ]));
    }
  }

  // 头像
  let avatarCellContent: Paragraph[] = [];
  if (basicInfo.avatar) {
    try {
      const avatarBytes = base64ToUint8Array(basicInfo.avatar);
      const imageType = getImageTypeFromBase64(basicInfo.avatar);
      avatarCellContent = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ type: imageType, data: avatarBytes, transformation: { width: 80, height: 104 } })],
        }),
      ];
    } catch { /* ignore */ }
  }

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({ borders: NO_BORDERS, width: { size: 78, type: WidthType.PERCENTAGE }, children: infoRows.length ? infoRows.map(_ => undefined as any).filter(() => false) : [new Paragraph({ children: [] })], verticalMerge: 'restart' }),
          new TableCell({ borders: NO_BORDERS, width: { size: 22, type: WidthType.PERCENTAGE }, children: avatarCellContent }),
        ],
      }),
    ],
  });

  // 改用简单的两列表格：信息单元格（含多段）和头像单元格
  const infoParagraphs: Paragraph[] = [];
  const simpleRows = [
    [{ label: '姓　名：', value: basicInfo.name || '' }, { label: '出生年月：', value: basicInfo.age || '' }],
    [{ label: '联系电话：', value: phoneContact?.value || '', isLink: true, linkPrefix: 'tel:' }, { label: '求职意向：', value: basicInfo.jobTitle || '' }],
    [{ label: '邮　箱：', value: emailContact?.value || '', isLink: true, linkPrefix: 'mailto:' }, { label: basicInfo.gender ? '性　别：' : '', value: basicInfo.gender || '' }],
    [{ label: basicInfo.location ? '所在地：' : '', value: basicInfo.location || '' }, { label: customFields[0] ? `${customFields[0].label}：` : '', value: customFields[0]?.value || '' }],
  ];
  // 添加剩余自定义字段行
  for (let i = 1; i < customFields.length; i += 2) {
    simpleRows.push([
      { label: `${customFields[i].label}：`, value: customFields[i].value || '' },
      { label: customFields[i + 1] ? `${customFields[i + 1].label}：` : '', value: customFields[i + 1]?.value || '' },
    ]);
  }
  // 其他联系方式
  if (otherContacts.length > 0) {
    const labels: Record<string, string> = { wechat: '微　信：', qq: 'QQ：', github: 'GitHub：', website: '网　站：', other: '其他：' };
    for (let i = 0; i < otherContacts.length; i += 2) {
      const c1 = otherContacts[i];
      const c2 = otherContacts[i + 1];
      simpleRows.push([
        { label: labels[c1.type] || '其他：', value: c1.value || '', isLink: ['github', 'website'].includes(c1.type), linkPrefix: '' },
        c2 ? { label: labels[c2.type] || '其他：', value: c2.value || '', isLink: ['github', 'website'].includes(c2.type), linkPrefix: '' } : { label: '', value: '' },
      ]);
    }
  }

  const infoCellRows: TableRow[] = simpleRows.map((pair: any) => {
    const makeCell = (item: any) => {
      const runs: (TextRun | ExternalHyperlink)[] = [];
      if (item.label) runs.push(new TextRun({ text: item.label, size: 22, color: '444444' }));
      if (item.value && item.isLink) {
        runs.push(
          new ExternalHyperlink({
            link: (item.linkPrefix || '') + item.value,
            children: [new TextRun({ text: item.value, size: 22, color: '111111', style: 'Hyperlink', underline: { type: 'none' } })],
          })
        );
      } else if (item.value) {
        runs.push(new TextRun({ text: item.value, size: 22, color: '111111' }));
      }
      return new TableCell({
        borders: NO_BORDERS,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: runs, spacing: { before: 40, after: 40 } })],
      });
    };
    return new TableRow({ children: [makeCell(pair[0] || {}), makeCell(pair[1] || {})] });
  });

  const innerInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: NO_BORDERS,
    rows: infoCellRows,
  });

  const infoCellFinal = new TableCell({
    borders: NO_BORDERS,
    width: { size: 78, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    children: [innerInfoTable],
  });
  const avatarCellFinal = new TableCell({
    borders: NO_BORDERS,
    width: { size: 22, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    children: avatarCellContent.length ? avatarCellContent : [new Paragraph({ children: [] })],
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows: [new TableRow({ children: [infoCellFinal, avatarCellFinal] })],
    })
  );

  return children;
}

/**
 * BILINGUAL: 条目标题行（公司 竖线分隔 职位  日期）
 */
function buildBilingualEntryTitle(primary: string, secondary: string, dates: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: 'right', position: 9500 }],
    children: [
      new TextRun({ text: primary, bold: true, size: 26, color: '111111' }),
      new TextRun({ text: '  |  ', size: 22, color: '9CA3AF' }),
      new TextRun({ text: secondary, bold: true, size: 24, color: BILINGUAL_COLOR }),
      new TextRun({ text: `\t${dates}`, size: 22, color: '6B7280' }),
    ],
    spacing: { before: 120 },
  });
}

/** ==========================================================================
 *  BLUECORNER 风格（深蓝斜角标签）
 *  - 深蓝色 (#1e3a8a) 主题
 *  - 顶部：左侧大号"个人简历"标题 + 右侧圆形图标
 *  - 装饰条：深蓝左斜角 + 灰色右段
 *  - 模块标题：深蓝斜角切角矩形标签
 *  - 基本信息：两列网格布局
 *  - 条目：左 学校/公司/项目名 + 右 学位/职位/角色 日期
 *  ========================================================================== */

/** BLUECORNER: 主题色 */
const CORNER_COLOR = '1E3A8A';

/** BLUECORNER: 构建模块标题（深蓝填充+缩进切角效果通过左边框加粗+填充模拟） */
function buildCornerSectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    shading: { type: 'clear', fill: CORNER_COLOR, color: 'auto' },
    indent: { left: 260, right: 260 },
    spacing: { before: 220, after: 40, line: 380 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 20, color: '374151', space: 1 },
    },
    children: [
      new TextRun({ text: title, bold: true, size: 28, color: 'FFFFFF', font: 'Microsoft YaHei' }),
    ],
  });
}

/**
 * BLUECORNER: 构建头部（顶部标题+图标 + 装饰条 + 基本信息两列网格）
 */
function buildCornerHeader(resume: ResumeData): (Paragraph | Table)[] {
  const { basicInfo } = resume;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];
  const children: (Paragraph | Table)[] = [];

  // 顶部：个人简历大标题 居中（docx中图标较难，改为简洁标题）
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: '个人简历', bold: true, size: 64, color: CORNER_COLOR, font: 'Microsoft YaHei' }),
      ],
    })
  );

  // 装饰条（深蓝左 + 灰色右，通过两列表格实现）
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          height: { value: 260, rule: 'exact' },
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: NO_BORDERS,
              shading: { fill: CORNER_COLOR, type: 'clear' },
              children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: NO_BORDERS,
              shading: { fill: 'E5E7EB', type: 'clear' },
              children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })],
            }),
          ],
        }),
      ],
    })
  );
  children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));

  // 基本信息模块标题
  children.push(buildCornerSectionHeading('基本信息'));

  // 基本信息两列网格
  const phoneContact = contacts.find(c => c.type === 'phone');
  const emailContact = contacts.find(c => c.type === 'email');
  const otherContacts = contacts.filter(c => !['phone', 'email'].includes(c.type));

  const partyField = customFields.find(f => /政治|面貌|party/i.test(f.label));
  const nativeField = customFields.find(f => /籍贯|户口|address/i.test(f.label));
  const otherFields = customFields.filter(f => !/(政治|面貌|party|籍贯|户口|address)/i.test(f.label));

  const pairs: Array<[any, any]> = [
    [{ label: '姓　名：', value: basicInfo.name || '' }, { label: '求职意向：', value: basicInfo.jobTitle || '' }],
    [{ label: '性　别：', value: basicInfo.gender || '' }, { label: '出生年月：', value: basicInfo.age || '' }],
    [{ label: '政治面貌：', value: partyField?.value || '' }, { label: '电子邮箱：', value: emailContact?.value || '', isLink: true, linkPrefix: 'mailto:' }],
    [{ label: '籍　贯：', value: nativeField?.value || '' }, { label: '联系方式：', value: phoneContact?.value || '', isLink: true, linkPrefix: 'tel:' }],
  ];
  // 其他字段行
  for (let i = 0; i < otherFields.length; i += 2) {
    pairs.push([
      { label: `${otherFields[i].label}：`, value: otherFields[i].value || '' },
      otherFields[i + 1] ? { label: `${otherFields[i + 1].label}：`, value: otherFields[i + 1].value || '' } : { label: '', value: '' },
    ]);
  }
  // 其他联系方式
  if (otherContacts.length > 0) {
    const labels: Record<string, string> = { wechat: '微　信：', qq: 'QQ：', github: 'GitHub：', website: '网　站：', other: '其他：' };
    for (let i = 0; i < otherContacts.length; i += 2) {
      const c1 = otherContacts[i];
      const c2 = otherContacts[i + 1];
      pairs.push([
        { label: labels[c1.type] || '其他：', value: c1.value || '', isLink: ['github', 'website'].includes(c1.type), linkPrefix: '' },
        c2 ? { label: labels[c2.type] || '其他：', value: c2.value || '', isLink: ['github', 'website'].includes(c2.type), linkPrefix: '' } : { label: '', value: '' },
      ]);
    }
  }
  if (basicInfo.location) {
    pairs.push([
      { label: '所在地：', value: basicInfo.location || '' },
      { label: '', value: '' },
    ]);
  }

  const rows: TableRow[] = pairs.map((pair: any) => {
    const makeCell = (item: any) => {
      const runs: (TextRun | ExternalHyperlink)[] = [];
      if (item.label) runs.push(new TextRun({ text: item.label, size: 22, color: '4B5563' }));
      if (item.value && item.isLink) {
        runs.push(
          new ExternalHyperlink({
            link: (item.linkPrefix || '') + item.value,
            children: [new TextRun({ text: item.value, size: 22, color: '111111', style: 'Hyperlink', underline: { type: 'none' } })],
          })
        );
      } else if (item.value) {
        runs.push(new TextRun({ text: item.value, size: 22, color: '111111' }));
      }
      return new TableCell({
        borders: NO_BORDERS,
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: runs, spacing: { before: 60, after: 60 } })],
      });
    };
    return new TableRow({ children: [makeCell(pair[0] || {}), makeCell(pair[1] || {})] });
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows,
    })
  );

  return children;
}

/**
 * BLUECORNER: 条目标题行（左 学校/公司/项目 + 右 学位/职位/角色  日期）
 */
function buildCornerEntryTitle(primary: string, secondary: string, dates: string): Paragraph {
  return new Paragraph({
    tabStops: [{ type: 'right', position: 9500 }],
    children: [
      new TextRun({ text: primary, bold: true, size: 26, color: '111111' }),
      new TextRun({ text: `\t${secondary ? secondary + '   ' : ''}${dates}`, size: 22, color: '6B7280' }),
    ],
    spacing: { before: 120 },
  });
}

/** ==========================================================================
 *  通用文档创建 - 按模板分发
 *  ========================================================================== */

/**
 * 创建简历Word文档
 * @param resume - 简历数据
 * @param template - 模板类型 'modern' | 'classic' | 'minimal'
 * @returns Word文档Blob
 */
async function createResumeDocument(resume: ResumeData, template: string): Promise<Blob> {
  const tpl = template || 'modern';

  const { basicInfo, education, workExperience, projects, skills, sectionTitles, customSections } = resume;

  // --------- 获取样式工厂函数 ---------
  let buildHeading: (title: string) => Paragraph;
  let buildHeader: () => (Paragraph | Table)[];
  let defaultFont: string;
  let defaultLine: number;

  if (tpl === 'classic') {
    buildHeading = buildClassicSectionHeading;
    buildHeader = () => buildClassicHeader(resume);
    defaultFont = 'Times New Roman';
    defaultLine = 320;
  } else if (tpl === 'minimal') {
    buildHeading = buildMinimalSectionHeading;
    buildHeader = () => buildMinimalHeader(resume);
    defaultFont = 'Microsoft YaHei';
    defaultLine = 320;
  } else if (tpl === 'bilingual') {
    // 双语标签：模块标题需要英文副标，使用包装函数
    const bilingualHeadingCache: Record<string, Paragraph> = {};
    let bilingualIndex = 0;
    const bilingualKeys = ['summary', 'education', 'workExperience', 'projects', 'skills'];
    buildHeading = (title: string) => {
      // 首次调用按固定顺序匹配到标准模块，使用映射英文；否则用标题本身
      const key = bilingualKeys[bilingualIndex] || title;
      bilingualIndex++;
      return buildBilingualSectionHeading(title, BILINGUAL_SECTION_EN[key] || title);
    };
    buildHeader = () => buildBilingualHeader(resume);
    defaultFont = 'Microsoft YaHei';
    defaultLine = 300;
  } else if (tpl === 'bluecorner') {
    buildHeading = buildCornerSectionHeading;
    buildHeader = () => buildCornerHeader(resume);
    defaultFont = 'Microsoft YaHei';
    defaultLine = 300;
  } else {
    // modern (default)
    buildHeading = buildModernSectionHeading;
    buildHeader = () => buildModernHeader(resume);
    defaultFont = 'Microsoft YaHei';
    defaultLine = 276;
  }

  // --------- 各模块内容 ---------
  const allChildren: (Paragraph | Table)[] = [];

  // 头部
  allChildren.push(...buildHeader());
  allChildren.push(new Paragraph({ spacing: { after: 100 } }));

  // 自我评价
  if (basicInfo.summary) {
    allChildren.push(buildHeading(sectionTitles.summary));
    allChildren.push(
      new Paragraph({
        children: createSmartLinkRuns(basicInfo.summary),
        spacing: { after: 80 },
      })
    );
  }

  // 工作经历
  if (workExperience.length > 0) {
    allChildren.push(buildHeading(sectionTitles.workExperience));
    workExperience.forEach((work) => {
      const dates = `${work.startDate} - ${work.endDate}`;
      if (tpl === 'minimal') {
        allChildren.push(...buildMinimalEntryTitle(work.position, work.company, dates));
      } else if (tpl === 'classic') {
        allChildren.push(buildClassicEntryTitle(work.company, work.position, dates));
      } else if (tpl === 'bilingual') {
        allChildren.push(buildBilingualEntryTitle(work.company, work.position, dates));
      } else if (tpl === 'bluecorner') {
        allChildren.push(buildCornerEntryTitle(work.company, work.position, dates));
      } else {
        allChildren.push(buildModernEntryTitle(work.company, work.position, dates));
      }
      if (work.description) {
        allChildren.push(new Paragraph({ children: createSmartLinkRuns(work.description) }));
      }
      if (work.achievements && work.achievements.length > 0) {
        work.achievements.forEach((ach) => {
          allChildren.push(new Paragraph({ bullet: { level: 0 }, children: createSmartLinkRuns(ach) }));
        });
      }
      if (work.customFields && work.customFields.length > 0) {
        const fieldRuns: (TextRun | ExternalHyperlink)[] = [];
        work.customFields.forEach((field, index) => {
          if (index > 0) fieldRuns.push(new TextRun({ text: '  ' }));
          if (field.label) fieldRuns.push(new TextRun({ text: `${field.label}：`, bold: true }));
          fieldRuns.push(...createSmartLinkRuns(field.value || ''));
        });
        if (fieldRuns.length > 0) allChildren.push(new Paragraph({ children: fieldRuns }));
      }
    });
  }

  // 项目经历
  if (projects.length > 0) {
    allChildren.push(buildHeading(sectionTitles.projects));
    projects.forEach((project) => {
      const dates = `${project.startDate} - ${project.endDate}`;
      if (tpl === 'minimal') {
        allChildren.push(...buildMinimalEntryTitle(project.name, project.role, dates));
      } else if (tpl === 'classic') {
        allChildren.push(buildClassicEntryTitle(project.name, project.role, dates));
      } else if (tpl === 'bilingual') {
        allChildren.push(buildBilingualEntryTitle(project.name, project.role, dates));
      } else if (tpl === 'bluecorner') {
        allChildren.push(buildCornerEntryTitle(project.name, project.role, dates));
      } else {
        allChildren.push(buildModernEntryTitle(project.name, project.role, dates));
      }
      if (project.description) {
        allChildren.push(new Paragraph({ children: createSmartLinkRuns(project.description) }));
      }
      if (project.technologies && project.technologies.length > 0) {
        allChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: '技术栈：', bold: true }),
              new TextRun({ text: project.technologies.join('、') }),
            ],
          })
        );
      }
      if (project.customFields && project.customFields.length > 0) {
        const fieldRuns: (TextRun | ExternalHyperlink)[] = [];
        project.customFields.forEach((field, index) => {
          if (index > 0) fieldRuns.push(new TextRun({ text: '  ' }));
          if (field.label) fieldRuns.push(new TextRun({ text: `${field.label}：`, bold: true }));
          fieldRuns.push(...createSmartLinkRuns(field.value || ''));
        });
        if (fieldRuns.length > 0) allChildren.push(new Paragraph({ children: fieldRuns }));
      }
    });
  }

  // 教育经历
  if (education.length > 0) {
    allChildren.push(buildHeading(sectionTitles.education));
    education.forEach((edu) => {
      const dates = `${edu.startDate} - ${edu.endDate}`;
      const secondary = `${edu.degree} · ${edu.major}`;
      if (tpl === 'minimal') {
        allChildren.push(...buildMinimalEntryTitle(edu.school, secondary, dates));
      } else if (tpl === 'classic') {
        allChildren.push(buildClassicEntryTitle(edu.school, secondary, dates));
      } else if (tpl === 'bilingual') {
        allChildren.push(buildBilingualEntryTitle(edu.school, secondary, dates));
      } else if (tpl === 'bluecorner') {
        allChildren.push(buildCornerEntryTitle(edu.school, secondary, dates));
      } else {
        allChildren.push(buildModernEntryTitle(edu.school, secondary, dates));
      }
      if (edu.description) {
        allChildren.push(new Paragraph({ children: createSmartLinkRuns(edu.description) }));
      }
      if (edu.customFields && edu.customFields.length > 0) {
        const fieldRuns: (TextRun | ExternalHyperlink)[] = [];
        edu.customFields.forEach((field, index) => {
          if (index > 0) fieldRuns.push(new TextRun({ text: '  ' }));
          if (field.label) fieldRuns.push(new TextRun({ text: `${field.label}：`, bold: true }));
          fieldRuns.push(...createSmartLinkRuns(field.value || ''));
        });
        if (fieldRuns.length > 0) allChildren.push(new Paragraph({ children: fieldRuns }));
      }
    });
  }

  // 技能
  if (skills.length > 0) {
    allChildren.push(buildHeading(sectionTitles.skills));
    skills.forEach((skill) => {
      allChildren.push(new Paragraph({ bullet: { level: 0 }, children: createSmartLinkRuns(skill.name) }));
    });
  }

  // 自定义模块
  if (customSections && customSections.length > 0) {
    customSections.forEach((section) => {
      if (!section.items || section.items.length === 0) return;
      allChildren.push(buildHeading(section.title));
      section.items.forEach((item) => {
        if (item.title) {
          allChildren.push(
            new Paragraph({
              children: createSmartLinkRuns(item.title, { bold: true, size: tpl === 'minimal' ? 24 : 26 }),
              spacing: { before: 100 },
            })
          );
        }
        if (item.content) {
          const lines = item.content.split('\n').filter((l) => l.trim());
          lines.forEach((line) => {
            allChildren.push(new Paragraph({ children: createSmartLinkRuns(line) }));
          });
        }
      });
    });
  }

  // 构建文档
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: defaultFont, size: 22 },
          paragraph: { spacing: { line: defaultLine, before: 0, after: 60 } },
        },
      },
    },
    sections: [{ properties: {}, children: allChildren }],
  });

  return await Packer.toBlob(doc);
}

/**
 * 导出简历为Word文档
 * @param resume - 简历数据
 * @param template - 模板类型 'modern' | 'classic' | 'minimal'
 * @param filename - 导出的文件名
 */
export async function exportToWord(
  resume: ResumeData,
  template: string = 'modern',
  filename: string = '简历'
): Promise<void> {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'export-loading';
  const tplLabel =
    template === 'classic' ? '经典风格' :
    template === 'minimal' ? '简约风格' :
    template === 'bilingual' ? '双语标签' :
    template === 'bluecorner' ? '深蓝斜角' : '现代风格';
  loadingEl.textContent = `正在生成${tplLabel}Word文档...`;
  document.body.appendChild(loadingEl);

  try {
    const blob = await createResumeDocument(resume, template);
    saveAs(blob, `${filename}.docx`);
  } finally {
    document.body.removeChild(loadingEl);
  }
}
