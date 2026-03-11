'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Products() {
  const [isDark, setIsDark] = useState(true)
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
    <>
      <Header isDark={isDark} onThemeToggle={setIsDark} />
      <div className={isDark ? 'min-h-screen bg-gray-900 p-8' : 'min-h-screen bg-gray-50 p-8'}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Products</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700">
            Add Product
          </button>

          <div className={isDark ? 'bg-gray-800 rounded-lg shadow overflow-hidden' : 'bg-white rounded-lg shadow overflow-hidden'}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-50 border-b border-gray-200'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Name</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Price</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Quantity</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No products found</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className={isDark ? 'border-b border-gray-700 hover:bg-gray-700' : 'border-b border-gray-200 hover:bg-gray-50'}>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>${product.price.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.quantity}</td>
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
    </>
  )
}
