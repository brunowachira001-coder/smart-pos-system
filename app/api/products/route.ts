import { NextResponse } from 'next/server'

// Temporary in-memory storage for products
let products: any[] = []

export async function GET() {
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Add ID and timestamps
    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      created_at: new Date().toISOString(),
    }
    
    products.push(newProduct)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}
