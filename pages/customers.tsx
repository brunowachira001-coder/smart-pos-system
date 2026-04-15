import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Customers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    type: 'retail',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setCustomers([
      { id: 1, firstName: 'John', lastName: 'Doe', phone: '+254712345678', email: 'john@example.com', type: 'retail', totalPurchases: 15000, lastPurchase: '2024-04-12' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', phone: '+254723456789', email: 'jane@example.com', type: 'wholesale', totalPurchases: 85000, lastPurchase: '2024-04-11' },
      { id: 3, firstName: 'Bob', lastName: 'Johnson', phone: '+254734567890', email: 'bob@example.com', type: 'retail', totalPurchases: 5000, lastPurchase: '2024-04-10' },
    ]);
  }, [router]);

  const handleAddCustomer = () => {
    if (!formData.firstName || !formData.phone) {
      alert('Please fill in required fields');
      return;
    }

    const newCustomer = {
      id: customers.length + 1,
      ...formData,
      totalPurchases: 0,
      lastPurchase: new Date().toISOString().split('T')[0],
    };

    setCustomers([...customers, newCustomer]);
    setFormData({ firstName: '', lastName: '', phone: '', email: '', type: 'retail' });
    setShowForm(false);
    alert('Customer added successfully');
  };

  const handleDeleteCustomer = (id: number) => {
    if (confirm('Are you sure?')) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const retailCustomers = customers.filter((c) => c.type === 'retail');
  const wholesaleCustomers = customers.filter((c) => c.type === 'wholesale');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-slate-600 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
          <button
            onClick={handleAddCustomer}
            className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            Save Customer
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Retail Customers</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{retailCustomers.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Wholesale Customers</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{wholesaleCustomers.length}</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Total Purchases</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Last Purchase</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {customer.firstName} {customer.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.type === 'retail'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {customer.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  KES {customer.totalPurchases.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.lastPurchase}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button className="text-emerald-600 hover:text-emerald-700 font-medium">View</button>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
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
