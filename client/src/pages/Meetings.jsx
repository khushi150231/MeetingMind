import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import MeetingCard from '../components/MeetingCard';
import {
  Search,
  Plus,
  FolderOpen,
  X
} from 'lucide-react';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        sort: sortBy,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const res = await meetingsAPI.getAll(params);
      if (res.success) {
        setMeetings(res.meetings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetings();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sortBy, dateFrom, dateTo]);

  const handleDeleteMeeting = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await meetingsAPI.delete(id);
      fetchMeetings();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setSortBy('newest');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    search || statusFilter !== 'All' || sortBy !== 'newest' || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Meetings History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Search, filter, and review all your team transcripts and AI analyses.
          </p>
        </div>

        <Link
          to="/meetings/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Meeting</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meetings by title, transcript keywords, or summary..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-700 dark:text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-[#111827]">All Statuses</option>
              <option value="Processed" className="bg-white dark:bg-[#111827]">Processed</option>
              <option value="Draft" className="bg-white dark:bg-[#111827]">Draft</option>
              <option value="Processing" className="bg-white dark:bg-[#111827]">Processing</option>
              <option value="Failed" className="bg-white dark:bg-[#111827]">Failed</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-700 dark:text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] cursor-pointer"
            >
              <option value="newest" className="bg-white dark:bg-[#111827]">Sort: Newest First</option>
              <option value="oldest" className="bg-white dark:bg-[#111827]">Sort: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-[#1E293B] text-xs">
          <span className="text-slate-500 dark:text-[#94A3B8] font-medium">Date Range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-700 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-brand-500"
            title="From Date"
          />
          <span className="text-slate-400 dark:text-slate-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-700 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-brand-500"
            title="To Date"
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Meetings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl h-52 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-3xl border border-slate-200 dark:border-[#1E293B] text-center my-6 shadow-sm">
          <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">No meetings found</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto mb-5">
            {hasActiveFilters
              ? 'Try adjusting your search criteria or clearing your filters.'
              : 'Create a new meeting to upload your first transcript and start extracting action items.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-100 dark:bg-[#151B2E] hover:bg-slate-200 dark:hover:bg-[#1e293b] text-slate-700 dark:text-[#F8FAFC] text-xs font-semibold rounded-xl transition"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              to="/meetings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Meeting</span>
            </Link>
          )}
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-3 font-semibold">
            Showing {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                onDelete={handleDeleteMeeting}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

