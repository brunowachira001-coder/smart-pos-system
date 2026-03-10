'use client'

import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  isDark: boolean
  onThemeToggle: (isDark: boolean) => void
}

export default function Header({ isDark, onThemeToggle }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Store
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Dashboard
            </Link>
            <Link href="/products" className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Products
            </Link>
            <Link href="/checkout" className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Checkout
            </Link>
            <Link href="/transactions" className={isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}>
              Transactions
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDark}
              onChange={(e) => onThemeToggle(e.target.checked)}
              className="w-4 h-4"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </span>
          </label>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
          >
            <span className={isDark ? 'text-white' : 'text-gray-900'}>☰</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={`md:hidden ${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-4 space-y-2`}>
          <Link href="/dashboard" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Dashboard
          </Link>
          <Link href="/products" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Products
          </Link>
          <Link href="/checkout" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Checkout
          </Link>
          <Link href="/transactions" className={`block ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            Transactions
          </Link>
        </nav>
      )}
    </header>
  )
}
