import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { meetingsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import MeetingCard from '../components/MeetingCard';
import ActionItem from '../components/ActionItem';
import {
  Calendar,
  CheckCircle,
  Clock,
  CheckSquare,
  Sparkles,
  Plus,
  ArrowRight,
  FolderOpen
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMeetings: 0,
    processedMeetings: 0,
    pendingActionItems: 0,
    completedActionItems: 0,
    inProgressActionItems: 0
  });
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, meetingsRes] = await Promise.all([
        meetingsAPI.getDashboardStats(),
        meetingsAPI.getAll({ limit: 5 })
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (meetingsRes.success) {
        setAllMeetings(meetingsRes.meetings);
        setRecentMeetings(meetingsRes.meetings.slice(0, 5));
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteMeeting = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await meetingsAPI.delete(id);
      fetchDashboardData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleActionStatusChange = async (meetingId, itemId, newStatus) => {
    try {
      await meetingsAPI.updateActionItemStatus(meetingId, itemId, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Extract pending tasks from loaded meetings for quick display
  const topPendingTasks = [];
  allMeetings.forEach((m) => {
    (m.actionItems || []).forEach((item) => {
      if (item.status !== 'Completed' && topPendingTasks.length < 5) {
        topPendingTasks.push({ item, meeting: m });
      }
    });
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/80 dark:from-[#111827] dark:via-[#111827] dark:to-[#151B2E] p-6 sm:p-8 rounded-3xl border border-indigo-100/90 dark:border-[#1E293B] relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-indigo-200/80 dark:border-brand-800/60 inline-flex items-center gap-1.5 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>AI Meeting Workspace</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Hello, <span className="text-brand-600 dark:text-brand-400">{user?.name || 'Explorer'}</span> 👋
          </h1>
          <p className="text-slate-600 dark:text-[#94A3B8] text-xs sm:text-sm mt-2 leading-relaxed">
            Upload or paste meeting transcripts to extract structured summaries, key decisions, and actionable task owners instantly.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              to="/meetings/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Meeting</span>
            </Link>

            <Link
              to="/meetings"
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#151B2E] text-slate-700 dark:text-[#94A3B8] text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm transition"
            >
              <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>View All Meetings</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Meetings"
          value={loading ? '...' : stats.totalMeetings}
          icon={Calendar}
          color="brand"
          subtext="Saved in your workspace"
        />
        <StatCard
          title="Meetings Processed"
          value={loading ? '...' : stats.processedMeetings}
          icon={Sparkles}
          color="violet"
          subtext="Structured with AI"
        />
        <StatCard
          title="Pending Actions"
          value={loading ? '...' : stats.pendingActionItems}
          icon={Clock}
          color="amber"
          subtext="Requiring team action"
        />
        <StatCard
          title="Completed Actions"
          value={loading ? '...' : stats.completedActionItems}
          icon={CheckCircle}
          color="emerald"
          subtext="Successfully resolved"
        />
      </div>

      {/* Main Grid: Recent Meetings + Quick Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Meetings (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Recent Meetings</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Your latest transcribed sessions</p>
            </div>
            <Link
              to="/meetings"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] p-6 rounded-2xl h-44 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : recentMeetings.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl border border-slate-200 dark:border-[#1E293B] text-center shadow-sm">
              <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">No meetings created yet</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-sm mx-auto mb-4">
                Get started by creating your first meeting and pasting or uploading a transcript.
              </p>
              <Link
                to="/meetings/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Meeting</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting._id}
                  meeting={meeting}
                  onDelete={handleDeleteMeeting}
                />
              ))}
            </div>
          )}
        </div>

        {/* Priority Pending Action Items (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">Active Tasks</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Assigned action items</p>
            </div>
            <Link
              to="/action-items"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 group"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {topPendingTasks.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] text-center shadow-sm">
              <CheckSquare className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">All caught up! No active tasks pending.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topPendingTasks.map(({ item, meeting }) => (
                <ActionItem
                  key={item._id}
                  item={item}
                  meetingTitle={meeting.title}
                  showMeeting={true}
                  onStatusChange={(itemId, newStatus) =>
                    handleActionStatusChange(meeting._id, itemId, newStatus)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

