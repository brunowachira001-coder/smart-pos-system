import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Extract project ID from URL
    const projectId = supabaseUrl.includes('supabase.co') 
      ? supabaseUrl.split('//')[1]?.split('.')[0] 
      : 'INVALID';

    return res.status(200).json({
      supabaseUrl,
      projectId,
      hasAnonKey,
      hasServiceKey,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
