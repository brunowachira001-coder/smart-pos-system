import Link from 'next/link';
import { useRouter } from 'next/router';

interface BottomNavProps {
  slug: string;
  cartCount?: number;
}

export default function BottomNav({ slug, cartCount = 0 }: BottomNavProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (path: string) => currentPath.includes(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        <Link href={`/m/${slug}`}>
          <div className={`flex flex-col items-center py-2 cursor-pointer transition ${
            isActive('/m/[slug]') && !isActive('/category') && !isActive('/cart') && !isActive('/account')
              ? 'text-orange-500'
              : 'text-gray-600 hover:text-orange-500'
          }`}>
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium mt-1">Home</span>
          </div>
        </Link>
        
        <Link href={`/m/${slug}/category`}>
          <div className={`flex flex-col items-center py-2 cursor-pointer transition ${
            isActive('/category')
              ? 'text-orange-500'
              : 'text-gray-600 hover:text-orange-500'
          }`}>
            <span className="text-2xl">📂</span>
            <span className="text-xs font-medium mt-1">Category</span>
          </div>
        </Link>
        
        <Link href={`/m/${slug}/cart`}>
          <div className={`flex flex-col items-center py-2 cursor-pointer transition relative ${
            isActive('/cart')
              ? 'text-orange-500'
              : 'text-gray-600 hover:text-orange-500'
          }`}>
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-6 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="text-xs font-medium mt-1">Cart</span>
          </div>
        </Link>
        
        <Link href={`/m/${slug}/account`}>
          <div className={`flex flex-col items-center py-2 cursor-pointer transition ${
            isActive('/account')
              ? 'text-orange-500'
              : 'text-gray-600 hover:text-orange-500'
          }`}>
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium mt-1">Account</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
