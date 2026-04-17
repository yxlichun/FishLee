# CLAUDE.md

## 关于用户（AI 学习背景）

**技术背景**：前端开发工程师出身，后转型为移动端研发工程师，现任某科技公司移动端研发负责人 + 大前端技术委员会主席。具备扎实的工程实践能力和系统架构思维。

**转型目标**：正从技术管理转型为 AI 产品经理 / AI 项目负责人，同时主导公司研效提升项目（通过 AI 应用驱动研发流程变革）。

**AI 问题回答原则**：
- 用工程师视角类比（如把 Transformer 类比为前端的事件处理、把向量数据库类比为 index 结构）
- 跳过基础编程概念，直接聚焦 AI 原理/产品/应用层
- 结合研发效能、AI PM 视角给出实际落地建议，而非纯学术解释
- 可适度涉及代码示例，但优先强调"为什么"而非"怎么写"

---

## 项目概述

安石 —— AI 辅助学习路径管理网站，支持多目标管理。用户可以创建多个学习/生活目标（Goal），每个目标下独立管理学习路径、进度追踪、每日打卡、学习计划、Markdown 笔记（支持图片上传）、资源收藏、灵感记录。

## 开发命令

所有命令在 `website/` 目录下执行：

```bash
npm run dev        # Vite 开发服务器 http://localhost:5173
npm run build      # tsc + Vite 生产构建
npx tsc --noEmit   # 仅类型检查（无测试）
```

> npm 缓存权限问题：安装依赖用 `npm install --cache /tmp/npm-cache`

## 技术栈

- **前端**: React 19 + TypeScript + Vite 6 + Tailwind CSS 3 + Zustand 5
- **路由**: React Router 7，`/goals` 为落地页，`/goals/:goalId` 下 Layout 组件包裹所有子页面
- **后端**: Node.js 原生 HTTP 服务器（`server/index.js`），pm2 进程管理
- **存储**: 火山云 TOS 对象存储（`@volcengine/tos-sdk`），桶名 `fishlee`
- **部署**: 火山云轻量服务器（上海），GitHub Actions 自动部署
- **Markdown**: react-markdown + remark-gfm + react-syntax-highlighter
- **图表**: recharts（仅 Dashboard）
- **图标**: lucide-react
- **UI 语言**: 中文 (zh-CN)

## 项目结构

