/**
 * 简历预览组件
 * 根据选择的模板实时渲染简历预览
 */
import { useResumeStore } from '../store/resumeStore';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import BilingualTagTemplate from './templates/BilingualTagTemplate';
import BlueCornerTemplate from './templates/BlueCornerTemplate';
import { Segmented, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

/** 简历识别格式说明 */
const importHelpText = `简历识别格式说明：
1. 支持 PDF、Word(.docx)、TXT 格式
2. 识别规则（基于关键词）：
   - 基本信息：自动识别姓名、性别、年龄、求职意向、联系方式
   - 自我评价/求职总结：包含"个人简介"、"自我评价"、"求职总结"等关键词
   - 教育经历：包含"教育经历"、"教育背景"等关键词
   - 工作/实习经历：包含"工作经历"、"工作经验"、"实习经历"等关键词
   - 项目经历：包含"项目经历"、"项目经验"等关键词
   - 技能专长：包含"技能"、"专业技能"、"技术栈"等关键词
   - 其他模块（如荣誉奖项、证书等）：作为自定义模块自动识别
3. 建议使用标准简历格式，每个模块有明确的标题`;

/** 简历预览组件 */
export default function ResumePreview() {
  const { resume, template, setTemplate } = useResumeStore();

  /** 模板选项：五个固定模板 */
  const options = [
    { label: '现代风格', value: 'modern' },
    { label: '经典风格', value: 'classic' },
    { label: '简约风格', value: 'minimal' },
    { label: '双语标签', value: 'bilingual' },
    { label: '深蓝斜角', value: 'bluecorner' },
  ];

  /** 处理模板变化 */
  const handleTemplateChange = (value: string | number) => {
    setTemplate(value as any);
  };

  /** 渲染对应模板 */
  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return <ClassicTemplate data={resume} />;
      case 'minimal':
        return <MinimalTemplate data={resume} />;
      case 'bilingual':
        return <BilingualTagTemplate data={resume} />;
      case 'bluecorner':
        return <BlueCornerTemplate data={resume} />;
      case 'modern':
      default:
        return <ModernTemplate data={resume} />;
    }
  };

  return (
    <div className="preview-container">
      <div className="preview-toolbar">
        <span className="toolbar-label">选择模板：</span>
        <Segmented
          value={template}
          onChange={(value) => handleTemplateChange(value as string)}
          options={options}
        />
        <Tooltip title={importHelpText} placement="bottom" styles={{ root: { maxWidth: 360 } }}>
          <QuestionCircleOutlined style={{ color: '#999', cursor: 'help' }} />
        </Tooltip>
      </div>
      <div id="resume-preview" className="preview-content">
        {renderTemplate()}
      </div>
    </div>
  );
}
