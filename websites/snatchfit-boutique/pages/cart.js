import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export default function Cart() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { user } = useAuthStore();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  const subtotal = getTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display font-bold text-4xl mb-12">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/shop" className="bg-accent text-black px-6 py-2 rounded-lg font-bold hover:bg-pink-600 transition inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-3xl">👗</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p className="font-bold mt-2">${item.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 border rounded hover:bg-gray-200"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="px-2 py-1 border rounded hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                      <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-6 rounded-lg h-fit">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-accent text-black py-3 rounded-lg font-bold hover:bg-pink-600 transition mb-3"
              >
                Proceed to Checkout
              </button>
              <Link href="/shop" className="block text-center border-2 border-gray-300 py-3 rounded-lg font-bold hover:border-accent transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
