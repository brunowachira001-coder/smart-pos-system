import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">POS System</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard</h2>
            <p className="text-gray-600">View sales overview and analytics</p>
          </Link>
          
          <Link href="/products" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Products</h2>
            <p className="text-gray-600">Manage inventory and products</p>
          </Link>
          
          <Link href="/transactions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Transactions</h2>
            <p className="text-gray-600">View transaction history</p>
          </Link>
          
          <Link href="/checkout" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Checkout</h2>
            <p className="text-gray-600">Process new sales</p>
          </Link>
          
          <Link href="/reports" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Reports</h2>
            <p className="text-gray-600">Generate sales reports</p>
          </Link>
          
          <Link href="/settings" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Settings</h2>
            <p className="text-gray-600">Configure system settings</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
