import React, { useState } from 'react';
import { MealTrackerData, MealType, MessSettings, DayRecord, DEFAULT_MEAL_PRICE } from '../types';
import { getDayRecord } from '../utils/storage';
import {
  formatDateKey,
  getShortDayName,
  getDateStatus,
  isTodayDate,
  getDatesInMonth,
  format12HourTime,
  formatStringDateToIndian,
} from '../utils/dateUtils';
import { Check, Calendar, Trash2, Plus, Minus } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface MealTableProps {
  selectedYear: number;
  selectedMonth: number; // 0-indexed
  data: MealTrackerData;
  settings: MessSettings;
  onToggleMeal: (dateKey: string, meal: MealType) => void;
  onClearDayRecord?: (dateKey: string) => void;
}

type FilterMode = 'all' | 'today' | 'pending' | 'completed';

export const MealTable: React.FC<MealTableProps> = ({
  selectedYear,
  selectedMonth,
  data,
  settings,
  onToggleMeal,
  onClearDayRecord,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [deletingDateKey, setDeletingDateKey] = useState<string | null>(null);

  const activePrice = settings.mealPrice && settings.mealPrice > 0 ? settings.mealPrice : DEFAULT_MEAL_PRICE;
  const dates = getDatesInMonth(selectedYear, selectedMonth);

  // Filter dates based on active tab
  const filteredDates = dates.filter((d) => {
    const key = formatDateKey(d);
    const record = getDayRecord(data, key, activePrice);
    const status = getDateStatus(d);
    const isToday = isTodayDate(d);

    const totalReceived =
      (record.breakfast.received ? 1 : 0) +
      (record.lunch.received ? 1 : 0) +
      (record.dinner.received ? 1 : 0);

    if (filter === 'today') return isToday;
    if (filter === 'completed') return totalReceived === 3;
    if (filter === 'pending') {
      return (status === 'past' || status === 'today') && totalReceived < 3;
    }
    return true; // 'all'
  });

  // Calculate bottom total summary using actual meal entry amounts
  let monthTotalMeals = 0;
  let monthTotalBill = 0;

  dates.forEach((d) => {
    const key = formatDateKey(d);
    const rec = getDayRecord(data, key, activePrice);
    (['breakfast', 'lunch', 'dinner'] as MealType[]).forEach((mealKey) => {
      const entry = rec[mealKey];
      if (entry.received) {
        monthTotalMeals++;
        monthTotalBill += entry.amount ?? entry.rateAtTime ?? activePrice;
      }
    });
  });

  const handleIncrementMeals = (dateKey: string) => {
    const rec = getDayRecord(data, dateKey, activePrice);
    if (!rec.breakfast.received) {
      onToggleMeal(dateKey, 'breakfast');
    } else if (!rec.lunch.received) {
      onToggleMeal(dateKey, 'lunch');
    } else if (!rec.dinner.received) {
      onToggleMeal(dateKey, 'dinner');
    }
  };

  const handleDecrementMeals = (dateKey: string) => {
    const rec = getDayRecord(data, dateKey, activePrice);
    if (rec.dinner.received) {
      onToggleMeal(dateKey, 'dinner');
    } else if (rec.lunch.received) {
      onToggleMeal(dateKey, 'lunch');
    } else if (rec.breakfast.received) {
      onToggleMeal(dateKey, 'breakfast');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-0">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Daily Meal Record & Breakdown
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Rate = <strong className="text-emerald-400">₹{activePrice} / meal</strong> • Tap buttons to toggle or adjust
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

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 sm:px-4 w-28">Date</th>
              <th className="py-3 px-2 w-14">Day</th>
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
              <th className="py-3 px-3 text-right">Daily Cost</th>
              <th className="py-3 px-2 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredDates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No dates match the selected filter.
                </td>
              </tr>
            ) : (
              filteredDates.map((d) => {
                const dateKey = formatDateKey(d);
                const record = getDayRecord(data, dateKey, activePrice);
                const isToday = isTodayDate(d);
                const dateStatus = getDateStatus(d);
                const dayName = getShortDayName(d);
                const indianDateStr = formatStringDateToIndian(dateKey);

                const isWeekend = dayName === 'Sat' || dayName === 'Sun';

                const totalDayReceived =
                  (record.breakfast.received ? 1 : 0) +
                  (record.lunch.received ? 1 : 0) +
                  (record.dinner.received ? 1 : 0);

                const dailyCost =
                  (record.breakfast.received ? (record.breakfast.amount ?? record.breakfast.rateAtTime ?? activePrice) : 0) +
                  (record.lunch.received ? (record.lunch.amount ?? record.lunch.rateAtTime ?? activePrice) : 0) +
                  (record.dinner.received ? (record.dinner.amount ?? record.dinner.rateAtTime ?? activePrice) : 0);

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
                    <td className="py-2.5 px-3 sm:px-4 font-bold text-white whitespace-nowrap text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100">{indianDateStr}</span>
                        {isToday && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit">
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Day */}
                    <td className="py-2.5 px-2 font-medium whitespace-nowrap text-xs">
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
                        activePrice={activePrice}
                        onToggle={() => onToggleMeal(dateKey, 'breakfast')}
                      />
                    </td>

                    {/* Lunch Cell */}
                    <td className="py-2 px-2 text-center">
                      <MealCellButton
                        mealName="Lunch"
                        entry={record.lunch}
                        activePrice={activePrice}
                        onToggle={() => onToggleMeal(dateKey, 'lunch')}
                      />
                    </td>

                    {/* Dinner Cell */}
                    <td className="py-2 px-2 text-center">
                      <MealCellButton
                        mealName="Dinner"
                        entry={record.dinner}
                        activePrice={activePrice}
                        onToggle={() => onToggleMeal(dateKey, 'dinner')}
                      />
                    </td>

                    {/* Daily Cost & Counter */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick +/- Counter Controls */}
                        <div className="flex items-center gap-0.5 bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleDecrementMeals(dateKey)}
                            disabled={totalDayReceived === 0}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Decrease meal count"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">
                            {totalDayReceived}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrementMeals(dateKey)}
                            disabled={totalDayReceived === 3}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title="Increase meal count"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="block text-xs font-black text-emerald-400">
                            ₹{dailyCost}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {totalDayReceived} {totalDayReceived === 1 ? 'meal' : 'meals'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Delete Day Action */}
                    <td className="py-2 px-2 text-center">
                      {totalDayReceived > 0 && onClearDayRecord && (
                        <button
                          type="button"
                          onClick={() => setDeletingDateKey(dateKey)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete day meal record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-200">
        <div className="flex items-center gap-2">
          <span>Month Total Meals:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm">
            {monthTotalMeals} Meals
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Total Month Bill:</span>
          <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-base shadow-sm">
            ₹{monthTotalBill.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Delete Record Confirmation Modal */}
      <ConfirmationModal
        isOpen={deletingDateKey !== null}
        title="Delete Meal Record?"
        message={`Are you sure you want to delete the meal record for ${deletingDateKey ? formatStringDateToIndian(deletingDateKey) : ''}? This will reset daily meals to 0 and recalculate your bill.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (deletingDateKey && onClearDayRecord) {
            onClearDayRecord(deletingDateKey);
            setDeletingDateKey(null);
          }
        }}
        onCancel={() => setDeletingDateKey(null)}
      />
    </div>
  );
};

interface MealCellButtonProps {
  mealName: string;
  entry: DayRecord['breakfast'];
  activePrice: number;
  onToggle: () => void;
}

const MealCellButton: React.FC<MealCellButtonProps> = ({
  entry,
  activePrice,
  onToggle,
}) => {
  const isReceived = entry.received;
  const cost = entry.amount ?? entry.rateAtTime ?? activePrice;

  return (
    <button
      onClick={onToggle}
      type="button"
      className={`w-full py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 min-h-[40px] select-none cursor-pointer ${
        isReceived
          ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-950/50'
          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
      }`}
      title={
        isReceived
          ? `Received (₹${cost}). Click to remove.`
          : `Mark Received (+₹${activePrice})`
      }
    >
      {isReceived ? (
        <>
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>₹{cost}</span>
        </>
      ) : (
        <span className="text-slate-500">—</span>
      )}
    </button>
  );
};

