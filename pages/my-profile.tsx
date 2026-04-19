import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { applyTheme, getCurrentTheme } from '../lib/themes';

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
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'themes' | 'app'>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    setCurrentTheme(getCurrentTheme());
  }, []);

  const handleApplyTheme = (theme: string) => {
    applyTheme(theme as any);
    setCurrentTheme(theme);
    alert(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied successfully!`);
  };

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchProfile();
    } else if (!authLoading && !user) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setProfile({
            id: parsedUser.id || '1',
            full_name: parsedUser.username || 'User',
            email: parsedUser.email || '',
            role: 'Admin',
            created_at: new Date().toISOString()
          });
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      setLoading(false);
    }
  }, [authLoading, user?.email]);

  const fetchProfile = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.profile) {
        setProfile(data.profile);
      } else {
        setProfile({
          id: user.id || '1',
          full_name: user.username || user.firstName || 'User',
          email: user.email,
          role: 'Admin',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (user) {
        setProfile({
          id: user.id || '1',
          full_name: user.username || user.firstName || 'User',
          email: user.email,
          role: 'Admin',
          created_at: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || ''
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      console.log('Updating profile with data:', {
        id: profile.id,
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone
      });

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone
        })
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok && data.profile) {
        setProfile(data.profile);
        
        // Update localStorage user data
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.username = editForm.full_name;
          parsedUser.email = editForm.email;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        
        setShowEditModal(false);
        alert('Profile updated successfully!');
        
        // Reload page to update sidebar/topbar
        setTimeout(() => window.location.reload(), 500);
      } else {
        console.error('Update failed:', data);
        alert('Failed to update profile: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error instanceof Error ? error.message : 'Network error'));
    } finally {
      setSaving(false);
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

  const ThemeCard = ({ name, description, icon, preview, accentColor, isActive, onApply }: {
    name: string;
    description: string;
    icon: string;
    preview: string;
    accentColor: string;
    isActive: boolean;
    onApply: () => void;
  }) => (
    <div className={`bg-[var(--bg-secondary)] border-2 ${isActive ? 'border-emerald-500' : 'border-[var(--border-color)]'} rounded-lg p-4 transition-all hover:border-emerald-400`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h4 className="font-semibold text-[var(--text-primary)]">{name}</h4>
        </div>
        {isActive && (
          <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
            ✓ Active
          </span>
        )}
      </div>
      
      <p className="text-xs text-[var(--text-secondary)] mb-4">{description}</p>
      
      {/* Theme Preview */}
      <div className={`${preview} rounded-lg p-4 mb-4 border border-gray-700`}>
        <div className="space-y-2">
          <div className="h-2 bg-gray-600 rounded w-3/4"></div>
          <div className={`h-2 ${accentColor} rounded w-1/2`}></div>
          <div className="h-2 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          disabled={isActive}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
        >
          {isActive ? 'Currently Active' : 'Apply'}
        </button>
        <button className="px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-sm hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]">
          Preview
        </button>
      </div>
    </div>
  );

  if (authLoading || (loading && !profile)) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Unable to load profile data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-semibold tracking-tight mb-2 text-[var(--text-primary)]">Settings & Profile</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage your account settings, profile information, and theme preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-4">
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
        {activeTab === 'profile' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-12 w-full max-w-2xl">
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleEditClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-white text-gray-900 px-8 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm border border-gray-300"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Themes Tab Content */}
        {activeTab === 'themes' && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Choose from our collection of professional themes designed for optimal readability
              </p>
            </div>

            {/* Theme Grid - 2 rows of 3 - fills available space */}
            <div className="flex-1 grid grid-cols-3 gap-6 mb-4 content-start">
              {/* Light Theme */}
              <ThemeCard
                name="Light"
                description="Clean and bright theme for daytime use"
                icon="☀️"
                preview="bg-white"
                accentColor="bg-blue-500"
                isActive={currentTheme === 'light'}
                onApply={() => handleApplyTheme('light')}
              />

              {/* Dark Theme */}
              <ThemeCard
                name="Dark"
                description="Sleek dark theme for low-light environments"
                icon="🌙"
                preview="bg-gray-900"
                accentColor="bg-emerald-500"
                isActive={currentTheme === 'dark'}
                onApply={() => handleApplyTheme('dark')}
              />

              {/* Blue Professional */}
              <ThemeCard
                name="Blue Professional"
                description="Professional blue theme for business environments"
                icon="💼"
                preview="bg-blue-950"
                accentColor="bg-blue-400"
                isActive={currentTheme === 'blue'}
                onApply={() => handleApplyTheme('blue')}
              />

              {/* Ocean */}
              <ThemeCard
                name="Ocean"
                description="Calming ocean-inspired theme with cyan accents"
                icon="🌊"
                preview="bg-cyan-950"
                accentColor="bg-cyan-400"
                isActive={currentTheme === 'ocean'}
                onApply={() => handleApplyTheme('ocean')}
              />

              {/* Forest */}
              <ThemeCard
                name="Forest"
                description="Natural forest theme with green tones"
                icon="🌲"
                preview="bg-green-950"
                accentColor="bg-green-400"
                isActive={currentTheme === 'forest'}
                onApply={() => handleApplyTheme('forest')}
              />

              {/* System */}
              <ThemeCard
                name="System"
                description="Adapts to your system's theme preference"
                icon="💻"
                preview="bg-slate-800"
                accentColor="bg-slate-400"
                isActive={currentTheme === 'system'}
                onApply={() => handleApplyTheme('system')}
              />
            </div>

            {/* Theme Features - Simple bottom text */}
            <div className="text-center pt-4 border-t border-[var(--border-color)] mt-auto">
              <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Theme Features</h4>
              <div className="flex justify-center gap-12 text-sm text-[var(--text-secondary)]">
                <span>✓ High contrast ratios</span>
                <span>✓ Consistent color schemes</span>
                <span>✓ Accessibility focused</span>
                <span>✓ Professional appearance</span>
              </div>
            </div>
          </div>
        )}

        {/* App Tab Content */}
        {activeTab === 'app' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-8 w-full max-w-2xl">
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Change Password</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Password change functionality coming soon');
              setShowPasswordModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
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
