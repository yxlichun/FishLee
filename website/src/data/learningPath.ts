import { Phase } from '../types';

export const learningPath: Phase[] = [
  {
    id: 1,
    month: 1,
    title: 'AI认知升级与技术全景',
    subtitle: '建立AI全景认知，搭建信息获取体系',
    color: 'bg-blue-500',
    sections: [
      {
        id: '1-1',
        title: 'AI技术全景理解',
        duration: '2周',
        tasks: [
          { id: '1-1-1', text: '制作一张「AI技术全景图」（思维导图形式）' },
          { id: '1-1-2', text: '用非技术语言向朋友解释大模型工作原理' },
          { id: '1-1-3', text: '对比5个主流大模型的特点、定价、适用场景' },
        ],
        resources: [
          { title: '3Blue1Brown - 可视化Transformer', url: 'https://www.youtube.com/watch?v=wjZofJX0v4M', type: 'course' },
          { title: 'The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/', type: 'article' },
          { title: 'State of AI Report', url: 'https://www.stateof.ai/', type: 'article' },
        ],
      },
      {
        id: '1-2',
        title: 'AI行业趋势与生态研究',
        duration: '2周',
        tasks: [
          { id: '1-2-1', text: '订阅至少5个AI信息源，建立每日阅读习惯' },
          { id: '1-2-2', text: '撰写一份「2026 AI行业趋势分析报告」（3000字+）' },
          { id: '1-2-3', text: '绘制主流大模型厂商生态图谱' },
          { id: '1-2-4', text: '列出你最感兴趣的3个AI应用赛道' },
        ],
        resources: [
          { title: 'The Rundown AI', url: 'https://www.therundown.ai/', type: 'newsletter' },
          { title: 'Superhuman AI', url: 'https://www.superhuman.ai/', type: 'newsletter' },
          { title: 'The Batch by DeepLearning.AI', url: 'https://www.deeplearning.ai/the-batch/', type: 'newsletter' },
        ],
      },
    ],
  },
  {
    id: 2,
    month: 2,
    title: '产品经理核心技能',
    subtitle: '系统学习PM方法论，会写PRD和做原型',
    color: 'bg-green-500',
    sections: [
      {
        id: '2-1',
        title: '产品经理方法论体系',
        duration: '2周',
        tasks: [
          { id: '2-1-1', text: '阅读《启示录》并做笔记' },
          { id: '2-1-2', text: '完成3次用户访谈练习' },
          { id: '2-1-3', text: '撰写1份完整的PRD' },
          { id: '2-1-4', text: '用Figma制作一个低保真原型' },
          { id: '2-1-5', text: '用RICE模型为5个需求排优先级' },
        ],
        resources: [
          { title: '《启示录》- Marty Cagan', type: 'book' },
          { title: "Lenny's Newsletter", url: 'https://www.lennysnewsletter.com/', type: 'newsletter' },
          { title: 'Figma', url: 'https://www.figma.com/', type: 'tool' },
        ],
      },
      {
        id: '2-2',
        title: '数据驱动的产品思维',
        duration: '1周',
        tasks: [
          { id: '2-2-1', text: '为一个产品设计北极星指标和AARRR指标体系' },
          { id: '2-2-2', text: '分析某产品的注册转化漏斗，提出3个优化建议' },
        ],
        resources: [
          { title: '《精益数据分析》- Alistair Croll', type: 'book' },
          { title: 'Amplitude Product Analytics Playbook', url: 'https://amplitude.com/blog/product-analytics-playbook', type: 'article' },
        ],
      },
      {
        id: '2-3',
        title: '产品经理日常工具链',
        duration: '1周',
        tasks: [
          { id: '2-3-1', text: '熟悉Figma基础操作' },
          { id: '2-3-2', text: '在Notion中搭建个人产品知识库' },
          { id: '2-3-3', text: '了解Mixpanel/Amplitude的核心功能' },
        ],
        resources: [
          { title: 'Notion', url: 'https://www.notion.so/', type: 'tool' },
          { title: 'Mixpanel', url: 'https://mixpanel.com/', type: 'tool' },
        ],
      },
    ],
  },
  {
    id: 3,
    month: 3,
    title: 'AI产品方法论',
    subtitle: '掌握AI产品设计方法，深度分析经典案例',
    color: 'bg-purple-500',
    sections: [
      {
        id: '3-1',
        title: 'AI产品设计思维',
        duration: '2周',
        tasks: [
          { id: '3-1-1', text: '阅读Google PAIR指南，总结10条AI产品设计原则' },
          { id: '3-1-2', text: '为一个传统产品设计AI增强方案' },
          { id: '3-1-3', text: '设计一个AI功能的降级方案流程图' },
        ],
        resources: [
          { title: 'Google PAIR Guidebook', url: 'https://pair.withgoogle.com/guidebook/', type: 'article' },
          { title: 'Microsoft HAX Toolkit', url: 'https://www.microsoft.com/en-us/haxtoolkit/', type: 'article' },
        ],
      },
      {
        id: '3-2',
        title: 'AI产品案例深度分析',
        duration: '2周',
        tasks: [
          { id: '3-2-1', text: '深度分析3个AI产品案例（每个2000字+）' },
          { id: '3-2-2', text: '制作「AI产品案例库」（Notion数据库）' },
          { id: '3-2-3', text: '撰写一篇"AI产品成功模式总结"文章' },
        ],
        resources: [
          { title: 'ChatGPT', url: 'https://chat.openai.com/', type: 'tool' },
          { title: 'Perplexity', url: 'https://www.perplexity.ai/', type: 'tool' },
          { title: 'Cursor', url: 'https://cursor.sh/', type: 'tool' },
        ],
      },
    ],
  },
  {
    id: 4,
    month: 4,
    title: 'AI提效实践与工具链',
    subtitle: '精通AI提效工具链，设计AI增强工作流',
    color: 'bg-orange-500',
    sections: [
      {
        id: '4-1',
        title: '个人AI提效工具链',
        duration: '2周',
        tasks: [
          { id: '4-1-1', text: '尝试至少8个AI工具，记录使用体验' },
          { id: '4-1-2', text: '设计你个人的「AI增强工作流」' },
          { id: '4-1-3', text: '用AI工具完成一次完整的产品调研' },
          { id: '4-1-4', text: '对比AI辅助 vs 传统方式的效率差异' },
        ],
        resources: [
          { title: 'ChatPRD', url: 'https://www.chatprd.ai/', type: 'tool' },
          { title: 'Claude', url: 'https://claude.ai/', type: 'tool' },
          { title: 'Gamma', url: 'https://gamma.app/', type: 'tool' },
          { title: 'NotebookLM', url: 'https://notebooklm.google.com/', type: 'tool' },
        ],
      },
      {
        id: '4-2',
        title: 'AI开发提效工具生态',
        duration: '1周',
        tasks: [
          { id: '4-2-1', text: '亲自体验Cursor或v0.dev' },
          { id: '4-2-2', text: '用Bolt.new或Lovable构建一个简单原型' },
          { id: '4-2-3', text: '撰写「AI开发工具对项目管理的影响」分析' },
        ],
        resources: [
          { title: 'Cursor', url: 'https://cursor.sh/', type: 'tool' },
          { title: 'v0.dev', url: 'https://v0.dev/', type: 'tool' },
          { title: 'Bolt.new', url: 'https://bolt.new/', type: 'tool' },
        ],
      },
      {
        id: '4-3',
        title: '团队AI提效方案设计',
        duration: '1周',
        tasks: [
          { id: '4-3-1', text: '设计一份「团队AI提效方案」' },
          { id: '4-3-2', text: '计算AI工具的ROI' },
        ],
        resources: [],
      },
    ],
  },
  {
    id: 5,
    month: 5,
    title: '实战项目',
    subtitle: '完成一个完整AI项目，积累实战经验',
    color: 'bg-red-500',
    sections: [
      {
        id: '5-1',
        title: 'Week 1: 发现与定义',
        duration: '1周',
        tasks: [
          { id: '5-1-1', text: '用户调研：访谈5-10个目标用户' },
          { id: '5-1-2', text: '竞品分析：分析3-5个相关产品' },
          { id: '5-1-3', text: '撰写PRD' },
          { id: '5-1-4', text: '定义MVP范围和成功指标' },
        ],
        resources: [],
      },
      {
        id: '5-2',
        title: 'Week 2: 设计与原型',
        duration: '1周',
        tasks: [
          { id: '5-2-1', text: '用Figma/Visily设计交互原型' },
          { id: '5-2-2', text: '技术方案设计' },
          { id: '5-2-3', text: '用户测试原型，收集反馈' },
          { id: '5-2-4', text: '调整方案' },
        ],
        resources: [],
      },
      {
        id: '5-3',
        title: 'Week 3: 构建与测试',
        duration: '1周',
        tasks: [
          { id: '5-3-1', text: '构建MVP' },
          { id: '5-3-2', text: '提示词设计与优化' },
          { id: '5-3-3', text: '内部测试与Bug修复' },
          { id: '5-3-4', text: '邀请10+用户试用' },
        ],
        resources: [],
      },
      {
        id: '5-4',
        title: 'Week 4: 验证与迭代',
        duration: '1周',
        tasks: [
          { id: '5-4-1', text: '收集用户反馈与使用数据' },
          { id: '5-4-2', text: '数据分析' },
          { id: '5-4-3', text: '快速迭代1-2轮' },
          { id: '5-4-4', text: '撰写项目复盘报告' },
        ],
        resources: [],
      },
    ],
  },
  {
    id: 6,
    month: 6,
    title: '作品集与求职',
    subtitle: '打造作品集，准备面试，拿到offer',
    color: 'bg-indigo-500',
    sections: [
      {
        id: '6-1',
        title: '作品集打造',
        duration: '2周',
        tasks: [
          { id: '6-1-1', text: '搭建个人作品集网站' },
          { id: '6-1-2', text: '完善LinkedIn（中英文）' },
          { id: '6-1-3', text: '发布3-5篇产品/AI文章' },
          { id: '6-1-4', text: '整理项目案例' },
        ],
        resources: [
          { title: 'LinkedIn', url: 'https://www.linkedin.com/', type: 'tool' },
          { title: 'Notion Portfolio', url: 'https://www.notion.so/', type: 'tool' },
        ],
      },
      {
        id: '6-2',
        title: '面试准备',
        duration: '2周',
        tasks: [
          { id: '6-2-1', text: '准备20个常见问题的结构化回答' },
          { id: '6-2-2', text: '练习3-5个产品设计题' },
          { id: '6-2-3', text: '准备3个项目故事' },
          { id: '6-2-4', text: '模拟面试3次以上' },
        ],
        resources: [
          { title: 'Exponent PM Interview Prep', url: 'https://www.tryexponent.com/', type: 'course' },
        ],
      },
      {
        id: '6-3',
        title: '求职策略',
        duration: '贯穿第6月',
        tasks: [
          { id: '6-3-1', text: '列出15家目标公司' },
          { id: '6-3-2', text: '建立30+行业人脉' },
          { id: '6-3-3', text: '投递简历并拿到面试机会' },
          { id: '6-3-4', text: '完成面试并争取offer' },
        ],
        resources: [],
      },
    ],
  },
];
