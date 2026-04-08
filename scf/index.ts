/**
 * 腾讯云 SCF 函数入口
 *
 * 路由规则（由 API 网关传入 path）：
 *   GET  /api/data    → 读取 COS JSON 数据
 *   POST /api/data    → 写入 COS JSON 数据
 *   POST /api/upload  → 上传图片到 COS
 */

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

// ---------- SCF 事件结构 ----------

interface ScfEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body?: string;              // API 网关透传时 body 已是字符串（可能 base64）
  isBase64Encoded?: boolean;
}

interface ScfResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}

function resp(statusCode: number, data: unknown): ScfResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-filename, x-content-type',
    },
    body: JSON.stringify(data),
    isBase64Encoded: false,
  };
}

// ---------- 主入口 ----------

export const main_handler = async (event: ScfEvent): Promise<ScfResponse> => {
  const method = (event.httpMethod || '').toUpperCase();
  const path = event.path || '';

  // OPTIONS 预检
  if (method === 'OPTIONS') return resp(200, {});

  try {
    // ── GET /api/data ──────────────────────────────────
    if (method === 'GET' && path.startsWith('/api/data')) {
      const raw = await cosGet(DATA_KEY);
      if (raw) return resp(200, JSON.parse(raw));
      return resp(200, { taskProgress: {}, checkIns: [], notes: [], bookmarks: [], inspirations: [], plans: [] });
    }

    // ── POST /api/data ─────────────────────────────────
    if (method === 'POST' && path.startsWith('/api/data')) {
      const bodyStr = event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64').toString('utf-8')
        : (event.body || '{}');
      // 验证合法 JSON
      JSON.parse(bodyStr);
      await cosPut(DATA_KEY, bodyStr, 'application/json');
      return resp(200, { success: true });
    }

    // ── POST /api/upload ───────────────────────────────
    if (method === 'POST' && path.startsWith('/api/upload')) {
      const headers = event.headers || {};
      const rawFilename = headers['x-filename'] || `image-${Date.now()}.png`;
      const filename = decodeURIComponent(rawFilename);
      const contentType = headers['x-content-type'] || 'image/png';

      const bodyBuf = event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64')
        : Buffer.from(event.body || '', 'binary');

      const key = `notes-images/${Date.now()}-${filename}`;
      await cosPut(key, bodyBuf, contentType);

      // 拼接公开访问 URL（需要存储桶已设置公有读）
      const url = `https://${Bucket}.cos.${Region}.myqcloud.com/${key}`;
      return resp(200, { url });
    }

    return resp(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('SCF Error:', error);
    return resp(500, { error: 'Internal server error', details: (error as Error).message });
  }
};
