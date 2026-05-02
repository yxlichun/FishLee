# 部署手册

## 架构

- **服务器**：腾讯云轻量应用服务器（广州），IP：`154.8.161.108`
- **存储**：腾讯云 COS，桶名：`fishlee-1305024384`，地域：`ap-guangzhou`
- **进程管理**：pm2
- **自动部署**：GitHub Actions（push main 分支自动触发）

---

## 日常操作

### SSH 登录服务器
```bash
ssh root@154.8.161.108
# 密码登录
```

### 手动部署（不经过 GitHub Actions）
```bash
cd /Users/lichun/Library/Mobile\ Documents/com~apple~CloudDocs/Documents/code/FishLee
./deploy.sh 154.8.161.108
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

## 环境变量

服务器环境变量保存在 `/root/fishlee/ecosystem.config.js`，包含：
- `COS_SECRET_ID`
- `COS_SECRET_KEY`
- `COS_BUCKET`
- `COS_REGION`
- `ADMIN_PASSWORD`
- `PORT`

**密钥轮换**：去[腾讯云 CAM 控制台](https://console.cloud.tencent.com/cam/capi)生成新密钥后，更新 `ecosystem.config.js` 并重启：
```bash
pm2 restart fishlee
```

---

## 访问地址

- 网站：http://154.8.161.108:3000
- GitHub Actions：仓库 → Actions tab
