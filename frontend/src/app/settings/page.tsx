'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';
import { User as UserIcon, Mail, Key, ShieldCheck, Check, Save, Settings, Folder, Calendar } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      const u = res.data.user;
      setUser(u);
      setEmail(u.email);
      setAvatarUrl(u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put('/auth/profile', {
        email,
        avatarUrl,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setUser((prev: any) => ({ ...prev, ...res.data.user }));
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading user profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Title Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <Settings className="w-6 h-6 text-sky-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Account Settings & Profile</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage your personal profile details, avatar, and security</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl h-fit">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-24 h-24 rounded-full bg-slate-900 border-2 border-indigo-500/50 shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{user.username}</h2>
            <p className="text-slate-400 text-xs font-mono">{user.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Joined</span>
              </span>
              <span className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Folder className="w-3.5 h-3.5 text-emerald-400" />
                <span>Repositories</span>
              </span>
              <span className="text-white font-medium">{user.repositories?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-[#121722] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Profile Information</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  value={user.username}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg p-2.5 text-sm cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">Usernames cannot be changed.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Avatar Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 bg-[#0a0d14] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-400 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition"
                  >
                    Randomize
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">Change Password (Optional)</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Required only if changing password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:brightness-110 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
