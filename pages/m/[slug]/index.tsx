import { useState, useEffect, ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  stock_quantity: number;
  category: string;
  image_url?: string;
}

interface ShopSettings {
  business_name: string;
  logo_url?: string;
}

export default function MobileStorefront() {
  const router = useRouter();
  const { slug } = router.query;
  const [products, setProducts] = useState<Product[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    if (slug) {
      fetchShopSettings();
      fetchProducts();
      loadCartCount();
    }
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchShopSettings = async () => {
    try {
      const res = await fetch(`/api/tenant/by-slug/${slug}`);
      const data = await res.json();
      setShopSettings({
        business_name: data.tenant?.name || 'ShopMart',
        logo_url: data.tenant?.logo_url
      });
    } catch (error) {
      console.error('Failed to load shop settings:', error);
      setShopSettings({ business_name: 'ShopMart' });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ecommerce/products/simple?tenantSlug=${slug}&limit=50`);
      const data = await res.json();
      console.log('Products loaded:', data.products?.length || 0);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = () => {
    const cart = localStorage.getItem(`cart_${slug}`);
    if (cart) {
      const items = JSON.parse(cart);
      setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
    }
  };

  const addToCart = (productId: string) => {
    const cart = localStorage.getItem(`cart_${slug}`);
    const items = cart ? JSON.parse(cart) : [];
    const existing = items.find((i: any) => i.product_id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ product_id: productId, quantity: 1 });
    }
    localStorage.setItem(`cart_${slug}`, JSON.stringify(items));
    loadCartCount();
  };

  const categories = [
    { icon: '🪙', name: 'Coins', color: 'bg-yellow-100' },
    { icon: '⚡', name: 'Super Deals', color: 'bg-orange-100' },
    { icon: '🎁', name: 'Prize Land', color: 'bg-pink-100' },
    { icon: '🔥', name: 'Hot Sale', color: 'bg-red-100' },
    { icon: '👕', name: 'Fashion', color: 'bg-purple-100' },
    { icon: '📱', name: 'Electronics', color: 'bg-blue-100' },
  ];

  const miniCards = products.slice(0, 8);
  const superDeals = products.slice(0, 6);
  const brandDeals = products.slice(6, 12);
  const hotTrending = products.slice(12, 24);

  return (
    <>
      <Head>
        <title>{shopSettings?.business_name || 'ShopMart'} - Mobile Shop</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 pb-20">
      {/* Status Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-2 flex items-center justify-between text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {shopSettings?.business_name || 'ShopMart'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span>📍</span>
              <span className="text-gray-600">Deliver to</span>
              <span className="font-medium">Nairobi</span>
              <span className="text-gray-400">▼</span>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="absolute right-1 top-1 bottom-1 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
              🔍
            </button>
          </div>
        </div>
      </header>

      {/* Flash Sale Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-bold text-lg">FLASH SALE</div>
              <div className="text-xs opacity-90">Time-limited offer</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
              <div className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs">Hours</div>
            </div>
            <span className="text-xl">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
              <div className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs">Mins</div>
            </div>
            <span className="text-xl">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
              <div className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Mini Cards */}
      {miniCards.length > 0 && (
        <div className="bg-white px-4 py-3 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {miniCards.map((product) => {
              const discount = Math.floor(Math.random() * 50 + 20);
              return (
                <Link key={product.id} href={`/m/${slug}/product/${product.id}`}>
                  <div className="flex-shrink-0 w-24 cursor-pointer">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        -{discount}%
                      </div>
                    </div>
                    <div className="text-xs font-bold text-orange-600 mt-1">
                      KES{product.retail_price.toLocaleString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Icons */}
      <div className="bg-white px-4 py-4 mt-2">
        <div className="grid grid-cols-6 gap-3">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center cursor-pointer">
              <div className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center text-2xl shadow-sm hover:scale-110 transition`}>
                {cat.icon}
              </div>
              <span className="text-xs mt-1 text-center text-gray-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold mb-2">No Products Available</h2>
          <p className="text-gray-600">Check back soon for new items!</p>
        </div>
      ) : (
        <>
          {/* Super Deals Section */}
          {superDeals.length > 0 && (
            <div className="mt-2 bg-white px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <h2 className="text-lg font-bold">Super Deals</h2>
                </div>
                <span className="text-sm text-orange-500 font-medium">See all →</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {superDeals.map((product) => {
                  const rating = (4 + Math.random()).toFixed(1);
                  return (
                    <Link key={product.id} href={`/m/${slug}/product/${product.id}`}>
                      <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-4xl">📦</span>
                            )}
                          </div>
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                            SALE
                          </div>
                        </div>
                        <div className="p-2">
                          <div className="text-xs line-clamp-2 h-8 mb-1">{product.name}</div>
                          <div className="text-sm font-bold text-orange-600">
                            KES{product.retail_price.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <span className="text-yellow-400">★★★★★</span>
                            <span>{rating}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brand Deals Section */}
          {brandDeals.length > 0 && (
            <div className="mt-2 bg-white px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏷️</span>
                  <h2 className="text-lg font-bold">Brand Deals</h2>
                </div>
                <span className="text-sm text-orange-500 font-medium">See all →</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {brandDeals.map((product) => {
                  const discount = Math.floor(Math.random() * 40 + 30);
                  const sold = Math.floor(Math.random() * 5000);
                  const rating = (4 + Math.random()).toFixed(1);
                  return (
                    <Link key={product.id} href={`/m/${slug}/product/${product.id}`}>
                      <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-5xl">📦</span>
                            )}
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            -{discount}%
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product.id);
                            }}
                            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg"
                          >
                            🛒
                          </button>
                        </div>
                        <div className="p-3">
                          <div className="text-sm line-clamp-2 h-10 mb-2">{product.name}</div>
                          <div className="text-lg font-bold text-orange-600 mb-1">
                            KES{product.retail_price.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-gray-500">
                              <span className="text-yellow-400">★★★★★</span>
                              <span>{rating}</span>
                            </div>
                            <span className="text-gray-400">{sold}+ sold</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hot & Trending Section */}
          {hotTrending.length > 0 && (
            <div className="mt-2 bg-white px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-lg font-bold">Hot & Trending</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {hotTrending.map((product) => {
                  const sold = Math.floor(Math.random() * 10000);
                  const rating = (4 + Math.random()).toFixed(1);
                  return (
                    <Link key={product.id} href={`/m/${slug}/product/${product.id}`}>
                      <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-5xl">📦</span>
                            )}
                          </div>
                          {product.stock_quantity < 10 && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
                              LOW STOCK
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product.id);
                            }}
                            className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2 shadow-lg"
                          >
                            🛒
                          </button>
                        </div>
                        <div className="p-3">
                          <div className="text-sm line-clamp-2 h-10 mb-2">{product.name}</div>
                          <div className="text-lg font-bold text-orange-600 mb-1">
                            KES{product.retail_price.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <div className="flex items-center gap-1 text-gray-500">
                              <span className="text-yellow-400">★★★★★</span>
                              <span>{rating}</span>
                            </div>
                            <span className="text-gray-400">{sold}+ sold</span>
                          </div>
                          <div className="text-xs text-green-600 font-medium">✓ Free shipping</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <Link href={`/m/${slug}`}>
            <div className="flex flex-col items-center py-2 cursor-pointer text-orange-500">
              <span className="text-2xl">🏠</span>
              <span className="text-xs font-medium mt-1">Home</span>
            </div>
          </Link>
          <div className="flex flex-col items-center py-2 cursor-pointer text-gray-600 hover:text-orange-500">
            <span className="text-2xl">📂</span>
            <span className="text-xs font-medium mt-1">Category</span>
          </div>
          <Link href={`/m/${slug}/cart`}>
            <div className="flex flex-col items-center py-2 cursor-pointer text-gray-600 hover:text-orange-500 relative">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-6 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
              <span className="text-xs font-medium mt-1">Cart</span>
            </div>
          </Link>
          <div className="flex flex-col items-center py-2 cursor-pointer text-gray-600 hover:text-orange-500">
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium mt-1">Account</span>
          </div>
        </div>
      </nav>
    </div>
    </>
  );
}

// Disable default layout - render page without MainLayout wrapper
MobileStorefront.getLayout = function getLayout(page: ReactElement) {
  return page;
};
