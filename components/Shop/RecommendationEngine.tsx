/**
 * Recommendation Engine Component
 * 
 * Displays personalized product recommendations based on:
 * - Same category products
 * - Co-purchased items
 * - Trending products
 * - Browsing history
 * 
 * Tasks: 6.1
 * Requirements: 7.1, 7.2, 7.3, 7.5
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  retail_price: number;
  stock_quantity: number;
  image_url?: string;
}

interface Recommendation {
  product: Product;
  reason: 'same-category' | 'co-purchased' | 'trending' | 'browsing-history';
  score: number;
}

interface RecommendationEngineProps {
  tenantSlug: string;
  context: 'product-detail' | 'homepage' | 'cart';
  currentProductId?: string;
  limit?: number;
}

export default function RecommendationEngine({
  tenantSlug,
  context,
  currentProductId,
  limit = 6
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [tenantSlug, currentProductId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get browsing history from localStorage
      const browsingHistory = getBrowsingHistory();

      // Build API URL
      const params = new URLSearchParams({
        tenantSlug,
        context,
        limit: limit.toString()
      });

      if (currentProductId) {
        params.append('productId', currentProductId);
      }

      if (browsingHistory.length > 0) {
        params.append('browsingHistory', browsingHistory.join(','));
      }

      const response = await fetch(`/api/ecommerce/recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.data.recommendations);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBrowsingHistory = (): string[] => {
    try {
      const history = localStorage.getItem(`browsing_history_${tenantSlug}`);
      if (!history) return [];
      
      const parsed = JSON.parse(history);
      return parsed.map((item: any) => item.productId).slice(0, 10);
    } catch {
      return [];
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'same-category':
        return 'Similar Products';
      case 'co-purchased':
        return 'Frequently Bought Together';
      case 'trending':
        return 'Trending Now';
      case 'browsing-history':
        return 'Based on Your Browsing';
      default:
        return 'Recommended';
    }
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason) {
      case 'same-category':
        return 'bg-blue-100 text-blue-800';
      case 'co-purchased':
        return 'bg-green-100 text-green-800';
      case 'trending':
        return 'bg-orange-100 text-orange-800';
      case 'browsing-history':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">
        {context === 'product-detail' ? 'You May Also Like' : 'Recommended For You'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.product.id}
            href={`/shop/${tenantSlug}/product/${rec.product.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100">
                {rec.product.image_url ? (
                  <Image
                    src={rec.product.image_url}
                    alt={rec.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Reason Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getReasonBadgeColor(rec.reason)}`}>
                    {getReasonLabel(rec.reason)}
                  </span>
                </div>

                {/* Stock Badge */}
                {rec.product.stock_quantity < 10 && rec.product.stock_quantity > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white font-medium">
                      Only {rec.product.stock_quantity} left
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {rec.product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${rec.product.retail_price.toFixed(2)}
                  </span>
                  
                  {rec.product.stock_quantity > 0 ? (
                    <span className="text-xs text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>

                {rec.product.category && (
                  <p className="text-xs text-gray-500 mt-1">{rec.product.category}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {recommendations.length >= limit && (
        <div className="text-center mt-6">
          <Link
            href={`/shop/${tenantSlug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
