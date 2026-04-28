import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all transactions
    const { data: allTransactions, error: allError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get today's transactions with different timezone calculations
    const now = new Date();
    
    // Method 1: Simple today (local midnight)
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
    
    // Method 2: Kenya time (UTC+3)
    const kenyaOffset = 3 * 60; // 180 minutes
    const localOffset = now.getTimezoneOffset();
    const kenyaNow = new Date(now.getTime() + (kenyaOffset + localOffset) * 60000);
    const kenyaTodayStart = new Date(kenyaNow.getFullYear(), kenyaNow.getMonth(), kenyaNow.getDate(), 0, 0, 0, 0);
    const kenyaTodayEnd = new Date(kenyaTodayStart.getTime() + 24 * 60 * 60 * 1000);
    const todayStartUTC = new Date(kenyaTodayStart.getTime() - kenyaOffset * 60000);
    const todayEndUTC = new Date(kenyaTodayEnd.getTime() - kenyaOffset * 60000);

    const { data: todayTxns, error: todayError } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', todayStartUTC.toISOString())
      .lt('created_at', todayEndUTC.toISOString());

    // Get transaction count
    const { count, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      success: true,
      debug: {
        currentTime: now.toISOString(),
        kenyaTime: kenyaNow.toISOString(),
        todayStartUTC: todayStartUTC.toISOString(),
        todayEndUTC: todayEndUTC.toISOString(),
        localTodayStart: todayLocal.toISOString(),
        localTomorrowStart: tomorrowLocal.toISOString()
      },
      totalTransactions: count,
      todayTransactionsCount: todayTxns?.length || 0,
      todayTransactions: todayTxns,
      last10Transactions: allTransactions,
      errors: {
        all: allError?.message,
        today: todayError?.message,
        count: countError?.message
      }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
