import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { meetingsAPI, aiAPI } from '../services/api';
import ActionItem from '../components/ActionItem';
import LoadingState from '../components/LoadingState';
import {
  Calendar,
  Users,
  Sparkles,
  CheckCircle,
  Lightbulb,
  Clock,
  FileText,
  Edit3,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editParticipants, setEditParticipants] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editKeyPoints, setEditKeyPoints] = useState([]);
  const [editDecisions, setEditDecisions] = useState([]);
  const [editActionItems, setEditActionItems] = useState([]);
  const [editFollowUps, setEditFollowUps] = useState([]);

  // Transcript drawer toggle
  const [showTranscript, setShowTranscript] = useState(false);

  // AI Re-analysis loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await meetingsAPI.getById(id);
      if (res.success && res.meeting) {
        setMeeting(res.meeting);
        initEditState(res.meeting);
      }
    } catch (err) {
      setError(err.message || 'Failed to load meeting details');
    } finally {
      setLoading(false);
    }
  };

  const initEditState = (m) => {
    setEditTitle(m.title || '');
    setEditDate(m.date ? new Date(m.date).toISOString().split('T')[0] : '');
    setEditParticipants((m.participants || []).join(', '));
    setEditSummary(m.summary || '');
    setEditKeyPoints(m.keyPoints ? [...m.keyPoints] : []);
    setEditDecisions(m.decisions ? [...m.decisions] : []);
    setEditActionItems(
      m.actionItems
        ? m.actionItems.map((a) => ({
            _id: a._id,
            task: a.task,
            owner: a.owner || '',
            deadline: a.deadline || '',
            priority: a.priority || 'Medium',
            status: a.status || 'Pending'
          }))
        : []
    );
    setEditFollowUps(m.followUps ? [...m.followUps] : []);
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  // Handle single action item status toggle from view mode
  const handleActionStatusChange = async (itemId, newStatus) => {
    try {
      const res = await meetingsAPI.updateActionItemStatus(id, itemId, { status: newStatus });
      if (res.success && res.meeting) {
        setMeeting(res.meeting);
        initEditState(res.meeting);
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Handle AI analysis / re-analysis
  const handleTriggerAnalysis = async () => {
    if (!meeting?.transcript) {
      alert('This meeting has no transcript to analyze.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await aiAPI.analyzeMeeting(id, meeting.transcript);
      if (res.success && res.meeting) {
        setMeeting(res.meeting);
        initEditState(res.meeting);
      }
    } catch (err) {
      alert(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save changes from Edit Mode
  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const payload = {
        title: editTitle,
        date: editDate,
        participants: editParticipants,
        summary: editSummary,
        keyPoints: editKeyPoints.filter((k) => k.trim()),
        decisions: editDecisions.filter((d) => d.trim()),
        actionItems: editActionItems.filter((a) => a.task.trim()),
        followUps: editFollowUps.filter((f) => f.trim()),
        status: 'Processed'
      };

      const res = await meetingsAPI.update(id, payload);
      if (res.success && res.meeting) {
        setMeeting(res.meeting);
        initEditState(res.meeting);
        setIsEditing(false);
      }
    } catch (err) {
      alert(`Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!window.confirm(`Are you sure you want to delete "${meeting.title}"?`)) return;
    try {
      await meetingsAPI.delete(id);
      navigate('/meetings');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCopySummary = () => {
    if (!meeting) return;
    const textReport = `
# MeetingMind Summary: ${meeting.title}
Date: ${new Date(meeting.date).toLocaleDateString()}
Participants: ${(meeting.participants || []).join(', ')}

## Summary
${meeting.summary}

## Key Points
${(meeting.keyPoints || []).map((k) => `• ${k}`).join('\n')}

## Decisions
${(meeting.decisions || []).map((d) => `✓ ${d}`).join('\n')}

## Action Items
${(meeting.actionItems || [])
  .map(
    (a) =>
      `[${a.status}] ${a.task} (Owner: ${a.owner || 'Unassigned'}, Deadline: ${
        a.deadline || 'None'
      }, Priority: ${a.priority})`
  )
  .join('\n')}

## Follow-ups
${(meeting.followUps || []).map((f) => `• ${f}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !meeting) {
    return <LoadingState title="Loading meeting details..." />;
  }

  if (error || !meeting) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center my-6 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">Meeting Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || 'This meeting could not be loaded.'}</p>
        <Link
          to="/meetings"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
        >
          Back to Meetings
        </Link>
      </div>
    );
  }

  const formattedDate = meeting.date
    ? new Date(meeting.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Unknown Date';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Back Navigation and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meetings</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Report */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#94A3B8] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#151B2E] rounded-xl border border-slate-200 dark:border-[#1E293B] shadow-sm transition"
            title="Copy formatted markdown report"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {/* Re-analyze with AI */}
          <button
            onClick={handleTriggerAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/50 border border-brand-200/80 dark:border-brand-800/60 rounded-xl transition disabled:opacity-50 shadow-xs"
            title="Re-run AI processing on transcript"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Regenerate AI'}</span>
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition shadow-xs ${
              isEditing
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#151B2E] text-slate-700 dark:text-[#94A3B8] border border-slate-200 dark:border-[#1E293B]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{isEditing ? 'Exit Edit' : 'Edit Analysis'}</span>
          </button>

          {/* Delete Meeting */}
          <button
            onClick={handleDeleteMeeting}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60 transition"
            title="Delete meeting"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Analyzing banner if in progress */}
      {isAnalyzing && (
        <LoadingState
          isAiProcessing={true}
          title="Regenerating AI Analysis..."
          description="Processing transcript through Gemini to update summary, decisions, and action items."
        />
      )}

      {/* Header Info Banner */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-lg font-bold text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white dark:focus:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-1">
                  Participants
                </label>
                <input
                  type="text"
                  value={editParticipants}
                  onChange={(e) => setEditParticipants(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white dark:focus:bg-[#0B1020]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  meeting.status === 'Processed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                }`}
              >
                {meeting.status}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{formattedDate}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {meeting.title}
            </h1>

            {meeting.participants && meeting.participants.length > 0 && (
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 dark:text-[#94A3B8]">
                <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-500 dark:text-[#94A3B8]">Participants:</span>
                <span>{meeting.participants.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Sections with Distinct Subtle Accent Indicators */}
      <div className="space-y-6">
        {/* Section 1: Executive Summary (Indigo Accent Indicator) */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-summary-accent shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Executive Summary</span>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-indigo-200/80 dark:border-brand-800/60">
              AI Generated
            </span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full p-3 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] leading-relaxed"
            />
          ) : (
            <p className="text-slate-800 dark:text-[#F8FAFC] text-sm sm:text-base leading-relaxed">
              {meeting.summary || 'No summary generated yet. Click "Regenerate AI" to analyze.'}
            </p>
          )}
        </div>

        {/* Section 2: Key Discussion Points (Violet Accent Indicator) */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-keypoints-accent shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Key Discussion Points</span>
            </div>
            {isEditing && (
              <button
                onClick={() => setEditKeyPoints([...editKeyPoints, ''])}
                className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Point
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {editKeyPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const updated = [...editKeyPoints];
                      updated[idx] = e.target.value;
                      setEditKeyPoints(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white dark:focus:bg-[#0B1020]"
                  />
                  <button
                    onClick={() => setEditKeyPoints(editKeyPoints.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {(meeting.keyPoints && meeting.keyPoints.length > 0 ? meeting.keyPoints : ['No discussion points extracted.']).map(
                (point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-[#F8FAFC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                )
              )}
            </ul>
          )}
        </div>

        {/* Section 3: Important Decisions (Emerald Accent Indicator) */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-decisions-accent shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Decisions Made</span>
            </h2>
            {isEditing && (
              <button
                onClick={() => setEditDecisions([...editDecisions, ''])}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Decision
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {editDecisions.map((dec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dec}
                    onChange={(e) => {
                      const updated = [...editDecisions];
                      updated[idx] = e.target.value;
                      setEditDecisions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0B1020]"
                  />
                  <button
                    onClick={() => setEditDecisions(editDecisions.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(meeting.decisions && meeting.decisions.length > 0 ? meeting.decisions : ['No formal decisions recorded.']).map(
                (dec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#0B1020]/70 border border-slate-200/90 dark:border-[#1E293B] flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-[#F8FAFC]">{dec}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Section 4: Action Items & Ownership (Amber Accent Indicator) */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-actions-accent shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Action Items & Ownership
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Tasks assigned with designated owners, deadlines, and priorities.
              </p>
            </div>
            {isEditing && (
              <button
                onClick={() =>
                  setEditActionItems([
                    ...editActionItems,
                    { task: '', owner: '', deadline: '', priority: 'Medium', status: 'Pending' }
                  ])
                }
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              {editActionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/70 dark:bg-[#0B1020]/70 border border-slate-200 dark:border-[#1E293B] rounded-xl space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Task description"
                      value={item.task}
                      onChange={(e) => {
                        const updated = [...editActionItems];
                        updated[idx].task = e.target.value;
                        setEditActionItems(updated);
                      }}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      onClick={() =>
                        setEditActionItems(editActionItems.filter((_, i) => i !== idx))
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Owner"
                      value={item.owner || ''}
                      onChange={(e) => {
                        const updated = [...editActionItems];
                        updated[idx].owner = e.target.value;
                        setEditActionItems(updated);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC]"
                    />
                    <input
                      type="text"
                      placeholder="Deadline"
                      value={item.deadline || ''}
                      onChange={(e) => {
                        const updated = [...editActionItems];
                        updated[idx].deadline = e.target.value;
                        setEditActionItems(updated);
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC]"
                    />
                    <select
                      value={item.priority}
                      onChange={(e) => {
                        const updated = [...editActionItems];
                        updated[idx].priority = e.target.value;
                        setEditActionItems(updated);
                      }}
                      className="px-2 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC]"
                    >
                      <option value="High" className="bg-white dark:bg-[#111827]">High</option>
                      <option value="Medium" className="bg-white dark:bg-[#111827]">Medium</option>
                      <option value="Low" className="bg-white dark:bg-[#111827]">Low</option>
                    </select>
                    <select
                      value={item.status}
                      onChange={(e) => {
                        const updated = [...editActionItems];
                        updated[idx].status = e.target.value;
                        setEditActionItems(updated);
                      }}
                      className="px-2 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC]"
                    >
                      <option value="Pending" className="bg-white dark:bg-[#111827]">Pending</option>
                      <option value="In Progress" className="bg-white dark:bg-[#111827]">In Progress</option>
                      <option value="Completed" className="bg-white dark:bg-[#111827]">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : !meeting.actionItems || meeting.actionItems.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">No action items recorded for this meeting.</p>
          ) : (
            <div className="space-y-2.5">
              {meeting.actionItems.map((item) => (
                <ActionItem
                  key={item._id}
                  item={item}
                  onStatusChange={(itemId, newStatus) =>
                    handleActionStatusChange(itemId, newStatus)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Follow-ups / Unresolved (Sky Accent Indicator) */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-followups-accent shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Follow-ups & Unresolved Points</span>
            </h2>
            {isEditing && (
              <button
                onClick={() => setEditFollowUps([...editFollowUps, ''])}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Follow-up
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {editFollowUps.map((fu, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fu}
                    onChange={(e) => {
                      const updated = [...editFollowUps];
                      updated[idx] = e.target.value;
                      setEditFollowUps(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white dark:focus:bg-[#0B1020]"
                  />
                  <button
                    onClick={() => setEditFollowUps(editFollowUps.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {(meeting.followUps && meeting.followUps.length > 0 ? meeting.followUps : ['No unresolved points noted.']).map(
                (point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-[#F8FAFC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                )
              )}
            </ul>
          )}
        </div>

        {/* Section 6: Original Transcript Collapsible Drawer */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-[#151B2E] transition"
          >
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">
              <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Original Transcript</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                ({meeting.transcript?.length || 0} characters)
              </span>
            </div>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
          </button>

          {showTranscript && (
            <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-[#1E293B] bg-slate-50/70 dark:bg-[#0B1020]/70">
              <pre className="text-xs sm:text-sm font-mono text-slate-800 dark:text-[#94A3B8] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {meeting.transcript}
              </pre>
            </div>
          )}
        </div>

        {/* Edit Mode Bottom Action Bar */}
        {isEditing && (
          <div className="p-4 rounded-2xl border border-brand-300 dark:border-brand-700 flex items-center justify-end gap-3 sticky bottom-4 shadow-xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md z-20">
            <button
              onClick={() => {
                initEditState(meeting);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
