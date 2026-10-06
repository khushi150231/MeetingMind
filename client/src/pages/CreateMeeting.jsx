import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI, aiAPI } from '../services/api';
import LoadingState from '../components/LoadingState';
import {
  Sparkles,
  Calendar,
  Users,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Save,
  RotateCcw,
  Zap
} from 'lucide-react';

const SAMPLE_TRANSCRIPT = `Khushi: We need to complete the MeetingMind dashboard by Thursday.
Rahul: I can complete the authentication API by tomorrow.
Priya: I will work on the dashboard UI and finish it by Wednesday.
Khushi: Good. We also need to integrate the AI meeting analysis.
Rahul: I can handle the backend AI integration after finishing authentication.
Priya: We should also test the application before the final submission.
Khushi: Let's have another review meeting on Friday.`;

export default function CreateMeeting() {
  const navigate = useNavigate();

  // Basic Details
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState('');
  const [transcript, setTranscript] = useState('');

  // UI Flow State
  const [stage, setStage] = useState('input'); // 'input' | 'analyzing' | 'review'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI Structured Results (editable in 'review' stage)
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  // File upload handler (.txt)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please upload a plain text (.txt) transcript file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setTranscript(content);
        if (!title) {
          const autoTitle = file.name.replace(/\.txt$/i, '').replace(/[-_]/g, ' ');
          setTitle(autoTitle);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setTitle('Weekly Development Meeting');
    setParticipants('Khushi, Rahul, Priya, Aman');
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  // Step 1: Save as Draft without AI
  const handleSaveDraft = async () => {
    if (!title.trim() || !transcript.trim()) {
      setError('Meeting title and transcript are required to save.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await meetingsAPI.create({
        title,
        date,
        participants,
        transcript,
        status: 'Draft'
      });
      if (res.success && res.meeting) {
        navigate(`/meetings/${res.meeting._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save draft');
      setLoading(false);
    }
  };

  // Step 2: Trigger AI Analysis
  const handleAnalyzeMeeting = async () => {
    if (!title.trim()) {
      setError('Please provide a meeting title.');
      return;
    }
    if (!transcript.trim()) {
      setError('Please provide or upload a transcript to analyze.');
      return;
    }

    setError(null);
    setStage('analyzing');

    try {
      // Analyze directly via AI API service
      const res = await aiAPI.analyzeRaw(transcript);

      if (res.success && res.analysis) {
        const { summary, keyPoints, decisions, actionItems, followUps } = res.analysis;
        setSummary(summary || '');
        setKeyPoints(keyPoints || []);
        setDecisions(decisions || []);
        setActionItems(actionItems || []);
        setFollowUps(followUps || []);
        setStage('review');
      } else {
        throw new Error('AI did not return expected structured output');
      }
    } catch (err) {
      setError(err.message || 'AI analysis failed. Please check your API key.');
      setStage('input');
    }
  };

  // Step 3: Finalize and Save Meeting with Reviewed AI Data
  const handleFinalSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await meetingsAPI.create({
        title,
        date,
        participants,
        transcript,
        summary,
        keyPoints,
        decisions,
        actionItems,
        followUps,
        status: 'Processed'
      });

      if (res.success && res.meeting) {
        navigate(`/meetings/${res.meeting._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save processed meeting.');
      setLoading(false);
    }
  };

  // Helper actions for modifying items in Review stage
  const handleAddKeyPoint = () => setKeyPoints([...keyPoints, '']);
  const handleUpdateKeyPoint = (idx, val) => {
    const updated = [...keyPoints];
    updated[idx] = val;
    setKeyPoints(updated);
  };
  const handleRemoveKeyPoint = (idx) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== idx));
  };

  const handleAddDecision = () => setDecisions([...decisions, '']);
  const handleUpdateDecision = (idx, val) => {
    const updated = [...decisions];
    updated[idx] = val;
    setDecisions(updated);
  };
  const handleRemoveDecision = (idx) => {
    setDecisions(decisions.filter((_, i) => i !== idx));
  };

  const handleAddActionItem = () => {
    setActionItems([
      ...actionItems,
      { task: '', owner: '', deadline: '', priority: 'Medium', status: 'Pending' }
    ]);
  };
  const handleUpdateActionItem = (idx, field, val) => {
    const updated = [...actionItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setActionItems(updated);
  };
  const handleRemoveActionItem = (idx) => {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  };

  const handleAddFollowUp = () => setFollowUps([...followUps, '']);
  const handleUpdateFollowUp = (idx, val) => {
    const updated = [...followUps];
    updated[idx] = val;
    setFollowUps(updated);
  };
  const handleRemoveFollowUp = (idx) => {
    setFollowUps(followUps.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (stage === 'review' ? setStage('input') : navigate('/dashboard'))}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#151B2E] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {stage === 'review' ? 'Review & Edit AI Analysis' : 'Create New Meeting'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
              {stage === 'review'
                ? 'Review, edit, and confirm AI-extracted details before finalizing.'
                : 'Enter your transcript and let AI extract structured tasks and decisions.'}
            </p>
          </div>
        </div>

        {stage === 'input' && (
          <button
            type="button"
            onClick={handleLoadSample}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/60 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/50 transition shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Load Sample Transcript</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <p className="font-semibold text-rose-800 dark:text-rose-200">Action could not be completed</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* STAGE 1: INPUT FORM */}
      {stage === 'input' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
                Meeting Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Development Meeting"
                className="w-full px-4 py-2.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition"
              />
            </div>

            {/* Date and Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
                  Meeting Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8] mb-1.5">
                  Participants (comma separated)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="Khushi, Rahul, Priya, Aman"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition"
                  />
                </div>
              </div>
            </div>

            {/* Transcript Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-[#94A3B8]">
                  Meeting Transcript <span className="text-rose-500">*</span>
                </label>

                {/* Upload txt file button */}
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#F8FAFC] bg-slate-100 dark:bg-[#151B2E] hover:bg-slate-200/80 dark:hover:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-[#1E293B] cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Upload .txt file</span>
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <textarea
                rows={10}
                required
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste raw conversation, meeting notes, or speaker transcripts here..."
                className="w-full p-4 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition leading-relaxed resize-y"
              />
              <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
                <span>Supports speaker tags, timestamps, and multi-speaker transcripts</span>
                <span>{transcript.length} characters</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveDraft}
                className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#151B2E] text-slate-700 dark:text-[#94A3B8] text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-[#1E293B] shadow-sm transition"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleAnalyzeMeeting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-violet-200" />
                <span>Analyze Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: ANALYZING LOADING STATE */}
      {stage === 'analyzing' && (
        <LoadingState
          isAiProcessing={true}
          title="Analyzing meeting..."
          description="AI is processing your transcript into structured decisions, owners, and action items."
          steps={[
            { label: 'Reading speaker transcript and context', done: true },
            { label: 'Extracting executive summary & core discussion', current: true },
            { label: 'Identifying decisions and commitments', current: false },
            { label: 'Mapping task owners, deadlines and priority levels', current: false }
          ]}
        />
      )}

      {/* STAGE 3: REVIEW & EDIT AI RESULTS */}
      {stage === 'review' && (
        <div className="space-y-6 animate-fade-in">
          {/* Review Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-brand-950/40 border border-indigo-200/90 dark:border-brand-800/60 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <p className="text-xs sm:text-sm text-brand-900 dark:text-brand-200 font-medium">
                AI extraction complete. You can review, refine, or add fields below before saving.
              </p>
            </div>
            <button
              onClick={handleAnalyzeMeeting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-white dark:bg-[#111827] hover:bg-indigo-50/80 dark:hover:bg-[#151B2E] border border-indigo-200 dark:border-brand-800/60 rounded-xl transition shrink-0 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Regenerate AI Analysis</span>
            </button>
          </div>

          {/* Section: Summary */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-summary-accent shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              Executive Summary
            </h2>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-[#0B1020] transition leading-relaxed"
            />
          </div>

          {/* Section: Key Discussion Points */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-keypoints-accent shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                Key Discussion Points
              </h2>
              <button
                onClick={handleAddKeyPoint}
                className="flex items-center gap-1 text-xs font-semibold text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Point
              </button>
            </div>

            <div className="space-y-2">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleUpdateKeyPoint(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white dark:focus:bg-[#0B1020]"
                  />
                  <button
                    onClick={() => handleRemoveKeyPoint(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Decisions Made */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-decisions-accent shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Decisions Made
              </h2>
              <button
                onClick={handleAddDecision}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Decision
              </button>
            </div>

            <div className="space-y-2">
              {decisions.map((dec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={dec}
                    onChange={(e) => handleUpdateDecision(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#0B1020]"
                  />
                  <button
                    onClick={() => handleRemoveDecision(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Action Items (Editable) */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-actions-accent shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Action Items & Ownership
              </h2>
              <button
                onClick={handleAddActionItem}
                className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Action Item
              </button>
            </div>

            <div className="space-y-3">
              {actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/70 dark:bg-[#0B1020]/70 border border-slate-200 dark:border-[#1E293B] rounded-xl space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Task description"
                      value={item.task}
                      onChange={(e) => handleUpdateActionItem(idx, 'task', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleRemoveActionItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Remove task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8] block mb-1 font-medium">Owner:</span>
                      <input
                        type="text"
                        placeholder="Owner or null"
                        value={item.owner || ''}
                        onChange={(e) => handleUpdateActionItem(idx, 'owner', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-800 dark:text-[#F8FAFC]"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8] block mb-1 font-medium">Deadline:</span>
                      <input
                        type="text"
                        placeholder="e.g. Oct 08 / Wednesday"
                        value={item.deadline || ''}
                        onChange={(e) => handleUpdateActionItem(idx, 'deadline', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-800 dark:text-[#F8FAFC]"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8] block mb-1 font-medium">Priority:</span>
                      <select
                        value={item.priority || 'Medium'}
                        onChange={(e) => handleUpdateActionItem(idx, 'priority', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-800 dark:text-[#F8FAFC]"
                      >
                        <option value="High" className="bg-white dark:bg-[#111827]">High</option>
                        <option value="Medium" className="bg-white dark:bg-[#111827]">Medium</option>
                        <option value="Low" className="bg-white dark:bg-[#111827]">Low</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8] block mb-1 font-medium">Status:</span>
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => handleUpdateActionItem(idx, 'status', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-800 dark:text-[#F8FAFC]"
                      >
                        <option value="Pending" className="bg-white dark:bg-[#111827]">Pending</option>
                        <option value="In Progress" className="bg-white dark:bg-[#111827]">In Progress</option>
                        <option value="Completed" className="bg-white dark:bg-[#111827]">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Follow-ups */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200/90 dark:border-[#1E293B] section-followups-accent shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Follow-ups & Unresolved Points
              </h2>
              <button
                onClick={handleAddFollowUp}
                className="flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Follow-up
              </button>
            </div>

            <div className="space-y-2">
              {followUps.map((fu, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <input
                    type="text"
                    value={fu}
                    onChange={(e) => handleUpdateFollowUp(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50/60 dark:bg-[#0B1020] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white dark:focus:bg-[#0B1020]"
                  />
                  <button
                    onClick={() => handleRemoveFollowUp(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Review Action Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStage('input')}
              className="w-full sm:w-auto px-4 py-2.5 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC] text-xs sm:text-sm font-semibold transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleFinalSave}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes & Finalize Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
