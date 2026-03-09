新增一个功能模块: $ARGUMENTS

请按照以下步骤执行，确保不遗漏任何持久化节点：

1. 在 `types.ts` 中定义数据接口，并将其加入 `UserData`
2. 在 `store.ts` 中：
   - 初始 state 加默认值
   - 新增 CRUD action 方法
   - `parseUserData()` 加字段解析
   - `saveData()` body 加字段
   - `partialize` 加字段
   - `exportData()` 加字段
   - `migrate()` 加旧版本兼容，升级 `STORAGE_VERSION`
3. 创建页面组件 `components/Xxx.tsx`，样式对齐现有页面
4. 在 `App.tsx` 添加路由
5. 在 `Layout.tsx` 添加侧边栏导航
6. 运行 `npx tsc --noEmit` 确认类型检查通过
7. 提交并推送
