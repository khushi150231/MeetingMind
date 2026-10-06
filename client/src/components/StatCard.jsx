import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'brand', subtext }) {
  const colorStyles = {
    brand: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60',
      indicator: 'bg-indigo-600',
    },
    violet: {
      iconBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/60',
      indicator: 'bg-violet-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60',
      indicator: 'bg-emerald-600',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60',
      indicator: 'bg-amber-600',
    },
    cyan: {
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60',
      indicator: 'bg-sky-600',
    }
  };

  const style = colorStyles[color] || colorStyles.brand;

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md p-5 rounded-2xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8]">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-1.5 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1.5">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

