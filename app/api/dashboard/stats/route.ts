import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Replace with actual database queries
  const stats = {
    totalSales: 5250.50,
    totalTransactions: 42,
    totalProducts: 156,
  }

  return NextResponse.json(stats)
}
