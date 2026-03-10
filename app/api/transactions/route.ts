import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const client = supabaseAdmin()
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = supabaseAdmin()
    
    const { data: transaction, error: txError } = await client
      .from('transactions')
      .insert([{
        total: body.total,
        items_count: body.items?.length || 0,
      }])
      .select()

    if (txError) throw txError

    return NextResponse.json({ 
      success: true, 
      transactionId: transaction?.[0]?.id 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
