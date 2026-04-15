import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Customers() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCustomers();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/customers/list');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeCredit = customers.reduce((sum, c) => sum + c.creditUsed, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-600 mt-1">Manage customer information and credit</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Customers</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Total Spent</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">KES {totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Active Credit</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">KES {activeCredit.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">City</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Purchases</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Total Spent</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Credit Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.city || '-'}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900">{customer.totalPurchases}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-emerald-600">
                      KES {customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-orange-600">
                      KES {customer.creditUsed.toLocaleString()}
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
