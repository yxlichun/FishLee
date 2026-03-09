执行部署前检查并推送代码：

所有命令都在项目根目录（即 git 仓库根目录）下执行。

1. `cd website && npx tsc --noEmit` 类型检查
2. `cd website && npm run build` 生产构建
3. `git add -A && git status` 查看变更
4. 生成中文 commit message 并提交
5. `git push origin main`

如有错误则停止并报告。
