/**
 * Recently Viewed Products Component
 * 
 * Displays products the customer recently viewed.
 * 
 * Tasks: 7.3
 * Requirements: 9.2, 9.6, 9.7
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';

interface RecentlyViewedProps {
  tenantSlug: string;
}

export default function RecentlyViewed({ tenantSlug }: RecentlyViewedProps) {
  const { recentlyViewed, clearHistory, removeItem } = useRecentlyViewed(tenantSlug);

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentlyViewed.map((product) => (
          <div key={product.id} className="group relative">
            <Link href={`/shop/${tenantSlug}/product/${product.id}`}>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
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

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(product.id);
                    }}
                    className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from recently viewed"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.retail_price.toFixed(2)}
                    </span>
                  </div>

                  {product.category && (
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  )}

                  {/* Viewed Time */}
                  <p className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(product.viewedAt)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to format time ago
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
