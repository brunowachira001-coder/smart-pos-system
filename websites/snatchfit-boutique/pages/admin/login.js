import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check admin credentials
      if (
        formData.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
        formData.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      ) {
        localStorage.setItem('adminToken', 'admin_token_' + Date.now());
        toast.success('Admin login successful!');
        router.push('/admin/dashboard');
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 p-8 rounded-lg">
          <h1 className="font-display font-bold text-3xl mb-2 text-center">Admin Login</h1>
          <p className="text-gray-400 text-center mb-8">SnatchFit Admin Panel</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
                placeholder="admin@snatchfit.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-accent text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black py-2 rounded-lg font-bold hover:bg-pink-600 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
