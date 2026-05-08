import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description: string;
  retail_price: number;
  stock_quantity: number;
  category: string;
  image_url?: string;
}

export default function MobileProductDetail() {
  const router = useRouter();
  const { slug, id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedToast, setShowAddedToast] = useState(false);

  useEffect(() => {
    if (id && slug) {
      fetchProduct();
    }
  }, [id, slug]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/ecommerce/products/${id}?tenantSlug=${slug}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Failed to load product:', error);
    }
  };

  const addToCart = () => {
    const cart = localStorage.getItem(`cart_${slug}`);
    const items = cart ? JSON.parse(cart) : [];
    const existing = items.find((i: any) => i.product_id === id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product_id: id, quantity });
    }
    localStorage.setItem(`cart_${slug}`, JSON.stringify(items));
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  const buyNow = () => {
    addToCart();
    router.push(`/m/${slug}/cart`);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const images = product.image_url ? [product.image_url, product.image_url, product.image_url] : [];
  const discount = Math.floor(Math.random() * 40 + 20);
  const originalPrice = Math.floor(product.retail_price * 1.5);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-2xl">←</button>
          <div className="flex items-center gap-4">
            <button className="text-2xl">🔍</button>
            <button className="text-2xl">🛒</button>
            <button className="text-2xl">⋮</button>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          {images.length > 0 ? (
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">📦</span>
          )}
        </div>
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
          -{discount}%
        </div>
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {selectedImage + 1}/{images.length || 1}
        </div>
      </div>

      {/* Image Thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                selectedImage === idx ? 'border-orange-500' : 'border-gray-200'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Price Section */}
      <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold text-orange-600">
            KES{product.retail_price.toLocaleString()}
          </span>
          <span className="text-lg text-gray-400 line-through">
            KES{originalPrice.toLocaleString()}
          </span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
            SAVE {discount}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-yellow-500">★★★★★</span>
          <span className="font-medium">4.{Math.floor(Math.random() * 9)}</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">{Math.floor(Math.random() * 5000)}+ sold</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">{Math.floor(Math.random() * 1000)} reviews</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 border-b">
        <h1 className="text-lg font-bold mb-2">{product.name}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* Shipping Info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚚</span>
            <span className="font-medium">Delivery</span>
          </div>
          <span className="text-sm text-gray-600">Nairobi ▼</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Standard Delivery</span>
            <span className="font-medium text-green-600">FREE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimated Delivery</span>
            <span className="font-medium">3-5 days</span>
          </div>
        </div>
      </div>

      {/* Stock Info */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <span className="font-medium">Stock</span>
          <span className={`text-sm font-medium ${product.stock_quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
            {product.stock_quantity < 10 ? `Only ${product.stock_quantity} left!` : 'In Stock'}
          </span>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <span className="font-medium">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-gray-600"
            >
              −
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center font-bold text-orange-500"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Customer Reviews</h3>
          <Link href={`/m/${slug}/product/${id}/reviews`}>
            <span className="text-sm text-orange-500">See all →</span>
          </Link>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Customer {i}</div>
                  <div className="text-yellow-500 text-xs">★★★★★</div>
                </div>
                <span className="text-xs text-gray-400">2d ago</span>
              </div>
              <p className="text-sm text-gray-600">Great product! Fast delivery and excellent quality. Highly recommended!</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-4 py-4">
        <h3 className="font-bold text-lg mb-3">You may also like</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
                <span className="text-5xl">📦</span>
              </div>
              <div className="p-2">
                <div className="text-sm line-clamp-2 h-10 mb-1">Similar Product {i}</div>
                <div className="text-sm font-bold text-orange-600">
                  KES{Math.floor(Math.random() * 5000 + 1000).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 px-4 py-3">
        <div className="flex gap-3">
          <button
            onClick={addToCart}
            className="flex-1 bg-orange-100 text-orange-600 py-3 rounded-full font-bold hover:bg-orange-200 transition"
          >
            Add to Cart
          </button>
          <button
            onClick={buyNow}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Added to Cart Toast */}
      {showAddedToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          ✓ Added to cart!
        </div>
      )}
    </div>
  );
}
