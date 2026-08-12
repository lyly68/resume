/**
 * 经典风格简历模板
 * 传统布局、清晰的分段
 */
import type { ResumeData, ContactType } from '../../types/resume';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
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

/** 经典风格简历模板组件 */
export default function ClassicTemplate({ data }: { data: ResumeData }) {
  const { basicInfo, education, workExperience, projects, skills, sectionTitles } = data;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  return (
    <div className="resume-template classic-template">
      {/* 头部 */}
      <header className="classic-header">
        {basicInfo.avatar && (
          <img src={basicInfo.avatar} alt={basicInfo.name} className="classic-avatar" />
        )}
        <div className="classic-header-text">
          <h1 className="classic-name">{basicInfo.name}</h1>
          <div className="classic-contact">
            {contacts.map((contact) => (
              <span key={contact.id}>
                {contactTypeIcons[contact.type]}{' '}
                {isUrl(contact.value) ? (
                  <a href={contact.value} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none' }}>
                    {contact.value}
                  </a>
                ) : (
                  contact.value
                )}
              </span>
            ))}
            {basicInfo.location && <span><EnvironmentOutlined /> {basicInfo.location}</span>}
          </div>
          {basicInfo.jobTitle && <p className="classic-title">{basicInfo.jobTitle}</p>}
          {customFields.length > 0 && (
            <div className="classic-custom-fields">
              {customFields.map((field) => (
                <span key={field.id}>
                  {field.label}：{renderTextWithLinks(field.value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 自我评价 */}
      {basicInfo.summary && (
        <section className="classic-section">
          <h2 className="classic-heading">{sectionTitles.summary}</h2>
          <p className="classic-text">{renderTextWithLinks(basicInfo.summary)}</p>
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-heading">{sectionTitles.workExperience}</h2>
          {workExperience.map((work) => (
            <div key={work.id} className="classic-item">
              <div className="classic-row">
                <strong>{work.company}</strong>
                <span>{work.position}</span>
                <span className="classic-date">{work.startDate} - {work.endDate}</span>
              </div>
              {work.description && <p className="classic-text">{renderTextWithLinks(work.description)}</p>}
              {work.achievements.length > 0 && (
                <ul className="classic-list">
                  {work.achievements.map((ach, i) => (
                    <li key={i}>{renderTextWithLinks(ach)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 项目经历 */}
      {projects.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-heading">{sectionTitles.projects}</h2>
          {projects.map((project) => (
            <div key={project.id} className="classic-item">
              <div className="classic-row">
                <strong>{project.name}</strong>
                <span>{project.role}</span>
                <span className="classic-date">{project.startDate} - {project.endDate}</span>
              </div>
              {project.description && <p className="classic-text">{renderTextWithLinks(project.description)}</p>}
              {project.technologies.length > 0 && (
                <p className="classic-text">
                  <strong>技术栈：</strong>
                  {project.technologies.join('、')}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-heading">{sectionTitles.education}</h2>
          {education.map((edu) => (
            <div key={edu.id} className="classic-item">
              <div className="classic-row">
                <strong>{edu.school}</strong>
                <span>{edu.degree} · {edu.major}</span>
                <span className="classic-date">{edu.startDate} - {edu.endDate}</span>
              </div>
              {edu.description && <p className="classic-text">{renderTextWithLinks(edu.description)}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-heading">{sectionTitles.skills}</h2>
          <ul className="classic-skills-list">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 自定义模块 */}
      {data.customSections.map((section) => (
        section.items.length > 0 && (
          <section key={section.id} className="classic-section">
            <h2 className="classic-heading">{section.title}</h2>
            {section.items.map((item) => (
              <div key={item.id} className="classic-item">
                {item.title && <strong>{renderTextWithLinks(item.title)}</strong>}
                {item.content && <p className="classic-text">{renderTextWithLinks(item.content)}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
