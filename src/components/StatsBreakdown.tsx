import React from 'react';
import { MonthStats } from '../types';
import { PieChart, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface StatsBreakdownProps {
  stats: MonthStats;
}

export const StatsBreakdown: React.FC<StatsBreakdownProps> = ({ stats }) => {
  const breakfastMax = stats.daysInMonth;
  const lunchMax = stats.daysInMonth;
  const dinnerMax = stats.daysInMonth;

  const bPercent = Math.round((stats.breakfastReceived / breakfastMax) * 100);
  const lPercent = Math.round((stats.lunchReceived / lunchMax) * 100);
  const dPercent = Math.round((stats.dinnerReceived / dinnerMax) * 100);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">
              Meal Type Statistics
            </h2>
            <p className="text-xs text-slate-400">
              Breakdown of breakfast, lunch, and dinner attendance
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bars for Each Meal Type */}
      <div className="space-y-4">
        {/* Breakfast */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-200 flex items-center gap-1.5">
              <span>🍳</span> Breakfast
            </span>
            <span className="text-emerald-400">
              {stats.breakfastReceived} / {breakfastMax} ({bPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${bPercent}%` }}
            />
          </div>
        </div>

        {/* Lunch */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-200 flex items-center gap-1.5">
              <span>🍛</span> Lunch
            </span>
            <span className="text-emerald-400">
              {stats.lunchReceived} / {lunchMax} ({lPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${lPercent}%` }}
            />
          </div>
        </div>

        {/* Dinner */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-200 flex items-center gap-1.5">
              <span>🍽️</span> Dinner
            </span>
            <span className="text-emerald-400">
              {stats.dinnerReceived} / {dinnerMax} ({dPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${dPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall Progress Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Total Received: <strong className="text-white">{stats.totalReceived}</strong> / {stats.totalScheduled}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>
            Total Pending (Past & Today): <strong className="text-amber-300">{stats.totalPending}</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
