import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export default function MyProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'themes' | 'app'>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/profile/index?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (response.ok && data.profile) {
        setProfile(data.profile);
        setFormData({
          full_name: data.profile.full_name,
          email: data.profile.email,
          phone: data.profile.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const response = await fetch('/api/profile/index', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id, ...formData })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile?.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2 text-[var(--text-primary)]">Settings & Profile</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your account settings, profile information, and theme preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'themes'
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🎨 Themes
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'app'
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            ⚙️ App
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && profile && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-12 max-w-2xl mx-auto">
            {/* Avatar Section - Centered */}
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getInitials(profile.full_name)}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--card-bg)] hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Name and Email */}
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{profile.full_name}</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-8">{profile.email}</p>

              {/* Role and Member Since - Side by Side */}
              <div className="flex gap-16 w-full justify-center mb-8">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-medium">Role</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{profile.role}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-medium">Member Since</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(profile.created_at)}</p>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-white text-gray-900 px-8 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
              >
                Change Password
              </button>
            </div>
          </div>
        )}

        {/* Themes Tab Content */}
        {activeTab === 'themes' && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-6 text-center text-[var(--text-primary)]">Theme Preferences</h3>
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Dark Mode</p>
                  <p className="text-sm text-[var(--text-secondary)]">Use dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-sm text-[var(--text-secondary)] text-center mt-4">
                More theme options coming soon...
              </p>
            </div>
          </div>
        )}

        {/* App Tab Content */}
        {activeTab === 'app' && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-6 text-center text-[var(--text-primary)]">App Settings</h3>
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <p className="font-medium text-[var(--text-primary)] mb-3">Notifications</p>
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-primary)]">Email notifications</span>
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-primary)]">Push notifications</span>
                  <input type="checkbox" className="w-4 h-4 accent-emerald-600" defaultChecked />
                </label>
              </div>
              <p className="text-sm text-[var(--text-secondary)] text-center mt-4">
                More app settings coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
