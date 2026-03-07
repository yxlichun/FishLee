# AI产品经理学习路径网站

基于你的6个月AI PM转型计划的学习管理系统。

## 功能特性

- ✅ **学习路径管理**：6个阶段完整学习计划，任务清单管理
- 📊 **数据仪表盘**：学习进度、连续打卡、统计图表
- 📅 **每日打卡**：记录学习内容和时长
- 📝 **Markdown笔记**：支持Markdown格式的学习笔记
- 🔖 **资源收藏**：整理学习资源和工具
- 💾 **数据导入导出**：JSON格式数据备份

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- Zustand (状态管理)
- React Router
- React Markdown
- Recharts (图表)

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 数据存储

- 数据存储在浏览器的 localStorage 中
- 支持导出为 JSON 文件备份
- 支持从 JSON 文件导入数据

## 使用说明

1. **学习路径**：查看6个月的学习计划，勾选完成的任务
2. **每日打卡**：记录每天的学习内容和时长
3. **学习笔记**：用Markdown格式记录学习心得
4. **资源收藏**：保存有用的学习资源链接
5. **数据备份**：定期导出数据到JSON文件

## 项目结构

```
website/
├── src/
│   ├── components/      # React组件
│   ├── data/           # 学习路径数据
│   ├── types.ts        # TypeScript类型定义
│   ├── store.ts        # Zustand状态管理
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 入口文件
├── public/             # 静态资源
└── package.json        # 依赖配置
```

## License

MIT
