import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function POS() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/list');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  const change = parseFloat(amountPaid) - total || 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    if (!amountPaid || parseFloat(amountPaid) < total) {
      alert('Insufficient payment');
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await axios.post('/api/transactions/create', {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          discount: 0,
        })),
        paymentMethod,
        amountPaid: parseFloat(amountPaid),
        branchId: 1,
        userId: 1,
      });

      if (response.data.success) {
        alert(
          `Transaction completed!\nTransaction ID: ${response.data.data.transactionNumber}\nTotal: KES ${response.data.data.total.toFixed(2)}\nChange: KES ${response.data.data.change.toFixed(2)}`
        );
        setCart([]);
        setAmountPaid('');
        fetchProducts(); // Refresh products to update stock
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Point of Sale</h1>
        <p className="text-slate-600 mt-1">Process customer transactions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:border-emerald-500 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{product.name}</h3>
                      <p className="text-xs text-slate-600">SKU: {product.sku}</p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Stock: {product.stock}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-emerald-600">KES {product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition shadow hover:shadow-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Payment */}
        <div className="space-y-6">
          {/* Cart */}
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
              <p className="text-slate-600 text-center py-8">🛒 Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                          <p className="text-xs text-slate-600">KES {item.price} x {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-900 text-sm"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-slate-900 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-900 text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-900 font-medium">KES {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (16%):</span>
                    <span className="text-slate-900 font-medium">KES {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2">
                    <span className="text-slate-900">Total:</span>
                    <span className="text-emerald-600">KES {total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment */}
          {cart.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Payment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {amountPaid && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                    <p className="text-sm text-slate-600">Change:</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      KES {Math.max(0, change).toFixed(2)}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : 'Complete Transaction'}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
