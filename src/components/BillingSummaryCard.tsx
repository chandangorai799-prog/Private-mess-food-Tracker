import React from 'react';
import { BillingSummary, FIXED_MEAL_RATE, MessSettings } from '../types';
import { IndianRupee, CheckCircle, AlertTriangle, ArrowRight, Wallet, Sparkles, TrendingUp } from 'lucide-react';

interface BillingSummaryCardProps {
  monthName: string;
  billing: BillingSummary;
  settings: MessSettings;
  onTogglePreviousAdvance: (val: boolean) => void;
}

export const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
  monthName,
  billing,
  settings,
  onTogglePreviousAdvance,
}) => {
  const isAdvance = billing.advanceBalance > 0;
  const isPaid = billing.status === 'PAID' || billing.status === 'PAID + ADVANCE';

  const statusBadgeStyle = {
    UNPAID: 'bg-red-500/10 text-red-400 border-red-500/30',
    'PARTIALLY PAID': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'PAID + ADVANCE': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  }[billing.status];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white uppercase tracking-tight">
              Monthly Bill & Summary
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {monthName} • Fixed Rate: <strong className="text-emerald-400">₹{FIXED_MEAL_RATE} / meal</strong>
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-lg border text-xs font-black tracking-wider uppercase ${statusBadgeStyle}`}>
          {billing.status}
        </span>
      </div>

      {/* Main 3 Column Cards: Bill, Paid, Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Monthly Bill Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            Monthly Bill
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₹{billing.monthlyBill.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {billing.totalMeals} meals × ₹{FIXED_MEAL_RATE}
            </p>
          </div>
        </div>

        {/* Total Paid Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-sky-400 tracking-wider">
              Total Paid
            </span>
            <Wallet className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 tracking-tight">
              ₹{billing.effectivePaid.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {billing.previousAdvance > 0
                ? `Direct Paid: ₹${billing.totalPaid} + Prev Adv: ₹${billing.previousAdvance}`
                : `Applied to ${monthName}`}
            </p>
          </div>
        </div>

        {/* Balance Card (Remaining or Advance) */}
        <div
          className={`border rounded-xl p-4 flex flex-col justify-between space-y-2 ${
            isAdvance
              ? 'bg-sky-950/30 border-sky-500/40 text-sky-200'
              : billing.remainingBalance > 0
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider">
              {isAdvance ? 'Advance Balance' : 'Remaining Due'}
            </span>
            {isAdvance ? (
              <CheckCircle className="w-4 h-4 text-sky-400" />
            ) : billing.remainingBalance > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {isAdvance
                ? `+₹${billing.advanceBalance.toLocaleString('en-IN')}`
                : `₹${billing.remainingBalance.toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs font-medium mt-1 opacity-90">
              {isAdvance
                ? '✓ BILL PAID — Advance available for next month'
                : billing.remainingBalance > 0
                ? 'Amount pending to be paid to mess'
                : '✓ BILL FULLY SETTLED'}
            </p>
          </div>
        </div>
      </div>

      {/* Advance Toggle & Expense Averages */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.usePreviousAdvance ?? true}
            onChange={(e) => onTogglePreviousAdvance(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
          />
          <span className="text-slate-300 font-semibold">
            Use Previous Month Advance (if available)
          </span>
        </label>

        <div className="flex items-center gap-4 text-slate-400 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Avg Daily Expense:{' '}
              <strong className="text-white">₹{billing.averageDailyExpense}</strong>/day
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
