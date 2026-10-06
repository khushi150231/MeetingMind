import React from 'react';
import {
  CheckCircle2,
  Clock,
  User,
  Calendar
} from 'lucide-react';

export default function ActionItem({
  item,
  onStatusChange,
  meetingTitle,
  showMeeting = false
}) {
  const priorityStyles = {
    High: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    Medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    Low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
  };

  const statusStyles = {
    Completed: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    'In Progress': 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
    Pending: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
  };

  const isCompleted = item.status === 'Completed';

  return (
    <div
      className={`bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all duration-200 ${
        isCompleted
          ? 'opacity-75 bg-slate-50/80 dark:bg-[#0B1020]/60 border-slate-200 dark:border-[#1E293B]'
          : 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Quick status check button */}
        <button
          onClick={() => {
            const nextStatus =
              item.status === 'Completed'
                ? 'Pending'
                : item.status === 'Pending'
                ? 'In Progress'
                : 'Completed';
            onStatusChange && onStatusChange(item._id, nextStatus);
          }}
          className={`mt-0.5 p-1 rounded-lg border transition ${
            isCompleted
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
          title={`Click to cycle status (Current: ${item.status})`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] break-words ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {item.task}
          </p>

          {showMeeting && meetingTitle && (
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5 truncate">
              {meetingTitle}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Owner badge */}
            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#94A3B8] bg-slate-100 dark:bg-[#0B1020] px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-[#1E293B]">
              <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>{item.owner || 'Unassigned'}</span>
            </span>

            {/* Deadline badge */}
            {item.deadline && (
              <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#94A3B8] bg-slate-100 dark:bg-[#0B1020] px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-[#1E293B]">
                <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>{item.deadline}</span>
              </span>
            )}

            {/* Priority pill */}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-lg font-medium border ${
                priorityStyles[item.priority] || priorityStyles.Medium
              }`}
            >
              {item.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Status selector */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        <select
          value={item.status || 'Pending'}
          onChange={(e) => onStatusChange && onStatusChange(item._id, e.target.value)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer ${
            statusStyles[item.status] || statusStyles.Pending
          }`}
        >
          <option value="Pending" className="bg-white dark:bg-[#111827] text-amber-700 dark:text-amber-400">
            Pending
          </option>
          <option value="In Progress" className="bg-white dark:bg-[#111827] text-sky-700 dark:text-sky-400">
            In Progress
          </option>
          <option value="Completed" className="bg-white dark:bg-[#111827] text-emerald-700 dark:text-emerald-400">
            Completed
          </option>
        </select>
      </div>
    </div>
  );
}

