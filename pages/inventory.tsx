import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Inventory() {
  const router = useRouter();
  const [inventory, setInventory] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setInventory([
      { id: 1, sku: 'PROD001', name: 'Milk (1L)', stock: 100, reorderLevel: 20, reorderQty: 50, lastRestocked: '2024-04-10', status: 'good' },
      { id: 2, sku: 'PROD002', name: 'Bread (Loaf)', stock: 15, reorderLevel: 20, reorderQty: 50, lastRestocked: '2024-04-12', status: 'low' },
      { id: 3, sku: 'PROD003', name: 'Eggs (Dozen)', stock: 75, reorderLevel: 30, reorderQty: 60, lastRestocked: '2024-04-11', status: 'good' },
      { id: 4, sku: 'PROD004', name: 'Rice (2kg)', stock: 5, reorderLevel: 50, reorderQty: 100, lastRestocked: '2024-04-08', status: 'critical' },
      { id: 5, sku: 'PROD005', name: 'Sugar (1kg)', stock: 90, reorderLevel: 30, reorderQty: 60, lastRestocked: '2024-04-09', status: 'good' },
    ]);
  }, [router]);

  const filteredInventory = inventory.filter((item) => {
    if (filter === 'low') return item.stock <= item.reorderLevel;
    if (filter === 'critical') return item.stock < item.reorderLevel / 2;
    return true;
  });

  const handleRestock = (id: number) => {
    const item = inventory.find((i) => i.id === id);
    if (item) {
      alert(`Restocking ${item.name} with ${item.reorderQty} units`);
      setInventory(
        inventory.map((i) =>
          i.id === id ? { ...i, stock: i.stock + i.reorderQty, lastRestocked: new Date().toISOString().split('T')[0] } : i
        )
      );
    }
  };

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter((i) => i.stock <= i.reorderLevel).length,
    criticalStock: inventory.filter((i) => i.stock < i.reorderLevel / 2).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
        <p className="text-slate-600 mt-1">Manage product stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Items</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.totalItems}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Low Stock</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.lowStock}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Critical Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.criticalStock}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            filter === 'low' ? 'bg-yellow-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          Low Stock
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            filter === 'critical' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
          }`}
        >
          Critical
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Reorder Level</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Last Restocked</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredInventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{item.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.reorderLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'good'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'low'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.lastRestocked}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleRestock(item.id)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition"
                  >
                    Restock
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
