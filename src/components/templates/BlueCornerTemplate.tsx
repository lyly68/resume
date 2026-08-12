/**
 * 深蓝斜角标签简历模板
 * 模块标题采用左侧深蓝色斜角切角矩形填充
 * 顶部为大号"个人简历"标题 + 右上角图标
 * 基本信息采用两列网格布局
 */
import type { ResumeData, ContactType } from '../../types/resume';
import { MailOutlined, PhoneOutlined, GlobalOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined, TrophyOutlined, HomeOutlined, IdcardOutlined } from '@ant-design/icons';
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

/**
 * 构建斜角标签模块标题
 */
function buildCornerTagHeading(cn: string) {
  return (
    <div className="corner-heading-wrap">
      <div className="corner-heading-tag">
        <span>{cn}</span>
      </div>
    </div>
  );
}

/** 深蓝斜角标签简历模板组件 */
export default function BlueCornerTemplate({ data }: { data: ResumeData }) {
  const { basicInfo, education, workExperience, projects, skills, sectionTitles } = data;
  const contacts = basicInfo.contacts || [];
  const customFields = basicInfo.customFields || [];

  const phoneContact = contacts.find(c => c.type === 'phone');
  const emailContact = contacts.find(c => c.type === 'email');
  const otherContacts = contacts.filter(c => !['phone', 'email'].includes(c.type));

  return (
    <div className="resume-template corner-template">
      {/* 顶部：大号标题 + 图标 */}
      <div className="corner-top-bar">
        <h1 className="corner-top-title">个人简历</h1>
        <div className="corner-top-icons">
          <span className="corner-icon-circle"><IdcardOutlined /></span>
          <span className="corner-icon-circle"><TrophyOutlined /></span>
          <span className="corner-icon-circle"><HomeOutlined /></span>
        </div>
      </div>

      {/* 装饰条：深蓝斜角条 + 灰色条 */}
      <div className="corner-deco-bar"></div>

      {/* 基本信息 */}
      <section className="corner-section">
        {buildCornerTagHeading('基本信息')}
        <div className="corner-basic-grid">
          <div className="corner-basic-item">
            <span className="corner-basic-label">姓　名：</span>
            <span className="corner-basic-value">{basicInfo.name}</span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">求职意向：</span>
            <span className="corner-basic-value">{basicInfo.jobTitle}</span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">性　别：</span>
            <span className="corner-basic-value">{basicInfo.gender}</span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">出生年月：</span>
            <span className="corner-basic-value">{basicInfo.age}</span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">政治面貌：</span>
            <span className="corner-basic-value">
              {customFields.find(f => /政治|面貌|party/i.test(f.label))?.value || ''}
            </span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">电子邮箱：</span>
            <span className="corner-basic-value">
              {emailContact && (
                isUrl(emailContact.value) ? (
                  <a href={`mailto:${emailContact.value}`} style={{ color: '#222', textDecoration: 'none' }}>{emailContact.value}</a>
                ) : emailContact.value
              )}
            </span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">籍　贯：</span>
            <span className="corner-basic-value">
              {customFields.find(f => /籍贯|户口|address/i.test(f.label))?.value || ''}
            </span>
          </div>
          <div className="corner-basic-item">
            <span className="corner-basic-label">联系方式：</span>
            <span className="corner-basic-value">
              {phoneContact && (
                isUrl(phoneContact.value) ? (
                  <a href={phoneContact.value} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none' }}>{phoneContact.value}</a>
                ) : phoneContact.value
              )}
            </span>
          </div>
          {/* 自定义字段（除已用字段） */}
          {customFields.filter(f => !/(政治|面貌|party|籍贯|户口|address)/i.test(f.label)).map((f, idx) => (
            <div key={f.id} className="corner-basic-item" style={{ gridColumn: idx % 2 === 0 ? '1 / 2' : '2 / 3' }}>
              <span className="corner-basic-label">{f.label}：</span>
              <span className="corner-basic-value">{renderTextWithLinks(f.value)}</span>
            </div>
          ))}
          {/* 其他联系方式 */}
          {otherContacts.map((c, idx) => (
            <div key={c.id} className="corner-basic-item">
              <span className="corner-basic-label">
                {c.type === 'wechat' ? '微　信：' : c.type === 'qq' ? 'QQ：' : c.type === 'github' ? 'GitHub：' : c.type === 'website' ? '网　站：' : '其他：'}
              </span>
              <span className="corner-basic-value">
                {isUrl(c.value) ? (
                  <a href={c.value} target="_blank" rel="noopener noreferrer" style={{ color: '#222', textDecoration: 'none' }}>{c.value}</a>
                ) : c.value}
              </span>
            </div>
          ))}
          {/* 所在地 */}
          {basicInfo.location && (
            <div className="corner-basic-item">
              <span className="corner-basic-label">所在地：</span>
              <span className="corner-basic-value">{basicInfo.location}</span>
            </div>
          )}
        </div>
      </section>

      {/* 自我评价 */}
      {basicInfo.summary && (
        <section className="corner-section">
          {buildCornerTagHeading(sectionTitles.summary)}
          <p className="corner-text">{renderTextWithLinks(basicInfo.summary)}</p>
        </section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <section className="corner-section">
          {buildCornerTagHeading(sectionTitles.education)}
          {education.map((edu) => (
            <div key={edu.id} className="corner-entry">
              <div className="corner-entry-header">
                <div className="corner-entry-title-left">
                  <span className="corner-school">{edu.school}</span>
                </div>
                <div className="corner-entry-title-right">
                  <span className="corner-degree">{edu.degree}</span>
                  <span className="corner-date">{edu.startDate}-{edu.endDate}</span>
                </div>
              </div>
              {edu.description && <p className="corner-text">{renderTextWithLinks(edu.description)}</p>}
            </div>
          ))}
        </section>
      )}

      {/* 项目经历 */}
      {projects.length > 0 && (
        <section className="corner-section">
          {buildCornerTagHeading(sectionTitles.projects)}
          {projects.map((project) => (
            <div key={project.id} className="corner-entry">
              <div className="corner-entry-header">
                <div className="corner-entry-title-left">
                  <span className="corner-project">{project.name}</span>
                </div>
                <div className="corner-entry-title-right">
                  <span className="corner-role">{project.role}</span>
                  <span className="corner-date">{project.startDate}-{project.endDate}</span>
                </div>
              </div>
              {project.description && (
                <p className="corner-text">{renderTextWithLinks(project.description)}</p>
              )}
              {project.technologies.length > 0 && (
                <div className="corner-tech">
                  <strong>技术栈：</strong>{project.technologies.join(' / ')}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section className="corner-section">
          {buildCornerTagHeading(sectionTitles.workExperience)}
          {workExperience.map((work) => (
            <div key={work.id} className="corner-entry">
              <div className="corner-entry-header">
                <div className="corner-entry-title-left">
                  <span className="corner-company">{work.company}</span>
                </div>
                <div className="corner-entry-title-right">
                  <span className="corner-position">{work.position}</span>
                  <span className="corner-date">{work.startDate}-{work.endDate}</span>
                </div>
              </div>
              {work.description && <p className="corner-text">{renderTextWithLinks(work.description)}</p>}
              {work.achievements.length > 0 && (
                <ul className="corner-list">
                  {work.achievements.map((ach, i) => (
                    <li key={i}>{renderTextWithLinks(ach)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section className="corner-section">
          {buildCornerTagHeading(sectionTitles.skills)}
          <ul className="corner-skills-list">
            {skills.map((skill) => (
              <li key={skill.id}>{skill.name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* 自定义模块 */}
      {data.customSections.map((section) => (
        section.items.length > 0 && (
          <section key={section.id} className="corner-section">
            {buildCornerTagHeading(section.title)}
            {section.items.map((item) => (
              <div key={item.id} className="corner-entry">
                {item.title && <h3 className="corner-entry-subtitle">{renderTextWithLinks(item.title)}</h3>}
                {item.content && <p className="corner-text">{renderTextWithLinks(item.content)}</p>}
              </div>
            ))}
          </section>
        )
      ))}
    </div>
  );
}
