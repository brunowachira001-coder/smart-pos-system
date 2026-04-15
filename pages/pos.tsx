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

    // Load sample products
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
  const tax = subtotal * 0.16; // 16% VAT
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
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Point of Sale</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Stock: {product.stock}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">KES {product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
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
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shopping Cart</h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="border-b pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-600">KES {item.price} x {item.quantity}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>KES {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (16%):</span>
                      <span>KES {tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">KES {total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment */}
            {cart.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="check">Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Paid
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {amountPaid && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Change:</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {Math.max(0, change).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
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
