#!/bin/bash
# 用法：./deploy.sh <服务器IP>
# 示例：./deploy.sh 43.xxx.xxx.xxx
#
# 前提：
#   1. 已在服务器上执行过 setup 命令（见 README）
#   2. 本机已配置 SSH 免密登录（或准备好输入密码）

set -e

SERVER_IP=$1
if [ -z "$SERVER_IP" ]; then
  echo "用法: ./deploy.sh <服务器IP>"
  exit 1
fi

SSH_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/fishlee"

echo "==> 1. 构建前端..."
cd "$(dirname "$0")/website"
npm run build

echo "==> 2. 同步文件到服务器..."
# 上传前端构建产物
rsync -avz --delete dist/ "${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/dist/"

# 上传服务器代码
rsync -avz ../server/index.js ../server/package.json "${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/"

echo "==> 3. 服务器安装依赖 & 重启服务..."
ssh "${SSH_USER}@${SERVER_IP}" "
  cd ${REMOTE_DIR}
  npm install --production
  pm2 restart fishlee || pm2 start index.js --name fishlee
  pm2 save
"

echo "==> 部署完成！访问 http://${SERVER_IP}:3000"
