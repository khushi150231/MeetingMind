import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoadingState({
  title = 'Processing...',
  description = 'Please wait while we complete this action.',
  isAiProcessing = false,
  steps = []
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1E293B] text-center my-6 shadow-sm">
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center relative z-10 ai-pulse-active shadow-sm">
          {isAiProcessing ? (
            <Sparkles className="w-7 h-7 text-brand-600 dark:text-brand-400 animate-pulse" />
          ) : (
            <Loader2 className="w-7 h-7 text-brand-600 dark:text-brand-400 animate-spin" />
          )}
        </div>
        <div className="absolute inset-0 bg-brand-500/15 blur-xl rounded-full" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8FAFC] mb-1 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] max-w-sm mb-4">{description}</p>

      {steps.length > 0 && (
        <div className="space-y-2 w-full max-w-xs text-left">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg border transition ${
                step.done
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : step.current
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 animate-pulse'
                  : 'text-slate-400 dark:text-slate-500 border-transparent'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  step.done
                    ? 'bg-emerald-500'
                    : step.current
                    ? 'bg-brand-600 animate-ping'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

