import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Replace with actual database queries
  const products = [
    { id: '1', name: 'Product A', price: 29.99, quantity: 100 },
    { id: '2', name: 'Product B', price: 49.99, quantity: 50 },
    { id: '3', name: 'Product C', price: 19.99, quantity: 200 },
  ]

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  // TODO: Add product to database
  const body = await request.json()
  
  return NextResponse.json({ success: true, data: body }, { status: 201 })
}
