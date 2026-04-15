import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Inventory() {
  const router = useRouter();
  const [inventory, setInventory] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchInventory();
  }, [router]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/inventory/list');
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === 'low') return item.status === 'LOW_STOCK';
    if (filter === 'critical') return item.stock < (item.reorderPoint || 10);
    return true;
  });

  const lowStockCount = inventory.filter((item) => item.status === 'LOW_STOCK').length;
  const totalValue = inventory.reduce((sum, item) => sum + item.price * item.stock, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
        <p className="text-slate-600 mt-1">Track and manage product stock levels</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Inventory Value</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">KES {totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'low'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          Low Stock
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          Critical
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">No items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">SKU</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Price</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Stock</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900 font-medium">
                      KES {item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900 font-medium">{item.stock}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'LOW_STOCK'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.status === 'LOW_STOCK' ? '⚠️ Low Stock' : '✓ OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
