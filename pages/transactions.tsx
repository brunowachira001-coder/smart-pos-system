import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter, { getDateRange } from '../components/DateRangeFilter';

interface Transaction {
  id: string;
  transaction_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  items_count: number;
  items: any[];
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, filterType, paymentFilter, dateRange, startDate, endDate, currentPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchQuery,
        priceType: filterType,
        paymentMethod: paymentFilter,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/transactions/list?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTransactions(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      completed: 'bg-emerald-500/20 text-emerald-500',
      pending: 'bg-yellow-500/20 text-yellow-500',
      cancelled: 'bg-red-500/20 text-red-500'
    };

    return statusColors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-500';
  };

  const getTypeBadge = (items: any[]) => {
    if (!items || items.length === 0) return 'Retail';
    const hasWholesale = items.some(item => item.price_type === 'wholesale');
    return hasWholesale ? 'Wholesale' : 'Retail';
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const exportTransactions = () => {
    // Simple CSV export
    const headers = ['Transaction ID', 'Customer', 'Date', 'Items', 'Type', 'Status', 'Total'];
    const rows = transactions.map(t => [
      t.transaction_number,
      t.customer_name || 'Walk-in Customer',
      formatDate(t.created_at),
      t.items_count,
      getTypeBadge(t.items),
      t.status,
      `KSH ${t.total.toFixed(2)}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Transactions</h1>
          <p className="text-sm text-[var(--text-secondary)]">View and manage all your sales transactions.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('retail')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filterType === 'retail'
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Retail
              </button>
              <button
                onClick={() => setFilterType('wholesale')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filterType === 'wholesale'
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Wholesale
              </button>
            </div>

            {/* Date Range Filter */}
            <div className="flex-1 flex justify-center">
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                startDate={startDate}
                endDate={endDate}
                onDateChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>

            {/* Export Button */}
            <button
              onClick={exportTransactions}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>

            {/* New Sale Button */}
            <button
              onClick={() => router.push('/pos')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Sale
            </button>
          </div>

          {/* Search and Payment Filter */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions by ID or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                        {transaction.transaction_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                        {transaction.customer_name || 'Walk-in Customer'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                        {transaction.items_count}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                          {getTypeBadge(transaction.items)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
                        KSH {transaction.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewTransactionDetails(transaction)}
                          className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                        >
                          •••
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm text-[var(--text-secondary)]">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Transaction Details</h2>
                <p className="text-sm text-[var(--text-secondary)]">{selectedTransaction.transaction_number}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">Name:</span>
                    <p className="font-medium">{selectedTransaction.customer_name || 'Walk-in Customer'}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Phone:</span>
                    <p className="font-medium">{selectedTransaction.customer_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">Date:</span>
                    <p className="font-medium">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Time:</span>
                    <p className="font-medium">{formatTime(selectedTransaction.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Payment Method:</span>
                    <p className="font-medium capitalize">{selectedTransaction.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Status:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedTransaction.status)}`}>
                      {selectedTransaction.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Items ({selectedTransaction.items_count})</h3>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-[var(--border-color)] last:border-0">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {item.quantity} x KSH {item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">KSH {item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal:</span>
                    <span className="font-medium">KSH {selectedTransaction.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--border-color)]">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-emerald-500">KSH {selectedTransaction.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-6 bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 rounded-lg hover:bg-[var(--bg-secondary)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
