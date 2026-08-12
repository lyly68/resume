/**
 * 简历编辑器主应用组件
 * 整合表单、预览和工具栏，支持侧边栏拖拽缩放
 */
import { ConfigProvider, Layout, Tabs } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import BasicInfoForm from './components/BasicInfoForm';
import EducationForm from './components/EducationForm';
import WorkExperienceForm from './components/WorkExperienceForm';
import ProjectForm from './components/ProjectForm';
import SkillsForm from './components/SkillsForm';
import CustomSectionsForm from './components/CustomSectionsForm';
import ResumePreview from './components/ResumePreview';
import Toolbar from './components/Toolbar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useResumeStore } from './store/resumeStore';

/** 配置 dayjs 中文语言包，使日历显示阿拉伯数字而非英文 */
dayjs.locale('zh-cn');

const { Header, Content } = Layout;

/** 主应用组件 */
export default function App() {
  const { resume, importData } = useResumeStore();
  const [formPanelWidth, setFormPanelWidth] = useState(480);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  /** 初始化时从本地存储加载数据 */
  useEffect(() => {
    const saved = localStorage.getItem('resume_data');
    if (saved) {
      try {
        importData(saved);
      } catch {
        // 忽略加载错误
      }
    }
  }, []);

  /** 自动保存到本地存储 */
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('resume_data', JSON.stringify(resume));
    }, 500);
    return () => clearTimeout(timer);
  }, [resume]);

  /** 处理拖拽开始 */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = formPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [formPanelWidth]);

  /** 处理拖拽移动 */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    const newWidth = Math.min(Math.max(startWidth.current + delta, 320), 800);
    setFormPanelWidth(newWidth);
  }, []);

  /** 处理拖拽结束 */
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  /** 绑定和解绑拖拽事件 */
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  /** Tab 选项配置 */
  const tabItems = [
    { key: 'basic', label: '基本信息', children: <BasicInfoForm /> },
    { key: 'education', label: '教育经历', children: <EducationForm /> },
    { key: 'work', label: '工作经历', children: <WorkExperienceForm /> },
    { key: 'project', label: '项目经历', children: <ProjectForm /> },
    { key: 'skills', label: '技能专长', children: <SkillsForm /> },
    { key: 'custom', label: '自定义模块', children: <CustomSectionsForm /> },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="header-content">
            <h1 className="app-title">📝 在线简历编辑器</h1>
            <Toolbar />
          </div>
        </Header>
        <Content className="app-content">
          <div className="content-wrapper">
            <div
              className="form-panel"
              style={{ flex: `0 0 ${formPanelWidth}px`, width: formPanelWidth }}
            >
              <Tabs
                defaultActiveKey="basic"
                className="form-tabs"
                items={tabItems}
                tabBarStyle={{ flexWrap: 'wrap' }}
              />
            </div>
            <div
              className="resize-handle"
              onMouseDown={handleMouseDown}
              title="拖拽调整宽度"
            ></div>
            <div className="preview-panel">
              <ResumePreview />
            </div>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