```
FishLee/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署流水线
├── api/                        # Vercel Serverless Functions（已弃用）
│   ├── data.ts                 # 旧版数据读写 API（Vercel Blob）
│   └── upload.ts               # 旧版图片上传 API
├── scf/                        # 腾讯云 SCF 云函数（已弃用）
│   ├── index.ts                # 云函数入口
│   ├── upload-to-cos.js        # COS 对象存储上传脚本
│   ├── package.json            # SCF 依赖
│   └── tsconfig.json           # SCF TypeScript 配置
├── server/                     # 生产环境 Node.js 服务器（当前使用）
│   ├── index.js                # HTTP 服务器：静态文件 + API 代理（火山云 TOS）
│   └── package.json            # server 依赖（@volcengine/tos-sdk）
├── leadership/                 # 产品规划与学习文档
│   ├── AI产品经理学习路径.md      # 学习路径 v1 规划
│   ├── AI产品经理学习路径_v2.md   # 学习路径 v2 规划
│   ├── AboutMe.md              # 个人介绍
│   ├── 分享&课程规划.md          # 课程分享计划
│   ├── 学习路径产品升级建议.md    # 产品升级路线图（当前执行中）
│   ├── 晋升专家_课程与分享规划.md # 晋升课程规划
│   ├── 晋升专家_项目准备.md      # 晋升项目材料
│   └── 课程一_当实现变得廉价.md   # 课程内容稿
├── vercel.json                 # Vercel 部署配置（已弃用）
├── serverless.yml              # 腾讯云 Serverless 配置（已弃用）
├── deploy.sh                   # 手动部署脚本（rsync + pm2 restart）
├── package.json                # 根目录 package.json
├── CLAUDE.md                   # Claude Code 项目上下文
├── DEPLOY.md                   # 部署手册
└── website/                    # 前端主项目（React + Vite）
    ├── index.html              # Vite 入口 HTML
    ├── package.json            # 前端依赖（React, Zustand, Tailwind 等）
    ├── vite.config.ts          # Vite 构建配置（分包策略、代理等）
    ├── tsconfig.json           # TypeScript 配置（严格模式）
    ├── tailwind.config.js      # Tailwind CSS 配置（brand 色系）
    ├── postcss.config.js       # PostCSS 配置
    ├── .env.production         # 生产环境变量（API 地址）
    ├── start.sh                # 本地启动脚本
    └── src/
        ├── main.tsx            # 应用入口，挂载 React
        ├── App.tsx             # 路由定义（/goals 嵌套路由，lazy 加载）
        ├── types.ts            # 所有数据类型定义（Goal, UserData 等）
        ├── store.ts            # Zustand store（状态管理 + 双层持久化 + Goal 选择器 hook）
        ├── index.css           # Tailwind 基础 + 自定义组件类
        ├── vite-env.d.ts       # Vite 类型声明
        ├── data/
        │   └── learningPath.ts # 静态学习路径数据（内置 AI PM 路径模板）
        └── components/
            ├── Layout.tsx           # 侧边栏导航 + 移动端菜单 + Goal 同步 + 路由出口
            ├── Goals.tsx            # 目标列表落地页（/goals）
            ├── Dashboard.tsx        # 仪表盘（进度统计、热力图、阶段图表）
            ├── LearningPath.tsx     # 学习路径展示（阶段→章节→任务树）
            ├── CheckIn.tsx          # 每日打卡（记录学习内容和时长）
            ├── Plans.tsx            # 学习计划（每日待办，支持完成状态）
            ├── Notes.tsx            # 学习笔记（Markdown 编辑器，支持图片上传）
            ├── Resources.tsx        # 资源收藏（书签管理，分类浏览）
            ├── Inspirations.tsx     # 灵感记录（便签卡片，多色标签）
            └── MarkdownRenderer.tsx # Markdown 渲染（代码高亮、GFM 支持）
```

## 数据持久化架构（⚠️ 最易出错，务必仔细遵守）

### 双层存储

| 层 | 技术 | 用途 |
|---|------|------|
| 远程 | 火山云 TOS（`@volcengine/tos-sdk`） | 生产环境持久化，数据文件 `ai-pm-data.json` |
| 本地 | Zustand `persist` → localStorage | 生产环境缓存 + 本地开发（API 禁用时）|

### 环境控制（⚠️ 关键）

存储行为由 **`VITE_API_ENABLED`** 环境变量控制，**不再使用 `import.meta.env.DEV`**：

| 文件 | `VITE_API_ENABLED` | 说明 |
|------|--------------------|------|
| `.env.production` | `true` | 生产构建，始终走 API |
| `.env.development` | `false`（默认） | 纯前端开发，只用 localStorage |
| `.env.development`（手动改） | `true` + 配 `VITE_API_BASE=http://localhost:3000` | 联调远程存储时启用 |

**绝不能用 `isDevelopment` / `import.meta.env.DEV` 来区分存储行为**，否则开发和生产会产生不可复现的数据 gap。

### 认证架构（⚠️ 关键）

- **`POST /api/login`（服务端）**：密码校验在服务端，返回脱敏用户对象（不含 `password` 字段）
- **`GET /api/data`（服务端）**：返回数据时自动抹掉 `users[].password`，密码永远不出现在前端网络响应里
- **`devFallbackUser`（前端）**：仅在 `API_ENABLED=false` 的纯本地开发模式下作登录 fallback，生产环境不生效
- **禁止**在前端 store 里做密码明文比对（`API_ENABLED=true` 时完全走服务端 `/api/login`）

### 核心机制

- `loadData()` 从 TOS 拉取数据，对比 `_lastUpdated` 时间戳，**只在服务端数据更新时才覆盖本地**
- `loadData()` 更新 `activeGoalId` 时，若当前 id 在新拉取的 goals 里存在则保留（避免覆盖用户正在操作的目标）；否则使用服务端值（新浏览器首次登录）
- `saveData()` 写入 TOS，同时通过 `persist` 自动同步 localStorage
- API 失败时静默降级，保留 localStorage 数据，不阻塞页面渲染

