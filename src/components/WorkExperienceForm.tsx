/**
 * 工作经历表单组件
 * 支持添加、编辑、删除多条工作经历，包含成就列表管理，标题可编辑
 */
import { Form, Input, Button, DatePicker, Card, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useResumeStore } from '../store/resumeStore';
import dayjs from 'dayjs';
import { useState } from 'react';

const { TextArea } = Input;

/** 工作经历表单组件 */
export default function WorkExperienceForm() {
  const { resume, addWorkExperience, updateWorkExperience, removeWorkExperience, updateSectionTitle } = useResumeStore();
  const { workExperience, sectionTitles } = resume;
  const [newAchievement, setNewAchievement] = useState<Record<string, string>>({});

  /** 处理字段变化 */
  const handleChange = (id: string, field: string, value: string) => {
    updateWorkExperience(id, { [field]: value });
  };

  /** 处理日期变化 */
  const handleDateChange = (id: string, field: string, date: dayjs.Dayjs | null) => {
    handleChange(id, field, date ? date.format('YYYY-MM') : '');
  };

  /** 添加成就 */
  const addAchievement = (id: string) => {
    const achievement = newAchievement[id];
    if (!achievement?.trim()) return;
    const work = workExperience.find((w) => w.id === id);
    if (work) {
      updateWorkExperience(id, {
        achievements: [...work.achievements, achievement.trim()],
      });
    }
    setNewAchievement((prev) => ({ ...prev, [id]: '' }));
  };

  /** 删除成就 */
  const removeAchievement = (id: string, index: number) => {
    const work = workExperience.find((w) => w.id === id);
    if (work) {
      updateWorkExperience(id, {
        achievements: work.achievements.filter((_, i) => i !== index),
      });
    }
  };

  /** 处理标题变化 */
  const handleTitleChange = (value: string) => {
    updateSectionTitle('workExperience', value);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <span>💼 </span>
        <Input
          value={sectionTitles.workExperience}
          onChange={(e) => handleTitleChange(e.target.value)}
          prefix={<EditOutlined style={{ color: '#999' }} />}
          style={{ width: 160 }}
          size="small"
          variant="borderless"
        />
      </h3>
      {workExperience.map((work, index) => (
        <Card
          key={work.id}
          className="experience-card"
          title={`工作经历 ${index + 1}`}
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeWorkExperience(work.id)}
            >
              删除
            </Button>
          }
        >
          <div className="form-row">
            <Form.Item label="公司名称" required>
              <Input
                value={work.company}
                onChange={(e) => handleChange(work.id, 'company', e.target.value)}
                placeholder="如：某科技公司"
                showCount
                maxLength={100}
              />
            </Form.Item>
            <Form.Item label="职位">
              <Input
                value={work.position}
                onChange={(e) => handleChange(work.id, 'position', e.target.value)}
                placeholder="如：高级前端工程师"
                showCount
                maxLength={100}
              />
            </Form.Item>
          </div>
          <div className="form-row-date">
            <Form.Item label="开始时间">
              <DatePicker
                picker="month"
                value={work.startDate ? dayjs(work.startDate) : null}
                onChange={(date) => handleDateChange(work.id, 'startDate', date)}
                placeholder="开始时间"
              />
            </Form.Item>
            <Form.Item label="结束时间">
              <DatePicker
                picker="month"
                value={work.endDate ? dayjs(work.endDate) : null}
                onChange={(date) => handleDateChange(work.id, 'endDate', date)}
                placeholder="结束时间"
              />
            </Form.Item>
          </div>
          <Form.Item label="工作描述">
            <TextArea
              rows={2}
              value={work.description}
              onChange={(e) => handleChange(work.id, 'description', e.target.value)}
              placeholder="简要描述岗位职责..."
              showCount
              maxLength={500}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          {/* 自定义字段区域 */}
          <div className="custom-item-fields">
            <div className="custom-fields-label">自定义字段（可选）：</div>
            {(work.customFields || []).map((field, fieldIdx) => (
              <Space key={field.id} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                <Input
                  placeholder="字段名"
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...(work.customFields || [])];
                    newFields[fieldIdx] = { ...field, label: e.target.value };
                    useResumeStore.getState().updateWorkExperience(work.id, { customFields: newFields });
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
                    const newFields = [...(work.customFields || [])];
                    newFields[fieldIdx] = { ...field, value: e.target.value };
                    useResumeStore.getState().updateWorkExperience(work.id, { customFields: newFields });
                  }}
                  style={{ flex: 1 }}
                  size="small"
                  showCount
                  maxLength={200}
                />
                <MinusCircleOutlined
                  style={{ color: '#ff4d4f', cursor: 'pointer' }}
                  onClick={() => {
                    const newFields = (work.customFields || []).filter((_, i) => i !== fieldIdx);
                    useResumeStore.getState().updateWorkExperience(work.id, { customFields: newFields });
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
                const currentFields = work.customFields || [];
                useResumeStore.getState().updateWorkExperience(work.id, {
                  customFields: [...currentFields, newField],
                });
              }}
            >
              添加字段
            </Button>
          </div>
          <Form.Item label="主要成就">
            <div className="achievements-list">
              {work.achievements.map((ach, i) => (
                <Tag
                  key={i}
                  closable
                  onClose={() => removeAchievement(work.id, i)}
                  className="achievement-tag"
                >
                  {ach}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                value={newAchievement[work.id] || ''}
                onChange={(e) =>
                  setNewAchievement((prev) => ({ ...prev, [work.id]: e.target.value }))
                }
                placeholder="输入一项成就，如：主导完成技术迁移"
                onPressEnter={() => addAchievement(work.id)}
                showCount
                maxLength={200}
              />
              <Button type="primary" onClick={() => addAchievement(work.id)}>
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
        onClick={addWorkExperience}
        className="add-button"
      >
        添加工作经历
      </Button>
    </div>
  );
}
