#!/bin/bash

echo "🚀 AI PM Learning Path - 快速启动"
echo ""

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    echo ""
fi

echo "✨ 启动开发服务器..."
echo "📱 浏览器将自动打开 http://localhost:5173"
echo ""
npm run dev
