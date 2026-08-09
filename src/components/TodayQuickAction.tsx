import React, { useState, useRef } from 'react';
import { DayRecord, MealType, MessSettings, FIXED_MEAL_RATE } from '../types';
import {
  formatDateKey,
  format12HourTime,
} from '../utils/dateUtils';
import { Check, Clock, Plus, RotateCcw, Utensils } from 'lucide-react';

interface TodayQuickActionProps {
  todayDate: Date;
  todayRecord: DayRecord;
  settings: MessSettings;
  onToggleMeal: (dateKey: string, meal: MealType) => void;
}

export const TodayQuickAction: React.FC<TodayQuickActionProps> = ({
  todayDate,
  todayRecord,
  settings,
  onToggleMeal,
}) => {
  const dateKey = formatDateKey(todayDate);

  const formattedDate = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastToggledMeal, setLastToggledMeal] = useState<MealType | null>(null);
  const debounceRef = useRef<boolean>(false);

  const todayMealsCount =
    (todayRecord.breakfast.received ? 1 : 0) +
    (todayRecord.lunch.received ? 1 : 0) +
    (todayRecord.dinner.received ? 1 : 0);

  const todayCost = todayMealsCount * FIXED_MEAL_RATE;

  // Handler for prominent "+ ADD MEAL ₹44" button
  const handleQuickAddMeal = () => {
    if (debounceRef.current) return;
    debounceRef.current = true;
    setTimeout(() => {
      debounceRef.current = false;
    }, 300);

    // Find next un-received meal today (Breakfast -> Lunch -> Dinner)
    let targetMeal: MealType | null = null;
    if (!todayRecord.breakfast.received) {
      targetMeal = 'breakfast';
    } else if (!todayRecord.lunch.received) {
      targetMeal = 'lunch';
    } else if (!todayRecord.dinner.received) {
      targetMeal = 'dinner';
    } else {
      // If all 3 are recorded, toggle dinner or toggle first available
      targetMeal = 'dinner';
    }

    onToggleMeal(dateKey, targetMeal);
    setLastToggledMeal(targetMeal);
    setToastMessage(`Meal added — ₹${FIXED_MEAL_RATE} added to today's bill.`);

    // Auto dismiss toast after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleUndo = () => {
    if (lastToggledMeal) {
      onToggleMeal(dateKey, lastToggledMeal);
      setToastMessage(null);
      setLastToggledMeal(null);
    }
  };

  const mealsConfig: Array<{
    type: MealType;
    label: string;
    icon: string;
    timing: string;
    entry: DayRecord['breakfast'];
  }> = [
    {
      type: 'breakfast',
      label: 'Breakfast',
      icon: '🍳',
      timing: format12HourTime(settings.breakfastTime),
      entry: todayRecord.breakfast,
    },
    {
      type: 'lunch',
      label: 'Lunch',
      icon: '🍛',
      timing: format12HourTime(settings.lunchTime),
      entry: todayRecord.lunch,
    },
    {
      type: 'dinner',
      label: 'Dinner',
      icon: '🍽️',
      timing: format12HourTime(settings.dinnerTime),
      entry: todayRecord.dinner,
    },
  ];

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
      {/* Toast Notification with Undo */}
      {toastMessage && (
        <div className="bg-emerald-950 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-200">{toastMessage}</span>
          </div>
          <button
            onClick={handleUndo}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-500/40 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            UNDO
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Today's Record
            </span>
            <span className="text-xs font-extrabold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
              ₹{FIXED_MEAL_RATE} / meal
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mt-1">
            {formattedDate}
          </h2>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 block">Today's Total</span>
          <span className="text-lg font-black text-emerald-400">
            {todayMealsCount} {todayMealsCount === 1 ? 'Meal' : 'Meals'} • ₹{todayCost}
          </span>
        </div>
      </div>

      {/* Prominent Quick Add Button */}
      <button
        type="button"
        onClick={handleQuickAddMeal}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        + ADD MEAL ₹{FIXED_MEAL_RATE}
      </button>

      {/* 3 Touch-Friendly Meal Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mealsConfig.map((item) => {
          const isReceived = item.entry.received;

          return (
            <button
              key={item.type}
              onClick={() => onToggleMeal(dateKey, item.type)}
              type="button"
              className={`relative group text-left rounded-xl p-3.5 transition-all duration-200 border flex flex-col justify-between min-h-[100px] active:scale-[0.98] select-none cursor-pointer ${
                isReceived
                  ? 'bg-emerald-900/40 border-emerald-500/50 text-white shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-slate-600'
              }`}
            >
              {/* Top Header line inside button */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <span className="font-bold text-base block text-white leading-tight">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.timing}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isReceived
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-700/80 text-slate-400 group-hover:bg-slate-600'
                  }`}
                >
                  {isReceived ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
                  )}
                </div>
              </div>

              {/* Bottom State Label */}
              <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                {isReceived ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ✓ ₹{FIXED_MEAL_RATE}
                    </span>
                    {item.entry.markedAt && (
                      <span className="text-emerald-300/80 text-[11px] font-medium">
                        {item.entry.markedAt}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                    Tap to add ₹{FIXED_MEAL_RATE}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

