import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSales: 125400,
    transactions: 342,
    inventory: 1250,
    customers: 156,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

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

    setProducts([
      { id: 1, name: 'Milk (1L)', price: 150, sku: 'PROD001', stock: 100, category: 'Dairy' },
      { id: 2, name: 'Bread (Loaf)', price: 80, sku: 'PROD002', stock: 50, category: 'Bakery' },
      { id: 3, name: 'Eggs (Dozen)', price: 200, sku: 'PROD003', stock: 75, category: 'Dairy' },
      { id: 4, name: 'Rice (2kg)', price: 300, sku: 'PROD004', stock: 120, category: 'Grains' },
      { id: 5, name: 'Sugar (1kg)', price: 120, sku: 'PROD005', stock: 90, category: 'Groceries' },
    ]);
  }, [router]);

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
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-400 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user.firstName}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Total Sales', value: `KES ${stats.totalSales.toLocaleString()}`, icon: '💰', color: 'from-emerald-600 to-emerald-400' },
            { label: 'Transactions', value: stats.transactions, icon: '📊', color: 'from-blue-600 to-blue-400' },
            { label: 'Inventory', value: stats.inventory, icon: '📦', color: 'from-purple-600 to-purple-400' },
            { label: 'Customers', value: stats.customers, icon: '👥', color: 'from-orange-600 to-orange-400' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <span className="text-4xl opacity-20">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Sale</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{product.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">SKU: {product.sku}</p>
                      </div>
                      <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">{product.category}</span>
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

          {/* Cart */}
          <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700 h-fit sticky top-4">
            <h2 className="text-2xl font-bold text-white mb-4">Shopping Cart</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">🛒 Cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
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
                        <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
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

                <div className="border-t border-slate-600 pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-slate-300">Total:</span>
                    <span className="text-2xl font-bold text-emerald-400">KES {cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-600/50 transition"
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
