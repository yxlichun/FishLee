# CLAUDE.md

## 项目概述

AI PM 学习路径管理网站，用于追踪 6 个月 AI 产品经理转型计划。功能包括：学习进度追踪、每日打卡、学习计划、Markdown 笔记（支持图片上传）、资源收藏、灵感记录。

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
- **路由**: React Router 7，Layout 组件包裹所有页面
- **Markdown**: react-markdown + remark-gfm + react-syntax-highlighter
- **图表**: recharts（仅 Dashboard）
- **图标**: lucide-react
- **UI 语言**: 中文 (zh-CN)

## 项目结构

```
FishLee/
├── api/                    # Vercel Serverless Functions
│   ├── data.ts             # 数据读写 API（GET/POST）
│   └── upload.ts           # 图片上传 API
├── vercel.json             # Vercel 部署配置
├── CLAUDE.md
└── website/
    └── src/
        ├── types.ts        # 所有数据类型定义
        ├── store.ts        # Zustand store（唯一数据源）
        ├── App.tsx          # 路由定义
        ├── index.css        # Tailwind + 自定义组件类
        ├── data/
        │   └── learningPath.ts  # 静态学习路径数据
        └── components/
            ├── Layout.tsx         # 侧边栏 + 路由出口
            ├── Dashboard.tsx      # 仪表盘
            ├── LearningPath.tsx   # 学习路径
            ├── CheckIn.tsx        # 每日打卡
            ├── Plans.tsx          # 学习计划
            ├── Notes.tsx          # 学习笔记
            ├── Resources.tsx      # 资源收藏
            ├── Inspirations.tsx   # 灵感记录
            └── MarkdownRenderer.tsx # Markdown 渲染组件
```

## 数据持久化架构（⚠️ 最易出错，务必仔细遵守）

### 双层存储

| 层 | 技术 | 用途 |
|---|------|------|
| 远程 | Vercel Blob（`@vercel/blob`） | 生产环境持久化，支持跨设备 |
| 本地 | Zustand `persist` → localStorage | 开发环境持久化 + 生产环境缓存 |

### 核心机制

- `isDevelopment`（`import.meta.env.DEV`）区分环境
  - **开发**：`saveData()` 只写 localStorage（persist 自动），不调 API
  - **生产**：`saveData()` 先 `set({ _lastUpdated })`，再 POST 到 Blob
- `loadData()` 对比 localStorage 和 Blob 的 `_lastUpdated` 时间戳，取较新的
- API 失败时静默降级，保留 localStorage 数据

### ⚠️ 新增数据字段检查清单

**新增字段时必须在以下 7 个位置全部添加，缺一不可：**

1. `types.ts` — `UserData` 接口
2. `store.ts` — 初始 state 默认值
3. `store.ts` — `saveData()` 的 `JSON.stringify` body
4. `store.ts` — `loadData()` 的 `parseUserData()` 函数
5. `store.ts` — `partialize` 配置（控制 localStorage 持久化哪些字段）
6. `store.ts` — `exportData()` 的导出对象
7. `store.ts` — `migrate()` 函数（为旧版本 localStorage 补充新字段默认值，并升级 `STORAGE_VERSION`）

遗漏任一位置都会导致数据丢失。`parseUserData()` 已统一处理字段缺失，新增字段加一行 `newField: raw.newField || defaultValue` 即可。

### API 端点

- `GET /api/data` — 从 Blob 读取全量 JSON
- `POST /api/data` — 全量覆写 Blob（`addRandomSuffix: false`，pathname 固定为 `ai-pm-data.json`）
- `POST /api/upload` — 图片上传到 Blob `notes-images/` 目录，返回 `{ url }`

## 数据类型

```typescript
Plan      { id, date(YYYY-MM-DD), content, completed, createdAt }
CheckIn   { id, timestamp(ISO), content, duration, phaseId }
Note      { id, title, content, phaseId?, tags[], createdAt, updatedAt }
Bookmark  { id, title, url, category, note?, addedAt }
Inspiration { id, content, color, tags[], createdAt }
```

- ID 生成规则：`{前缀}-${Date.now()}`，前缀如 `pl-`、`ci-`、`n-`、`bm-`、`ins-`
- CheckIn 旧数据可能只有 `date` 字段，`migrateCheckIns()` 自动转为 `timestamp`

## 样式约定

- 自定义组件类（`index.css`）：`.card`、`.btn-primary`、`.btn-secondary`、`.sidebar-link`
- 自定义颜色：`brand-50` ~ `brand-900`（蓝色调）
- 页面容器统一：`p-8 max-w-4xl mx-auto`（Notes 用 `max-w-7xl`，Dashboard 用 `max-w-7xl`）
- 页头统一：`text-3xl font-bold` + `text-gray-500 mt-2` 副标题
- TypeScript 严格模式，`noUnusedLocals` + `noUnusedParameters` 开启
