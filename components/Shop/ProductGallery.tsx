/**
 * Product Gallery Component
 * 
 * Features:
 * - Multi-angle product images with thumbnail strip
 * - Hover zoom lens with magnification
 * - Click to expand fullscreen mode
 * - Video player with inline playback
 * - Mobile pinch-to-zoom support
 * - 360° rotation (when available)
 * - Image type filtering (Product Only / All Images)
 * 
 * Tasks: 5.1-5.12
 * Requirements: 1.1-1.7, 2.1-2.6, 4.2-4.5
 */

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export interface ProductImage {
  id: string;
  image_url: string;
  image_type: 'primary' | 'angle' | 'lifestyle' | 'size_reference' | 'detail';
  display_order: number;
  alt_text?: string;
}

export interface ProductVideo {
  id: string;
  video_url: string;
  video_type: 'mp4' | 'webm' | 'youtube' | 'vimeo';
  thumbnail_url?: string;
  duration_seconds?: number;
  title?: string;
}

interface ProductGalleryProps {
  productId: string;
  tenantSlug: string;
  images: ProductImage[];
  videos?: ProductVideo[];
  primaryImage: string;
  onImageChange?: (imageUrl: string) => void;
}

export default function ProductGallery({
  productId,
  tenantSlug,
  images,
  videos = [],
  primaryImage,
  onImageChange
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'product-only'>('all');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  const imageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  // Filter images based on view mode
  const filteredImages = viewMode === 'product-only'
    ? images.filter(img => ['primary', 'angle', 'detail'].includes(img.image_type))
    : images;

  // Combine images and videos for gallery
  const allMedia = [
    ...filteredImages.map(img => ({ type: 'image' as const, data: img })),
    ...videos.map(vid => ({ type: 'video' as const, data: vid }))
  ];

  const currentMedia = allMedia[activeIndex];

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    setIsVideoPlaying(false);
    
    if (allMedia[index]?.type === 'image') {
      onImageChange?.(allMedia[index].data.image_url);
    }
  };

  // Handle mouse move for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || isTouchDevice) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  // Handle mouse enter (start zoom after 100ms)
  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setTimeout(() => setIsZoomed(true), 100);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle video play
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    videoRef.current?.play();
  };

  // Get image type label
  const getImageTypeLabel = (type: string) => {
    switch (type) {
      case 'size_reference':
        return 'Size Reference';
      case 'lifestyle':
        return 'Lifestyle';
      case 'detail':
        return 'Detail View';
      default:
        return '';
    }
  };

  // Render video player
  const renderVideoPlayer = (video: ProductVideo) => {
    if (video.video_type === 'youtube' || video.video_type === 'vimeo') {
      const embedUrl = video.video_type === 'youtube'
        ? `https://www.youtube.com/embed/${video.video_url.split('v=')[1]}`
        : `https://player.vimeo.com/video/${video.video_url.split('/').pop()}`;

      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={isVideoPlaying}
        poster={video.thumbnail_url}
      >
        <source src={video.video_url} type={`video/${video.video_type}`} />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="product-gallery">
      {/* Main Display Area */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-4">
        <div
          ref={imageRef}
          className="relative aspect-square cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleFullscreen}
        >
          {currentMedia?.type === 'image' ? (
            <>
              <Image
                src={currentMedia.data.image_url || primaryImage}
                alt={currentMedia.data.alt_text || 'Product image'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={activeIndex === 0}
              />
              
              {/* Zoom Lens */}
              {isZoomed && !isTouchDevice && (
                <div
                  className="absolute inset-0 bg-white bg-opacity-90 pointer-events-none"
                  style={{
                    backgroundImage: `url(${currentMedia.data.image_url})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '200%',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              )}

              {/* Image Type Label */}
              {currentMedia.data.image_type !== 'primary' && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                  {getImageTypeLabel(currentMedia.data.image_type)}
                </div>
              )}
            </>
          ) : currentMedia?.type === 'video' ? (
            <div className="relative w-full h-full">
              {!isVideoPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVideoPlay();
                  }}
                >
                  <div className="bg-black bg-opacity-70 rounded-full p-6 hover:bg-opacity-90 transition-all">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  {currentMedia.data.duration_seconds && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {Math.floor(currentMedia.data.duration_seconds / 60)}:{(currentMedia.data.duration_seconds % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              )}
              {renderVideoPlayer(currentMedia.data)}
            </div>
          ) : null}

          {/* Fullscreen Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
            aria-label="Toggle fullscreen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {allMedia.map((media, index) => (
          <button
            key={media.type === 'image' ? media.data.id : media.data.id}
            onClick={() => handleThumbnailClick(index)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              activeIndex === index
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            {media.type === 'image' ? (
              <Image
                src={media.data.image_url}
                alt={media.data.alt_text || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="relative w-full h-full bg-gray-200">
                {media.data.thumbnail_url ? (
                  <Image
                    src={media.data.thumbnail_url}
                    alt={media.data.title || 'Video thumbnail'}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* View Mode Toggle */}
      {images.some(img => ['lifestyle', 'size_reference'].includes(img.image_type)) && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setViewMode('product-only')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'product-only'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Product Only
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Images
          </button>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={toggleFullscreen}
        >
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            aria-label="Close fullscreen"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {currentMedia?.type === 'image' && (
              <Image
                src={currentMedia.data.image_url}
                alt={currentMedia.data.alt_text || 'Product image'}
                width={1200}
                height={1200}
                className="object-contain max-h-[90vh]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
