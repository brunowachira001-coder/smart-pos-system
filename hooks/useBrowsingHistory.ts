import { useState, useEffect, useCallback } from 'react';

interface BrowsingHistoryItem {
  productId: string;
  productName: string;
  category: string;
  viewedAt: string; // ISO timestamp
}

interface UseBrowsingHistoryProps {
  tenantSlug: string;
  maxEntries?: number;
  expirationDays?: number;
}

interface UseBrowsingHistoryReturn {
  history: BrowsingHistoryItem[];
  addToHistory: (item: Omit<BrowsingHistoryItem, 'viewedAt'>) => void;
  getHistory: () => BrowsingHistoryItem[];
  clearHistory: () => void;
  removeItem: (productId: string) => void;
  getProductIds: () => string[];
}

const STORAGE_KEY_PREFIX = 'browsing_history_';
const DEFAULT_MAX_ENTRIES = 50;
const DEFAULT_EXPIRATION_DAYS = 30;

/**
 * Custom hook for managing browsing history in localStorage
 * Tracks product views with automatic expiration and deduplication
 */
export function useBrowsingHistory({
  tenantSlug,
  maxEntries = DEFAULT_MAX_ENTRIES,
  expirationDays = DEFAULT_EXPIRATION_DAYS
}: UseBrowsingHistoryProps): UseBrowsingHistoryReturn {
  const [history, setHistory] = useState<BrowsingHistoryItem[]>([]);

  /**
   * Get storage key for this tenant
   */
  const getStorageKey = useCallback(() => {
    return `${STORAGE_KEY_PREFIX}${tenantSlug}`;
  }, [tenantSlug]);

  /**
   * Check if an entry is expired
   */
  const isExpired = useCallback(
    (viewedAt: string): boolean => {
      const viewedDate = new Date(viewedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - viewedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > expirationDays;
    },
    [expirationDays]
  );

  /**
   * Load history from localStorage
   * Removes expired entries automatically
   */
  const loadHistory = useCallback((): BrowsingHistoryItem[] => {
    if (typeof window === 'undefined') return [];

    try {
      const storageKey = getStorageKey();
      const stored = localStorage.getItem(storageKey);

      if (!stored) return [];

      const parsed: BrowsingHistoryItem[] = JSON.parse(stored);

      // Filter out expired entries
      const validEntries = parsed.filter((item) => !isExpired(item.viewedAt));

      // If we removed expired entries, update localStorage
      if (validEntries.length !== parsed.length) {
        localStorage.setItem(storageKey, JSON.stringify(validEntries));
      }

      return validEntries;
    } catch (err) {
      console.error('Error loading browsing history:', err);
      return [];
    }
  }, [getStorageKey, isExpired]);

  /**
   * Save history to localStorage
   */
  const saveHistory = useCallback(
    (items: BrowsingHistoryItem[]) => {
      if (typeof window === 'undefined') return;

      try {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (err) {
        console.error('Error saving browsing history:', err);
      }
    },
    [getStorageKey]
  );

  /**
   * Add item to browsing history
   * Updates timestamp if item already exists
   * Removes oldest entries if max limit exceeded
   */
  const addToHistory = useCallback(
    (item: Omit<BrowsingHistoryItem, 'viewedAt'>) => {
      setHistory((prevHistory) => {
        // Remove existing entry for this product (if any)
        const filtered = prevHistory.filter((h) => h.productId !== item.productId);

        // Add new entry at the beginning (most recent first)
        const newEntry: BrowsingHistoryItem = {
          ...item,
          viewedAt: new Date().toISOString()
        };

        const updated = [newEntry, ...filtered];

        // Limit to max entries
        const limited = updated.slice(0, maxEntries);

        // Save to localStorage
        saveHistory(limited);

        return limited;
      });
    },
    [maxEntries, saveHistory]
  );

  /**
   * Get current history
   */
  const getHistory = useCallback((): BrowsingHistoryItem[] => {
    return history;
  }, [history]);

  /**
   * Clear all browsing history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    
    if (typeof window !== 'undefined') {
      try {
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.error('Error clearing browsing history:', err);
      }
    }
  }, [getStorageKey]);

  /**
   * Remove specific item from history
   */
  const removeItem = useCallback(
    (productId: string) => {
      setHistory((prevHistory) => {
        const filtered = prevHistory.filter((item) => item.productId !== productId);
        saveHistory(filtered);
        return filtered;
      });
    },
    [saveHistory]
  );

  /**
   * Get array of product IDs (for API calls)
   */
  const getProductIds = useCallback((): string[] => {
    return history.map((item) => item.productId);
  }, [history]);

  // Load history on mount
  useEffect(() => {
    const loaded = loadHistory();
    setHistory(loaded);
  }, [loadHistory]);

  // Cleanup expired entries periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prevHistory) => {
        const validEntries = prevHistory.filter((item) => !isExpired(item.viewedAt));
        
        if (validEntries.length !== prevHistory.length) {
          saveHistory(validEntries);
          return validEntries;
        }
        
        return prevHistory;
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isExpired, saveHistory]);

  return {
    history,
    addToHistory,
    getHistory,
    clearHistory,
    removeItem,
    getProductIds
  };
}
