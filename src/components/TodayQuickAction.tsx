import React, { useState, useRef } from 'react';
import { DayRecord, MealType, MessSettings, DEFAULT_MEAL_PRICE } from '../types';
import {
  formatDateKey,
  format12HourTime,
} from '../utils/dateUtils';
import { Check, Clock, Plus, RotateCcw, Utensils, Sparkles } from 'lucide-react';

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
  const activeRate = settings.mealPrice && settings.mealPrice > 0 ? settings.mealPrice : DEFAULT_MEAL_PRICE;

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

  const todayCost =
    (todayRecord.breakfast.received ? (todayRecord.breakfast.amount ?? todayRecord.breakfast.rateAtTime ?? activeRate) : 0) +
    (todayRecord.lunch.received ? (todayRecord.lunch.amount ?? todayRecord.lunch.rateAtTime ?? activeRate) : 0) +
    (todayRecord.dinner.received ? (todayRecord.dinner.amount ?? todayRecord.dinner.rateAtTime ?? activeRate) : 0);

  // Handler for prominent "+ ADD MEAL ₹X" button
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
      // If all 3 are recorded, toggle dinner
      targetMeal = 'dinner';
    }

    onToggleMeal(dateKey, targetMeal);
    setLastToggledMeal(targetMeal);
    setToastMessage(`Meal logged — ₹${activeRate} added to today's bill.`);

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
    bgAccent: string;
    timing: string;
    entry: DayRecord['breakfast'];
  }> = [
    {
      type: 'breakfast',
      label: 'Breakfast',
      icon: '🍳',
      bgAccent: 'from-amber-50 to-orange-50/40 border-amber-200/80',
      timing: format12HourTime(settings.breakfastTime),
      entry: todayRecord.breakfast,
    },
    {
      type: 'lunch',
      label: 'Lunch',
      icon: '🍛',
      bgAccent: 'from-emerald-50 to-teal-50/40 border-emerald-200/80',
      timing: format12HourTime(settings.lunchTime),
      entry: todayRecord.lunch,
    },
    {
      type: 'dinner',
      label: 'Dinner',
      icon: '🍽️',
      bgAccent: 'from-indigo-50 to-slate-50/40 border-indigo-200/80',
      timing: format12HourTime(settings.dinnerTime),
      entry: todayRecord.dinner,
    },
  ];

  return (
    <section className="theme-card-bg border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Toast Notification with Undo */}
      {toastMessage && (
        <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 theme-accent-text" />
            <span className="text-xs font-bold text-slate-100">{toastMessage}</span>
          </div>
          <button
            onClick={handleUndo}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            UNDO
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase theme-badge border border-current/20">
              <Sparkles className="w-3 h-3" />
              Today's Orders
            </span>
            <span className="text-xs font-bold theme-text-muted bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80">
              ₹{activeRate} / meal
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black theme-text-primary mt-1">
            {formattedDate}
          </h2>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold theme-text-muted block uppercase tracking-wider">Today's Summary</span>
          <span className="text-base sm:text-lg font-black theme-accent-text">
            {todayMealsCount} {todayMealsCount === 1 ? 'Meal' : 'Meals'} • ₹{todayCost}
          </span>
        </div>
      </div>

      {/* Prominent Quick Add Button */}
      <button
        type="button"
        onClick={handleQuickAddMeal}
        className="w-full py-3.5 px-4 rounded-xl theme-accent-btn font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        + ADD MEAL ₹{activeRate}
      </button>

      {/* 3 Touch-Friendly Food Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mealsConfig.map((item) => {
          const isReceived = item.entry.received;
          const mealCost = item.entry.amount ?? item.entry.rateAtTime ?? activeRate;

          return (
            <button
              key={item.type}
              onClick={() => onToggleMeal(dateKey, item.type)}
              type="button"
              className={`relative group text-left rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between min-h-[110px] active:scale-[0.98] select-none cursor-pointer ${
                isReceived
                  ? 'theme-accent-bg text-white border-transparent shadow-md'
                  : `bg-gradient-to-br ${item.bgAccent} hover:shadow-xs text-slate-800`
              }`}
            >
              {/* Top Header line inside button */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl drop-shadow-xs">{item.icon}</span>
                  <div>
                    <span
                      className={`font-black text-base block leading-tight ${
                        isReceived ? 'text-white' : 'theme-text-primary'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${
                        isReceived ? 'text-slate-100' : 'theme-text-muted'
                      }`}
                    >
                      <Clock className="w-3 h-3 opacity-80" />
                      {item.timing}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isReceived
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'bg-white text-slate-400 border border-slate-200 group-hover:border-slate-300'
                  }`}
                >
                  {isReceived ? (
                    <Check className="w-5 h-5 stroke-[3] theme-accent-text" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
                  )}
                </div>
              </div>

              {/* Bottom State Label */}
              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                  isReceived ? 'border-white/30' : 'border-slate-200/80'
                }`}
              >
                {isReceived ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white font-extrabold flex items-center gap-1">
                      ✓ Completed • ₹{mealCost}
                    </span>
                    {item.entry.markedAt && (
                      <span className="text-slate-100 text-[11px] font-bold">
                        {format12HourTime(item.entry.markedAt)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="theme-text-muted font-bold group-hover:theme-text-primary transition-colors">
                    Tap to mark • ₹{activeRate}
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


