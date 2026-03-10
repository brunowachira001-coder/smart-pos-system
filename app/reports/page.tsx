'use client'

import Link from 'next/link'

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Home</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-white mb-4">Daily Sales Report</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Generate Report
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-white mb-4">Monthly Summary</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Generate Report
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-white mb-4">Product Performance</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Generate Report
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-white mb-4">Inventory Report</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
