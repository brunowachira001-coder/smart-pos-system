import React, { useState } from 'react';

interface DateRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
}

export default function DateRangeFilter({ 
  value, 
  onChange, 
  startDate = '', 
  endDate = '',
  onDateChange 
}: DateRangeFilterProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'month' | 'year'>('day');
  const [showDropdown, setShowDropdown] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = formatDate(new Date());

  const handleTabChange = (tab: 'day' | 'month' | 'year') => {
    setActiveTab(tab);
    // Auto-select appropriate range based on tab
    if (tab === 'day') {
      onChange('today');
    } else if (tab === 'month') {
      onChange('thisMonth');
    } else if (tab === 'year') {
      onChange('thisYear');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-1">
        {/* Tab Buttons */}
        <button
          onClick={() => handleTabChange('day')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'day'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => handleTabChange('month')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'month'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => handleTabChange('year')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'year'
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Year
        </button>

        {/* Date Range Inputs */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[var(--border-color)]">
          <input
            type="date"
            value={startDate || today}
            onChange={(e) => onDateChange?.(e.target.value, endDate || today)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-[var(--text-secondary)] text-xs">to</span>
          <input
            type="date"
            value={endDate || today}
            onChange={(e) => onDateChange?.(startDate || today, e.target.value)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Quick Select Dropdown */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
        >
          ▼
        </button>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => { onChange('today'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              Today
            </button>
            <button
              onClick={() => { onChange('yesterday'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              Yesterday
            </button>
            <button
              onClick={() => { onChange('last7days'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => { onChange('last30days'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => { onChange('thisMonth'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              This Month
            </button>
            <button
              onClick={() => { onChange('lastMonth'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              Last Month
            </button>
            <button
              onClick={() => { onChange('thisYear'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              This Year
            </button>
            <button
              onClick={() => { onChange('all'); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              All Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function getDateRange(range: string): { startDate: Date | null; endDate: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return { startDate: today, endDate: now };
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: today };
    
    case 'last7days':
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      return { startDate: last7, endDate: now };
    
    case 'last30days':
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      return { startDate: last30, endDate: now };
    
    case 'thisMonth':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: monthStart, endDate: now };
    
    case 'lastMonth':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: lastMonthStart, endDate: lastMonthEnd };
    
    case 'thisYear':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { startDate: yearStart, endDate: now };
    
    case 'all':
    default:
      return { startDate: null, endDate: null };
  }
}
