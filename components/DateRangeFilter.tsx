import React, { useState } from 'react';

interface DateRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
}

const getDisplayLabel = (value: string): string => {
  const labels: { [key: string]: string } = {
    'today': 'Today',
    'yesterday': 'Yesterday',
    'last7days': 'Last 7 Days',
    'last30days': 'Last 30 Days',
    'thisMonth': 'This Month',
    'lastMonth': 'Last Month',
    'thisYear': 'This Year',
    'all': 'All'
  };
  return labels[value] || 'All';
};

export default function DateRangeFilter({ 
  value, 
  onChange, 
  startDate = '', 
  endDate = '',
  onDateChange 
}: DateRangeFilterProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = formatDate(new Date());

  return (
    <div className="flex items-center gap-3">
      {/* Dropdown Select - Similar to "All" in reference */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2 min-w-[120px] justify-between"
        >
          <span>{getDisplayLabel(value)}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute left-0 mt-2 w-48 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg shadow-xl z-50 py-1">
              <button
                onClick={() => { onChange('all'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                All
              </button>
              <button
                onClick={() => { onChange('today'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => { onChange('yesterday'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                Yesterday
              </button>
              <button
                onClick={() => { onChange('last7days'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => { onChange('last30days'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => { onChange('thisMonth'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                This Month
              </button>
              <button
                onClick={() => { onChange('lastMonth'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                Last Month
              </button>
              <button
                onClick={() => { onChange('thisYear'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors"
              >
                This Year
              </button>
            </div>
          </>
        )}
      </div>

      {/* Calendar Icon with Date Pickers */}
      <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
        <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          value={startDate || today}
          onChange={(e) => onDateChange?.(e.target.value, endDate || today)}
          className="bg-transparent border-none text-sm text-[var(--text-primary)] focus:outline-none w-[110px]"
        />
        <span className="text-[var(--text-secondary)] text-sm">to</span>
        <input
          type="date"
          value={endDate || today}
          onChange={(e) => onDateChange?.(startDate || today, e.target.value)}
          className="bg-transparent border-none text-sm text-[var(--text-primary)] focus:outline-none w-[110px]"
        />
      </div>
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
