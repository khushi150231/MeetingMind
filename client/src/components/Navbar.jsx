import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  Sparkles,
  Plus,
  LogOut,
  User,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasApiKey = user?.hasCustomApiKey || user?.hasServerApiKey;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E293B] px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-100 dark:hover:bg-[#151B2E] transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Meeting<span className="text-brand-600 dark:text-brand-400">Mind</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 rounded-md">
              AI Workspace
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Polished AI Key Status Pill */}
        <Link
          to="/settings"
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
            hasApiKey
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
          }`}
          title={hasApiKey ? 'Gemini AI API configured' : 'Configure Gemini API key'}
        >
          {hasApiKey ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>AI Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Set AI Key</span>
            </>
          )}
        </Link>

        {/* New Meeting CTA Button */}
        <Link
          to="/meetings/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Meeting</span>
        </Link>

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#151B2E] border border-transparent hover:border-slate-200 dark:hover:border-[#1E293B] transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-100 to-violet-100 dark:from-brand-950 dark:to-violet-950 border border-brand-200/80 dark:border-brand-700/60 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:block text-xs font-medium text-slate-700 dark:text-[#94A3B8] max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] shadow-xl dark:shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#1E293B]">
                  <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#151B2E] transition"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span>Settings & API Key</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-[#1E293B]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

