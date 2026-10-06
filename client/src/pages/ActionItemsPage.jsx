import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import ActionItem from '../components/ActionItem';
import {
  Search,
  CheckSquare,
  Plus
} from 'lucide-react';

export default function ActionItemsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingsAPI.getAll();
      if (res.success) {
        setMeetings(res.meetings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStatusChange = async (meetingId, itemId, newStatus) => {
    try {
      await meetingsAPI.updateActionItemStatus(meetingId, itemId, { status: newStatus });
      setMeetings((prevMeetings) =>
        prevMeetings.map((m) => {
          if (m._id !== meetingId) return m;
          return {
            ...m,
            actionItems: (m.actionItems || []).map((item) =>
              item._id === itemId ? { ...item, status: newStatus } : item
            )
          };
        })
      );
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Flatten action items with their associated meeting info
  const allActionItems = [];
  meetings.forEach((m) => {
    (m.actionItems || []).forEach((item) => {
      allActionItems.push({
        ...item,
        meetingId: m._id,
        meetingTitle: m.title
      });
    });
  });

  // Apply filters
  const filteredItems = allActionItems.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTask = item.task && item.task.toLowerCase().includes(q);
      const matchOwner = item.owner && item.owner.toLowerCase().includes(q);
      const matchMeeting = item.meetingTitle && item.meetingTitle.toLowerCase().includes(q);
      if (!matchTask && !matchOwner && !matchMeeting) return false;
    }
    return true;
  });

  // Calculate quick metrics
  const total = allActionItems.length;
  const pending = allActionItems.filter((i) => i.status === 'Pending').length;
  const inProgress = allActionItems.filter((i) => i.status === 'In Progress').length;
  const completed = allActionItems.filter((i) => i.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Action Items & Task Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Track and update all tasks extracted from your meeting transcripts.
          </p>
        </div>
      </div>

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
            statusFilter === 'All'
              ? 'border-brand-500 bg-indigo-50/70 dark:bg-brand-950/50 shadow-md ring-1 ring-brand-500/30'
              : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-1 tracking-tight">{total}</p>
        </div>

        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
            statusFilter === 'Pending'
              ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/50 shadow-md ring-1 ring-amber-400/30'
              : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-1 tracking-tight">{pending}</p>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
            statusFilter === 'In Progress'
              ? 'border-sky-400 bg-sky-50/70 dark:bg-sky-950/50 shadow-md ring-1 ring-sky-400/30'
              : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-1 tracking-tight">{inProgress}</p>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm ${
            statusFilter === 'Completed'
              ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-md ring-1 ring-emerald-400/30'
              : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-1 tracking-tight">{completed}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by task description, owner, or meeting title..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-700 dark:text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-[#111827]">All Statuses</option>
              <option value="Pending" className="bg-white dark:bg-[#111827]">Pending</option>
              <option value="In Progress" className="bg-white dark:bg-[#111827]">In Progress</option>
              <option value="Completed" className="bg-white dark:bg-[#111827]">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-700 dark:text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-[#111827]">All Priorities</option>
              <option value="High" className="bg-white dark:bg-[#111827]">High Priority</option>
              <option value="Medium" className="bg-white dark:bg-[#111827]">Medium Priority</option>
              <option value="Low" className="bg-white dark:bg-[#111827]">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] p-5 rounded-xl h-20 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-3xl border border-slate-200 dark:border-[#1E293B] text-center my-6 shadow-sm">
          <CheckSquare className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">No action items found</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto mb-4">
            {allActionItems.length === 0
              ? 'Analyze a meeting transcript to extract your first action items and owners.'
              : 'No items match your active search or filter criteria.'}
          </p>
          {allActionItems.length === 0 && (
            <Link
              to="/meetings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Meeting</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ActionItem
              key={item._id}
              item={item}
              meetingTitle={item.meetingTitle}
              showMeeting={true}
              onStatusChange={(itemId, newStatus) =>
                handleStatusChange(item.meetingId, itemId, newStatus)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

