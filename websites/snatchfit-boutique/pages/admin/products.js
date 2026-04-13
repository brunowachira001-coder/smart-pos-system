import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'dresses',
    sizes: [],
    colors: [],
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', {
        ...formData,
        price: Number(formData.price),
        sizes: [
          { size: 'XS', stock: 10 },
          { size: 'S', stock: 10 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 10 },
        ],
        colors: [
          { name: 'Black', hex: '#000000', images: [] },
          { name: 'White', hex: '#FFFFFF', images: [] },
        ],
        images: [],
      });
      toast.success('Product created!');
      setShowForm(false);
      setFormData({ name: '', description: '', price: '', category: 'dresses', sizes: [], colors: [] });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted!');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-3xl">Manage Products</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-accent text-black px-6 py-2 rounded-lg font-bold hover:bg-pink-600 transition"
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-accent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-accent text-white"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-accent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-accent text-white"
                  >
                    <option value="dresses">Dresses</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="accessories">Accessories</option>
                    <option value="shoes">Shoes</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-accent text-black py-2 rounded-lg font-bold hover:bg-pink-600 transition"
              >
                Create Product
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{product.description.slice(0, 50)}...</p>
              <p className="font-bold mb-4">${product.price}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/products/${product._id}`)}
                  className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 bg-red-600 py-2 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
