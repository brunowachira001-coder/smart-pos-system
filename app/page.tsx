'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { useState } from 'react'

export default function Home() {
  const [isDark, setIsDark] = useState(true)

  return (
    <>
      <Header isDark={isDark} onThemeToggle={setIsDark} />
      <main className={isDark ? 'min-h-screen bg-gray-900' : 'min-h-screen bg-gray-50'}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>View sales overview and analytics</p>
            </Link>
            
            <Link href="/products" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Products</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage inventory and products</p>
            </Link>
            
            <Link href="/transactions" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Transactions</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>View transaction history</p>
            </Link>
            
            <Link href="/checkout" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Checkout</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Process new sales</p>
            </Link>
            
            <Link href="/inventory" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Inventory</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage stock levels</p>
            </Link>
            
            <Link href="/reports" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Generate sales reports</p>
            </Link>
            
            <Link href="/settings" className={`p-6 rounded-lg shadow hover:shadow-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Configure system settings</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
