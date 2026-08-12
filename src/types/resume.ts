/**
 * 简历数据类型定义
 * 定义简历各模块的数据结构
 */

/** 联系方式类型 */
export type ContactType = 'phone' | 'email' | 'wechat' | 'qq' | 'github' | 'website' | 'other';

/** 联系方式 */
export interface ContactItem {
  id: string;
  type: ContactType;
  value: string;
  label?: string;
}

/** 自定义字段 */
export interface CustomField {
  id: string;
  label: string;
  value: string;
}

/** 基本信息 */
export interface BasicInfo {
  name: string;
  gender: string;
  age: string;
  jobTitle: string;
  location: string;
  summary: string;
  avatar?: string;
  contacts: ContactItem[];
  customFields: CustomField[];
}

/** 教育经历 */
export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  description?: string;
  customFields?: CustomField[];
}

/** 工作经历 */
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  customFields?: CustomField[];
}

/** 项目经历 */
export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  customFields?: CustomField[];
}

/** 技能 */
export interface Skill {
  id: string;
  name: string;
}

/** 自定义模块条目 */
export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
}

/** 自定义模块（如实习经历、荣誉奖项等） */
export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

/** 完整简历数据 */
export interface ResumeData {
  basicInfo: BasicInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  customSections: CustomSection[];
  sectionTitles: SectionTitles;
}

/** 简历模板类型（支持基础模板和自定义模块模板） */
export type TemplateType = 'modern' | 'classic' | 'minimal' | 'bilingual' | 'bluecorner' | `custom_${string}`;

/** 模块标题配置 */
export interface SectionTitles {
  summary: string;
  education: string;
  workExperience: string;
  projects: string;
  skills: string;
}
