import React from 'react';
import { DayRecord, MealType, MessSettings } from '../types';
import {
  formatDateKey,
  format12HourTime,
  getCurrentFormattedTime,
} from '../utils/dateUtils';
import { Check, Flame, Clock, Sparkles } from 'lucide-react';

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
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Today's Record
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mt-1">
            {formattedDate}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 block">
            One-Tap Action
          </span>
        </div>
      </div>

      {/* 3 Large Touch-Friendly Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mealsConfig.map((item) => {
          const isReceived = item.entry.received;

          return (
            <button
              key={item.type}
              onClick={() => onToggleMeal(dateKey, item.type)}
              type="button"
              className={`relative group text-left rounded-xl p-4 transition-all duration-200 border flex flex-col justify-between min-h-[110px] active:scale-[0.98] select-none ${
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isReceived
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-700/80 text-slate-400 group-hover:bg-slate-600'
                  }`}
                >
                  {isReceived ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
                  )}
                </div>
              </div>

              {/* Bottom State Label */}
              <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                {isReceived ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ✓ Received
                    </span>
                    {item.entry.markedAt && (
                      <span className="text-emerald-300/80 text-[11px] font-medium">
                        Marked at {item.entry.markedAt}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                    Tap to mark received
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
