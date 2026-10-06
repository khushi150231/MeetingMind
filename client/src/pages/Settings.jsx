import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import {
  User,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  Sun,
  Moon,
  Palette,
  Check,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Name cannot be empty');
      return;
    }

    setSavingSettings(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await authAPI.updateSettings({
        name: name.trim()
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Manage your account profile, workspace appearance, and AI engine preferences.
        </p>
      </div>

      {/* Notification banners */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs sm:text-sm animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Section 1: Account Profile */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-5 transition-colors"
      >
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Profile Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Your personal details and workspace display identity.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#F8FAFC] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#F8FAFC]">
                Email Address
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Account</span>
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-[#0B1020]/60 border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Email address is linked to your account authentication and cannot be changed directly.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings || name.trim() === (user?.name || '')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Section 2: Workspace Appearance / Theme */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-5 transition-colors">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Workspace Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Choose between light and dark visual themes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Selector Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
              theme === 'light'
                ? 'border-brand-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-brand-500/30 shadow-sm'
                : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0B1020]/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              {theme === 'light' && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Light Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Clean white backgrounds with vibrant Indigo & Blue accents.
              </p>
            </div>
          </button>

          {/* Dark Mode Selector Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
              theme === 'dark'
                ? 'border-brand-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-brand-500/30 shadow-sm'
                : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0B1020]/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-950/70 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-xs">
                <Moon className="w-4 h-4 text-indigo-300" />
              </div>
              {theme === 'dark' && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Dark Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Deep navy backgrounds (#0B1020) crafted for focused low-light work.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Section 3: AI Engine Connection Status (User-Facing & Clean) */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600/10 to-violet-600/10 dark:from-brand-600/20 dark:to-violet-600/20 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-xs">
              <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                Gemini AI Intelligence
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Enterprise-grade multimodal intelligence powering your workspace.
              </p>
            </div>
          </div>

          {/* Simple "Connected" indicator */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Connected</span>
          </span>
        </div>

        {/* Feature summary card */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#0B1020]/60 border border-slate-200/80 dark:border-[#1E293B] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-[#F8FAFC]">
            <Zap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Active Automated Capabilities</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Executive transcript summarization</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Automated action item & task assignment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Key decision detection & follow-ups</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Structured insights & participant notes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
