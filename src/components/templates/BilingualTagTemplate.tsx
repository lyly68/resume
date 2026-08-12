/**
 * 商务双语标签简历模板
 * 模块标题采用深蓝色矩形填充 + 中英双语设计
 * 基本信息左右布局：左侧字段 + 右侧头像
 */
import type { ResumeData, ContactType } from '../../types/resume';
import { MailOutlined, PhoneOutlined, GlobalOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { renderTextWithLinks, isUrl } from '../../utils/linkRenderer';

/** 联系方式图标映射 */
const contactTypeIcons: Record<ContactType, React.ReactNode> = {
  phone: <PhoneOutlined />,
  email: <MailOutlined />,
  wechat: <span>微信</span>,
  qq: <span>QQ</span>,
  github: <span>GitHub</span>,
  website: <GlobalOutlined />,
  other: <span>其他</span>,
};

/** 模块中英文标题映射 */
const SECTION_EN: Record<string, string> = {
  summary: 'Self Assessment',
  education: 'Education Background',
  workExperience: 'Work Experience',
  projects: 'Project Experience',
  skills: 'Personal Skills',
};

/** 联系方式标签映射 */
const CONTACT_LABEL: Record<ContactType, string> = {
  phone: '联系电话',
  email: '邮箱',
  wechat: '微信',
  qq: 'QQ',
  github: 'GitHub',
  website: '网站',
  other: '其他',
};

/**
 * 构建双语模块标题
 */
function buildBilingualHeading(sectionKey: string, cn: string) {
  const en = SECTION_EN[sectionKey] || cn;
  return (
    <div className="bilingual-heading">
      <span className="bilingual-heading-cn">{cn}</span>
      <span className="bilingual-heading-en">{en}</span>
    </div>
  );
}

/** 商务双语标签简历模板组件 */
export default function BilingualTagTemplate({ data }: { data: ResumeData }) {
  const { basicInfo, education, workExperience, projects, skills, sectionTitles } = data;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  return (
    <div className="resume-template bilingual-template">
      {/* 标题行：居中的"个人简历 Personal Resume" */}
      <div className="bilingual-top-title">
        <h1 className="bilingual-top-cn">个人简历</h1>
        <span className="bilingual-top-en">Personal Resume</span>
      </div>

      {/* 基本信息模块 */}
      <section className="bilingual-section">
        {buildBilingualHeading('summary', '基本信息 Basic Information')}
        <div className="bilingual-basic-wrapper">
          <div className="bilingual-basic-left">
            <div className="bilingual-basic-row">
              <span className="bilingual-basic-label">姓　名：</span>
              <span className="bilingual-basic-value">{basicInfo.name}</span>
              <span className="bilingual-basic-label" style={{ marginLeft: 32 }}>出生年月：</span>
              <span className="bilingual-basic-value">{basicInfo.age}</span>
            </div>
            <div className="bilingual-basic-row">
              {contacts.filter(c => c.type === 'phone').map(c => (
                <span key={c.id} style={{ display: 'inline-flex' }}>
                  <span className="bilingual-basic-label">联系电话：</span>
                  <span className="bilingual-basic-value">
                    {isUrl(c.value) ? (
                      <a href={c.value} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none' }}>{c.value}</a>
                    ) : c.value}
                  </span>
                </span>
              ))}
              <span className="bilingual-basic-label" style={{ marginLeft: 32 }}>求职意向：</span>
              <span className="bilingual-basic-value">{basicInfo.jobTitle}</span>
            </div>
            <div className="bilingual-basic-row">
              {contacts.filter(c => c.type === 'email').map(c => (
                <span key={c.id} style={{ display: 'inline-flex' }}>
                  <span className="bilingual-basic-label">邮　箱：</span>
                  <span className="bilingual-basic-value">
                    {isUrl(c.value) ? (
                      <a href={`mailto:${c.value}`} style={{ color: '#222', textDecoration: 'none' }}>{c.value}</a>
                    ) : c.value}
                  </span>
                </span>
              ))}
              {customFields.slice(0, 1).map(f => (
                <span key={f.id} style={{ display: 'inline-flex', marginLeft: 32 }}>
                  <span className="bilingual-basic-label">{f.label}：</span>
                  <span className="bilingual-basic-value">{renderTextWithLinks(f.value)}</span>
                </span>
              ))}
            </div>
            <div className="bilingual-basic-row">
              {basicInfo.gender && (
                <>
                  <span className="bilingual-basic-label">性　别：</span>
                  <span className="bilingual-basic-value">{basicInfo.gender}</span>
                </>
              )}
              {basicInfo.location && (
                <>
                  <span className="bilingual-basic-label" style={{ marginLeft: 32 }}>所在地：</span>
                  <span className="bilingual-basic-value">{basicInfo.location}</span>
                </>
              )}
              {customFields.slice(1, 2).map(f => (
                <span key={f.id} style={{ display: 'inline-flex', marginLeft: 32 }}>
                  <span className="bilingual-basic-label">{f.label}：</span>
                  <span className="bilingual-basic-value">{renderTextWithLinks(f.value)}</span>
                </span>
              ))}
            </div>
            {/* 其他联系方式 */}
            {contacts.filter(c => !['phone', 'email'].includes(c.type)).length > 0 && (
              <div className="bilingual-basic-row">
                {contacts.filter(c => !['phone', 'email'].includes(c.type)).map(c => (
                  <span key={c.id} style={{ display: 'inline-flex' }}>
                    <span className="bilingual-basic-label">{CONTACT_LABEL[c.type]}：</span>
                    <span className="bilingual-basic-value">
                      {contactTypeIcons[c.type]}{' '}
                      {isUrl(c.value) ? (
                        <a href={c.value} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none' }}>{c.value}</a>
                      ) : c.value}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {customFields.slice(2).map(f => (
              <div key={f.id} className="bilingual-basic-row">
                <span className="bilingual-basic-label">{f.label}：</span>
                <span className="bilingual-basic-value">{renderTextWithLinks(f.value)}</span>
              </div>
            ))}
          </div>
          {basicInfo.avatar && (
            <div className="bilingual-basic-right">
              <img src={basicInfo.avatar} alt={basicInfo.name} className="bilingual-avatar" />
            </div>
          )}
        </div>
      </section>

      {/* 自我评价 */}
      {basicInfo.summary && (
        <section className="bilingual-section">
          {buildBilingualHeading('summary', sectionTitles.summary)}
          <p className="bilingual-text">{renderTextWithLinks(basicInfo.summary)}</p>
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section className="bilingual-section">
          {buildBilingualHeading('workExperience', sectionTitles.workExperience)}
          {workExperience.map((work) => (
            <div key={work.id} className="bilingual-entry">
              <div className="bilingual-entry-header">
                <div className="bilingual-entry-title">
                  <span className="bilingual-company">{work.company}</span>
                  <span className="bilingual-divider"></span>
                  <span className="bilingual-position">{work.position}</span>
                </div>
                <span className="bilingual-date">
                  <CalendarOutlined /> {work.startDate}-{work.endDate}
                </span>
              </div>
              {work.description && <p className="bilingual-text">{renderTextWithLinks(work.description)}</p>}
              {work.achievements.length > 0 && (
                <ul className="bilingual-list">
                  {work.achievements.map((ach, i) => (
                    <li key={i}>{renderTextWithLinks(ach)}</li>
                  ))}
                </ul>
              )}
              {(work.customFields && work.customFields.length > 0) && (
                <div className="bilingual-custom-fields">
                  {work.customFields.map((field) => (
                    <span key={field.id} className="bilingual-custom-field">
                      <strong>{field.label}：</strong>{renderTextWithLinks(field.value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 项目经历 */}
      {projects.length > 0 && (
        <section className="bilingual-section">
          {buildBilingualHeading('projects', sectionTitles.projects)}
          {projects.map((project) => (
            <div key={project.id} className="bilingual-entry">
              <div className="bilingual-entry-header">
                <div className="bilingual-entry-title">
                  <span className="bilingual-company">{project.name}</span>
                  <span className="bilingual-divider"></span>
                  <span className="bilingual-position">{project.role}</span>
                </div>
                <span className="bilingual-date">
                  <CalendarOutlined /> {project.startDate}-{project.endDate}
                </span>
              </div>
              {project.description && <p className="bilingual-text">{renderTextWithLinks(project.description)}</p>}
              {project.technologies.length > 0 && (
                <div className="bilingual-tech-tags">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="bilingual-tech-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <section className="bilingual-section">
          {buildBilingualHeading('education', sectionTitles.education)}
          {education.map((edu) => (
            <div key={edu.id} className="bilingual-entry">
              <div className="bilingual-entry-header">
                <div className="bilingual-entry-title">
                  <span className="bilingual-company">{edu.school}</span>
                  <span className="bilingual-divider"></span>
                  <span className="bilingual-position">
                    {edu.degree} · {edu.major}
                  </span>
                </div>
                <span className="bilingual-date">
                  <CalendarOutlined /> {edu.startDate}-{edu.endDate}
                </span>
              </div>
              {edu.description && <p className="bilingual-text">{renderTextWithLinks(edu.description)}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section className="bilingual-section">
          {buildBilingualHeading('skills', sectionTitles.skills)}
          <ul className="bilingual-skills-list">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 自定义模块 */}
      {data.customSections.map((section) => (
        section.items.length > 0 && (
          <section key={section.id} className="bilingual-section">
            {buildBilingualHeading(section.id, section.title)}
            {section.items.map((item) => (
              <div key={item.id} className="bilingual-entry">
                {item.title && <h3 className="bilingual-entry-subtitle">{renderTextWithLinks(item.title)}</h3>}
                {item.content && <p className="bilingual-text">{renderTextWithLinks(item.content)}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
