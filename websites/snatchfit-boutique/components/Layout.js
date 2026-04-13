import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                SF
              </div>
              <span className="font-display font-bold text-lg hidden sm:inline">SnatchFit</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/shop" className="hover:text-accent transition">
                Shop
              </Link>
              <Link href="/about" className="hover:text-accent transition">
                About
              </Link>
              <Link href="/contact" className="hover:text-accent transition">
                Contact
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <Link href="/cart" className="relative hover:text-accent transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative group">
                  <button className="hover:text-accent transition">{user.name}</button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-800 rounded-t-lg">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 hover:bg-gray-800">
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="hover:text-accent transition">
                    Login
                  </Link>
                  <Link href="/register" className="bg-accent text-black px-4 py-2 rounded-lg hover:bg-pink-600 transition">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="/shop" className="block hover:text-accent transition">
                Shop
              </Link>
              <Link href="/about" className="block hover:text-accent transition">
                About
              </Link>
              <Link href="/contact" className="block hover:text-accent transition">
                Contact
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold mb-4">SnatchFit</h3>
              <p className="text-gray-400">Bold, confident, modern fashion for the trend-conscious.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shop?category=dresses" className="hover:text-accent transition">Dresses</Link></li>
                <li><Link href="/shop?category=tops" className="hover:text-accent transition">Tops</Link></li>
                <li><Link href="/shop?category=bottoms" className="hover:text-accent transition">Bottoms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-accent transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-accent transition">Privacy</a></li>
                <li><a href="#" className="hover:text-accent transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SnatchFit Boutique. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
