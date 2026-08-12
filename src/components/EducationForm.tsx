/**
 * 教育经历表单组件
 * 支持添加、编辑、删除多条教育经历，标题可编辑
 */
import { Form, Input, Button, DatePicker, Card, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useResumeStore } from '../store/resumeStore';
import dayjs from 'dayjs';

const { TextArea } = Input;

/** 教育经历表单组件 */
export default function EducationForm() {
  const { resume, addEducation, updateEducation, removeEducation, updateSectionTitle } = useResumeStore();
  const { education, sectionTitles } = resume;

  /** 处理字段变化 */
  const handleChange = (id: string, field: string, value: string) => {
    updateEducation(id, { [field]: value });
  };

  /** 处理日期变化 */
  const handleDateChange = (id: string, field: string, date: dayjs.Dayjs | null) => {
    handleChange(id, field, date ? date.format('YYYY-MM') : '');
  };

  /** 处理标题变化 */
  const handleTitleChange = (value: string) => {
    updateSectionTitle('education', value);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <span>🎓 </span>
        <Input
          value={sectionTitles.education}
          onChange={(e) => handleTitleChange(e.target.value)}
          prefix={<EditOutlined style={{ color: '#999' }} />}
          style={{ width: 160 }}
          size="small"
          variant="borderless"
        />
      </h3>
      {education.map((edu, index) => (
        <Card
          key={edu.id}
          className="experience-card"
          title={`教育经历 ${index + 1}`}
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeEducation(edu.id)}
            >
              删除
            </Button>
          }
        >
          <div className="form-row">
            <Form.Item label="学校名称">
              <Input
                value={edu.school}
                onChange={(e) => handleChange(edu.id, 'school', e.target.value)}
                placeholder="如：某某大学"
                showCount
                maxLength={100}
              />
            </Form.Item>
            <Form.Item label="学历">
              <Input
                value={edu.degree}
                onChange={(e) => handleChange(edu.id, 'degree', e.target.value)}
                placeholder="如：本科"
                showCount
                maxLength={50}
              />
            </Form.Item>
          </div>
          <div className="form-row">
            <Form.Item label="专业">
              <Input
                value={edu.major}
                onChange={(e) => handleChange(edu.id, 'major', e.target.value)}
                placeholder="如：计算机科学与技术"
                showCount
                maxLength={100}
              />
            </Form.Item>
            <div className="form-row-date">
              <Form.Item label="开始时间">
                <DatePicker
                  picker="month"
                  value={edu.startDate ? dayjs(edu.startDate) : null}
                  onChange={(date) => handleDateChange(edu.id, 'startDate', date)}
                  placeholder="开始时间"
                />
              </Form.Item>
              <Form.Item label="结束时间">
                <DatePicker
                  picker="month"
                  value={edu.endDate ? dayjs(edu.endDate) : null}
                  onChange={(date) => handleDateChange(edu.id, 'endDate', date)}
                  placeholder="结束时间"
                />
              </Form.Item>
            </div>
          </div>
          <Form.Item label="描述（可选）">
            <TextArea
              rows={2}
              value={edu.description}
              onChange={(e) => handleChange(edu.id, 'description', e.target.value)}
              placeholder="主修课程、荣誉奖项等"
              showCount
              maxLength={500}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          {/* 自定义字段区域 */}
          <div className="custom-item-fields">
            <div className="custom-fields-label">自定义字段（可选）：</div>
            {(edu.customFields || []).map((field, fieldIdx) => (
              <Space key={field.id} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                <Input
                  placeholder="字段名"
                  value={field.label}
                  onChange={(e) => {
                    const newFields = [...(edu.customFields || [])];
                    newFields[fieldIdx] = { ...field, label: e.target.value };
                    useResumeStore.getState().updateEducation(edu.id, { customFields: newFields });
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
                    const newFields = [...(edu.customFields || [])];
                    newFields[fieldIdx] = { ...field, value: e.target.value };
                    useResumeStore.getState().updateEducation(edu.id, { customFields: newFields });
                  }}
                  style={{ flex: 1 }}
                  size="small"
                  showCount
                  maxLength={200}
                />
                <MinusCircleOutlined
                  style={{ color: '#ff4d4f', cursor: 'pointer' }}
                  onClick={() => {
                    const newFields = (edu.customFields || []).filter((_, i) => i !== fieldIdx);
                    useResumeStore.getState().updateEducation(edu.id, { customFields: newFields });
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
                const currentFields = edu.customFields || [];
                useResumeStore.getState().updateEducation(edu.id, {
                  customFields: [...currentFields, newField],
                });
              }}
            >
              添加字段
            </Button>
          </div>
        </Card>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={addEducation}
        className="add-button"
      >
        添加教育经历
      </Button>
    </div>
  );
}
