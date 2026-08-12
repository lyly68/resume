/**
 * 基本信息表单组件
 * 支持修改个人信息，联系方式和自定义字段支持动态添加、编辑、删除
 */
import { Form, Input, Select, Upload, Button, Space, Card, Tooltip } from 'antd';
import { UserOutlined, MobileOutlined, MailOutlined, EnvironmentOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useResumeStore, contactTypeOptions } from '../store/resumeStore';
import type { ContactType } from '../types/resume';

const { TextArea } = Input;

/** 联系方式图标映射 */
const contactIcons: Record<ContactType, React.ReactNode> = {
  phone: <MobileOutlined />,
  email: <MailOutlined />,
  wechat: null,
  qq: null,
  github: null,
  website: null,
  other: null,
};

/** 基本信息表单组件 */
export default function BasicInfoForm() {
  const { 
    resume, 
    updateBasicInfo, 
    addContact, 
    updateContact, 
    removeContact,
    addCustomField,
    updateCustomField,
    removeCustomField,
    updateSectionTitle
  } = useResumeStore();
  const { basicInfo } = resume;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  /** 处理表单字段变化 */
  const handleChange = (field: string, value: string) => {
    updateBasicInfo({ [field]: value });
  };

  /** 处理联系方式变化 */
  const handleContactChange = (id: string, field: string, value: string) => {
    updateContact(id, { [field]: value });
  };

  /** 处理自定义字段变化 */
  const handleCustomFieldChange = (id: string, field: string, value: string) => {
    updateCustomField(id, { [field]: value });
  };

  /** 处理头像上传，将图片转为 base64 存储 */
  const handleAvatarUpload = (options: any) => {
    const file = options.file as File;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateBasicInfo({ avatar: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  /** 删除头像 */
  const handleRemoveAvatar = () => {
    updateBasicInfo({ avatar: '' });
  };

  /** 处理标题编辑 */
  const handleTitleChange = (key: 'summary' | 'education' | 'workExperience' | 'projects' | 'skills', value: string) => {
    updateSectionTitle(key, value);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">📋 基本信息</h3>
      <Form layout="vertical">
        {/* 头像上传 */}
        <Form.Item label="个人头像">
          <div className="avatar-upload-wrapper">
            <Upload
              listType="picture-card"
              showUploadList={false}
              customRequest={handleAvatarUpload}
              accept="image/*"
            >
              {basicInfo.avatar ? (
                <img src={basicInfo.avatar} alt="头像" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <PlusOutlined />
                  <span>上传头像</span>
                </div>
              )}
            </Upload>
            {basicInfo.avatar && (
              <button type="button" className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                移除头像
              </button>
            )}
          </div>
        </Form.Item>

        <div className="form-row">
          <Form.Item label="姓名">
            <Input
              prefix={<UserOutlined />}
              value={basicInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="请输入姓名"
              showCount
              maxLength={50}
            />
          </Form.Item>
          <Form.Item label="求职意向">
            <Input
              value={basicInfo.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="如：前端工程师"
              showCount
              maxLength={50}
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item label="性别">
            <Select
              value={basicInfo.gender}
              onChange={(value) => handleChange('gender', value)}
              allowClear
              placeholder="请选择性别（选填）"
              options={[
                { label: '男', value: '男' },
                { label: '女', value: '女' },
              ]}
            />
          </Form.Item>
          <Form.Item label="年龄">
            <Input
              value={basicInfo.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="年龄"
              showCount
              maxLength={10}
            />
          </Form.Item>
        </div>

        <Form.Item label="所在城市">
          <Input
            prefix={<EnvironmentOutlined />}
            value={basicInfo.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="如：北京"
            showCount
            maxLength={50}
          />
        </Form.Item>

        {/* 联系方式 */}
        <Form.Item label="联系方式">
          <div className="contacts-list">
            {contacts.map((contact, index) => (
              <Card
                key={contact.id}
                size="small"
                className="contact-card"
                title={`联系方式 ${index + 1}`}
                extra={
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeContact(contact.id)}
                  >
                    删除
                  </Button>
                }
              >
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Form.Item label="类型" style={{ marginBottom: 8 }}>
                    <Select
                      value={contact.type}
                      onChange={(value: ContactType) => handleContactChange(contact.id, 'type', value)}
                      style={{ width: '100%' }}
                      options={contactTypeOptions}
                    />
                  </Form.Item>
                  <Form.Item label="内容" style={{ marginBottom: 0 }}>
                    <Input
                      prefix={contactIcons[contact.type]}
                      value={contact.value}
                      onChange={(e) => handleContactChange(contact.id, 'value', e.target.value)}
                      placeholder={
                        contact.type === 'phone' ? '请输入手机号' :
                        contact.type === 'email' ? '请输入邮箱' :
                        contact.type === 'wechat' ? '请输入微信号' :
                        contact.type === 'qq' ? '请输入QQ号' :
                        contact.type === 'github' ? '请输入GitHub账号' :
                        contact.type === 'website' ? '请输入网站地址' :
                        '请输入内容'
                      }
                      showCount
                      maxLength={100}
                    />
                  </Form.Item>
                </Space>
              </Card>
            ))}
          </div>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={addContact}
            className="add-button"
          >
            添加联系方式
          </Button>
        </Form.Item>

        {/* 自定义字段 */}
        <Form.Item label="自定义字段">
          <div className="contacts-list">
            {customFields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                className="contact-card"
                title={`字段 ${index + 1}`}
                extra={
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeCustomField(field.id)}
                  >
                    删除
                  </Button>
                }
              >
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Form.Item label="字段名称" style={{ marginBottom: 8 }}>
                    <Input
                      value={field.label}
                      onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                      placeholder="如：政治面貌、籍贯、身高..."
                      showCount
                      maxLength={50}
                    />
                  </Form.Item>
                  <Form.Item label="字段值" style={{ marginBottom: 0 }}>
                    <Input
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                      placeholder="请输入字段值"
                      showCount
                      maxLength={100}
                    />
                  </Form.Item>
                </Space>
              </Card>
            ))}
          </div>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={addCustomField}
            className="add-button"
          >
            添加自定义字段
          </Button>
        </Form.Item>

        {/* 自我评价 */}
        <Form.Item 
          label={
            <span>
              <Input 
                value={resume.sectionTitles.summary}
                onChange={(e) => handleTitleChange('summary', e.target.value)}
                prefix={<EditOutlined style={{ color: '#999' }} />}
                style={{ width: 160, marginLeft: 8 }}
                size="small"
                variant="borderless"
              />
            </span>
          }
        >
          <TextArea
            rows={4}
            value={basicInfo.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="简要介绍自己，突出核心优势和职业亮点..."
            showCount
            maxLength={500}
            autoSize={{ minRows: 4, maxRows: 10 }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
