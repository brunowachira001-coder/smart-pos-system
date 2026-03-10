'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTransactions: 0,
    totalProducts: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-white">${stats.totalSales.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <p className="text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  )
}
