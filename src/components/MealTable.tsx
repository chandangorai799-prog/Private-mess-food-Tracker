import React, { useState } from 'react';
import { MealTrackerData, MealType, MessSettings, DayRecord } from '../types';
import { getDayRecord } from '../utils/storage';
import {
  formatDateKey,
  formatShortDate,
  getShortDayName,
  getDateStatus,
  isTodayDate,
  getDatesInMonth,
  format12HourTime,
} from '../utils/dateUtils';
import { Check, Filter, Search, Calendar, Info } from 'lucide-react';

interface MealTableProps {
  selectedYear: number;
  selectedMonth: number; // 0-indexed
  data: MealTrackerData;
  settings: MessSettings;
  onToggleMeal: (dateKey: string, meal: MealType) => void;
}

type FilterMode = 'all' | 'today' | 'pending' | 'completed';

export const MealTable: React.FC<MealTableProps> = ({
  selectedYear,
  selectedMonth,
  data,
  settings,
  onToggleMeal,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');

  const dates = getDatesInMonth(selectedYear, selectedMonth);

  // Filter dates based on active tab
  const filteredDates = dates.filter((d) => {
    const key = formatDateKey(d);
    const record = getDayRecord(data, key);
    const status = getDateStatus(d);
    const isToday = isTodayDate(d);

    const totalReceived =
      (record.breakfast.received ? 1 : 0) +
      (record.lunch.received ? 1 : 0) +
      (record.dinner.received ? 1 : 0);

    if (filter === 'today') return isToday;
    if (filter === 'completed') return totalReceived === 3;
    if (filter === 'pending') {
      // Pending if date is past or today and totalReceived < 3
      return (status === 'past' || status === 'today') && totalReceived < 3;
    }
    return true; // 'all'
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Monthly Food Record
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Tap meal buttons to mark received or undo
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All ({dates.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'today'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Main Responsive Table / List View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[580px]">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 w-24">Date</th>
              <th className="py-3 px-2 w-16">Day</th>
              <th className="py-3 px-2 text-center">
                🍳 Breakfast
                <span className="block text-[10px] text-slate-500 font-normal">
                  {format12HourTime(settings.breakfastTime)}
                </span>
              </th>
              <th className="py-3 px-2 text-center">
                🍛 Lunch
                <span className="block text-[10px] text-slate-500 font-normal">
                  {format12HourTime(settings.lunchTime)}
                </span>
              </th>
              <th className="py-3 px-2 text-center">
                🍽️ Dinner
                <span className="block text-[10px] text-slate-500 font-normal">
                  {format12HourTime(settings.dinnerTime)}
                </span>
              </th>
              <th className="py-3 px-3 text-right w-20">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredDates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No dates match the selected filter.
                </td>
              </tr>
            ) : (
              filteredDates.map((d) => {
                const dateKey = formatDateKey(d);
                const record = getDayRecord(data, dateKey);
                const isToday = isTodayDate(d);
                const dateStatus = getDateStatus(d);
                const dayName = getShortDayName(d);
                const shortDateStr = formatShortDate(d);

                const isWeekend = dayName === 'Sat' || dayName === 'Sun';

                const totalDayReceived =
                  (record.breakfast.received ? 1 : 0) +
                  (record.lunch.received ? 1 : 0) +
                  (record.dinner.received ? 1 : 0);

                return (
                  <tr
                    key={dateKey}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isToday
                        ? 'bg-emerald-950/25 border-l-4 border-l-emerald-500'
                        : dateStatus === 'future'
                        ? 'opacity-85'
                        : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="py-2.5 px-3 sm:px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{shortDateStr}</span>
                        {isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Day */}
                    <td className="py-2.5 px-2 font-medium whitespace-nowrap">
                      <span
                        className={
                          isWeekend ? 'text-amber-400 font-semibold' : 'text-slate-400'
                        }
                      >
                        {dayName}
                      </span>
                    </td>

                    {/* Breakfast Cell */}
                    <td className="py-2 px-2 text-center">
                      <MealCellButton
                        mealName="Breakfast"
                        entry={record.breakfast}
                        onToggle={() => onToggleMeal(dateKey, 'breakfast')}
                      />
                    </td>

                    {/* Lunch Cell */}
                    <td className="py-2 px-2 text-center">
                      <MealCellButton
                        mealName="Lunch"
                        entry={record.lunch}
                        onToggle={() => onToggleMeal(dateKey, 'lunch')}
                      />
                    </td>

                    {/* Dinner Cell */}
                    <td className="py-2 px-2 text-center">
                      <MealCellButton
                        mealName="Dinner"
                        entry={record.dinner}
                        onToggle={() => onToggleMeal(dateKey, 'dinner')}
                      />
                    </td>

                    {/* Daily Total */}
                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                          totalDayReceived === 3
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : totalDayReceived > 0
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-800/50 text-slate-500'
                        }`}
                      >
                        {totalDayReceived} / 3
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface MealCellButtonProps {
  mealName: string;
  entry: DayRecord['breakfast'];
  onToggle: () => void;
}

const MealCellButton: React.FC<MealCellButtonProps> = ({
  entry,
  onToggle,
}) => {
  const isReceived = entry.received;

  return (
    <button
      onClick={onToggle}
      type="button"
      className={`w-full py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 min-h-[42px] select-none ${
        isReceived
          ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-950/50'
          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
      }`}
      title={
        isReceived
          ? `Received${entry.markedAt ? ` at ${entry.markedAt}` : ''}. Click to undo.`
          : 'Mark as Received'
      }
    >
      {isReceived ? (
        <>
          <Check className="w-4 h-4 stroke-[3]" />
          <span>✓</span>
        </>
      ) : (
        <span className="text-slate-400">—</span>
      )}
    </button>
  );
};
