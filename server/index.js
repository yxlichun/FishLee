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
const zlib = require('zlib');
const { TosClient } = require('@volcengine/tos-sdk');

const https = require('https');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// 豆包大模型配置
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const ARK_API_KEY = process.env.ARK_API_KEY || '';

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
    return Buffer.from(result.data).toString('utf-8');
  } catch (err) {
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

// 可 gzip 压缩的文本类型
const COMPRESSIBLE_EXTS = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt', '.woff', '.woff2']);

// ---------- 静态文件 ----------
function serveStatic(req, res, filePath) {
  const isIndexHtml = path.basename(filePath) === 'index.html';

  if (!fs.existsSync(filePath)) {
    // SPA fallback → index.html
    const html = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    };
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.includes('gzip')) {
      const compressed = zlib.gzipSync(html);
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      res.end(compressed);
    } else {
      res.writeHead(200, headers);
      res.end(html);
    }
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);

  const headers = { 'Content-Type': contentType };

  // Cache-Control
  if (isIndexHtml) {
    headers['Cache-Control'] = 'no-cache';
  } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  }

  // gzip 压缩（仅文本类型）
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('gzip') && COMPRESSIBLE_EXTS.has(ext)) {
    const compressed = zlib.gzipSync(content);
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    res.end(compressed);
  } else {
    res.writeHead(200, headers);
    res.end(content);
  }
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
      else { send(res, 200, { goals: [], activeGoalId: null }); }
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

    // ── POST /api/ai/summary ──
    if (method === 'POST' && urlPath === '/api/ai/summary') {
      if (!ARK_API_KEY) {
        send(res, 500, { error: 'ARK_API_KEY not configured' });
        return;
      }
      const buf = await readBody(req);
      const { prompt } = JSON.parse(buf.toString('utf-8'));
      if (!prompt) {
        send(res, 400, { error: 'prompt is required' });
        return;
      }

      const arkBody = JSON.stringify({
        model: 'doubao-seed-2-0-lite-260215',
        messages: [
          { role: 'system', content: '你是一个学习助手，帮助用户总结和回顾每日学习情况。请用简洁、鼓励性的语气回复，使用中文。回复控制在 300 字以内。' },
          { role: 'user', content: prompt },
        ],
      });

      const arkUrl = new URL(ARK_API_URL);
      const arkReq = https.request({
        hostname: arkUrl.hostname,
        path: arkUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`,
          'Content-Length': Buffer.byteLength(arkBody),
        },
      }, (arkRes) => {
        let data = '';
        arkRes.on('data', (chunk) => { data += chunk; });
        arkRes.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.choices && result.choices[0]) {
              send(res, 200, { content: result.choices[0].message.content });
            } else if (result.error) {
              send(res, 502, { error: result.error.message || 'AI API error' });
            } else {
              send(res, 502, { error: 'Unexpected AI response', raw: data });
            }
          } catch {
            send(res, 502, { error: 'Failed to parse AI response', raw: data });
          }
        });
      });

      arkReq.on('error', (err) => {
        send(res, 502, { error: `AI API request failed: ${err.message}` });
      });

      arkReq.write(arkBody);
      arkReq.end();
      return;
    }

    // ── 静态文件 ──
    const filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
    serveStatic(req, res, filePath);

  } catch (err) {
    console.error(err);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
