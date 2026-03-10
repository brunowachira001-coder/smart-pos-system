'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        
        // Check if data is an array, if not set empty array
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700">
          Add Product
        </button>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-white">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-white">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-white">{product.quantity}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-400 hover:text-blue-300 mr-4">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
