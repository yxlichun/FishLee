检查当前代码的数据持久化是否完整。

逐一核对以下节点，列出遗漏项：

1. `types.ts` 的 `UserData` 接口包含哪些字段
2. `store.ts` 初始 state 是否与 `UserData` 一致
3. `saveData()` 的 POST body 是否包含所有字段
4. `parseUserData()` 是否解析了所有字段
5. `partialize` 是否持久化了所有数据字段 + `_lastUpdated`
6. `exportData()` 是否导出了所有字段
7. `migrate()` 的版本号和迁移逻辑是否正确

输出检查结果和修复建议。
