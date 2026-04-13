import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display font-bold text-4xl mb-12">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="font-bold text-xl mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-bold">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-bold">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <p className="font-bold capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <a href="/orders" className="block bg-accent text-black py-3 rounded-lg font-bold hover:bg-pink-600 transition text-center">
              View Orders
            </a>
            <a href="/shop" className="block border-2 border-gray-300 py-3 rounded-lg font-bold hover:border-accent transition text-center">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