### ⚠️ 新增数据字段检查清单

**数据架构**: 所有业务数据嵌套在 `Goal` 实体内部。`UserData = { goals: Goal[]; activeGoalId: string | null }`。每个 Goal 包含独立的 taskProgress、checkIns、notes、bookmarks、inspirations、plans、learningPaths、activePathId。

**新增 Goal 级字段时必须在以下 7 个位置全部添加，缺一不可：**

1. `types.ts` — `Goal` 接口
2. `store.ts` — `makeDefaultGoal()` 返回值
3. `store.ts` — `saveData()` 的 `JSON.stringify` body
4. `store.ts` — `parseGoal()` 函数（补齐缺失字段）
5. `store.ts` — `partialize` 配置（控制 localStorage 持久化哪些字段）
6. `store.ts` — `exportData()` 的导出对象
7. `store.ts` — `migrate()` 函数（为旧版本 localStorage 补充新字段默认值，并升级 `STORAGE_VERSION`）

遗漏任一位置都会导致数据丢失。`parseGoal()` 已统一处理字段缺失，新增字段加一行 `newField: raw.newField || defaultValue` 即可。

### API 端点

API 由 `server/index.js` 提供，运行在火山云轻量服务器上（pm2 管理）：

- `POST /api/login` — 服务端校验用户名密码，返回脱敏用户对象（无 `password`）
- `GET /api/data` — 从 TOS 读取全量 JSON（`ai-pm-data.json`），返回前自动抹掉 `users[].password`
- `POST /api/data` — 全量覆写 TOS 中的 JSON（含带密码的 users，服务端存储）
- `POST /api/upload` — 图片上传到 TOS `notes-images/` 目录，返回 `{ url }`

### 部署

- **生产服务器**：火山云轻量服务器（上海），pm2 进程管理
- **自动部署**：push main 分支 → GitHub Actions → 构建前端 → SCP 上传 → pm2 restart
- **手动部署**：`SSH_KEY=~/Downloads/fishlee.pem ./deploy.sh 14.103.81.26`
- **服务器环境变量**：保存在 `/root/fishlee/ecosystem.config.js`（TOS 密钥等）

## 数据类型

```typescript
Goal      { id, title, description, icon?, color?, createdAt, updatedAt,
            taskProgress, checkIns[], notes[], bookmarks[], inspirations[],
            plans[], learningPaths[], activePathId }
UserData  { goals: Goal[], activeGoalId }
Plan      { id, date(YYYY-MM-DD), content, completed, createdAt }
CheckIn   { id, timestamp(ISO), content, duration, phaseId, planSnapshot? }
Note      { id, title, content, phaseId?, tags[], createdAt, updatedAt }
Bookmark  { id, title, url, category, note?, addedAt }
Inspiration { id, content, color, tags[], createdAt }
```

- ID 生成规则：`{前缀}-${Date.now()}`，前缀如 `goal-`、`pl-`、`ci-`、`n-`、`bm-`、`ins-`
- CheckIn 旧数据可能只有 `date` 字段，`migrateCheckIns()` 自动转为 `timestamp`
- 组件通过 `useGoalData(g => g.checkIns)` 选择器获取当前目标的数据，通过 `useStore()` 获取 action
- `STORAGE_VERSION = 6`，v5→v6 迁移引入用户管理（`users`、`allUserData`、`currentUser`）

## 样式约定

- 自定义组件类（`index.css`）：`.card`、`.btn-primary`、`.btn-secondary`、`.sidebar-link`
- 自定义颜色：`brand-50` ~ `brand-900`（蓝色调）
- 页面容器统一：`p-8 max-w-4xl mx-auto`（Notes 用 `max-w-7xl`，Dashboard 用 `max-w-7xl`）
- 页头统一：`text-3xl font-bold` + `text-gray-500 mt-2` 副标题
- TypeScript 严格模式，`noUnusedLocals` + `noUnusedParameters` 开启
