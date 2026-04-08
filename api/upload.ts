import COS from 'cos-nodejs-sdk-v5';
import type { IncomingMessage, ServerResponse } from 'http';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

const Bucket = process.env.COS_BUCKET!;
const Region = process.env.COS_REGION!;

function setCors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename, x-content-type');
}

function uploadStream(key: string, stream: IncomingMessage, contentType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      { Bucket, Region, Key: key, Body: stream, ContentType: contentType },
      (err, data) => {
        if (err) { reject(err); return; }
        // COS putObject 返回的 Location 不带协议头
        const url = `https://${data.Location}`;
        resolve(url);
      }
    );
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const rawFilename = (req.headers['x-filename'] as string) || `image-${Date.now()}.png`;
    const filename = decodeURIComponent(rawFilename);
    const contentType = (req.headers['x-content-type'] as string) || 'image/png';
    const suffix = Date.now();
    const key = `notes-images/${suffix}-${filename}`;

    const url = await uploadStream(key, req, contentType);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url }));
  } catch (error) {
    console.error('Upload error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Upload failed', details: (error as Error).message }));
  }
}
