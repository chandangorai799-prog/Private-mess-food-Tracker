import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { getMonthYearString } from '../utils/dateUtils';

interface MonthNavigatorProps {
  selectedYear: number;
  selectedMonth: number;
  daysInMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetToCurrentMonth: () => void;
  isCurrentMonthSelected: boolean;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  selectedYear,
  selectedMonth,
  daysInMonth,
  onPrevMonth,
  onNextMonth,
  onResetToCurrentMonth,
  isCurrentMonthSelected,
}) => {
  const monthYearLabel = getMonthYearString(selectedYear, selectedMonth);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Month Selector Title */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700/60">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {monthYearLabel}
              </h2>
              {!isCurrentMonthSelected && (
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {daysInMonth} Days • {daysInMonth * 3} Meal Slots
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {!isCurrentMonthSelected && (
            <button
              onClick={onResetToCurrentMonth}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all flex items-center gap-1"
            >
              Current Month
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <button
              onClick={onPrevMonth}
              aria-label="Previous Month"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors active:scale-95 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNextMonth}
              aria-label="Next Month"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors active:scale-95 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
