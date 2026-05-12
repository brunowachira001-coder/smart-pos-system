/**
 * Recently Viewed Products Hook
 * 
 * Manages recently viewed product history in localStorage.
 * 
 * Tasks: 7.3
 * Requirements: 9.1, 9.3, 9.4, 9.5
 */

import { useState, useEffect, useCallback } from 'react';

interface RecentlyViewedProduct {
  id: string;
  name: string;
  retail_price: number;
  image_url?: string;
  category?: string;
  viewedAt: number;
}

const MAX_ITEMS = 12;
const EXPIRY_DAYS = 30;

export function useRecentlyViewed(tenantSlug: string) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const storageKey = `recently_viewed_${tenantSlug}`;

  // Load from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, [tenantSlug]);

  // Load from localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        setRecentlyViewed([]);
        return;
      }

      const parsed: RecentlyViewedProduct[] = JSON.parse(stored);
      const now = Date.now();
      const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      // Filter out expired entries
      const valid = parsed.filter(item => {
        return (now - item.viewedAt) < expiryTime;
      });

      setRecentlyViewed(valid);

      // Update storage if we removed expired items
      if (valid.length !== parsed.length) {
        localStorage.setItem(storageKey, JSON.stringify(valid));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      setRecentlyViewed([]);
    }
  }, [storageKey]);

  // Add product to history
  const addToHistory = useCallback(async (
    productId: string,
    productData?: Partial<RecentlyViewedProduct>
  ) => {
    try {
      // If product data not provided, fetch from API
      let product: RecentlyViewedProduct;
      
      if (productData && productData.name) {
        product = {
          id: productId,
          name: productData.name,
          retail_price: productData.retail_price || 0,
          image_url: productData.image_url,
          category: productData.category,
          viewedAt: Date.now()
        };
      } else {
        // Fetch from API
        const response = await fetch('/api/ecommerce/recently-viewed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantSlug, productId })
        });

        if (!response.ok) {
          throw new Error('Failed to validate product');
        }

        const data = await response.json();
        product = data.data.product;
      }

      // Remove if already exists (to update timestamp)
      const filtered = recentlyViewed.filter(item => item.id !== productId);

      // Add to beginning
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);

      // Save to state and localStorage
      setRecentlyViewed(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  }, [tenantSlug, storageKey, recentlyViewed]);

  // Get history
  const getHistory = useCallback(() => {
    return recentlyViewed;
  }, [recentlyViewed]);

  // Clear history
  const clearHistory = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Remove single item
  const removeItem = useCallback((productId: string) => {
    const updated = recentlyViewed.filter(item => item.id !== productId);
    setRecentlyViewed(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [recentlyViewed, storageKey]);

  return {
    recentlyViewed,
    addToHistory,
    getHistory,
    clearHistory,
    removeItem
  };
}

export default useRecentlyViewed;
