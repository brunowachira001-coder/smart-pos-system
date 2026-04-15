import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';

export default function POS() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setProducts([
      { id: 1, name: 'Milk (1L)', price: 150, sku: 'PROD001', stock: 100, category: 'Dairy' },
      { id: 2, name: 'Bread (Loaf)', price: 80, sku: 'PROD002', stock: 50, category: 'Bakery' },
      { id: 3, name: 'Eggs (Dozen)', price: 200, sku: 'PROD003', stock: 75, category: 'Dairy' },
      { id: 4, name: 'Rice (2kg)', price: 300, sku: 'PROD004', stock: 120, category: 'Grains' },
      { id: 5, name: 'Sugar (1kg)', price: 120, sku: 'PROD005', stock: 90, category: 'Groceries' },
      { id: 6, name: 'Cooking Oil (1L)', price: 250, sku: 'PROD006', stock: 60, category: 'Oils' },
      { id: 7, name: 'Beans (1kg)', price: 180, sku: 'PROD007', stock: 80, category: 'Grains' },
      { id: 8, name: 'Flour (2kg)', price: 140, sku: 'PROD008', stock: 100, category: 'Grains' },
    ]);
  }, [router]);

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

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    if (!amountPaid || parseFloat(amountPaid) < total) {
      alert('Insufficient payment');
      return;
    }
    alert(`Transaction completed!\nTotal: KES ${total.toFixed(2)}\nChange: KES ${change.toFixed(2)}`);
    setCart([]);
    setAmountPaid('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Point of Sale</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{product.name}</h3>
                        <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                      </div>
                      <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">Stock: {product.stock}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-emerald-400">KES {product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition shadow-lg hover:shadow-emerald-600/50"
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
            <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Shopping Cart</h2>
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-8">🛒 Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-white text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400">KES {item.price} x {item.quantity}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-white text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-600 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal:</span>
                      <span className="text-white">KES {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tax (16%):</span>
                      <span className="text-white">KES {tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-slate-600 pt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-emerald-400">KES {total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment */}
            {cart.length > 0 && (
              <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Payment</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="check">Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {amountPaid && (
                    <div className="bg-emerald-600/20 border border-emerald-600/50 p-3 rounded-lg">
                      <p className="text-sm text-slate-400">Change:</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        KES {Math.max(0, change).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-600/50 transition"
                  >
                    Complete Transaction
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
