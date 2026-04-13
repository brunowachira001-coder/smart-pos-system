import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/products'),
      ]);
      setOrders(ordersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black p-6 flex justify-between items-center">
        <h1 className="font-display font-bold text-2xl">SnatchFit Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-accent text-black px-4 py-2 rounded-lg font-bold hover:bg-pink-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 mb-2">Total Orders</p>
            <p className="font-display font-bold text-3xl">{orders.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 mb-2">Total Products</p>
            <p className="font-display font-bold text-3xl">{products.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 mb-2">Total Revenue</p>
            <p className="font-display font-bold text-3xl">
              ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/admin/products">
            <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition">
              <p className="font-bold text-lg mb-2">📦 Manage Products</p>
              <p className="text-gray-400">Add, edit, or delete products</p>
            </div>
          </Link>
          <Link href="/admin/orders">
            <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition">
              <p className="font-bold text-lg mb-2">📋 Manage Orders</p>
              <p className="text-gray-400">View and update order status</p>
            </div>
          </Link>
          <Link href="/admin/inventory">
            <div className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700 transition">
              <p className="font-bold text-lg mb-2">📊 Inventory</p>
              <p className="text-gray-400">Manage stock levels</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="font-bold text-xl mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">Customer</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-gray-700">
                    <td className="py-2">{order._id.slice(-8)}</td>
                    <td className="py-2">{order.userId}</td>
                    <td className="py-2">${order.total.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        order.status === 'delivered' ? 'bg-green-900 text-green-200' :
                        order.status === 'shipped' ? 'bg-blue-900 text-blue-200' :
                        'bg-yellow-900 text-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
