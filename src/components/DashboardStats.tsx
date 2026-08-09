import React from 'react';
import { BillingSummary, MonthStats, FIXED_MEAL_RATE } from '../types';
import { Utensils, IndianRupee, CreditCard, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: MonthStats;
  billing: BillingSummary;
  todayMealsCount: number;
  monthName: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  billing,
  todayMealsCount,
  monthName,
}) => {
  const todayCost = todayMealsCount * FIXED_MEAL_RATE;

  const statusColorMap = {
    UNPAID: 'bg-red-500/10 text-red-400 border-red-500/30',
    'PARTIALLY PAID': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'PAID + ADVANCE': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Today's Meals & Cost */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
            <span>₹{todayCost}</span>
            <span className="text-xs font-semibold text-slate-400">({todayMealsCount} {todayMealsCount === 1 ? 'meal' : 'meals'})</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            ₹{FIXED_MEAL_RATE} / meal
          </p>
        </div>
      </div>

      {/* Current Month Bill */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{monthName} Bill</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            ₹{billing.monthlyBill}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {billing.totalMeals} meals × ₹{FIXED_MEAL_RATE}
          </p>
        </div>
      </div>

      {/* Total Paid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-sky-400 tracking-tight">
            ₹{billing.effectivePaid}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {billing.previousAdvance > 0 ? `Paid: ₹${billing.totalPaid} + Adv: ₹${billing.previousAdvance}` : 'All payments applied'}
          </p>
        </div>
      </div>

      {/* Remaining / Advance Balance & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {billing.advanceBalance > 0 ? 'Advance Balance' : 'Remaining Due'}
          </span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase ${
              statusColorMap[billing.status]
            }`}
          >
            {billing.status}
          </span>
        </div>
        <div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              billing.advanceBalance > 0
                ? 'text-sky-400'
                : billing.remainingBalance > 0
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {billing.advanceBalance > 0
              ? `+₹${billing.advanceBalance}`
              : `₹${billing.remainingBalance}`}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Avg Expense: ₹{billing.averageDailyExpense}/day
          </p>
        </div>
      </div>
    </div>
  );
};

