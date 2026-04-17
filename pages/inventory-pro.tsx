import React, { useState } from 'react';

export default function InventoryPro() {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [inventory] = useState([
    { id: 1, product: 'Wireless Headphones', warehouse: 'Main', quantity: 150, reorderLevel: 50, status: 'Optimal' },
    { id: 2, product: 'USB-C Cable', warehouse: 'Main', quantity: 500, reorderLevel: 100, status: 'Optimal' },
    { id: 3, product: 'Phone Case', warehouse: 'Branch A', quantity: 45, reorderLevel: 100, status: 'Low' },
    { id: 4, product: 'Screen Protector', warehouse: 'Main', quantity: 1000, reorderLevel: 200, status: 'Optimal' },
    { id: 5, product: 'Power Bank', warehouse: 'Branch B', quantity: 30, reorderLevel: 100, status: 'Critical' },
  ]);

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Inventory Management</h1>
          <button 
            onClick={() => setShowAdjustModal(true)}
            className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Adjust Stock
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">2,125</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Low Stock Items</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">2</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Critical Items</p>
            <p className="text-3xl font-bold text-red-600 mt-2">1</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Warehouse</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Reorder Level</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{item.product}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.warehouse}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{item.reorderLevel}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Optimal' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAdjustModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Adjust Stock</h2>
              <div className="space-y-3">
                <select className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg">
                  <option>Select Product</option>
                  {inventory.map(item => <option key={item.id}>{item.product}</option>)}
                </select>
                <input type="number" placeholder="Quantity" className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" />
                <select className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg">
                  <option>Add Stock</option>
                  <option>Remove Stock</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAdjustModal(false)} className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)]">Cancel</button>
                <button onClick={() => { alert('Stock adjusted!'); setShowAdjustModal(false); }} className="flex-1 px-4 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700">Adjust</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
