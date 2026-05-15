import { useState, useEffect, useCallback } from 'react';

interface ProductImage {
  id: string;
  image_url: string;
  image_type: string;
  alt_text?: string;
  display_order: number;
}

interface UseProductGalleryProps {
  images: ProductImage[];
  autoPreload?: boolean;
}

interface UseProductGalleryReturn {
  activeIndex: number;
  isZoomed: boolean;
  zoomPosition: { x: number; y: number };
  isFullscreen: boolean;
  activeImage: ProductImage | null;
  selectImage: (index: number) => void;
  toggleZoom: () => void;
  setZoomPosition: (x: number, y: number) => void;
  toggleFullscreen: () => void;
  nextImage: () => void;
  prevImage: () => void;
  preloadImages: () => void;
}

/**
 * Custom hook for managing product gallery state and interactions
 * Handles image selection, zoom, fullscreen, and preloading
 */
export function useProductGallery({
  images,
  autoPreload = true
}: UseProductGalleryProps): UseProductGalleryReturn {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPositionState] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  // Get active image
  const activeImage = images[activeIndex] || null;

  /**
   * Preload images for faster display
   * Creates Image objects to trigger browser caching
   */
  const preloadImages = useCallback(() => {
    if (!images || images.length === 0) return;

    images.forEach((img) => {
      if (!preloadedImages.has(img.image_url)) {
        const image = new Image();
        image.src = img.image_url;
        image.onload = () => {
          setPreloadedImages((prev) => new Set(prev).add(img.image_url));
        };
      }
    });
  }, [images, preloadedImages]);

  /**
   * Select image by index
   * Validates index bounds and updates active image
   */
  const selectImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setActiveIndex(index);
        // Reset zoom when switching images
        setIsZoomed(false);
        setZoomPositionState({ x: 0, y: 0 });
      }
    },
    [images.length]
  );

  /**
   * Toggle zoom state
   * Resets zoom position when disabling zoom
   */
  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => {
      if (prev) {
        // Reset zoom position when disabling zoom
        setZoomPositionState({ x: 0, y: 0 });
      }
      return !prev;
    });
  }, []);

  /**
   * Set zoom position (for zoom lens)
   * Normalizes coordinates to 0-1 range
   */
  const setZoomPosition = useCallback((x: number, y: number) => {
    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    setZoomPositionState({ x: clampedX, y: clampedY });
  }, []);

  /**
   * Toggle fullscreen mode
   * Exits zoom when entering fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      if (!prev) {
        // Exit zoom when entering fullscreen
        setIsZoomed(false);
        setZoomPositionState({ x: 0, y: 0 });
      }
      return !prev;
    });
  }, []);

  /**
   * Navigate to next image
   * Wraps around to first image at end
   */
  const nextImage = useCallback(() => {
    setActiveIndex((prev) => {
      const next = prev + 1;
      return next >= images.length ? 0 : next;
    });
    // Reset zoom when switching images
    setIsZoomed(false);
    setZoomPositionState({ x: 0, y: 0 });
  }, [images.length]);

  /**
   * Navigate to previous image
   * Wraps around to last image at start
   */
  const prevImage = useCallback(() => {
    setActiveIndex((prev) => {
      const next = prev - 1;
      return next < 0 ? images.length - 1 : next;
    });
    // Reset zoom when switching images
    setIsZoomed(false);
    setZoomPositionState({ x: 0, y: 0 });
  }, [images.length]);

  // Auto-preload images on mount if enabled
  useEffect(() => {
    if (autoPreload && images.length > 0) {
      preloadImages();
    }
  }, [autoPreload, images.length, preloadImages]);

  // Reset active index if images change and current index is out of bounds
  useEffect(() => {
    if (activeIndex >= images.length && images.length > 0) {
      setActiveIndex(0);
    }
  }, [images.length, activeIndex]);

  // Handle keyboard navigation in fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, nextImage, prevImage, toggleFullscreen]);

  return {
    activeIndex,
    isZoomed,
    zoomPosition,
    isFullscreen,
    activeImage,
    selectImage,
    toggleZoom,
    setZoomPosition,
    toggleFullscreen,
    nextImage,
    prevImage,
    preloadImages
  };
}
