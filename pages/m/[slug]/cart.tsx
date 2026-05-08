import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

interface CartItem {
  product_id: string;
  quantity: number;
  product?: any;
}

export default function MobileCart() {
  const router = useRouter();
  const { slug } = router.query;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (slug) {
      loadCart();
    }
  }, [slug]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = localStorage.getItem(`cart_${slug}`);
      if (!cart) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const items: CartItem[] = JSON.parse(cart);
      setCartItems(items);
      setSelectedItems(items.map(i => i.product_id));

      // Fetch product details
      const productIds = items.map(i => i.product_id);
      const productPromises = productIds.map(id =>
        axios.get(`/api/ecommerce/products/${id}?tenantSlug=${slug}`)
      );
      const responses = await Promise.all(productPromises);
      setProducts(responses.map(r => r.data));
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedItems = cartItems.map(item =>
      item.product_id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem(`cart_${slug}`, JSON.stringify(updatedItems));
  };

  const removeItem = (productId: string) => {
    const updatedItems = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updatedItems);
    setSelectedItems(selectedItems.filter(id => id !== productId));
    localStorage.setItem(`cart_${slug}`, JSON.stringify(updatedItems));
  };

  const toggleSelectItem = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(i => i.product_id));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      if (!selectedItems.includes(item.product_id)) return sum;
      const product = products.find(p => p.id === item.product_id);
      return sum + (product?.retail_price || 0) * item.quantity;
    }, 0);
  };

  const selectedCount = selectedItems.length;
  const total = calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => router.back()} className="text-2xl">←</button>
            <h1 className="text-lg font-bold">Shopping Cart</h1>
            <div className="w-8"></div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 text-center mb-6">Add items to get started</p>
          <Link href={`/m/${slug}`}>
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-2xl">←</button>
          <h1 className="text-lg font-bold">Shopping Cart ({cartItems.length})</h1>
          <button className="text-sm text-orange-500 font-medium">Edit</button>
        </div>
      </header>

      {/* Select All */}
      <div className="bg-white px-4 py-3 border-b flex items-center gap-3">
        <button
          onClick={toggleSelectAll}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            selectedItems.length === cartItems.length
              ? 'bg-orange-500 border-orange-500'
              : 'border-gray-300'
          }`}
        >
          {selectedItems.length === cartItems.length && <span className="text-white text-xs">✓</span>}
        </button>
        <span className="font-medium">Select All ({cartItems.length})</span>
      </div>

      {/* Cart Items */}
      <div className="space-y-2 p-2">
        {cartItems.map((item) => {
          const product = products.find(p => p.id === item.product_id);
          if (!product) return null;

          const isSelected = selectedItems.includes(item.product_id);

          return (
            <div key={item.product_id} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex gap-3">
                <button
                  onClick={() => toggleSelectItem(item.product_id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </button>

                <Link href={`/m/${slug}/product/${product.id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
                  <div className="text-xs text-gray-500 mb-2">
                    {product.category || 'General'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-orange-600">
                      KES{product.retail_price.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-7 h-7 rounded border border-orange-500 flex items-center justify-center text-orange-500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-sm text-red-500 font-medium"
                >
                  🗑️ Remove
                </button>
                <div className="text-sm text-gray-600">
                  Subtotal: <span className="font-bold text-gray-900">
                    KES{(product.retail_price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-white mt-2 px-4 py-4">
        <h3 className="font-bold mb-3">Recommended for you</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <div className="p-2">
                <div className="text-xs line-clamp-2 h-8 mb-1">Product {i}</div>
                <div className="text-sm font-bold text-orange-600">
                  KES{Math.floor(Math.random() * 3000 + 500).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedItems.length === cartItems.length
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedItems.length === cartItems.length && <span className="text-white text-xs">✓</span>}
              </button>
              <span className="text-sm">All</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">Total ({selectedCount} items)</div>
              <div className="text-xl font-bold text-orange-600">
                KES{total.toLocaleString()}
              </div>
            </div>
          </div>
          <Link href={`/m/${slug}/checkout`}>
            <button
              disabled={selectedCount === 0}
              className={`w-full py-3 rounded-full font-bold text-white ${
                selectedCount > 0
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Checkout ({selectedCount})
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
