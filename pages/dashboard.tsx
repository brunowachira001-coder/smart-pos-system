import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    transactions: 0,
    inventory: 0,
    customers: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load sample products
    setProducts([
      { id: 1, name: 'Milk (1L)', price: 150, sku: 'PROD001', stock: 100 },
      { id: 2, name: 'Bread (Loaf)', price: 80, sku: 'PROD002', stock: 50 },
      { id: 3, name: 'Eggs (Dozen)', price: 200, sku: 'PROD003', stock: 75 },
      { id: 4, name: 'Rice (2kg)', price: 300, sku: 'PROD004', stock: 120 },
      { id: 5, name: 'Sugar (1kg)', price: 120, sku: 'PROD005', stock: 90 },
    ]);

    // Load stats
    setStats({
      totalSales: 15000,
      transactions: 45,
      inventory: 435,
      customers: 28,
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

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

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    alert(`Transaction completed! Total: KES ${cartTotal.toFixed(2)}`);
    setCart([]);
    setShowCart(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-blue-600">💳 Smart POS</div>
              <span className="text-gray-600">|</span>
              <span className="text-gray-700 font-medium">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                🛒 Cart ({cart.length})
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
              <dd className="mt-2 text-3xl font-extrabold text-green-600">KES {stats.totalSales.toLocaleString()}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Transactions</dt>
              <dd className="mt-2 text-3xl font-extrabold text-blue-600">{stats.transactions}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Inventory Items</dt>
              <dd className="mt-2 text-3xl font-extrabold text-purple-600">{stats.inventory}</dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500">Active Customers</dt>
              <dd className="mt-2 text-3xl font-extrabold text-orange-600">{stats.customers}</dd>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Available Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    <div className="flex justify-between items-center mt-4">
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

          {/* Cart */}
          <div className="bg-white shadow rounded-lg p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">KES {item.price} x {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-green-600">KES {cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
