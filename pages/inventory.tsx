import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';

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
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600 text-sm">Total Items</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalItems}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600 text-sm">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600 text-sm">Critical Stock</p>
            <p className="text-3xl font-bold text-red-600">{stats.criticalStock}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'low' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'critical' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Critical
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Restocked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.reorderLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'good'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'low'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.lastRestocked}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleRestock(item.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
