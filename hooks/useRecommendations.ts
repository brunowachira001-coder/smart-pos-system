import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  stock_quantity: number;
  image_url?: string;
  category?: string;
}

interface Recommendation {
  product: Product;
  reason: string;
  score: number;
}

interface UseRecommendationsProps {
  tenantSlug: string;
  productId?: string;
  context?: 'product-detail' | 'homepage' | 'cart';
  browsingHistory?: string[];
  limit?: number;
  enableCache?: boolean;
}

interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CACHE_KEY_PREFIX = 'recommendations_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Custom hook for fetching and caching product recommendations
 * Supports product-specific, homepage, and cart recommendations
 */
export function useRecommendations({
  tenantSlug,
  productId,
  context = 'homepage',
  browsingHistory = [],
  limit = 6,
  enableCache = true
}: UseRecommendationsProps): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate cache key based on parameters
   */
  const getCacheKey = useCallback(() => {
    const key = `${CACHE_KEY_PREFIX}${tenantSlug}_${context}_${productId || 'homepage'}_${browsingHistory.join(',')}`;
    return key;
  }, [tenantSlug, context, productId, browsingHistory]);

  /**
   * Get cached recommendations from localStorage
   */
  const getCachedRecommendations = useCallback((): Recommendation[] | null => {
    if (!enableCache || typeof window === 'undefined') return null;

    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error reading recommendations cache:', err);
      return null;
    }
  }, [enableCache, getCacheKey]);

  /**
   * Cache recommendations in localStorage
   */
  const cacheRecommendations = useCallback(
    (data: Recommendation[]) => {
      if (!enableCache || typeof window === 'undefined') return;

      try {
        const cacheKey = getCacheKey();
        const cacheData = {
          data,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (err) {
        console.error('Error caching recommendations:', err);
      }
    },
    [enableCache, getCacheKey]
  );

  /**
   * Fetch recommendations from API
   */
  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedRecommendations();
      if (cached) {
        setRecommendations(cached);
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        tenantSlug,
        context,
        limit: limit.toString()
      });

      if (productId) {
        params.append('productId', productId);
      }

      if (browsingHistory.length > 0) {
        params.append('browsingHistory', browsingHistory.join(','));
      }

      // Fetch from API
      const response = await fetch(`/api/ecommerce/recommendations?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again in a minute.');
        }
        throw new Error('Failed to fetch recommendations');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch recommendations');
      }

      const fetchedRecommendations = result.data.recommendations || [];

      // Cache the results
      cacheRecommendations(fetchedRecommendations);

      setRecommendations(fetchedRecommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      
      // Fallback to empty array on error
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [
    tenantSlug,
    productId,
    context,
    browsingHistory,
    limit,
    getCachedRecommendations,
    cacheRecommendations
  ]);

  /**
   * Refetch recommendations (bypasses cache)
   */
  const refetch = useCallback(async () => {
    // Clear cache for this key
    if (enableCache && typeof window !== 'undefined') {
      try {
        const cacheKey = getCacheKey();
        localStorage.removeItem(cacheKey);
      } catch (err) {
        console.error('Error clearing cache:', err);
      }
    }

    await fetchRecommendations();
  }, [enableCache, getCacheKey, fetchRecommendations]);

  // Fetch recommendations on mount and when dependencies change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch
  };
}
