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
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', price: '', quantity: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        }),
      })

      if (response.ok) {
        setFormData({ name: '', price: '', quantity: '' })
        setShowModal(false)
        await fetchProducts()
        alert('Product added successfully!')
      } else {
        alert('Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header isDark={isDark} onThemeToggle={setIsDark} />
      <div className={isDark ? 'min-h-screen bg-gray-900 p-8' : 'min-h-screen bg-gray-50 p-8'}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Products</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
          >
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
            <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>KES {product.price.toFixed(2)}</td>
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Product</h2>
              
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-3 py-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={`w-full px-3 py-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-500"
                  >
                    {submitting ? 'Adding...' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 py-2 rounded ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
