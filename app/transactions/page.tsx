'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Transaction {
  id: string
  date: string
  amount: number
  items: number
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Items</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">No transactions found</td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-white">{transaction.id}</td>
                    <td className="px-6 py-4 text-sm text-white">{transaction.date}</td>
                    <td className="px-6 py-4 text-sm text-white">{transaction.items}</td>
                    <td className="px-6 py-4 text-sm text-white">${transaction.amount.toFixed(2)}</td>
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
