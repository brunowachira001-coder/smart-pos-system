import React, { useState } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function POSAdvanced() {
  const [products] = useState([
    { id: '1', name: 'Wireless Headphones', price: 49.99, stock: 150 },
    { id: '2', name: 'USB-C Cable', price: 9.99, stock: 500 },
    { id: '3', name: 'Phone Case', price: 5.00, stock: 300 },
    { id: '4', name: 'Screen Protector', price: 2.00, stock: 1000 },
    { id: '5', name: 'Power Bank', price: 20.00, stock: 200 },
    { id: '6', name: 'Bluetooth Speaker', price: 35.00, stock: 80 },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  // Toast notification
  const { toast, showToast, hideToast } = useToast();

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      ));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }
    showToast('Transaction completed successfully!', 'success');
    setCart([]);
    setShowCheckout(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Point of Sale</h1>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[var(--card-bg)] rounded-lg shadow-md border border-[var(--border-color)] p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => addToCart(product)}
            >
              <div className="text-center">
                <p className="font-semibold text-[var(--text-primary)] truncate">{product.name}</p>
                <p className="text-emerald-600 font-bold text-lg mt-2">KES {product.price}</p>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{product.stock} in stock</p>
                <button className="w-full mt-3 px-4 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm p-6 sticky top-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Shopping Cart</h2>
          {cart.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-center py-8">Cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="border-b border-[var(--border-color)] pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-[var(--text-primary)] text-sm">{item.productName}</p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-600 hover:text-red-700 text-lg"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        className="w-12 text-center border border-[var(--border-color)] rounded"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-emerald-600 font-semibold text-sm">KES {item.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-[var(--border-color)] pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Subtotal:</span>
                  <span className="font-semibold">KES {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Tax (16%):</span>
                  <span className="font-semibold">KES {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold bg-emerald-50 p-3 rounded">
                  <span>Total:</span>
                  <span className="text-emerald-600">KES {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-4 px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    {showCheckout && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Checkout</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

            <div className="bg-[var(--bg-secondary)] p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span className="font-semibold">KES {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-[var(--border-color)] pt-2">
                <span>Total:</span>
                <span className="text-emerald-600">KES {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 px-4 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
