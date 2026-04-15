import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    retailPrice: '',
    wholesalePrice: '',
    costPrice: '',
    stock: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setProducts([
      { id: 1, name: 'Milk (1L)', sku: 'PROD001', category: 'Dairy', retailPrice: 150, wholesalePrice: 130, costPrice: 100, stock: 100 },
      { id: 2, name: 'Bread (Loaf)', sku: 'PROD002', category: 'Bakery', retailPrice: 80, wholesalePrice: 70, costPrice: 50, stock: 50 },
      { id: 3, name: 'Eggs (Dozen)', sku: 'PROD003', category: 'Dairy', retailPrice: 200, wholesalePrice: 180, costPrice: 140, stock: 75 },
    ]);
  }, [router]);

  const handleAddProduct = () => {
    if (!formData.name || !formData.sku) {
      alert('Please fill in all required fields');
      return;
    }

    const newProduct = {
      id: products.length + 1,
      ...formData,
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      costPrice: parseFloat(formData.costPrice),
      stock: parseInt(formData.stock),
    };

    setProducts([...products, newProduct]);
    setFormData({ name: '', sku: '', category: '', retailPrice: '', wholesalePrice: '', costPrice: '', stock: '' });
    setShowForm(false);
    alert('Product added successfully');
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products Management</h1>
          <p className="text-slate-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="SKU *"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Cost Price"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Retail Price"
              value={formData.retailPrice}
              onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Wholesale Price"
              value={formData.wholesalePrice}
              onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddProduct}
            className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            Save Product
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Retail</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Wholesale</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">KES {product.costPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">KES {product.retailPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">KES {product.wholesalePrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
