import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { getTodayStartInKenyaTime, getTodayEndInKenyaTime } from '../../../lib/timezone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: returns, error } = await supabase
      .from('returns')
      .select('*');

    if (error) throw error;

    const totalReturns = returns?.length || 0;
    const pendingReturns = returns?.filter(r => r.status === 'Pending').length || 0;
    const completedReturns = returns?.filter(r => r.status === 'Completed').length || 0;
    const totalRefundAmount = returns?.reduce((sum, r) => sum + parseFloat(r.refund_amount || 0), 0) || 0;
    const totalReturnValue = returns?.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0;

    // Today's returns in Kenyan timezone
    const todayStart = getTodayStartInKenyaTime();
    const todayEnd = getTodayEndInKenyaTime();
    const todayReturns = returns?.filter(r => {
      const returnDate = new Date(r.return_date);
      return returnDate >= todayStart && returnDate <= todayEnd;
    }) || [];
    const todayReturnCount = todayReturns.length;
    const todayReturnValue = todayReturns.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    return res.status(200).json({
      totalReturns,
      pendingReturns,
      completedReturns,
      totalRefundAmount,
      totalReturnValue,
      todayReturnCount,
      todayReturnValue,
      returns: returns || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
