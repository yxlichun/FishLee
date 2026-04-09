/**
 * 将 website/dist/ 目录上传到 COS
 * 用法：node upload-to-cos.js
 * 需要环境变量：COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION
 */

const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const Bucket = process.env.COS_BUCKET;
const Region = process.env.COS_REGION;
const DIST_DIR = path.join(__dirname, '../website/dist');

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

// 递归收集所有文件
function collectFiles(dir, base = '') {
  const entries = fs.readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const cosKey = base ? `${base}/${entry}` : entry;
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath, cosKey));
    } else {
      files.push({ fullPath, cosKey });
    }
  }
  return files;
}

async function uploadFile({ fullPath, cosKey }) {
  const ext = path.extname(fullPath);
  const contentType = MIME[ext] || 'application/octet-stream';
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket, Region,
      Key: cosKey,
      Body: fs.createReadStream(fullPath),
      ContentType: contentType,
    }, (err) => {
      if (err) { reject(err); return; }
      console.log(`✓ ${cosKey}`);
      resolve();
    });
  });
}

async function main() {
  const files = collectFiles(DIST_DIR);
  console.log(`上传 ${files.length} 个文件到 ${Bucket}...\n`);
  for (const file of files) {
    await uploadFile(file);
  }
  console.log('\n全部上传完成！');
}

main().catch((err) => {
  console.error('上传失败:', err.message);
  process.exit(1);
});
