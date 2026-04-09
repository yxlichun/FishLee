/**
 * 腾讯云 SCF Web 函数入口
 * 监听 TENCENTCLOUD_PORT（默认 9000），由平台代理 HTTP 请求进来
 *
 * 路由：
 *   GET  /api/data    → 读取 COS JSON 数据
 *   POST /api/data    → 写入 COS JSON 数据
 *   POST /api/upload  → 上传图片到 COS
 */

import http from 'http';
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

const Bucket = process.env.COS_BUCKET!;
const Region = process.env.COS_REGION!;
const DATA_KEY = 'ai-pm-data.json';

// ---------- COS helpers ----------

function cosGet(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    cos.getObject({ Bucket, Region, Key: key }, (err, data) => {
      if (err) { resolve(null); return; }
      resolve((data.Body as Buffer).toString());
    });
  });
}

function cosPut(key: string, body: string | Buffer, contentType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      { Bucket, Region, Key: key, Body: body, ContentType: contentType },
      (err) => { err ? reject(err) : resolve(); }
    );
  });
}

function readBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function setCors(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-content-type');
}

function send(res: http.ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body);
}

// ---------- HTTP 服务器 ----------

const server = http.createServer(async (req, res) => {
  setCors(res);

  const method = (req.method || '').toUpperCase();
  const url = req.url || '';
  // 去掉 query string
  const path = url.split('?')[0];

  if (method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  try {
    // ── GET /api/data ──────────────────────────────────
    if (method === 'GET' && path === '/api/data') {
      const raw = await cosGet(DATA_KEY);
      if (raw) {
        send(res, 200, JSON.parse(raw));
      } else {
        send(res, 200, { taskProgress: {}, checkIns: [], notes: [], bookmarks: [], inspirations: [], plans: [] });
      }
      return;
    }

    // ── POST /api/data ─────────────────────────────────
    if (method === 'POST' && path === '/api/data') {
      const buf = await readBody(req);
      const bodyStr = buf.toString('utf-8');
      JSON.parse(bodyStr); // 验证合法 JSON
      await cosPut(DATA_KEY, bodyStr, 'application/json');
      send(res, 200, { success: true });
      return;
    }

    // ── POST /api/upload ───────────────────────────────
    if (method === 'POST' && path === '/api/upload') {
      const rawFilename = (req.headers['x-filename'] as string) || `image-${Date.now()}.png`;
      const filename = decodeURIComponent(rawFilename);
      const contentType = (req.headers['x-content-type'] as string) || 'image/png';
      const buf = await readBody(req);
      const key = `notes-images/${Date.now()}-${filename}`;
      await cosPut(key, buf, contentType);
      const fileUrl = `https://${Bucket}.cos.${Region}.myqcloud.com/${key}`;
      send(res, 200, { url: fileUrl });
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    send(res, 500, { error: 'Internal server error', details: (error as Error).message });
  }
});

const port = parseInt(process.env.TENCENTCLOUD_PORT || '9000', 10);
server.listen(port, () => {
  console.log(`fishlee-api listening on port ${port}`);
});
