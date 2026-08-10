import React from 'react';
import { MonthStats } from '../types';
import { PieChart, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Meal Attendance Breakdown
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Monthly completion rate by meal category
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bars for Each Meal Type */}
      <div className="space-y-4">
        {/* Breakfast */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-800 flex items-center gap-1.5">
              <span>🍳</span> Breakfast
            </span>
            <span className="text-emerald-700 font-black">
              {stats.breakfastReceived} / {breakfastMax} ({bPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${bPercent}%` }}
            />
          </div>
        </div>

        {/* Lunch */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-800 flex items-center gap-1.5">
              <span>🍛</span> Lunch
            </span>
            <span className="text-emerald-700 font-black">
              {stats.lunchReceived} / {lunchMax} ({lPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${lPercent}%` }}
            />
          </div>
        </div>

        {/* Dinner */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-800 flex items-center gap-1.5">
              <span>🍽️</span> Dinner
            </span>
            <span className="text-emerald-700 font-black">
              {stats.dinnerReceived} / {dinnerMax} ({dPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${dPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall Progress Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-semibold">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            Total Meals Taken: <strong className="text-slate-900 font-black">{stats.totalReceived}</strong> / {stats.totalScheduled}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>
            Pending (Past/Today): <strong className="text-amber-700 font-black">{stats.totalPending}</strong>
          </span>
        </div>
      </div>
    </section>
  );
};

