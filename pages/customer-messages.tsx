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

  useEffect(() => {
    fetchStats();
  }, []);

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
          onClick={() => setActiveTab('send')}
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
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">Template management coming soon...</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Use the API endpoint /api/sms/templates to manage templates
            </p>
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
    </div>
  );
}
