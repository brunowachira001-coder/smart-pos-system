import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DateRangeFilter, { getDateRange } from '../components/DateRangeFilter';

interface Return {
  id: string;
  return_id: string;
  transaction_id: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  amount: number;
  reason: string;
  status: string;
  return_date: string;
  processed_date: string | null;
}

export default function Returns() {
  const router = useRouter();
  const [returns, setReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; stock: number }>>([]);
  const [createFormData, setCreateFormData] = useState({
    transactionId: '',
    customerName: '',
    reason: '',
  });
  const [returnItems, setReturnItems] = useState<Array<{
    productName: string;
    quantity: number;
    amount: number;
  }>>([{ productName: '', quantity: 1, amount: 0 }]);
  const [createFormErrors, setCreateFormErrors] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [transactionItems, setTransactionItems] = useState<Array<any>>([]);
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [productSearchTerms, setProductSearchTerms] = useState<string[]>(['']);
  const [unitPrices, setUnitPrices] = useState<number[]>([0]);

  const [stats, setStats] = useState({
    totalReturns: 0,
    pendingReturns: 0,
    completedReturns: 0,
    totalReturnValue: 0,
    todayReturnCount: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Convert selected range to actual dates
    const { startDate: start, endDate: end } = getDateRange(dateRange);
    
    if (start && end) {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else {
      // For 'all', clear the date range
      setStartDate('');
      setEndDate('');
    }
  }, [dateRange]);

  useEffect(() => {
    filterReturns();
  }, [returns, searchTerm, statusFilter, startDate, endDate]);

  const fetchData = async () => {
    try {
      const [statsRes, returnsRes, productsRes] = await Promise.all([
        fetch('/api/returns/stats'),
        fetch('/api/returns'),
        fetch('/api/products/list'),
      ]);

      const statsData = await statsRes.json();
      const returnsData = await returnsRes.json();
      const productsData = await productsRes.json();

      setStats({
        totalReturns: statsData.totalReturns || 0,
        pendingReturns: statsData.pendingReturns || 0,
        completedReturns: statsData.completedReturns || 0,
        totalReturnValue: statsData.totalReturnValue || 0,
        todayReturnCount: statsData.todayReturnCount || 0,
      });

      setReturns(returnsData);
      
      // Set available products for the dropdown - API returns { products: [...] }
      const productsList = productsData.products || [];
      console.log('Products fetched:', productsList.length, 'items');
      if (Array.isArray(productsList) && productsList.length > 0) {
        const mappedProducts = productsList.map((p: any) => ({
          id: p.id,
          name: p.name,
          stock: p.stock_quantity || 0,
        }));
        console.log('Mapped products:', mappedProducts);
        setAvailableProducts(mappedProducts);
      } else {
        console.warn('No products found or invalid format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    let filtered = returns;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.return_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filtering
    if (startDate && endDate) {
      filtered = filtered.filter(r => {
        const returnDate = new Date(r.return_date).toISOString().split('T')[0];
        return returnDate >= startDate && returnDate <= endDate;
      });
    }

    setFilteredReturns(filtered);
  };

  const handleProcessReturn = async (returnId: string, status: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          processed_by: 'Admin',
          refund_method: 'Cash',
          refund_amount: selectedReturn?.amount || 0,
        }),
      });

      if (response.ok) {
        setShowProcessModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error processing return:', error);
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormErrors('');
    setSubmitting(true);

    // Validation
    if (!createFormData.transactionId || !createFormData.reason) {
      setCreateFormErrors('Please fill in transaction ID and return reason');
      setSubmitting(false);
      return;
    }

    // Validate at least one item
    const validItems = returnItems.filter(item => item.productName && item.quantity > 0);
    if (validItems.length === 0) {
      setCreateFormErrors('Please add at least one product to return');
      setSubmitting(false);
      return;
    }

    try {
      // Create a return for each item
      const promises = validItems.map(item =>
        fetch('/api/returns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: createFormData.transactionId,
            product_name: item.productName,
            customer_name: createFormData.customerName || 'Walk-in Customer',
            quantity: item.quantity,
            amount: item.amount,
            reason: createFormData.reason,
            status: 'Pending',
          }),
        })
      );

      const responses = await Promise.all(promises);
      const failedResponses = responses.filter(r => !r.ok);

      if (failedResponses.length > 0) {
        const errorData = await failedResponses[0].json();
        setCreateFormErrors(errorData.error || 'Failed to create some returns');
      } else {
        setShowCreateModal(false);
        setCreateFormData({
          transactionId: '',
          customerName: '',
          reason: '',
        });
        setReturnItems([{ productName: '', quantity: 1, amount: 0 }]);
        setTransactionItems([]);
        setProductSearchTerms(['']);
        setUnitPrices([0]);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating returns:', error);
      setCreateFormErrors('Failed to create returns. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTransactionDetails = async (transactionId: string) => {
    if (!transactionId.trim()) {
      setTransactionItems([]);
      return;
    }

    setLoadingTransaction(true);
    try {
      const response = await fetch(`/api/transactions/${encodeURIComponent(transactionId)}`);
      if (response.ok) {
        const data = await response.json();
        setTransactionItems(data.items || []);
        
        // Auto-fill customer name if available
        if (data.transaction.customer_name) {
          setCreateFormData(prev => ({
            ...prev,
            customerName: data.transaction.customer_name
          }));
        }
      } else {
        setTransactionItems([]);
        console.log('Transaction not found');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      setTransactionItems([]);
    } finally {
      setLoadingTransaction(false);
    }
  };

  const handleProductSelect = (index: number, productName: string) => {
    const newItems = [...returnItems];
    newItems[index].productName = productName;

    // Auto-fill quantity and price from transaction if available
    const transactionItem = transactionItems.find(
      item => item.product_name === productName
    );

    if (transactionItem) {
      const quantity = transactionItem.quantity;
      const totalPrice = parseFloat(transactionItem.subtotal);
      const unitPrice = totalPrice / quantity;

      newItems[index].quantity = quantity;
      newItems[index].amount = totalPrice;

      // Store unit price for this item
      const newUnitPrices = [...unitPrices];
      newUnitPrices[index] = unitPrice;
      setUnitPrices(newUnitPrices);
    }

    setReturnItems(newItems);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...returnItems];
    newItems[index].quantity = newQuantity;

    // Auto-calculate price based on unit price if available
    if (unitPrices[index] && unitPrices[index] > 0) {
      newItems[index].amount = unitPrices[index] * newQuantity;
    }

    setReturnItems(newItems);
  };

  const getFilteredProducts = (searchTerm: string) => {
    if (!searchTerm) return availableProducts;
    
    const term = searchTerm.toLowerCase();
    return availableProducts.filter(product =>
      product.name.toLowerCase().includes(term)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--text-primary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Returns</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage product returns and process refunds.</p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <button className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
            📤 Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
          >
            ⚙️ Create Return
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Total Returns</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalReturns}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-500">{stats.pendingReturns}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-500">{stats.completedReturns}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Return Value</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">KES {stats.totalReturnValue.toFixed(2)}</p>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Today's Returns</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.todayReturnCount}</p>
        </div>
      </div>

      {/* Return History */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Return History</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">A list of all processed returns.</p>
          
          <input
            type="text"
            placeholder="🔍 Search by receipt #, customer name, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border-color)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Return ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Return Date ↓</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((returnItem) => (
                <tr key={returnItem.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)] font-mono">{returnItem.return_id}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{returnItem.transaction_id}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{returnItem.reason}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">{returnItem.quantity}</td>
                  <td className="px-4 py-4 text-sm text-[var(--text-primary)]">
                    {new Date(returnItem.return_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setShowProcessModal(true);
                      }}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Return Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-2xl w-full mx-4 border border-[var(--border-color)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Create Return</h2>
            
            <form onSubmit={handleCreateReturn} className="space-y-4">
              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={createFormData.transactionId}
                    onChange={(e) => {
                      setCreateFormData({ ...createFormData, transactionId: e.target.value });
                      fetchTransactionDetails(e.target.value);
                    }}
                    placeholder="e.g., TXN-001 or paste transaction number"
                    className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {loadingTransaction && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {transactionItems.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Transaction found with {transactionItems.length} items
                  </p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={createFormData.customerName}
                  onChange={(e) => setCreateFormData({ ...createFormData, customerName: e.target.value })}
                  placeholder="Optional - defaults to Walk-in Customer"
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Return Reason */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Return Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.reason}
                  onChange={(e) => setCreateFormData({ ...createFormData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Defective">Defective Product</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Not as Described">Not as Described</option>
                  <option value="Changed Mind">Customer Changed Mind</option>
                  <option value="Damaged">Damaged During Shipping</option>
                  <option value="Quality Issues">Quality Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Items to Return */}
              <div className="border-t border-[var(--border-color)] pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Items to Return <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setReturnItems([...returnItems, { productName: '', quantity: 1, amount: 0 }]);
                      setProductSearchTerms([...productSearchTerms, '']);
                      setUnitPrices([...unitPrices, 0]);
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                {transactionItems.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                      📦 Items from Transaction:
                    </p>
                    <div className="space-y-1">
                      {transactionItems.map((item, idx) => (
                        <div key={idx} className="text-xs text-blue-600 dark:text-blue-400">
                          • {item.product_name} - Qty: {item.quantity} - KES {parseFloat(item.subtotal).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {returnItems.map((item, index) => (
                    <div key={index} className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-[var(--text-primary)]">Item {index + 1}</span>
                        {returnItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setReturnItems(returnItems.filter((_, i) => i !== index));
                              setProductSearchTerms(productSearchTerms.filter((_, i) => i !== index));
                              setUnitPrices(unitPrices.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Product Search and Select */}
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">
                            Product {transactionItems.length > 0 && '(auto-fills from transaction)'}
                          </label>
                          
                          {/* Search Input */}
                          <input
                            type="text"
                            value={productSearchTerms[index] || ''}
                            onChange={(e) => {
                              const newSearchTerms = [...productSearchTerms];
                              newSearchTerms[index] = e.target.value;
                              setProductSearchTerms(newSearchTerms);
                            }}
                            placeholder="🔍 Type to search products..."
                            className="w-full px-3 py-2 mb-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />

                          {/* Filtered Product List */}
                          <div className="max-h-40 overflow-y-auto border border-[var(--border-color)] rounded bg-[var(--bg-tertiary)]">
                            {getFilteredProducts(productSearchTerms[index]).length > 0 ? (
                              getFilteredProducts(productSearchTerms[index]).map((product) => {
                                const isFromTransaction = transactionItems.some(
                                  ti => ti.product_name === product.name
                                );
                                return (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => {
                                      handleProductSelect(index, product.name);
                                      const newSearchTerms = [...productSearchTerms];
                                      newSearchTerms[index] = product.name;
                                      setProductSearchTerms(newSearchTerms);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] border-b border-[var(--border-color)] last:border-b-0 ${
                                      item.productName === product.name ? 'bg-emerald-500/10 text-emerald-600' : 'text-[var(--text-primary)]'
                                    } ${isFromTransaction ? 'font-medium' : ''}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span>
                                        {isFromTransaction && '✓ '}
                                        {product.name}
                                      </span>
                                      <span className="text-xs text-[var(--text-secondary)]">
                                        Stock: {product.stock}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                                {productSearchTerms[index] ? 'No products found' : 'Start typing to search...'}
                              </div>
                            )}
                          </div>

                          {item.productName && (
                            <p className="text-xs text-emerald-600 mt-1">
                              Selected: {item.productName}
                            </p>
                          )}
                        </div>

                        {/* Quantity and Amount */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-[var(--text-secondary)] mb-1">
                              Quantity {transactionItems.length > 0 && '(auto-filled)'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              required
                            />
                            {unitPrices[index] > 0 && (
                              <p className="text-xs text-[var(--text-secondary)] mt-1">
                                Unit price: KES {unitPrices[index].toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-[var(--text-secondary)] mb-1">
                              Amount (KES) {unitPrices[index] > 0 && '(auto-calculated)'}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) => {
                                const newItems = [...returnItems];
                                newItems[index].amount = parseFloat(e.target.value) || 0;
                                setReturnItems(newItems);
                              }}
                              placeholder="0.00"
                              className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {unitPrices[index] > 0 && (
                              <p className="text-xs text-emerald-600 mt-1">
                                ✓ Auto-calculated
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  💡 Tip: Enter transaction ID to auto-fill. Adjust quantity and price auto-calculates!
                </p>
              </div>

              {/* Error Message */}
              {createFormErrors && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{createFormErrors}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Creating...' : `Create Return (${returnItems.filter(i => i.productName).length} items)`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateFormData({
                      transactionId: '',
                      customerName: '',
                      reason: '',
                    });
                    setReturnItems([{ productName: '', quantity: 1, amount: 0 }]);
                    setTransactionItems([]);
                    setProductSearchTerms(['']);
                    setUnitPrices([0]);
                    setCreateFormErrors('');
                  }}
                  className="px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Process Return</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Return ID: {selectedReturn.return_id}</p>
                <p className="text-sm text-[var(--text-secondary)]">Customer: {selectedReturn.customer_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">Product: {selectedReturn.product_name}</p>
                <p className="text-sm text-[var(--text-secondary)]">Amount: KES {selectedReturn.amount}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleProcessReturn(selectedReturn.id, 'Completed')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleProcessReturn(selectedReturn.id, 'Rejected')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
              <button
                onClick={() => setShowProcessModal(false)}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
