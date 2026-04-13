import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Orders() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display font-bold text-4xl mb-12">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
            <a href="/shop" className="bg-accent text-black px-6 py-2 rounded-lg font-bold hover:bg-pink-600 transition inline-block">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-bold">{order._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-bold capitalize">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-bold mb-2">Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
