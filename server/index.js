/**
 * Lighthouse Node.js 服务器（火山云 TOS 版本）
 * - 静态文件服务（前端 dist/）
 * - GET  /api/data    读 TOS
 * - POST /api/data    写 TOS
 * - POST /api/upload  图片上传 TOS
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { TosClient } = require('@volcengine/tos-sdk');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const tos = new TosClient({
  accessKeyId: process.env.TOS_ACCESS_KEY_ID,
  accessKeySecret: process.env.TOS_SECRET_ACCESS_KEY,
  region: process.env.TOS_REGION,
  endpoint: process.env.TOS_ENDPOINT,
});
const Bucket = process.env.TOS_BUCKET;
const DATA_KEY = 'ai-pm-data.json';

// ---------- MIME ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

// ---------- TOS helpers ----------
async function tosGet(key) {
  try {
    const result = await tos.getObject({ bucket: Bucket, key });
    const chunks = [];
    return new Promise((resolve, reject) => {
      result.data.content.on('data', (c) => chunks.push(c));
      result.data.content.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      result.data.content.on('error', reject);
    });
  } catch (err) {
    // 对象不存在时返回 null
    if (err.code === 'NoSuchKey' || err.statusCode === 404) return null;
    throw err;
  }
}

async function tosPut(key, body, contentType) {
  await tos.putObject({ bucket: Bucket, key, body, contentType });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function send(res, status, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

// ---------- 静态文件 ----------
function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath)) {
    // SPA fallback → index.html
    const html = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}

// ---------- 服务器 ----------
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-content-type');

  const method = req.method.toUpperCase();
  const urlPath = req.url.split('?')[0];

  if (method === 'OPTIONS') { res.writeHead(200).end(); return; }

  try {
    // ── GET /api/data ──
    if (method === 'GET' && urlPath === '/api/data') {
      const raw = await tosGet(DATA_KEY);
      if (raw) { send(res, 200, raw); }
      else { send(res, 200, { taskProgress: {}, checkIns: [], notes: [], bookmarks: [], inspirations: [], plans: [] }); }
      return;
    }

    // ── POST /api/data ──
    if (method === 'POST' && urlPath === '/api/data') {
      const buf = await readBody(req);
      const str = buf.toString('utf-8');
      JSON.parse(str); // 验证 JSON
      await tosPut(DATA_KEY, str, 'application/json');
      send(res, 200, { success: true });
      return;
    }

    // ── POST /api/upload ──
    if (method === 'POST' && urlPath === '/api/upload') {
      const rawFilename = decodeURIComponent(req.headers['x-filename'] || `image-${Date.now()}.png`);
      const contentType = req.headers['x-content-type'] || 'image/png';
      const buf = await readBody(req);
      const key = `notes-images/${Date.now()}-${rawFilename}`;
      await tosPut(key, buf, contentType);
      const url = `https://${Bucket}.tos-${process.env.TOS_REGION}.volces.com/${key}`;
      send(res, 200, { url });
      return;
    }

    // ── 静态文件 ──
    const filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
    serveStatic(res, filePath);

  } catch (err) {
    console.error(err);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
