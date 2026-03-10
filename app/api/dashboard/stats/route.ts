import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        totalSales: 0, 
        totalTransactions: 0, 
        totalProducts: 0 
      })
    }

    const client = supabaseAdmin()
    
    // Get total sales
    const { data: transactions } = await client
      .from('transactions')
      .select('total')

    const totalSales = transactions?.reduce((sum: number, t: any) => sum + (t.total || 0), 0) || 0

    // Get transaction count
    const { count: totalTransactions } = await client
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    // Get product count
    const { count: totalProducts } = await client
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
