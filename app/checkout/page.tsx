'use client'

import Link from 'next/link'
import { useState } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id))
  }

  const processPayment = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total }),
      })
      if (response.ok) {
        alert('Payment processed successfully')
        setCart([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">Back to Home</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shopping Cart</h2>
              {cart.length === 0 ? (
                <p className="text-gray-600">Cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${(cartTotal * 1.1).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={processPayment}
              disabled={cart.length === 0}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Process Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
