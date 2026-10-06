import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Settings,
  PlusCircle,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Meetings', path: '/meetings', icon: Calendar },
    { label: 'Action Items', path: '/action-items', icon: CheckSquare },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0B1020] border-r border-slate-200/80 dark:border-[#1E293B] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex items-center justify-between lg:hidden border-b border-slate-100 dark:border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">MeetingMind</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-slate-100 dark:hover:bg-[#151B2E] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <NavLink
            to="/meetings/new"
            onClick={() => onClose && onClose()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition group"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>+ New Meeting</span>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border-l-2 border-brand-600 shadow-sm pl-3 font-semibold'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] hover:bg-slate-100/70 dark:hover:bg-[#151B2E] font-medium'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* AI Engine Status Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 dark:from-[#111827] dark:via-[#111827] dark:to-[#151B2E] border border-indigo-100/90 dark:border-[#1E293B] shadow-sm">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Gemini AI Engine</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            Extracts summaries, decisions & tasks with owners and deadlines.
          </p>
        </div>
      </aside>
    </>
  );
}

