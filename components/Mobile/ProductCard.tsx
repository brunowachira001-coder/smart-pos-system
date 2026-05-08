import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    retail_price: number;
    image_url?: string;
    stock_quantity: number;
  };
  slug: string;
  onAddToCart?: (productId: string) => void;
  variant?: 'default' | 'compact' | 'large';
}

export default function ProductCard({ product, slug, onAddToCart, variant = 'default' }: ProductCardProps) {
  const discount = Math.floor(Math.random() * 40 + 20);
  const rating = 4 + Math.random();
  const soldCount = Math.floor(Math.random() * 10000);

  if (variant === 'compact') {
    return (
      <Link href={`/m/${slug}/product/${product.id}`}>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>
            <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
              -{discount}%
            </div>
          </div>
          <div className="p-2">
            <div className="text-xs line-clamp-2 h-8 mb-1">{product.name}</div>
            <div className="text-sm font-bold text-orange-600">
              KES{product.retail_price.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span className="text-yellow-400">★★★★★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'large') {
    return (
      <Link href={`/m/${slug}/product/${product.id}`}>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">📦</span>
              )}
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              -{discount}%
            </div>
            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product.id);
                }}
                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition"
              >
                🛒
              </button>
            )}
          </div>
          <div className="p-3">
            <div className="text-sm line-clamp-2 h-10 mb-2">{product.name}</div>
            <div className="text-lg font-bold text-orange-600 mb-1">
              KES{product.retail_price.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <span className="text-yellow-400">★★★★★</span>
                <span>{rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">{soldCount}+ sold</span>
            </div>
            <div className="text-xs text-green-600 font-medium mt-2">✓ Free shipping</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/m/${slug}/product/${product.id}`}>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">📦</span>
            )}
          </div>
          {product.stock_quantity < 10 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
              LOW STOCK
            </div>
          )}
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product.id);
              }}
              className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition"
            >
              🛒
            </button>
          )}
        </div>
        <div className="p-3">
          <div className="text-sm line-clamp-2 h-10 mb-2">{product.name}</div>
          <div className="text-lg font-bold text-orange-600 mb-1">
            KES{product.retail_price.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1 text-gray-500">
              <span className="text-yellow-400">★★★★★</span>
              <span>{rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400">{soldCount}+ sold</span>
          </div>
          <div className="text-xs text-green-600 font-medium">✓ Free shipping</div>
        </div>
      </div>
    </Link>
  );
}
