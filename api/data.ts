import COS from 'cos-nodejs-sdk-v5';
import type { IncomingMessage, ServerResponse } from 'http';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

const Bucket = process.env.COS_BUCKET!;
const Region = process.env.COS_REGION!;
const DATA_KEY = 'ai-pm-data.json';

function setCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getObject(): Promise<string | null> {
  return new Promise((resolve) => {
    cos.getObject({ Bucket, Region, Key: DATA_KEY }, (err, data) => {
      if (err) { resolve(null); return; }
      resolve(data.Body.toString());
    });
  });
}

function putObject(content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      { Bucket, Region, Key: DATA_KEY, Body: content, ContentType: 'application/json' },
      (err) => { err ? reject(err) : resolve(); }
    );
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const body = await getObject();
      if (body) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ taskProgress: {}, checkIns: [], notes: [], bookmarks: [], inspirations: [], plans: [] }));
      }
      return;
    }

    if (req.method === 'POST') {
      const raw = await readBody(req);
      // 验证是合法 JSON
      JSON.parse(raw);
      await putObject(raw);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', details: (error as Error).message }));
  }
}
