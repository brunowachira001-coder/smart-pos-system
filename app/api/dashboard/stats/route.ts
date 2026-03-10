import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Get total sales
    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('total')

    const totalSales = transactions?.reduce((sum, t) => sum + (t.total || 0), 0) || 0

    // Get transaction count
    const { count: totalTransactions } = await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    // Get product count
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalTransactions: totalTransactions || 0,
      totalProducts: totalProducts || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ 
      totalSales: 0, 
      totalTransactions: 0, 
      totalProducts: 0 
    })
  }
}
