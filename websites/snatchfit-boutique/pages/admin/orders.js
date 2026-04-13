import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      toast.success('Order updated!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="font-display font-bold text-3xl mb-8">Manage Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-gray-800 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Order ID</p>
                  <p className="font-bold">{order._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="font-bold">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="font-bold mb-2">Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-400">
                      {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
