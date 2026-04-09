# 部署手册

## 架构

- **服务器**：火山云轻量服务器（上海），IP：`14.103.81.26`
- **存储**：火山云 TOS，桶名：`fishlee`，地域：`cn-guangzhou`
- **进程管理**：pm2
- **自动部署**：GitHub Actions（push main 分支自动触发）

---

## 日常操作

### SSH 登录服务器
```bash
ssh -i ~/Downloads/fishlee.pem root@14.103.81.26
```

### 手动部署（不经过 GitHub Actions）
```bash
cd /Users/sftc/Documents/code/FishLee
SSH_KEY=~/Downloads/fishlee.pem ./deploy.sh 14.103.81.26
```

### 自动部署
```bash
git push  # push main 分支即自动触发
```
GitHub Actions 会自动完成：构建前端 → 上传服务器 → pm2 重启

---

## 服务器常用命令

### 查看服务状态
```bash
pm2 status
```

### 查看日志
```bash
pm2 logs fishlee --lines 50
```

### 重启服务
```bash
pm2 restart fishlee
```

### 查看实时日志
```bash
pm2 logs fishlee
```

---

## 回退

### 回退到迁移前（Vercel 版本）
```bash
git reset --hard f438289
git push --force
```

### 查看历史提交
```bash
git log --oneline
```

---

## 环境变量

服务器环境变量保存在 `/root/fishlee/ecosystem.config.js`，包含：
- `TOS_ACCESS_KEY_ID`
- `TOS_SECRET_ACCESS_KEY`
- `TOS_BUCKET`
- `TOS_REGION`
- `TOS_ENDPOINT`
- `PORT`

**密钥轮换**：去[火山云密钥管理](https://console.volcengine.com/iam/keymanage)生成新密钥后，更新 `ecosystem.config.js` 并重启：
```bash
pm2 restart fishlee
```

---

## 访问地址

- 网站：http://14.103.81.26:3000
- GitHub Actions：仓库 → Actions tab
