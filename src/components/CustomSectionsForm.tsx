/**
 * 自定义模块表单组件
 * 支持用户添加自定义大标题模块（如实习经历、荣誉奖项等）
 * 每个模块可包含多个条目，每个条目有标题和内容
 */
import { Form, Input, Button, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useResumeStore } from '../store/resumeStore';

const { TextArea } = Input;

/** 自定义模块表单组件 */
export default function CustomSectionsForm() {
  const {
    resume,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
  } = useResumeStore();

  const { customSections } = resume;

  /** 处理模块标题变化 */
  const handleSectionTitleChange = (id: string, value: string) => {
    updateCustomSection(id, { title: value });
  };

  /** 处理条目字段变化 */
  const handleItemChange = (sectionId: string, itemId: string, field: string, value: string) => {
    updateCustomSectionItem(sectionId, itemId, { [field]: value });
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <span>📝 </span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>自定义模块</span>
      </h3>
      <p className="section-desc">可以添加如实习经历、荣誉奖项、出版著作等自定义模块</p>
      
      {customSections.map((section, sectionIndex) => (
        <Card
          key={section.id}
          className="experience-card custom-section-card"
          title={
            <Input
              value={section.title}
              onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
              prefix={<EditOutlined style={{ color: '#999' }} />}
              style={{ width: 200 }}
              size="small"
              variant="borderless"
            />
          }
          extra={
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeCustomSection(section.id)}
            >
              删除模块
            </Button>
          }
        >
          {section.items.map((item, itemIndex) => (
            <Card
              key={item.id}
              size="small"
              className="custom-item-card"
              title={`条目 ${itemIndex + 1}`}
              extra={
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeCustomSectionItem(section.id, item.id)}
                >
                  删除
                </Button>
              }
            >
              <Form.Item label="标题">
                <Input
                  value={item.title}
                  onChange={(e) => handleItemChange(section.id, item.id, 'title', e.target.value)}
                  placeholder="如：2023年度优秀员工"
                  showCount
                  maxLength={100}
                />
              </Form.Item>
              <Form.Item label="内容">
                <TextArea
                  rows={3}
                  value={item.content}
                  onChange={(e) => handleItemChange(section.id, item.id, 'content', e.target.value)}
                  placeholder="详细描述..."
                  showCount
                  maxLength={500}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                />
              </Form.Item>
            </Card>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => addCustomSectionItem(section.id)}
            className="add-button"
            style={{ marginTop: 8 }}
          >
            添加条目
          </Button>
        </Card>
      ))}
      
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={addCustomSection}
        className="add-button"
      >
        添加新模块
      </Button>
    </div>
  );
}
