import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  size?: string;
  color?: string;
  products: {
    image_url?: string;
    stock_quantity: number;
  };
}

export default function ShoppingCart() {
  const router = useRouter();
  const { slug } = router.query;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCart();
    }
  }, [slug]);

  const fetchCart = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId') || Math.random().toString(36);
      localStorage.setItem('sessionId', sessionId);

      const res = await axios.get(`/api/ecommerce/cart?sessionId=${sessionId}`);
      setCartId(res.data.cart.id);
      setCartItems(res.data.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await axios.put('/api/ecommerce/cart', {
        itemId,
        quantity: newQuantity
      });
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await axios.delete(`/api/ecommerce/cart?itemId=${itemId}`);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  };

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/shop/${slug}`}>
              <button className="text-gray-600 hover:text-gray-900">
                ← Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href={`/shop/${slug}`}>
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-3xl">📦</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{item.product_name}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        KSh {item.product_price.toLocaleString()} each
                      </p>
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 border border-gray-300 rounded hover:border-emerald-500"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.products.stock_quantity}
                            className="px-3 py-1 border border-gray-300 rounded hover:border-emerald-500 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        KSh {(item.product_price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                <h2 className="font-bold text-xl mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? 'FREE' : `KSh ${shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  {subtotal < 5000 && (
                    <p className="text-xs text-gray-500">
                      Add KSh {(5000 - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}
                </div>

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Total</span>
                  <span className="text-emerald-600">KSh {total.toLocaleString()}</span>
                </div>

                <Link href={`/shop/${slug}/checkout`}>
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
                    Proceed to Checkout
                  </button>
                </Link>

                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <p>✓ Secure checkout</p>
                  <p>✓ Cash on delivery available</p>
                  <p>✓ 7-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
