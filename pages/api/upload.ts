import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, filename } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Extract base64 data
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = filename ? path.extname(filename) : '.jpg';
    const newFilename = `product-${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(uploadDir, newFilename);

    // Write file
    fs.writeFileSync(filepath, buffer);

    const url = `/uploads/${newFilename}`;

    return res.status(200).json({ 
      url,
      filename: newFilename,
      size: buffer.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
