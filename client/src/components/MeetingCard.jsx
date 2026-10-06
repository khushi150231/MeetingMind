import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Lightbulb,
  Users,
  Trash2,
  ArrowRight
} from 'lucide-react';

export default function MeetingCard({ meeting, onDelete }) {
  const statusStyles = {
    Processed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    Processing: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 animate-pulse',
    Draft: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    Failed: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
  };

  const formattedDate = meeting.date
    ? new Date(meeting.date).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })
    : 'Unknown Date';

  const actionCount = meeting.actionItems ? meeting.actionItems.length : 0;
  const decisionsCount = meeting.decisions ? meeting.decisions.length : 0;

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-lg dark:hover:shadow-brand-500/10 rounded-2xl p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group relative">
      <div>
        {/* Top row: Status and Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              statusStyles[meeting.status] || statusStyles.Draft
            }`}
          >
            {meeting.status === 'Processing' ? 'AI Processing...' : meeting.status}
          </span>

          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Meeting Title */}
        <Link
          to={`/meetings/${meeting._id}`}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1 block mb-2"
        >
          {meeting.title}
        </Link>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed mb-3.5">
          {meeting.summary || (meeting.transcript ? meeting.transcript.slice(0, 140) + '...' : 'No transcript preview available.')}
        </p>

        {/* Participants snippet */}
        {meeting.participants && meeting.participants.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8] mb-3.5 overflow-hidden">
            <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{meeting.participants.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Footer: Stats & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-[#94A3B8] font-medium">
          <span className="flex items-center gap-1" title={`${actionCount} Action Items`}>
            <CheckSquare className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>{actionCount} {actionCount === 1 ? 'Action' : 'Actions'}</span>
          </span>
          <span className="flex items-center gap-1" title={`${decisionsCount} Decisions`}>
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{decisionsCount} {decisionsCount === 1 ? 'Decision' : 'Decisions'}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(meeting._id, meeting.title);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Delete meeting"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <Link
            to={`/meetings/${meeting._id}`}
            className="p-1.5 text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#151B2E] transition flex items-center"
            title="Open meeting details"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

