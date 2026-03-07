import { put, head } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOB_FILENAME = 'ai-pm-data.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Read data from blob
      try {
        const blobUrl = process.env.BLOB_READ_WRITE_TOKEN
          ? `https://${process.env.VERCEL_URL || 'localhost'}/.well-known/vercel/blob/${BLOB_FILENAME}`
          : null;

        if (!blobUrl) {
          // Return empty data if blob not configured yet
          return res.status(200).json({
            taskProgress: {},
            checkIns: [],
            notes: [],
            bookmarks: [],
            inspirations: [],
          });
        }

        const response = await fetch(blobUrl);
        if (response.ok) {
          const data = await response.json();
          return res.status(200).json(data);
        }
      } catch (error) {
        // If blob doesn't exist, return empty data
        console.log('Blob not found, returning empty data');
      }

      return res.status(200).json({
        taskProgress: {},
        checkIns: [],
        notes: [],
        bookmarks: [],
        inspirations: [],
      });
    }

    if (req.method === 'POST') {
      // Write data to blob
      const data = req.body;
      const blob = await put(BLOB_FILENAME, JSON.stringify(data), {
        access: 'public',
        contentType: 'application/json',
      });
      return res.status(200).json({ success: true, url: blob.url });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}
