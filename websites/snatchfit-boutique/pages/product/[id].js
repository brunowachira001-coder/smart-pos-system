import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data.data);
      if (res.data.data.sizes?.length > 0) {
        setSelectedSize(res.data.data.sizes[0].size);
      }
      if (res.data.data.colors?.length > 0) {
        setSelectedColor(res.data.data.colors[0].name);
      }
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.images?.[0],
    });

    toast.success('Added to cart!');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg h-96 flex items-center justify-center mb-4">
              <div className="text-6xl">👗</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-20 flex items-center justify-center cursor-pointer hover:bg-gray-300">
                  <div className="text-2xl">👗</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display font-bold text-4xl mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <span className="text-gray-600">({product.reviews?.length || 0} reviews)</span>
            </div>

            <div className="mb-6">
              {product.originalPrice && (
                <span className="text-gray-400 line-through mr-4">${product.originalPrice}</span>
              )}
              <span className="font-display font-bold text-3xl">${product.price}</span>
            </div>

            <p className="text-gray-600 mb-8">{product.description}</p>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Size</h3>
              <div className="flex gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    className={`px-4 py-2 border-2 rounded-lg transition ${
                      selectedSize === size.size
                        ? 'border-accent bg-accent text-black'
                        : 'border-gray-300 hover:border-accent'
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Color</h3>
              <div className="flex gap-3">
                {product.colors?.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color.name ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="font-bold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-accent"
                >
                  −
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-accent"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-accent text-black py-4 rounded-lg font-bold text-lg hover:bg-pink-600 transition mb-4"
            >
              Add to Cart
            </button>

            {/* Wishlist */}
            <button className="w-full border-2 border-gray-300 py-4 rounded-lg font-bold hover:border-accent transition">
              ♡ Add to Wishlist
            </button>

            {/* Info */}
            <div className="mt-12 space-y-4 text-sm text-gray-600">
              <p>✓ Free shipping on orders over $100</p>
              <p>✓ 30-day return policy</p>
              <p>✓ Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
