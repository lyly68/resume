/**
 * 简历状态管理
 * 使用 Zustand 管理简历数据
 */
import { create } from 'zustand';
import type { ResumeData, BasicInfo, TemplateType, Education, WorkExperience, Project, Skill, ContactItem, ContactType, CustomField, SectionTitles, CustomSection, CustomSectionItem } from '../types/resume';

/** 生成唯一ID */
const generateId = (): string => Math.random().toString(36).substring(2, 9);

/** 默认联系方式 */
const defaultContacts: ContactItem[] = [
  { id: generateId(), type: 'phone', value: '13800138000' },
  { id: generateId(), type: 'email', value: 'zhangsan@example.com' },
];

/** 默认模块标题 */
const defaultSectionTitles: SectionTitles = {
  summary: '自我评价',
  education: '教育经历',
  workExperience: '工作经历',
  projects: '项目经历',
  skills: '技能专长',
};

/** 默认简历数据 */
const defaultResume: ResumeData = {
  basicInfo: {
    name: '张三',
    gender: '男',
    age: '28',
    jobTitle: '前端工程师',
    location: '北京',
    summary: '5年以上前端开发经验，精通React、Vue等主流框架，具备良好的代码规范和工程化意识。熟悉TypeScript、Node.js，能够独立完成项目从0到1的搭建。注重用户体验，追求代码质量。',
    avatar: '',
    contacts: defaultContacts,
    customFields: [],
  },
  education: [
    {
      id: '1',
      school: '某某大学',
      degree: '本科',
      major: '计算机科学与技术',
      startDate: '2018-09',
      endDate: '2022-06',
      description: '主修课程：数据结构、算法设计、操作系统、计算机网络、数据库等',
      customFields: [],
    },
  ],
  workExperience: [
    {
      id: '1',
      company: '某科技公司',
      position: '高级前端工程师',
      startDate: '2022-07',
      endDate: '至今',
      description: '负责公司核心产品的前端开发，参与项目架构设计',
      achievements: [
        '主导完成公司管理后台从Vue2到React18的技术迁移，页面加载速度提升40%',
        '搭建团队组件库和脚手架工具，提升团队开发效率30%',
        '优化打包配置，首屏加载时间从3.2s降至1.1s',
      ],
      customFields: [],
    },
  ],
  projects: [
    {
      id: '1',
      name: '企业级数据可视化平台',
      role: '前端负责人',
      startDate: '2023-01',
      endDate: '2023-12',
      description: '面向企业的数据可视化分析平台，支持多数据源接入、拖拽式图表配置和实时数据展示',
      technologies: ['React', 'TypeScript', 'ECharts', 'D3.js', 'Webpack', 'Redux'],
      customFields: [],
    },
  ],
  skills: [
    { id: '1', name: 'React' },
    { id: '2', name: 'TypeScript' },
    { id: '3', name: 'Node.js' },
    { id: '4', name: 'Vue.js' },
    { id: '5', name: 'Webpack/Vite' },
  ],
  customSections: [],
  sectionTitles: defaultSectionTitles,
};

/** 简历Store接口 */
interface ResumeStore {
  resume: ResumeData;
  template: TemplateType;
  
  // 基本信息
  updateBasicInfo: (data: Partial<BasicInfo>) => void;
  
  // 联系方式
  addContact: () => void;
  updateContact: (id: string, data: Partial<ContactItem>) => void;
  removeContact: (id: string) => void;
  
  // 自定义字段
  addCustomField: () => void;
  updateCustomField: (id: string, data: Partial<CustomField>) => void;
  removeCustomField: (id: string) => void;
  
  // 模块标题
  updateSectionTitle: (key: keyof SectionTitles, title: string) => void;
  
  // 教育经历
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  // 工作经历
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, data: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  
  // 项目经历
  addProject: () => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // 技能
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // 自定义模块
  addCustomSection: () => void;
  updateCustomSection: (id: string, data: Partial<CustomSection>) => void;
  updateCustomSectionTitle: (id: string, title: string) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, data: Partial<CustomSectionItem>) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
  
  // 模板
  setTemplate: (template: TemplateType) => void;
  
  // 重置
  resetResume: () => void;
  
  // 导入导出
  exportData: () => string;
  importData: (data: string) => void;
  
  // 从解析数据合并填充简历
  mergeParsedResume: (data: Partial<ResumeData>) => void;
}

