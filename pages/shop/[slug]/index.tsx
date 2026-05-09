import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useShopTheme } from '@/hooks/useShopTheme';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  stock_quantity: number;
  category: string;
  image_url?: string;
  description?: string;
}

function seededRandom(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.floor(((h >>> 0) / 0xffffffff) * (max - min + 1)) + min;
}

function ProductCard({ product, slug, primary }: { product: Product; slug: string; primary: string }) {
  const discount = seededRandom(product.id, 20, 85);
  const rating = (3.5 + seededRandom(product.id + 'r', 0, 15) / 10).toFixed(1);
  const sold = seededRandom(product.id + 's', 100, 50000);
  const originalPrice = Math.round(product.retail_price / (1 - discount / 100));
  const savings = Math.round(product.retail_price * seededRandom(product.id + 'sv', 5, 30) / 100);
  const isNew = seededRandom(product.id + 'n', 0, 4) === 0;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
    const existing = cart.find((i: any) => i.product_id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ product_id: product.id, product_name: product.name, product_price: product.retail_price, quantity: 1, image_url: product.image_url });
    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  return (
    <Link href={`/shop/${slug}/product/${product.id}`}>
      <div className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group relative">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-100">📦</div>
          )}
          {isNew && (
            <div className="absolute top-0 left-0 right-0 text-white text-xs text-center py-0.5 font-medium" style={{ backgroundColor: primary }}>
              WELCOME DEAL · Free shipping
            </div>
          )}
          <button
            onClick={addToCart}
            className="absolute bottom-2 right-2 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{ backgroundColor: primary }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
        <div className="p-2">
          <div className="flex gap-1 mb-1">
            <span className="text-xs px-1.5 py-0.5 rounded font-medium text-white" style={{ backgroundColor: primary }}>Sale</span>
          </div>
          <p className="text-xs text-gray-700 line-clamp-2 h-8 mb-1 leading-4">{product.name}</p>
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-base font-bold text-black">KES{product.retail_price.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through">KES{originalPrice.toLocaleString()}</span>
            <span className="text-xs text-red-500 font-medium">-{discount}%</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
            <span className="text-yellow-400">{'★'.repeat(Math.round(parseFloat(rating)))}</span>
            <span>{rating}</span>
            <span>|</span>
            <span>{sold.toLocaleString()}+ sold</span>
          </div>
          <p className="text-xs" style={{ color: primary }}>New shoppers save KES{savings.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Free shipping</p>
        </div>
      </div>
    </Link>
  );
}

function Countdown({ endsIn }: { endsIn: number }) {
  const [secs, setSecs] = useState(endsIn);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return <span className="font-mono font-bold text-red-600">{h}:{m}:{s}</span>;
}

