import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { username, password });

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('[LOGIN PAGE] Full error:', err);
      console.error('[LOGIN PAGE] Response:', err.response);
      console.error('[LOGIN PAGE] Response data:', err.response?.data);
      
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      console.error('[LOGIN PAGE] Final error message:', errorMsg);
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo - Top Left */}
        <div className="absolute -top-20 -left-20 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-4xl">🏪</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600 mb-8">Sign in to your Smart Traders account</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-900 mb-2">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-slate-600 text-xs text-center mb-3 font-medium">Demo Credentials</p>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
              <p className="text-slate-700 text-sm"><span className="font-semibold text-emerald-600">Username:</span> admin</p>
              <p className="text-slate-700 text-sm"><span className="font-semibold text-emerald-600">Password:</span> admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          © 2024 Smart Traders. All rights reserved.
        </p>
      </div>
    </div>
  );
}
