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

interface StockAdjustment {
  type: 'add' | 'remove' | 'return'
  quantity: number
  reason: string
}

export default function Inventory() {
  const [isDark, setIsDark] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustment, setAdjustment] = useState<StockAdjustment>({ type: 'add', quantity: 0, reason: '' })

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

  const handleAdjustStock = async () => {
    if (!selectedItem || adjustment.quantity <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    try {
      let newQuantity = selectedItem.quantity

      if (adjustment.type === 'add') {
        newQuantity += adjustment.quantity
      } else if (adjustment.type === 'remove') {
        newQuantity -= adjustment.quantity
        if (newQuantity < 0) {
          alert('Cannot remove more than available stock')
          return
        }
      } else if (adjustment.type === 'return') {
        newQuantity += adjustment.quantity
      }

      const response = await fetch(`/api/products/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        setShowAdjustModal(false)
        setSelectedItem(null)
        setAdjustment({ type: 'add', quantity: 0, reason: '' })
        await fetchInventory()
        alert(`Stock ${adjustment.type === 'add' ? 'added' : adjustment.type === 'remove' ? 'removed' : 'returned'} successfully!`)
      } else {
        alert('Failed to adjust stock')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      alert('Error adjusting stock')
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
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setAdjustment({ type: 'add', quantity: 0, reason: '' })
                            setShowAdjustModal(true)
                          }}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Add Stock
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setAdjustment({ type: 'remove', quantity: 0, reason: '' })
                            setShowAdjustModal(true)
                          }}
                          className="text-orange-400 hover:text-orange-300 text-xs"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setAdjustment({ type: 'return', quantity: 0, reason: '' })
                            setShowAdjustModal(true)
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAdjustModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {adjustment.type === 'add' ? 'Add Stock' : adjustment.type === 'remove' ? 'Remove Stock' : 'Process Return'}
              </h2>
              
              <div className={`mb-4 p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Product: <span className="font-semibold">{selectedItem.name}</span></p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>Current Stock: <span className="font-semibold">{selectedItem.quantity}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustment.quantity}
                    onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reason</label>
                  <input
                    type="text"
                    placeholder={adjustment.type === 'add' ? 'e.g., New purchase' : adjustment.type === 'remove' ? 'e.g., Damaged, Lost' : 'e.g., Customer return, Defective'}
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                    className={`w-full px-3 py-2 border rounded ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    New Stock: <span className="font-semibold">
                      {adjustment.type === 'add' 
                        ? selectedItem.quantity + adjustment.quantity
                        : adjustment.type === 'remove'
                        ? Math.max(0, selectedItem.quantity - adjustment.quantity)
                        : selectedItem.quantity + adjustment.quantity
                      }
                    </span>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAdjustStock}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowAdjustModal(false)
                      setSelectedItem(null)
                      setAdjustment({ type: 'add', quantity: 0, reason: '' })
                    }}
                    className={`flex-1 py-2 rounded ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
