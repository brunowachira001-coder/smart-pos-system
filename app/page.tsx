import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to POS System v2</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard" className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition hover:bg-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">View sales overview and analytics</p>
          </Link>
          
          <Link href="/products" className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition hover:bg-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">Products</h2>
            <p className="text-gray-400">Manage inventory and products</p>
          </Link>
          
          <Link href="/transactions" className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition hover:bg-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">Transactions</h2>
            <p className="text-gray-400">View transaction history</p>
          </Link>
          
          <Link href="/checkout" className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition hover:bg-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">Checkout</h2>
            <p className="text-gray-400">Process new sales</p>
          </Link>
          
          <Link href="/reports" className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition hover:bg-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">Reports</h2>
            <p className="text-gray-400">Generate sales reports</p>
          </Link>
          
          <Link href="/settings" className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition hover:bg-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">Settings</h2>
            <p className="text-gray-400">Configure system settings</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
