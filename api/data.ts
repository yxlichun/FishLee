import { put, list, del } from '@vercel/blob';
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
        const { blobs } = await list({ prefix: BLOB_FILENAME });

        if (blobs.length > 0) {
          // Get the most recent blob
          const latestBlob = blobs.sort((a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          )[0];

          const response = await fetch(latestBlob.url);
          if (response.ok) {
            const data = await response.json();
            return res.status(200).json(data);
          }
        }
      } catch (error) {
        console.log('Blob not found or error reading:', error);
      }

      // Return empty data if no blob exists
      return res.status(200).json({
        taskProgress: {},
        checkIns: [],
        notes: [],
        bookmarks: [],
        inspirations: [],
      });
    }

    if (req.method === 'POST') {
      // Delete old blobs first
      try {
        const { blobs } = await list({ prefix: BLOB_FILENAME });
        for (const blob of blobs) {
          await del(blob.url);
        }
      } catch (error) {
        console.log('Error deleting old blobs:', error);
      }

      // Write new data to blob
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
    return res.status(500).json({
      error: 'Internal server error',
      details: (error as Error).message
    });
  }
}
