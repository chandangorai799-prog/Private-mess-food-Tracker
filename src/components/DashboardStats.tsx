import React from 'react';
import { MonthStats } from '../types';
import { CheckCircle2, Clock, CalendarCheck, Percent, Sparkles } from 'lucide-react';

interface DashboardStatsProps {
  stats: MonthStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Scheduled */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats.totalScheduled}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {stats.daysInMonth} days × 3 meals
          </p>
        </div>
      </div>

      {/* Received */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-emerald-400 mb-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Received</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {stats.totalReceived}
          </div>
          <p className="text-[11px] text-emerald-300/80 font-medium mt-0.5">
            Marked as eaten
          </p>
        </div>
      </div>

      {/* Pending (Past & Today) */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-amber-400 mb-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {stats.totalPending}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Elapsed unreceived
          </p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-indigo-400 mb-1">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Completion</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-indigo-300 tracking-tight">
            {stats.completionRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
