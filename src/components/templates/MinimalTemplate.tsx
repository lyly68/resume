/**
 * 简约风格简历模板
 * 极简设计、留白充足
 */
import type { ResumeData, ContactType } from '../../types/resume';
import { MailOutlined, PhoneOutlined, GlobalOutlined, EnvironmentOutlined } from '@ant-design/icons';
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

/** 简约风格简历模板组件 */
export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const { basicInfo, education, workExperience, projects, skills, sectionTitles } = data;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  return (
    <div className="resume-template minimal-template">
      {/* 头部 */}
      <header className="minimal-header">
        {basicInfo.avatar && (
          <img src={basicInfo.avatar} alt={basicInfo.name} className="minimal-avatar" />
        )}
        <div className="minimal-header-text">
          <h1 className="minimal-name">{basicInfo.name}</h1>
          {basicInfo.jobTitle && <p className="minimal-title">{basicInfo.jobTitle}</p>}
          <div className="minimal-contact">
            {contacts.map((contact) => (
              <span key={contact.id}>
              {contactTypeIcons[contact.type]}{' '}
              {isUrl(contact.value) ? (
                <a href={contact.value} target="_blank" rel="noopener noreferrer" style={{ color: '#888', textDecoration: 'none' }}>
                  {contact.value}
                </a>
              ) : (
                contact.value
              )}
            </span>
            ))}
            {basicInfo.location && <span><EnvironmentOutlined /> {basicInfo.location}</span>}
          </div>
          {customFields.length > 0 && (
            <div className="minimal-custom-fields">
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
        <section className="minimal-section">
          <h2 className="minimal-heading">
            {sectionTitles.summary.toUpperCase()}
          </h2>
          <p className="minimal-text">{renderTextWithLinks(basicInfo.summary)}</p>
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section className="minimal-section">
          <h2 className="minimal-heading">
            {sectionTitles.workExperience.toUpperCase()}
          </h2>
          {workExperience.map((work) => (
            <div key={work.id} className="minimal-item">
              <div className="minimal-row">
                <div>
                  <h3 className="minimal-subtitle">{work.position}</h3>
                  <p className="minimal-company">{work.company}</p>
                </div>
                <span className="minimal-date">{work.startDate} - {work.endDate}</span>
              </div>
              {work.description && <p className="minimal-text">{renderTextWithLinks(work.description)}</p>}
              {work.achievements.length > 0 && (
                <ul className="minimal-list">
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
        <section className="minimal-section">
          <h2 className="minimal-heading">
            {sectionTitles.projects.toUpperCase()}
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="minimal-item">
              <div className="minimal-row">
                <div>
                  <h3 className="minimal-subtitle">{project.name}</h3>
                  <p className="minimal-company">{project.role}</p>
                </div>
                <span className="minimal-date">{project.startDate} - {project.endDate}</span>
              </div>
              {project.description && <p className="minimal-text">{renderTextWithLinks(project.description)}</p>}
              {project.technologies.length > 0 && (
                <div className="minimal-tags">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="minimal-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <section className="minimal-section">
          <h2 className="minimal-heading">
            {sectionTitles.education.toUpperCase()}
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="minimal-item">
              <div className="minimal-row">
                <div>
                  <h3 className="minimal-subtitle">{edu.school}</h3>
                  <p className="minimal-company">{edu.degree} · {edu.major}</p>
                </div>
                <span className="minimal-date">{edu.startDate} - {edu.endDate}</span>
              </div>
              {edu.description && <p className="minimal-text">{renderTextWithLinks(edu.description)}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section className="minimal-section">
          <h2 className="minimal-heading">
            {sectionTitles.skills.toUpperCase()}
          </h2>
          <ul className="minimal-skills-list">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 自定义模块 */}
      {data.customSections.map((section) => (
        section.items.length > 0 && (
          <section key={section.id} className="minimal-section">
            <h2 className="minimal-heading">
              {section.title.toUpperCase()}
            </h2>
            {section.items.map((item) => (
              <div key={item.id} className="minimal-item">
                {item.title && <h3 className="minimal-subtitle">{renderTextWithLinks(item.title)}</h3>}
                {item.content && <p className="minimal-text">{renderTextWithLinks(item.content)}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
