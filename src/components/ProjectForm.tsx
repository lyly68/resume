/**
 * 项目经历表单组件
 * 支持添加、编辑、删除多条项目经历，包含技术栈标签管理，标题可编辑
 */
import { Form, Input, Button, DatePicker, Card, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useResumeStore } from '../store/resumeStore';
import dayjs from 'dayjs';
import { useState } from 'react';

const { TextArea } = Input;

/** 项目经历表单组件 */
export default function ProjectForm() {
  const { resume, addProject, updateProject, removeProject, updateSectionTitle } = useResumeStore();
  const { projects, sectionTitles } = resume;
  const [newTech, setNewTech] = useState<Record<string, string>>({});

  /** 处理字段变化 */
  const handleChange = (id: string, field: string, value: string) => {
    updateProject(id, { [field]: value });
  };

  /** 处理日期变化 */
  const handleDateChange = (id: string, field: string, date: dayjs.Dayjs | null) => {
    handleChange(id, field, date ? date.format('YYYY-MM') : '');
  };

  /** 添加技术栈 */
  const addTechnology = (id: string) => {
    const tech = newTech[id];
    if (!tech?.trim()) return;
    const project = projects.find((p) => p.id === id);
    if (project) {
      updateProject(id, {
        technologies: [...project.technologies, tech.trim()],
      });
    }
    setNewTech((prev) => ({ ...prev, [id]: '' }));
  };

  /** 删除技术栈 */
  const removeTechnology = (id: string, index: number) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      updateProject(id, {
        technologies: project.technologies.filter((_, i) => i !== index),
      });
    }
  };

  /** 处理标题变化 */
  const handleTitleChange = (value: string) => {
    updateSectionTitle('projects', value);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <span>🚀 </span>
        <Input
          value={sectionTitles.projects}
          onChange={(e) => handleTitleChange(e.target.value)}
          prefix={<EditOutlined style={{ color: '#999' }} />}
          style={{ width: 160 }}
          size="small"
          variant="borderless"
        />
      </h3>
      {projects.map((project, index) => (
        <Card
          key={project.id}
          className="experience-card"
          title={`项目经历 ${index + 1}`}
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeProject(project.id)}
            >
              删除
            </Button>
          }
        >
          <div className="form-row">
            <Form.Item label="项目名称">
              <Input
                value={project.name}
                onChange={(e) => handleChange(project.id, 'name', e.target.value)}
                placeholder="如：企业级数据可视化平台"
                showCount
                maxLength={100}
              />
            </Form.Item>
            <Form.Item label="担任角色">
              <Input
                value={project.role}
                onChange={(e) => handleChange(project.id, 'role', e.target.value)}
                placeholder="如：前端负责人"
                showCount
                maxLength={50}
              />
            </Form.Item>
          </div>
          <div className="form-row-date">
            <Form.Item label="开始时间">
              <DatePicker
                picker="month"
                value={project.startDate ? dayjs(project.startDate) : null}
                onChange={(date) => handleDateChange(project.id, 'startDate', date)}
                placeholder="开始时间"
              />
            </Form.Item>
            <Form.Item label="结束时间">
              <DatePicker
                picker="month"
                value={project.endDate ? dayjs(project.endDate) : null}
                onChange={(date) => handleDateChange(project.id, 'endDate', date)}
                placeholder="结束时间"
              />
            </Form.Item>
          </div>
          <Form.Item label="项目描述">
            <TextArea
              rows={3}
              value={project.description}
              onChange={(e) => handleChange(project.id, 'description', e.target.value)}
              placeholder="描述项目背景、目标、你的贡献等..."
              showCount
              maxLength={500}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Form.Item>
          {/* 自定义字段区域 */}
          <div className="custom-item-fields">
            <div className="custom-fields-label">自定义字段（可选）：</div>
            {(project.customFields || []).map((field, fieldIdx) => (
              <Space key={field.id} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                <Input
                  placeholder="字段名"
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...(project.customFields || [])];
                    newFields[fieldIdx] = { ...field, label: e.target.value };
                    useResumeStore.getState().updateProject(project.id, { customFields: newFields });
                  }}
                  style={{ width: 100 }}
                  size="small"
                  showCount
                  maxLength={30}
                />
                <Input
                  placeholder="字段值"
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...(project.customFields || [])];
                    newFields[fieldIdx] = { ...field, value: e.target.value };
                    useResumeStore.getState().updateProject(project.id, { customFields: newFields });
                  }}
                  style={{ flex: 1 }}
                  size="small"
                  showCount
                  maxLength={200}
                />
                <MinusCircleOutlined
                  style={{ color: '#ff4d4f', cursor: 'pointer' }}
                  onClick={() => {
                    const newFields = (project.customFields || []).filter((_, i) => i !== fieldIdx);
                    useResumeStore.getState().updateProject(project.id, { customFields: newFields });
                  }}
                />
              </Space>
            ))}
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                const newField = {
                  id: Math.random().toString(36).substring(2, 9),
                  label: '',
                  value: '',
                };
                const currentFields = project.customFields || [];
                useResumeStore.getState().updateProject(project.id, {
                  customFields: [...currentFields, newField],
                });
              }}
            >
              添加字段
            </Button>
          </div>
          <Form.Item label="技术栈">
            <div className="tags-list">
              {project.technologies.map((tech, i) => (
                <Tag
                  key={i}
                  color="blue"
                  closable
                  onClose={() => removeTechnology(project.id, i)}
                >
                  {tech}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                value={newTech[project.id] || ''}
                onChange={(e) =>
                  setNewTech((prev) => ({ ...prev, [project.id]: e.target.value }))
                }
                placeholder="输入技术名称，如：React"
                onPressEnter={() => addTechnology(project.id)}
                showCount
                maxLength={50}
              />
              <Button type="primary" onClick={() => addTechnology(project.id)}>
                添加
              </Button>
            </Space.Compact>
          </Form.Item>
        </Card>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={addProject}
        className="add-button"
      >
        添加项目经历
      </Button>
    </div>
  );
}
