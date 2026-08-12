/**
 * 现代风格简历模板
 * 简洁大方、层次分明的设计
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

/** 现代风格简历模板组件 */
export default function ModernTemplate({ data }: { data: ResumeData }) {
  const { basicInfo, education, workExperience, projects, skills, sectionTitles } = data;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  return (
    <div className="resume-template modern-template">
      {/* 头部 */}
      <header className="resume-header">
        {basicInfo.avatar && (
          <img src={basicInfo.avatar} alt={basicInfo.name} className="resume-avatar" />
        )}
        <div className="header-info">
          <h1 className="resume-name">{basicInfo.name}</h1>
          <p className="resume-title">{basicInfo.jobTitle}</p>
          <div className="contact-info">
            {contacts.map((contact) => (
              <span key={contact.id}>
                {contactTypeIcons[contact.type]}{' '}
                {isUrl(contact.value) ? (
                  <a href={contact.value} target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'none' }}>
                    {contact.value}
                  </a>
                ) : (
                  contact.value
                )}
              </span>
            ))}
            {basicInfo.gender && <span>{basicInfo.gender}</span>}
            {basicInfo.age && <span>{basicInfo.age}岁</span>}
            {basicInfo.location && <span><EnvironmentOutlined /> {basicInfo.location}</span>}
          </div>
          {customFields.length > 0 && (
            <div className="custom-fields">
              {customFields.map((field) => (
                <span key={field.id} className="custom-field">
                  <strong>{field.label}：</strong>{renderTextWithLinks(field.value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 自我评价 */}
      {basicInfo.summary && (
        <section className="resume-section">
          <h2 className="section-heading">
            {sectionTitles.summary}
          </h2>
          <p className="summary-text">{renderTextWithLinks(basicInfo.summary)}</p>
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading">
            <span className="heading-bar"></span>
            {sectionTitles.workExperience}
          </h2>
          {workExperience.map((work) => (
            <div key={work.id} className="experience-item">
              <div className="experience-header">
                <div className="experience-title">
                  <span className="company-name">{work.company}</span>
                  <span className="position-name">{work.position}</span>
                </div>
                <span className="experience-date">
                  {work.startDate} - {work.endDate}
                </span>
              </div>
              {work.description && <p className="experience-desc">{renderTextWithLinks(work.description)}</p>}
              {work.achievements.length > 0 && (
                <ul className="achievements-list">
                  {work.achievements.map((ach, i) => (
                    <li key={i}>{renderTextWithLinks(ach)}</li>
                  ))}
                </ul>
              )}
              {(work.customFields && work.customFields.length > 0) && (
                <div className="item-custom-fields">
                  {work.customFields.map((field) => (
                    <span key={field.id} className="item-custom-field">
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
        <section className="resume-section">
          <h2 className="section-heading">
            <span className="heading-bar"></span>
            {sectionTitles.projects}
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="experience-item">
              <div className="experience-header">
                <div className="experience-title">
                  <span className="project-name">{project.name}</span>
                  <span className="project-role">{project.role}</span>
                </div>
                <span className="experience-date">
                  {project.startDate} - {project.endDate}
                </span>
              </div>
              {project.description && <p className="experience-desc">{renderTextWithLinks(project.description)}</p>}
              {project.technologies.length > 0 && (
                <div className="tech-tags">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
              {(project.customFields && project.customFields.length > 0) && (
                <div className="item-custom-fields">
                  {project.customFields.map((field) => (
                    <span key={field.id} className="item-custom-field">
                      <strong>{field.label}：</strong>{renderTextWithLinks(field.value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading">
            <span className="heading-bar"></span>
            {sectionTitles.education}
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="experience-item">
              <div className="experience-header">
                <div className="experience-title">
                  <span className="school-name">{edu.school}</span>
                  <span className="major-name">
                    {edu.degree} · {edu.major}
                  </span>
                </div>
                <span className="experience-date">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              {edu.description && <p className="experience-desc">{renderTextWithLinks(edu.description)}</p>}
              {(edu.customFields && edu.customFields.length > 0) && (
                <div className="item-custom-fields">
                  {edu.customFields.map((field) => (
                    <span key={field.id} className="item-custom-field">
                      <strong>{field.label}：</strong>{renderTextWithLinks(field.value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading">
            <span className="heading-bar"></span>
            {sectionTitles.skills}
          </h2>
          <ul className="skills-list">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 自定义模块 */}
      {data.customSections.map((section) => (
        section.items.length > 0 && (
          <section key={section.id} className="resume-section">
            <h2 className="section-heading">
              <span className="heading-bar"></span>
              {section.title}
            </h2>
            {section.items.map((item) => (
              <div key={item.id} className="experience-item">
                {item.title && <h3 className="item-title">{renderTextWithLinks(item.title)}</h3>}
                {item.content && <p className="experience-desc">{renderTextWithLinks(item.content)}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
