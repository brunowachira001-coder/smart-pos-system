import React, { useState, useEffect } from 'react';

export default function ProductsPro() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', price: '', stock: '', category: 'Electronics' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(50);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setLowStockThreshold(data.low_stock_threshold || 50);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const getProductStatus = (stock) => {
    return stock <= lowStockThreshold ? 'Low Stock' : 'Active';
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.price || !newProduct.stock) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          sku: newProduct.sku,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          category: newProduct.category
        })
      });
      
      if (response.ok) {
        await fetchProducts();
        setNewProduct({ name: '', sku: '', price: '', stock: '', category: 'Electronics' });
        setShowAddModal(false);
        alert('Product added successfully!');
      } else {
        alert('Error adding product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-secondary)]">Loading products...</div></div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Products</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Add Product
          </button>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Stock</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">KES {product.price}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{product.stock} units</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      getProductStatus(product.stock) === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getProductStatus(product.stock)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add New Product</h2>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
                <input 
                  type="text" 
                  placeholder="SKU" 
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
                <input 
                  type="number" 
                  placeholder="Stock" 
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg"
                >
                  <option>Electronics</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)]">Cancel</button>
                <button onClick={handleAddProduct} className="flex-1 px-4 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700">Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
