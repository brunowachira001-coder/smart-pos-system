import React, { useState, useEffect } from 'react';

export default function CustomersPro() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone
        })
      });
      
      if (response.ok) {
        await fetchCustomers();
        setNewCustomer({ name: '', email: '', phone: '' });
        setShowAddModal(false);
        alert('Customer added successfully!');
      } else {
        alert('Error adding customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-[var(--text-secondary)]">Loading customers...</div></div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Customers</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Add Customer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Total Customers</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">156</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Active Customers</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">142</p>
          </div>
          <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border-color)] shadow-sm">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">KES 45.2K</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Total Spent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">KES {customer.totalSpent}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Add New Customer</h2>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg" 
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)]">Cancel</button>
                <button onClick={handleAddCustomer} className="flex-1 px-4 py-2 bg-emerald-600 text-[var(--text-primary)] rounded-lg hover:bg-emerald-700">Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
