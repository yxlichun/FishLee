/**
 * Lighthouse Node.js 服务器
 * - 静态文件服务（前端 dist/）
 * - GET  /api/data    读 COS
 * - POST /api/data    写 COS
 * - POST /api/upload  图片上传 COS
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});
const Bucket = process.env.COS_BUCKET;
const Region = process.env.COS_REGION;
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

// ---------- COS ----------
function cosGet(key) {
  return new Promise((resolve) => {
    cos.getObject({ Bucket, Region, Key: key }, (err, data) => {
      if (err) { resolve(null); return; }
      resolve(data.Body.toString());
    });
  });
}

function cosPut(key, body, contentType) {
  return new Promise((resolve, reject) => {
    cos.putObject({ Bucket, Region, Key: key, Body: body, ContentType: contentType },
      (err) => { err ? reject(err) : resolve(); });
  });
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
    const index = path.join(DIST_DIR, 'index.html');
    const html = fs.readFileSync(index);
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
      const raw = await cosGet(DATA_KEY);
      if (raw) { send(res, 200, raw); }
      else { send(res, 200, { taskProgress: {}, checkIns: [], notes: [], bookmarks: [], inspirations: [], plans: [] }); }
      return;
    }

    // ── POST /api/data ──
    if (method === 'POST' && urlPath === '/api/data') {
      const buf = await readBody(req);
      const str = buf.toString('utf-8');
      JSON.parse(str); // 验证 JSON
      await cosPut(DATA_KEY, str, 'application/json');
      send(res, 200, { success: true });
      return;
    }

    // ── POST /api/upload ──
    if (method === 'POST' && urlPath === '/api/upload') {
      const rawFilename = decodeURIComponent(req.headers['x-filename'] || `image-${Date.now()}.png`);
      const contentType = req.headers['x-content-type'] || 'image/png';
      const buf = await readBody(req);
      const key = `notes-images/${Date.now()}-${rawFilename}`;
      await cosPut(key, buf, contentType);
      const url = `https://${Bucket}.cos.${Region}.myqcloud.com/${key}`;
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
