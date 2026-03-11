'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { useState, useEffect } from 'react'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  price: number
}

export default function Inventory() {
  const [isDark, setIsDark] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setItems(data)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseInt(editQuantity) }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditQuantity('')
        await fetchInventory()
        alert('Quantity updated successfully!')
      } else {
        alert('Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      alert('Error updating quantity')
    }
  }

  const getLowStockColor = (quantity: number) => {
    if (quantity <= 5) return 'text-red-400'
    if (quantity <= 10) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <>
      <Header isDark={isDark} onThemeToggle={setIsDark} />
      <div className={isDark ? 'min-h-screen bg-gray-900 p-8' : 'min-h-screen bg-gray-50 p-8'}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Inventory Management</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
          </div>

          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Stock Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Items</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{items.length}</p>
              </div>
              <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Stock Value</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  KES {items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Low Stock Items</p>
                <p className="text-2xl font-bold text-red-400">{items.filter(i => i.quantity <= 5).length}</p>
              </div>
            </div>
          </div>

          <div className={isDark ? 'bg-gray-800 rounded-lg shadow overflow-hidden' : 'bg-white rounded-lg shadow overflow-hidden'}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-700 border-b border-gray-600' : 'bg-gray-50 border-b border-gray-200'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Product Name</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Price</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Quantity</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Stock Value</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No inventory items found</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className={isDark ? 'border-b border-gray-700 hover:bg-gray-700' : 'border-b border-gray-200 hover:bg-gray-50'}>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>KES {item.price.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${getLowStockColor(item.quantity)}`}>{item.quantity}</td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>KES {(item.quantity * item.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.quantity <= 5 ? 'bg-red-100 text-red-800' :
                          item.quantity <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.quantity <= 5 ? 'Low Stock' : item.quantity <= 10 ? 'Medium' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === item.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className={`w-16 px-2 py-1 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.id)}
                              className="text-green-400 hover:text-green-300 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item.id)
                              setEditQuantity(item.quantity.toString())
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                        )}
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
