/**
 * 技能表单组件
 * 支持添加、编辑、删除技能名称，标题可编辑
 */
import { Form, Input, Button, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useResumeStore } from '../store/resumeStore';

/** 技能表单组件 */
export default function SkillsForm() {
  const { resume, addSkill, updateSkill, removeSkill, updateSectionTitle } = useResumeStore();
  const { skills, sectionTitles } = resume;

  /** 处理字段变化 */
  const handleChange = (id: string, field: string, value: string) => {
    updateSkill(id, { [field]: value });
  };

  /** 处理标题变化 */
  const handleTitleChange = (value: string) => {
    updateSectionTitle('skills', value);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <span>🛠️ </span>
        <Input
          value={sectionTitles.skills}
          onChange={(e) => handleTitleChange(e.target.value)}
          prefix={<EditOutlined style={{ color: '#999' }} />}
          style={{ width: 160 }}
          size="small"
          variant="borderless"
        />
      </h3>
      {skills.map((skill, index) => (
        <Card
          key={skill.id}
          className="experience-card skill-card"
          title={`技能 ${index + 1}`}
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeSkill(skill.id)}
            >
              删除
            </Button>
          }
        >
          <Form.Item label="技能名称" required>
            <Input
              value={skill.name}
              onChange={(e) => handleChange(skill.id, 'name', e.target.value)}
              placeholder="如：React"
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Card>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={addSkill}
        className="add-button"
      >
        添加技能
      </Button>
    </div>
  );
}
