import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter from '../components/DateRangeFilter';

interface Product {
  id: string;
  name: string;
  sku: string;
  retail_price: number;
  wholesale_price: number;
  stock_quantity: number;
  image_url?: string;
}

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  price_type: string;
  subtotal: number;
}

export default function POSPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMode, setPriceMode] = useState<'retail' | 'wholesale'>('retail');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchProducts();
    } else {
      fetchProducts();
    }
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/list');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const searchProducts = async () => {
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/pos/cart?sessionId=${sessionId}`);
      const data = await response.json();
      setCart(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product: Product) => {
    setLoading(true);
    try {
      const unitPrice = priceMode === 'retail' ? product.retail_price : product.wholesale_price;
      
      const response = await fetch('/api/pos/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: 1,
          unitPrice,
          priceType: priceMode
        })
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch('/api/pos/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, quantity: newQuantity })
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/pos/cart?id=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`/api/pos/cart?sessionId=${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const paid = parseFloat(amountPaid) || 0;
    if (paid < cartTotal) {
      alert('Amount paid is less than total');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerName: customerName || 'Walk-in Customer',
          customerPhone,
          subtotal: cartTotal,
          discount: 0,
          tax: 0,
          total: cartTotal,
          amountPaid: paid,
          paymentMethod,
          cashierName: 'John Doe'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Transaction completed!\nChange: KSH ${(paid - cartTotal).toFixed(2)}`);
        setShowCheckout(false);
        setCustomerName('');
        setCustomerPhone('');
        setAmountPaid('');
        await fetchCart();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="text"
              placeholder="Search by name, SKU, or description... [retail mode]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={priceMode}
              onChange={(e) => setPriceMode(e.target.value as 'retail' | 'wholesale')}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)]"
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  {/* Stock Badge */}
                  <div className="text-xs text-[var(--text-secondary)] mb-2">
                    {product.stock_quantity} in stock
                  </div>

                  {/* Product Image Placeholder */}
                  <div className="w-full h-32 bg-[var(--bg-primary)] rounded-lg mb-3 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <svg className="w-12 h-12 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">SKU: {product.sku}</p>
                  </div>

                  {/* Prices */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {priceMode === 'retail' ? 'Retail' : 'Wholesale'}:
                      </span>
                      <span className="text-xs text-[var(--text-primary)]">
                        KSH {priceMode === 'retail' ? product.retail_price.toFixed(2) : product.wholesale_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Selected Price */}
                  <div className="text-center py-2 bg-[var(--bg-primary)] rounded">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      KSH {(priceMode === 'retail' ? product.retail_price : product.wholesale_price).toFixed(2)}
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {priceMode === 'retail' ? 'Retail' : 'Wholesale'} Price
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 sticky top-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Cart</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Clear All
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-[var(--text-secondary)] py-8">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="bg-[var(--bg-primary)] rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.product_name}</h4>
                          <p className="text-xs text-[var(--text-secondary)]">{item.sku}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-[var(--bg-tertiary)] rounded flex items-center justify-center hover:bg-[var(--bg-secondary)]"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-[var(--bg-tertiary)] rounded flex items-center justify-center hover:bg-[var(--bg-secondary)]"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold">KSH {item.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Total */}
              <div className="border-t border-[var(--border-color)] pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Items:</span>
                  <span className="text-sm font-medium">{cart.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-emerald-500">KSH {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                  placeholder="Walk-in Customer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                  placeholder="+254..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount Paid *</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="bg-[var(--bg-primary)] rounded-lg p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Total:</span>
                  <span className="text-sm font-semibold">KSH {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Change:</span>
                  <span className="text-sm font-semibold text-emerald-500">
                    KSH {Math.max(0, (parseFloat(amountPaid) || 0) - cartTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 rounded-lg hover:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading || !amountPaid || parseFloat(amountPaid) < cartTotal}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold"
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
