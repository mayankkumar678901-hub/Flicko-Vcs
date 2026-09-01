'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';
import ContributionCalendar from '@/components/ContributionCalendar';
import { useTheme, MOOD_THEMES } from '@/context/ThemeContext';
import { User as UserIcon, Mail, Key, ShieldCheck, Check, Save, Settings, Folder, Calendar, Plus, GitBranch, Lock, Globe, Palette, Sparkles } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { theme, setTheme } = useTheme();

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
    const token = localStorage.getItem('vcs_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const u = res.data.user;
      setUser(u);
      setEmail(u.email || '');
      setAvatarUrl(u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`);
    } catch (err) {
      localStorage.removeItem('vcs_token');
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

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Settings className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Account Settings & Profile</h1>
            <p className="text-slate-400 text-[11px]">Manage personal profile, mood themes, and repositories</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Mood Themes Customizer Section (Compact Grid) */}
      <div className="bg-[#121722] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-white">Personal Mood Themes</h3>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
            {MOOD_THEMES.find(t => t.id === theme)?.emoji} Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-0.5">
          {MOOD_THEMES.map((t) => {
            const isSelected = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-2 rounded-lg text-center transition flex flex-col items-center justify-between space-y-1.5 group ${
                  isSelected
                    ? 'bg-slate-800/95 border-2 border-sky-400 shadow-md shadow-sky-500/10 scale-[1.02]'
                    : 'bg-[#0a0d14] border border-slate-800/90 hover:border-slate-700'
                }`}
                title={t.tagline}
              >
                <div className="flex items-center justify-center text-sm">
                  <span>{t.emoji}</span>
                </div>

                <span className="font-bold text-[11px] text-white group-hover:text-sky-300 transition truncate w-full">
                  {t.name}
                </span>

                <div className="flex items-center space-x-1 pt-0.5">
                  {t.previewColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="w-2 h-2 rounded-full border border-slate-900 shadow-sm"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Progress Calendar Tracker */}
      <ContributionCalendar username={user.username} />

      {/* Profile & Settings Grid (Compact) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Profile Card */}
        <div className="bg-[#121722] border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-3 shadow-xl h-fit">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-500/50 shadow-md"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">{user.username}</h2>
            <p className="text-slate-400 text-[11px] font-mono">{user.email}</p>
          </div>

          <div className="w-full pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-sky-400" />
                <span>Joined</span>
              </span>
              <span className="text-white font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Folder className="w-3 h-3 text-emerald-400" />
                <span>Repos</span>
              </span>
              <span className="text-white font-medium">{user.repositories?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-[#121722] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-1.5">Profile Information</h3>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  value={user.username}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg py-1.5 px-3 text-xs cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  Avatar Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 bg-[#0a0d14] border border-slate-700 text-white rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-sky-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeAvatar}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
                  >
                    Random
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-white border-b border-slate-800 pb-1.5">Change Password (Optional)</h3>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Required only if changing password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  New Password (8+ chars, numbers & symbols)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-700 text-white rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Your Repositories Section (Compact) */}
      <div className="bg-[#121722] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white">Your Repositories</h3>
          </div>
          <Link
            href="/new"
            className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] px-2.5 py-1 rounded-lg font-semibold hover:brightness-110 shadow transition"
          >
            <Plus className="w-3 h-3" />
            <span>New Repo</span>
          </Link>
        </div>

        {user.repositories && user.repositories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {user.repositories.map((repo: any) => (
              <Link
                key={repo.id}
                href={`/${user.username}/${repo.name}`}
                className="p-3 bg-[#0a0d14] border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between group transition shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs group-hover:text-sky-400 transition">
                      {repo.name}
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-700">
                      {repo.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-800/80">
                  <span className="flex items-center space-x-1">
                    <GitBranch className="w-3 h-3 text-sky-400" />
                    <span>{repo.defaultBranch}</span>
                  </span>
                  <span>•</span>
                  <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            You don't have any repositories yet. Click <strong>New Repo</strong> to create one!
          </div>
        )}
      </div>
    </div>
  );
}