export default function ShopStorefront() {
  const router = useRouter();
  const { slug, q } = router.query;
  const theme = useShopTheme(slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState((q as string) || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
    setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/ecommerce/products/simple?tenantSlug=${slug}&limit=100`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    return () => window.removeEventListener('cart-updated', updateCartCount);
  }, [slug, updateCartCount]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const bundleProducts = filtered.slice(0, 4);
  const superDealProducts = filtered.slice(4, 8);
  const mainProducts = filtered.slice(8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop/${slug}?q=${encodeURIComponent(search)}`, undefined, { shallow: true });
  };

  const p = theme.primary; // shorthand

  return (
    <>
      <Head>
        <title>{theme.name || String(slug)} - Online Store</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 py-3">
              <Link href={`/shop/${slug}`} className="shrink-0">
                {theme.logo_url ? (
                  <img src={theme.logo_url} alt="logo" className="h-9 w-auto object-contain" />
                ) : (
                  <span className="text-2xl font-extrabold tracking-tight" style={{ color: p }}>{theme.name || slug}</span>
                )}
              </Link>

              <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 border-2 rounded-l-md px-4 py-2 text-sm focus:outline-none"
                  style={{ borderColor: p }}
                />
                <button type="submit" className="text-white px-5 py-2 rounded-r-md text-sm font-medium" style={{ backgroundColor: p }}>
                  Search
                </button>
              </form>

              <div className="flex items-center gap-5 shrink-0">
                <Link href={`/shop/${slug}/auth`} className="text-sm text-gray-600 hidden sm:block" style={{ color: undefined }}>
                  Sign in / Register
                </Link>
                <Link href={`/shop/${slug}/cart`} className="relative">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Category nav */}
            <nav className="flex items-center gap-1 py-2 border-t border-gray-100 overflow-x-auto">
              <button className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 whitespace-nowrap shrink-0 text-gray-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                All Categories
              </button>
              <span className="text-gray-300">|</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="text-sm px-3 py-1.5 whitespace-nowrap shrink-0 transition font-medium"
                  style={{ color: activeCategory === cat ? p : '#4b5563' }}
                >
                  {cat === 'All' ? 'SuperDeals' : cat}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section style={{ backgroundColor: `${p}15` }} className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{theme.name || slug}</h1>
              <p className="text-gray-600 mb-4">{theme.tagline || 'Discover amazing deals on quality products'}</p>
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white px-6 py-2.5 rounded font-medium text-sm"
                style={{ backgroundColor: p }}
              >
                Shop now
              </button>
            </div>
            <div className="text-7xl hidden sm:block">🛍️</div>
          </div>
        </section>

        {/* TODAY'S DEALS */}
        {filtered.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Today's deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Bundle deals</h3>
                    <p className="text-xs text-gray-500">3+ from KES {bundleProducts[0] ? Math.round(bundleProducts[0].retail_price * 0.8).toLocaleString() : '—'} each</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {bundleProducts.map(prod => (
                    <Link key={prod.id} href={`/shop/${slug}/product/${prod.id}`}>
                      <div className="aspect-square bg-gray-50 rounded overflow-hidden hover:opacity-80 transition">
                        {prod.image_url ? <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                      </div>
                      <p className="text-xs font-medium mt-1" style={{ color: p }}>KES{prod.retail_price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h3 className="font-bold text-red-600">SuperDeals</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">Ends in: <Countdown endsIn={53046} /></p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {superDealProducts.map(prod => {
                    const disc = seededRandom(prod.id, 40, 85);
                    return (
                      <Link key={prod.id} href={`/shop/${slug}/product/${prod.id}`}>
                        <div className="relative aspect-square bg-gray-50 rounded overflow-hidden hover:opacity-80 transition">
                          {prod.image_url ? <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                          <span className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-0.5 font-bold">-{disc}%</span>
                        </div>
                        <p className="text-xs font-medium mt-1" style={{ color: p }}>KES{prod.retail_price.toLocaleString()}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PRODUCT GRID */}
        <section id="products" className="max-w-7xl mx-auto px-4 pb-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: p }} />
              <p className="mt-4 text-gray-500 text-sm">Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold mb-2">No products found</h3>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="text-sm underline" style={{ color: p }}>Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-gray-200">
              {(mainProducts.length > 0 ? mainProducts : filtered).map(prod => (
                <ProductCard key={prod.id} product={prod} slug={slug as string} primary={p} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Customer service</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Return & Refund Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Shopping with us</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><a href="#" className="hover:text-white">Delivery options</a></li>
                  <li><a href="#" className="hover:text-white">Buyer Protection</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Pay with</h4>
                <div className="flex flex-wrap gap-2">
                  {['VISA', 'Mastercard', 'M-PESA', 'Airtel'].map(m => (
                    <span key={m} className="bg-white text-gray-900 text-xs px-2 py-1 rounded font-medium">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Stay connected</h4>
                <div className="flex gap-3 text-gray-400">
                  {theme.facebook_url && <a href={theme.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">f</a>}
                  {theme.instagram_url && <a href={theme.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">📷</a>}
                  {theme.tiktok_url && <a href={theme.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">♪</a>}
                </div>
                {theme.phone && <p className="text-xs text-gray-400 mt-2">📞 {theme.phone}</p>}
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} {theme.name || slug}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
