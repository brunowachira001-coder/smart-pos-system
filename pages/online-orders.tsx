import { useState, useEffect, useCallback } from 'react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_street: string;
  shipping_country: string;
  customer_notes?: string;
  created_at: string;
  online_order_items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; next: string | null }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-100', next: 'confirmed' },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-700',   bg: 'bg-blue-100',   next: 'preparing' },
  preparing:  { label: 'Preparing',  color: 'text-purple-700', bg: 'bg-purple-100', next: 'ready' },
  ready:      { label: 'Ready',      color: 'text-teal-700',   bg: 'bg-teal-100',   next: 'shipped' },
  shipped:    { label: 'Shipped',    color: 'text-indigo-700', bg: 'bg-indigo-100', next: 'delivered' },
  delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-100',  next: null },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-100',    next: null },
};

const NEXT_LABEL: Record<string, string> = {
  confirmed: 'Confirm',
  preparing: 'Start Preparing',
  ready: 'Mark Ready',
  shipped: 'Mark Shipped',
  delivered: 'Mark Delivered',
};

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' ? '/api/online-orders' : `/api/online-orders?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      const list: Order[] = data.orders || [];
      setOrders(list);
      setNewCount(list.filter(o => o.order_status === 'pending').length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    // Poll every 30 seconds for new orders
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/online-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        await fetchOrders();
        if (selected?.id === orderId) {
          setSelected(prev => prev ? { ...prev, order_status: status } : null);
        }
      }
    } finally {
      setUpdating(null);
    }
  };

  const filters = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              🛍️ Online Orders
              {newCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {newCount} new
                </span>
              )}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage orders from your online shop</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-emerald-50'
              }`}
            >
              {f.label}
              {f.key === 'pending' && newCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-[var(--text-primary)] font-medium">No orders found</p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Orders from your online shop will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Order list */}
            <div className="lg:col-span-2 space-y-3">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
                const isNew = order.order_status === 'pending';
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className={`bg-[var(--bg-primary)] border rounded-xl p-4 cursor-pointer hover:border-emerald-400 transition ${
                      selected?.id === order.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-[var(--border-color)]'
                    } ${isNew ? 'border-l-4 border-l-yellow-400' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[var(--text-primary)] text-sm">{order.order_number}</span>
                          {isNew && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">NEW</span>}
                        </div>
                        <p className="text-sm text-[var(--text-primary)] font-medium">{order.shipping_full_name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{order.shipping_phone} · {order.shipping_city}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {order.online_order_items?.length || 0} item{(order.online_order_items?.length || 0) !== 1 ? 's' : ''} ·{' '}
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : 'M-Pesa'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-emerald-600 text-sm">KES {order.total_amount.toLocaleString()}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {new Date(order.created_at).toLocaleString('en-KE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Quick action */}
                    {cfg.next && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                        <button
                          onClick={e => { e.stopPropagation(); updateStatus(order.id, cfg.next!); }}
                          disabled={updating === order.id}
                          className="w-full py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition disabled:opacity-50"
                        >
                          {updating === order.id ? 'Updating...' : `→ ${NEXT_LABEL[cfg.next] || cfg.next}`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order detail panel */}
            <div className="lg:col-span-1">
              {selected ? (
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-5 sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-[var(--text-primary)]">Order Details</h2>
                    <button onClick={() => setSelected(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg">×</button>
                  </div>

                  <div className="space-y-4">
                    {/* Order number + status */}
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Order</p>
                      <p className="font-bold text-[var(--text-primary)]">{selected.order_number}</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${STATUS_CONFIG[selected.order_status]?.bg} ${STATUS_CONFIG[selected.order_status]?.color}`}>
                        {STATUS_CONFIG[selected.order_status]?.label}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="border-t border-[var(--border-color)] pt-3">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Customer</p>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{selected.shipping_full_name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{selected.shipping_phone}</p>
                    </div>

                    {/* Delivery address */}
                    <div className="border-t border-[var(--border-color)] pt-3">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Deliver To</p>
                      <p className="text-sm text-[var(--text-primary)]">{selected.shipping_street}</p>
                      <p className="text-sm text-[var(--text-primary)]">{selected.shipping_city}, {selected.shipping_country}</p>
                    </div>

                    {/* Items */}
                    <div className="border-t border-[var(--border-color)] pt-3">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-2">Items</p>
                      <div className="space-y-2">
                        {selected.online_order_items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-[var(--text-primary)] flex-1 pr-2">{item.product_name} <span className="text-[var(--text-secondary)]">×{item.quantity}</span></span>
                            <span className="font-medium text-[var(--text-primary)] shrink-0">KES {item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-[var(--border-color)] pt-3 flex justify-between font-bold">
                      <span className="text-[var(--text-primary)]">Total</span>
                      <span className="text-emerald-600">KES {selected.total_amount.toLocaleString()}</span>
                    </div>

                    {/* Payment */}
                    <div className="text-sm text-[var(--text-secondary)]">
                      Payment: <span className="font-medium text-[var(--text-primary)]">
                        {selected.payment_method === 'cod' ? 'Cash on Delivery' : 'M-Pesa'}
                      </span>
                    </div>

                    {/* Notes */}
                    {selected.customer_notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        📝 {selected.customer_notes}
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="border-t border-[var(--border-color)] pt-3 space-y-2">
                      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-2">Update Status</p>
                      {Object.entries(STATUS_CONFIG)
                        .filter(([key]) => key !== selected.order_status && key !== 'pending')
                        .map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => updateStatus(selected.id, key)}
                            disabled={updating === selected.id}
                            className={`w-full py-2 text-xs font-medium rounded-lg border transition disabled:opacity-50 ${cfg.bg} ${cfg.color} border-current`}
                          >
                            {updating === selected.id ? 'Updating...' : `Mark as ${cfg.label}`}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-[var(--text-secondary)] text-sm">Click an order to see details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
