import React from 'react';
import { BillingSummary, MessSettings } from '../types';
import { IndianRupee, CheckCircle, AlertTriangle, Wallet, TrendingUp } from 'lucide-react';

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

  const statusBadgeStyle = {
    UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
    'PARTIALLY PAID': 'bg-amber-50 text-amber-800 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'PAID + ADVANCE': 'bg-sky-50 text-sky-800 border-sky-200',
  }[billing.status];

  return (
    <section className="theme-card-bg border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl theme-accent-light border flex items-center justify-center theme-accent-text shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg theme-text-primary tracking-tight">
              Monthly Bill & Financial Summary
            </h3>
            <p className="text-xs theme-text-muted font-semibold">
              {monthName} • Fixed Rate: <strong className="theme-accent-text">₹{billing.fixedRate} / meal</strong>
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full border text-xs font-black tracking-wider uppercase ${statusBadgeStyle}`}>
          {billing.status}
        </span>
      </div>

      {/* Main 3 Column Cards: Bill, Paid, Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Monthly Bill Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Monthly Bill
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{billing.monthlyBill.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {billing.totalMeals} meals recorded
            </p>
          </div>
        </div>

        {/* Total Paid Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-sky-700 tracking-wider">
              Total Paid
            </span>
            <Wallet className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 tracking-tight">
              ₹{billing.effectivePaid.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {billing.previousAdvance > 0
                ? `Direct Paid: ₹${billing.totalPaid} + Prev Adv: ₹${billing.previousAdvance}`
                : `Applied to ${monthName}`}
            </p>
          </div>
        </div>

        {/* Balance Card (Remaining or Advance) */}
        <div
          className={`border rounded-2xl p-4 flex flex-col justify-between space-y-2 ${
            isAdvance
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : billing.remainingBalance > 0
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              {isAdvance ? 'Advance Credit' : 'Remaining Due'}
            </span>
            {isAdvance ? (
              <CheckCircle className="w-4 h-4 text-sky-600" />
            ) : billing.remainingBalance > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {isAdvance
                ? `+₹${billing.advanceBalance.toLocaleString('en-IN')}`
                : `₹${billing.remainingBalance.toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs font-bold mt-1 opacity-90">
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
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.usePreviousAdvance ?? true}
            onChange={(e) => onTogglePreviousAdvance(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
          />
          <span className="text-slate-700 font-bold">
            Use Previous Month Advance (if available)
          </span>
        </label>

        <div className="flex items-center gap-4 text-slate-600 font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Avg Daily Expense:{' '}
              <strong className="text-slate-900 font-black">₹{billing.averageDailyExpense}</strong>/day
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

