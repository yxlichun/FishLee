#!/bin/bash
# 用法：./deploy.sh <服务器IP>
# 示例：./deploy.sh 14.103.81.26
#
# 可选环境变量：
#   SSH_KEY=~/Downloads/fishlee.pem  指定私钥文件

set -e

SERVER_IP=$1
if [ -z "$SERVER_IP" ]; then
  echo "用法: ./deploy.sh <服务器IP>"
  exit 1
fi

SSH_USER="root"
REMOTE_DIR="/root/fishlee"
SSH_OPTS="-o StrictHostKeyChecking=no"
[ -n "$SSH_KEY" ] && SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
RSYNC_SSH="ssh $SSH_OPTS"

echo "==> 1. 构建前端..."
cd "$(dirname "$0")/website"
npm run build

echo "==> 2. 同步文件到服务器..."
rsync -avz -e "$RSYNC_SSH" --delete dist/ "${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/dist/"
rsync -avz -e "$RSYNC_SSH" ../server/index.js ../server/package.json "${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/"

echo "==> 3. 服务器安装依赖 & 重启服务..."
ssh $SSH_OPTS "${SSH_USER}@${SERVER_IP}" "
  cd ${REMOTE_DIR}
  npm install --production --cache /tmp/npm-cache
  pm2 restart fishlee || pm2 start index.js --name fishlee
  pm2 save
"

echo "==> 部署完成！访问 http://${SERVER_IP}:3000"
