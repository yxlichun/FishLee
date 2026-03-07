import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_KEY = 'ai-pm-learning-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Read data
      const data = await kv.get(DATA_KEY);
      return res.status(200).json(data || {
        taskProgress: {},
        checkIns: [],
        notes: [],
        bookmarks: [],
        inspirations: [],
      });
    }

    if (req.method === 'POST') {
      // Write data
      const data = req.body;
      await kv.set(DATA_KEY, data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