/** 联系方式类型选项 */
export const contactTypeOptions: { value: ContactType; label: string }[] = [
  { value: 'phone', label: '手机' },
  { value: 'email', label: '邮箱' },
  { value: 'wechat', label: '微信' },
  { value: 'qq', label: 'QQ' },
  { value: 'github', label: 'GitHub' },
  { value: 'website', label: '网站' },
  { value: 'other', label: '其他' },
];

/** 创建简历Store */
export const useResumeStore = create<ResumeStore>((set, get) => ({
  resume: JSON.parse(JSON.stringify(defaultResume)),
  template: 'modern',

  updateBasicInfo: (data) =>
    set((state) => ({
      resume: { ...state.resume, basicInfo: { ...state.resume.basicInfo, ...data } },
    })),

  addContact: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        basicInfo: {
          ...state.resume.basicInfo,
          contacts: [
            ...state.resume.basicInfo.contacts,
            { id: generateId(), type: 'phone', value: '' },
          ],
        },
      },
    })),

  updateContact: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        basicInfo: {
          ...state.resume.basicInfo,
          contacts: state.resume.basicInfo.contacts.map((contact) =>
            contact.id === id ? { ...contact, ...data } : contact
          ),
        },
      },
    })),

  removeContact: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        basicInfo: {
          ...state.resume.basicInfo,
          contacts: state.resume.basicInfo.contacts.filter((contact) => contact.id !== id),
        },
      },
    })),

  addCustomField: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        basicInfo: {
          ...state.resume.basicInfo,
          customFields: [
            ...state.resume.basicInfo.customFields,
            { id: generateId(), label: '', value: '' },
          ],
        },
      },
    })),

  updateCustomField: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        basicInfo: {
          ...state.resume.basicInfo,
          customFields: state.resume.basicInfo.customFields.map((field) =>
            field.id === id ? { ...field, ...data } : field
          ),
        },
      },
    })),

  removeCustomField: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        basicInfo: {
          ...state.resume.basicInfo,
          customFields: state.resume.basicInfo.customFields.filter((field) => field.id !== id),
        },
      },
    })),

  updateSectionTitle: (key, title) =>
    set((state) => ({
      resume: {
        ...state.resume,
        sectionTitles: {
          ...state.resume.sectionTitles,
          [key]: title,
        },
      },
    })),

  addEducation: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: [
          ...state.resume.education,
          {
            id: generateId(),
            school: '',
            degree: '',
            major: '',
            startDate: '',
            endDate: '',
            description: '',
            customFields: [],
          },
        ],
      },
    })),

  updateEducation: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.map((edu) =>
          edu.id === id ? { ...edu, ...data } : edu
        ),
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.filter((edu) => edu.id !== id),
      },
    })),

  addWorkExperience: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        workExperience: [
          ...state.resume.workExperience,
          {
            id: generateId(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: '',
            achievements: [],
            customFields: [],
          },
        ],
      },
    })),

  updateWorkExperience: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        workExperience: state.resume.workExperience.map((work) =>
          work.id === id ? { ...work, ...data } : work
        ),
      },
    })),

  removeWorkExperience: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        workExperience: state.resume.workExperience.filter((work) => work.id !== id),
      },
    })),

  addProject: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: [
          ...state.resume.projects,
          {
            id: generateId(),
            name: '',
            role: '',
            startDate: '',
            endDate: '',
            description: '',
            technologies: [],
            customFields: [],
          },
        ],
      },
    })),

  updateProject: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.map((proj) =>
          proj.id === id ? { ...proj, ...data } : proj
        ),
      },
    })),

  removeProject: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        projects: state.resume.projects.filter((proj) => proj.id !== id),
      },
    })),

  addSkill: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: [...state.resume.skills, { id: generateId(), name: '' }],
      },
    })),

  updateSkill: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.map((skill) =>
          skill.id === id ? { ...skill, ...data } : skill
        ),
      },
    })),

  removeSkill: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.filter((skill) => skill.id !== id),
      },
    })),

  addCustomSection: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: [
          ...state.resume.customSections,
          { id: generateId(), title: '新模块', items: [] },
        ],
      },
    })),

  updateCustomSection: (id, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: state.resume.customSections.map((section) =>
          section.id === id ? { ...section, ...data } : section
        ),
      },
    })),

  updateCustomSectionTitle: (id, title) =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: state.resume.customSections.map((section) =>
          section.id === id ? { ...section, title } : section
        ),
      },
    })),

  removeCustomSection: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: state.resume.customSections.filter((section) => section.id !== id),
      },
    })),

  addCustomSectionItem: (sectionId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: state.resume.customSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: [
                  ...section.items,
                  { id: generateId(), title: '', content: '' },
                ],
              }
            : section
        ),
      },
    })),

  updateCustomSectionItem: (sectionId, itemId, data) =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: state.resume.customSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.map((item) =>
                  item.id === itemId ? { ...item, ...data } : item
                ),
              }
            : section
        ),
      },
    })),

  removeCustomSectionItem: (sectionId, itemId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        customSections: state.resume.customSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.filter((item) => item.id !== itemId),
              }
            : section
        ),
      },
    })),

  setTemplate: (template) => set({ template }),

  resetResume: () => set({ resume: JSON.parse(JSON.stringify(defaultResume)) }),

  exportData: () => JSON.stringify(get().resume, null, 2),

  importData: (data) => {
    try {
      const parsed = JSON.parse(data);
      // 数据迁移：将旧格式的 phone/email 转换为 contacts 数组
      if (parsed.basicInfo && !parsed.basicInfo.contacts) {
        const contacts: ContactItem[] = [];
        if (parsed.basicInfo.phone) {
          contacts.push({ id: generateId(), type: 'phone', value: parsed.basicInfo.phone });
        }
        if (parsed.basicInfo.email) {
          contacts.push({ id: generateId(), type: 'email', value: parsed.basicInfo.email });
        }
        parsed.basicInfo.contacts = contacts;
        // 删除旧字段
        delete parsed.basicInfo.phone;
        delete parsed.basicInfo.email;
      }
      // 确保 contacts 数组存在
      if (parsed.basicInfo && !Array.isArray(parsed.basicInfo.contacts)) {
        parsed.basicInfo.contacts = [];
      }
      // 确保 customFields 数组存在
      if (parsed.basicInfo && !Array.isArray(parsed.basicInfo.customFields)) {
        parsed.basicInfo.customFields = [];
      }
      // 确保 customSections 数组存在
      if (!Array.isArray(parsed.customSections)) {
        parsed.customSections = [];
      }
      // 确保 sectionTitles 存在
      if (!parsed.sectionTitles) {
        parsed.sectionTitles = { ...defaultSectionTitles };
      }
      set({ resume: parsed });
    } catch (e) {
      console.error('导入数据失败:', e);
    }
  },

  mergeParsedResume: (data) =>
    set((state) => {
      const resume = { ...state.resume };
      const { basicInfo: parsedBasic, education, workExperience, projects, skills, customSections } = data;

      // 合并基本信息：只填充非空字段
      if (parsedBasic) {
        const currentBasic = { ...resume.basicInfo };
        if (parsedBasic.name) currentBasic.name = parsedBasic.name;
        if (parsedBasic.gender) currentBasic.gender = parsedBasic.gender;
        if (parsedBasic.age) currentBasic.age = parsedBasic.age;
        if (parsedBasic.jobTitle) currentBasic.jobTitle = parsedBasic.jobTitle;
        if (parsedBasic.location) currentBasic.location = parsedBasic.location;
        if (parsedBasic.summary) currentBasic.summary = parsedBasic.summary;
        // 合并联系方式：追加新联系方式，避免重复
        if (parsedBasic.contacts && parsedBasic.contacts.length > 0) {
          const existingValues = new Set(currentBasic.contacts.map((c) => c.value));
          const newContacts = parsedBasic.contacts.filter((c) => !existingValues.has(c.value));
          currentBasic.contacts = [...currentBasic.contacts, ...newContacts];
        }
        resume.basicInfo = currentBasic;
      }

      // 替换数组类型数据（如果有解析结果）
      if (education && education.length > 0) resume.education = education;
      if (workExperience && workExperience.length > 0) resume.workExperience = workExperience;
      if (projects && projects.length > 0) resume.projects = projects;
      if (skills && skills.length > 0) resume.skills = skills;
      if (customSections && customSections.length > 0) {
        // 智能合并自定义模块：匹配到已有模块则追加条目，否则创建新模块
        const existingSections = [...resume.customSections];
        for (const parsedSection of customSections) {
          const existingIdx = existingSections.findIndex((s) => s.id === parsedSection.id);
          if (existingIdx >= 0) {
            // 匹配到已有模块（标题相同），追加条目
            existingSections[existingIdx] = {
              ...existingSections[existingIdx],
              items: [...existingSections[existingIdx].items, ...parsedSection.items],
            };
          } else {
            // 未匹配到已有模块，创建新模块
            existingSections.push(parsedSection);
          }
        }
        resume.customSections = existingSections;
      }

      return { resume };
    }),
}));
