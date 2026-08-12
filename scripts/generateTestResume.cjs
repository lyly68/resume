/**
 * 生成标准格式简历文档脚本
 * 用于测试简历解析器的识别准确率
 * 使用方法: node scripts/generateTestResume.js
 */
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

/** 创建标准格式简历文档 */
async function generateResume() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // ========== 基本信息 ==========
        new Paragraph({
          children: [new TextRun({ text: '张燕', bold: true, size: 36, font: '微软雅黑' })],
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '求职意向：软件测试工程师', size: 24, font: '微软雅黑' })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '13800138000 | zhangsan@example.com | 1516225502@qq.com', size: 22, font: '微软雅黑' })],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '女 | 17岁 | 四川', size: 22, font: '微软雅黑' })],
          spacing: { after: 400 },
        }),

        // ========== 自我评价 ==========
        new Paragraph({
          children: [new TextRun({ text: '自我评价', bold: true, size: 28, font: '微软雅黑' })],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '5年以上前端开发经验，精通React、Vue等主流框架，具备良好的代码规范和工程化意识。熟悉TypeScript、Node.js，能够独立完成项目从0到1的搭建。注重用户体验，追求代码质量。', size: 22, font: '微软雅黑' })],
          spacing: { after: 400 },
        }),

        // ========== 教育经历 ==========
        new Paragraph({
          children: [new TextRun({ text: '教育经历', bold: true, size: 28, font: '微软雅黑' })],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '青岛科技大学', bold: true, size: 24, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '计算机科学与技术 | 本科', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '2021.09 - 2025.06', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '主修课程：数据结构、算法设计、操作系统、计算机网络、数据库等', size: 22, font: '微软雅黑' })],
          spacing: { after: 400 },
        }),

        // ========== 实习经历 ==========
        new Paragraph({
          children: [new TextRun({ text: '实习经历', bold: true, size: 28, font: '微软雅黑' })],
          spacing: { before: 200, after: 200 },
        }),
        // 第一段实习
        new Paragraph({
          children: [new TextRun({ text: '青岛海信智能医疗技术有限公司', bold: true, size: 24, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '软件测试', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '2025.08 - 2025.11', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '测试设备：便携式彩色多普勒超声诊断系统H7，HD80', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '测试内容：依据需求文档与测试用例，独立完成图像参数、病人管理、任务管理器、多取样线PW、网络设置、多语言及按键定义、病人报告生成及IO外接设备等核心模块的功能测试，累计执行1000+条测试用例。', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '缺陷流程管理：熟练使用JIRA平台进行缺陷的提交、跟踪、协同定位及回归验证，累计提交50+个有效缺陷，其中识别并推动解决10个高优先级关键缺陷。', size: 22, font: '微软雅黑' })],
          spacing: { after: 200 },
        }),
        // 第二段实习
        new Paragraph({
          children: [new TextRun({ text: '上海高顿教育科技有限公司', bold: true, size: 24, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '软件测试', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '2025.11 - 2026.04', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '测试内容：负责AI讲题智能体、Python作业AI智能批改、批量导出试卷的功能、UI和回归测试。', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '测试方法：深入理解业务需求，独立设计并编写了3份高质量的测试用例，应用了等价类、边界值、场景法等测试方法，覆盖了核心用户路径和异常场景。', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '成果：在实习期间，累计发现并提交了40个有效Bug，其中包含19个高优先级/严重级别的Bug，有效保障了产品上线质量。', size: 22, font: '微软雅黑' })],
          spacing: { after: 400 },
        }),

        // ========== 项目经历 ==========
        new Paragraph({
          children: [new TextRun({ text: '项目经历', bold: true, size: 28, font: '微软雅黑' })],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '新闻文章管理系统', bold: true, size: 24, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '测试', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '2025.05 - 2025.06', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '项目简介：该系统是一个基于Web的新闻内容管理平台，支持新闻信息的增删查改、用户注册与登录、用户信息管理等功能，面向后台管理员与普通用户。', size: 22, font: '微软雅黑' })],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '测试职责：功能测试设计与执行、接口测试、性能测试。', size: 22, font: '微软雅黑' })],
          spacing: { after: 400 },
        }),

        // ========== 技能专长 ==========
        new Paragraph({
          children: [new TextRun({ text: '技能专长', bold: true, size: 28, font: '微软雅黑' })],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({ children: [new TextRun({ text: 'Selenium', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Python', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'JIRA', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Postman', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Java', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'JavaScript', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'React', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Vue', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'MySQL', size: 22, font: '微软雅黑' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Linux', size: 22, font: '微软雅黑' })] }),
      ],
    }],
  });

  // 保存文件
  const outputDir = path.join(__dirname, '..', 'public');
  const outputPath = path.join(outputDir, '测试简历_标准格式.docx');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ 简历文档已生成:', outputPath);
}

generateResume().catch(console.error);
