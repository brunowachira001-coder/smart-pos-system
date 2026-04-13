import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CheckoutSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const { user, token } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id && user && token) {
      createOrder();
    }
  }, [session_id, user, token]);

  const createOrder = async () => {
    try {
      const res = await axios.post(
        '/api/orders',
        {
          shippingAddress: {
            street: 'Address from checkout',
            city: 'City',
            state: 'State',
            zipCode: '12345',
            country: 'Country',
          },
          stripePaymentId: session_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(res.data.data);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Processing your order...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✓</div>
        <h1 className="font-display font-bold text-4xl mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {order && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
            <p className="mb-2">
              <span className="font-bold">Order ID:</span> {order._id}
            </p>
            <p className="mb-2">
              <span className="font-bold">Total:</span> ${order.total.toFixed(2)}
            </p>
            <p>
              <span className="font-bold">Status:</span> {order.status}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/orders" className="block bg-accent text-black py-3 rounded-lg font-bold hover:bg-pink-600 transition">
            View Orders
          </Link>
          <Link href="/shop" className="block border-2 border-gray-300 py-3 rounded-lg font-bold hover:border-accent transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
