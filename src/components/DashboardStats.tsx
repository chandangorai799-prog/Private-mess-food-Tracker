import React from 'react';
import { BillingSummary, MonthStats } from '../types';
import { Utensils, IndianRupee, CreditCard, User, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const currentRate = billing.fixedRate;
  const todayCost = todayMealsCount * currentRate;

  const statusColorMap = {
    UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
    'PARTIALLY PAID': 'bg-amber-50 text-amber-800 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'PAID + ADVANCE': 'bg-sky-50 text-sky-800 border-sky-200',
  };

  // Calculate attendance progress percentage (max 3 meals per day)
  const maxPossibleMealsMonth = stats.daysInMonth * 3;
  const attendancePercentage = Math.round((stats.totalReceived / maxPossibleMealsMonth) * 100) || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Today's Meals & Orders */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Today's Orders
          </span>
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 group-hover:scale-110 transition-transform">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>₹{todayCost}</span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {todayMealsCount} {todayMealsCount === 1 ? 'meal' : 'meals'}
            </span>
          </div>
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Day Progress</span>
              <span>{todayMealsCount}/3 Slots</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                style={{ width: `${(todayMealsCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Bill */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {monthName} Total Bill
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            ₹{billing.monthlyBill}
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            {billing.totalMeals} meals recorded • ₹{currentRate}/meal
          </p>
          <div className="mt-2.5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Attendance Rate</span>
              <span>{attendancePercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, attendancePercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Total Paid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Paid
          </span>
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 group-hover:scale-110 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight">
            ₹{billing.effectivePaid}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {billing.previousAdvance > 0
              ? `Paid ₹${billing.totalPaid} + Adv ₹${billing.previousAdvance}`
              : 'All cleared payments applied'}
          </p>
        </div>
      </div>

      {/* 4. Pending Amount / Status */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            {billing.advanceBalance > 0 ? 'Advance Credit' : 'Pending Amount'}
          </span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
              statusColorMap[billing.status]
            }`}
          >
            {billing.status}
          </span>
        </div>
        <div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              billing.advanceBalance > 0
                ? 'text-sky-600'
                : billing.remainingBalance > 0
                ? 'text-rose-600'
                : 'text-emerald-600'
            }`}
          >
            {billing.advanceBalance > 0
              ? `+₹${billing.advanceBalance}`
              : `₹${billing.remainingBalance}`}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
            {billing.remainingBalance > 0 ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            Avg Expense: ₹{billing.averageDailyExpense}/day
          </p>
        </div>
      </div>
    </div>
  );
};


