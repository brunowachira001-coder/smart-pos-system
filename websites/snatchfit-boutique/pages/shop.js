import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Shop() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: router.query.category || '',
    minPrice: 0,
    maxPrice: 500,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const res = await axios.get(`/api/products?${params}`);
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['dresses', 'tops', 'bottoms', 'outerwear', 'accessories', 'shoes'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display font-bold text-4xl mb-12">Shop</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4">Filters</h3>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-bold mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="mr-2"
                    />
                    All
                  </label>
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={filters.category === cat}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="mr-2"
                      />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-bold mb-3">Price Range</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Min: ${filters.minPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Max: ${filters.maxPrice}</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Link key={product._id} href={`/product/${product._id}`}>
                    <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
                      <div className="h-64 bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                        <div className="text-6xl">👗</div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            {product.originalPrice && (
                              <span className="text-gray-400 line-through mr-2">${product.originalPrice}</span>
                            )}
                            <span className="font-bold text-lg">${product.price}</span>
                          </div>
                          <span className="text-xs bg-accent text-black px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
