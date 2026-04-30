// Customer Messages Dashboard
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Stats {
  total_sent: number;
  total_failed: number;
  total_pending: number;
  total_cost: number;
  delivery_rate: number;
}

export default function CustomerMessages() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Send Message State
  const [showSendModal, setShowSendModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  
  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchCustomers();
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sms/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers/list?limit=1000');
      const data = await response.json();
      
      if (response.ok) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/sms/templates');
      const data = await response.json();
      
      if (response.ok) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer');
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/sms/send-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: selectedCustomers,
          message: messageText
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({
          success: true,
          sent: data.sent,
          failed: data.failed,
          total: data.total
        });
        setMessageText('');
        setSelectedCustomers([]);
        fetchStats(); // Refresh stats
      } else {
        setSendResult({
          success: false,
          error: data.error || 'Failed to send messages'
        });
      }
    } catch (error: any) {
      setSendResult({
        success: false,
        error: error.message || 'Network error'
      });
    } finally {
      setSending(false);
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Customer Messages</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            AI-powered automated SMS communication
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
        >
          Send Message
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Total Sent</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.total_sent}
                </p>
              </div>
              <div className="text-3xl">📤</div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Pending</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.total_pending}
                </p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Failed</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.total_failed}
                </p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Delivery Rate</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {stats.delivery_rate.toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  KES {stats.total_cost.toFixed(2)}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[var(--border-color)]">
        <div className="flex gap-4">
          {['overview', 'templates', 'queue', 'automation', 'config'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                🤖 AI Communication Assistant
              </h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <p className="text-[var(--text-primary)] mb-2">
                  <strong>Status:</strong> ✅ Active | Monitoring 24/7
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  Your AI assistant is automatically sending personalized messages to customers based on their activity.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('send')}
                  className="p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] text-left transition"
                >
                  <p className="font-semibold text-[var(--text-primary)]">📤 Send Bulk Message</p>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Send messages to multiple customers
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className="p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] text-left transition"
                >
                  <p className="font-semibold text-[var(--text-primary)]">📝 Manage Templates</p>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Create and edit message templates
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('automation')}
                  className="p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] text-left transition"
                >
                  <p className="font-semibold text-[var(--text-primary)]">⚙️ Automation Rules</p>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    Configure automated messaging
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('queue')}
                  className="p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] text-left transition"
                >
                  <p className="font-semibold text-[var(--text-primary)]">📋 Message Queue</p>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    View pending and sent messages
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            {loadingTemplates ? (
              <p className="text-center text-[var(--text-secondary)] py-8">Loading templates...</p>
            ) : templates.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] py-8">No templates found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{template.name}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded mt-1 inline-block">
                          {template.category}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        template.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-[var(--text-secondary)] mt-3 whitespace-pre-wrap">
                      {template.message_text}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-secondary)]">
                      <span>Language: {template.language?.toUpperCase() || 'EN'}</span>
                      <span>AI: {template.ai_personalization ? 'Yes' : 'No'}</span>
                      {template.total_sent > 0 && (
                        <span>Sent: {template.total_sent}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">Message queue viewer coming soon...</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Use the API endpoint /api/sms/queue to view messages
            </p>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">Automation rules coming soon...</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Use the API endpoint /api/sms/automation to manage rules
            </p>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">SMS configuration coming soon...</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Use Shop Settings to configure Africa's Talking API
            </p>
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Send Message</h2>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSendResult(null);
                }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Send Result */}
            {sendResult && (
              <div className={`mb-4 p-4 rounded-lg ${
                sendResult.success 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}>
                {sendResult.success ? (
                  <div>
                    <p className="font-semibold">✅ Messages Sent Successfully!</p>
                    <p className="text-sm mt-1">
                      Sent: {sendResult.sent} | Failed: {sendResult.failed} | Total: {sendResult.total}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">❌ Error</p>
                    <p className="text-sm mt-1">{sendResult.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Message Text */}
            <div className="mb-4">
              <label className="block text-[var(--text-primary)] font-semibold mb-2">
                Message Text
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here... (e.g., Hi {name}! Thank you for shopping at Nyla Wigs!)"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                disabled={sending}
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Use {'{name}'} to personalize with customer name
              </p>
            </div>

            {/* Customer Selection */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[var(--text-primary)] font-semibold">
                  Select Customers ({selectedCustomers.length} selected)
                </label>
                <button
                  onClick={selectAllCustomers}
                  className="text-sm text-emerald-500 hover:text-emerald-400"
                  disabled={sending}
                >
                  {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg max-h-60 overflow-y-auto">
                {customers.length === 0 ? (
                  <p className="text-center text-[var(--text-secondary)] py-8">No customers found</p>
                ) : (
                  customers.map((customer) => (
                    <label
                      key={customer.id}
                      className="flex items-center gap-3 p-3 hover:bg-[var(--bg-tertiary)] cursor-pointer border-b border-[var(--border-color)] last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                        className="w-4 h-4"
                        disabled={sending}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">{customer.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{customer.phone}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim() || selectedCustomers.length === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {sending ? 'Sending...' : `Send to ${selectedCustomers.length} Customer${selectedCustomers.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSendResult(null);
                }}
                disabled={sending}
                className="px-6 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] py-3 rounded-lg font-semibold transition-colors"
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
