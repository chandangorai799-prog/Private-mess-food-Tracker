import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, RotateCcw } from 'lucide-react';
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs text-slate-900 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Month Selector Title */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                {monthYearLabel}
              </h2>
              {!isCurrentMonthSelected && (
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {daysInMonth} Days • {daysInMonth * 3} Meal Slots
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {!isCurrentMonthSelected && (
            <button
              onClick={onResetToCurrentMonth}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Current Month
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <button
              onClick={onPrevMonth}
              aria-label="Previous Month"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNextMonth}
              aria-label="Next Month"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

