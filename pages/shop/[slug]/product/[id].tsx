import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

interface Product {
  id: string;
  name: string;
  description?: string;
  retail_price: number;
  stock_quantity: number;
  category?: string;
  image_url?: string;
  sku?: string;
}

function seededRandom(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.floor(((h >>> 0) / 0xffffffff) * (max - min + 1)) + min;
}

export default function ProductDetail() {
  const router = useRouter();
  const { slug, id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!slug || !id) return;

    // Fetch product
    fetch(`/api/ecommerce/products/${id}?tenantSlug=${slug}`)
      .then(r => r.json())
      .then(d => setProduct(d.product || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));

    // Fetch related
    fetch(`/api/ecommerce/products/simple?tenantSlug=${slug}&limit=12`)
      .then(r => r.json())
      .then(d => setRelatedProducts((d.products || []).filter((p: Product) => p.id !== id).slice(0, 6)))
      .catch(() => {});

    // Cart count
    const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
    setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
  }, [slug, id]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem(`cart_${slug}`) || '[]');
    const existing = cart.find((i: any) => i.product_id === product.id);
    if (existing) existing.quantity += quantity;
    else cart.push({ product_id: product.id, product_name: product.name, product_price: product.retail_price, quantity, image_url: product.image_url });
    localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart();
    router.push(`/shop/${slug}/cart`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="text-5xl">😕</div>
      <p className="text-gray-600">Product not found</p>
      <Link href={`/shop/${slug}`} className="text-orange-600 underline text-sm">Back to shop</Link>
    </div>
  );

  const discount = seededRandom(product.id, 20, 70);
  const originalPrice = Math.round(product.retail_price / (1 - discount / 100));
  const rating = (3.8 + seededRandom(product.id + 'r', 0, 12) / 10).toFixed(1);
  const reviewCount = seededRandom(product.id + 'rc', 50, 5000);
  const sold = seededRandom(product.id + 's', 200, 20000);
  const viewers = seededRandom(product.id + 'v', 5, 80);

  return (
    <>
      <Head><title>{product.name} – {slug}</title></Head>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href={`/shop/${slug}`} className="text-2xl font-extrabold text-orange-600">{slug}</Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <nav className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <Link href={`/shop/${slug}`} className="hover:text-orange-600">Home</Link>
              <span>›</span>
              {product.category && <><span className="hover:text-orange-600 cursor-pointer">{product.category}</span><span>›</span></>}
              <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
            </nav>
            <div className="ml-auto">
              <Link href={`/shop/${slug}/cart`} className="relative">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image */}
              <div>
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border mb-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                {/* Live viewers */}
                <p className="text-xs text-orange-600 mb-2">🔥 {viewers} people are viewing this right now</p>

                <h1 className="text-lg font-semibold text-gray-900 mb-3 leading-snug">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(Math.round(parseFloat(rating)))}</span>
                    <span className="text-sm font-medium text-orange-600">{rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">{reviewCount.toLocaleString()} reviews</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">{sold.toLocaleString()}+ sold</span>
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-black">KES {product.retail_price.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">KES {originalPrice.toLocaleString()}</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">-{discount}%</span>
                  </div>
                  <p className="text-xs text-green-600">✓ Free shipping · Buyer protection</p>
                </div>

                {/* Stock */}
                <div className="mb-4">
                  {product.stock_quantity > 0 ? (
                    <p className="text-sm text-green-600 font-medium">✓ In Stock ({product.stock_quantity} available)</p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">✗ Out of Stock</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-sm">−</button>
                    <span className="px-4 py-2 text-sm font-medium border-x border-gray-300">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} className="px-3 py-2 hover:bg-gray-100 text-sm">+</button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={buyNow}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-bold text-sm transition disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={addToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-3 rounded font-bold text-sm transition disabled:opacity-50"
                  >
                    {added ? '✓ Added!' : 'Add to Cart'}
                  </button>
                </div>

                {/* Trust */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded p-2">
                    <span>🔒</span><span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded p-2">
                    <span>🚚</span><span>Fast delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded p-2">
                    <span>↩️</span><span>7-day returns</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded p-2">
                    <span>💬</span><span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 pt-6 border-t">
                <h2 className="font-bold text-gray-900 mb-3">Product Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">You may also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-gray-200">
                {relatedProducts.map(p => {
                  const disc = seededRandom(p.id, 20, 70);
                  const orig = Math.round(p.retail_price / (1 - disc / 100));
                  return (
                    <Link key={p.id} href={`/shop/${slug}/product/${p.id}`}>
                      <div className="bg-white hover:shadow-md transition cursor-pointer">
                        <div className="aspect-square bg-gray-50 overflow-hidden">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-700 line-clamp-2 h-8 mb-1">{p.name}</p>
                          <p className="text-sm font-bold">KES {p.retail_price.toLocaleString()}</p>
                          <p className="text-xs text-gray-400 line-through">KES {orig.toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
