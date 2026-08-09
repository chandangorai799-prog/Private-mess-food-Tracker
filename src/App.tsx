/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MealTrackerData,
  MessSettings,
  MealType,
  DayRecord,
} from './types';
import {
  loadMealData,
  saveMealData,
  loadSettings,
  saveSettings,
  getDayRecord,
  calculateMonthStats,
  exportMonthCSV,
  clearData,
} from './utils/storage';
import {
  formatDateKey,
  getCurrentFormattedTime,
  isTodayDate,
} from './utils/dateUtils';

import { Header } from './components/Header';
import { MonthNavigator } from './components/MonthNavigator';
import { DashboardStats } from './components/DashboardStats';
import { TodayQuickAction } from './components/TodayQuickAction';
import { MealTable } from './components/MealTable';
import { StatsBreakdown } from './components/StatsBreakdown';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';

export default function App() {
  const today = useMemo(() => new Date(), []);

  // Active Year and Month state
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());

  // Meal Tracker Data & Settings State
  const [mealData, setMealData] = useState<MealTrackerData>(() => loadMealData());
  const [settings, setSettings] = useState<MessSettings>(() => loadSettings());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<{
    isOpen: boolean;
    allData: boolean;
  }>({
    isOpen: false,
    allData: false,
  });

  // Save meal data whenever it changes
  useEffect(() => {
    saveMealData(mealData);
  }, [mealData]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  const isCurrentMonthSelected =
    selectedYear === today.getFullYear() && selectedMonth === today.getMonth();

  // Toggle meal status (received / pending)
  const handleToggleMeal = (dateKey: string, meal: MealType) => {
    setMealData((prevData) => {
      const dayRecord = getDayRecord(prevData, dateKey);
      const currentEntry = dayRecord[meal];

      const newReceived = !currentEntry.received;
      const updatedEntry = {
        received: newReceived,
        markedAt: newReceived ? getCurrentFormattedTime() : undefined,
        markedTimestamp: newReceived ? Date.now() : undefined,
      };

      const updatedDayRecord: DayRecord = {
        ...dayRecord,
        [meal]: updatedEntry,
      };

      return {
        ...prevData,
        [dateKey]: updatedDayRecord,
      };
    });
  };

  // Compute month statistics
  const stats = useMemo(() => {
    return calculateMonthStats(selectedYear, selectedMonth, mealData);
  }, [selectedYear, selectedMonth, mealData]);

  // Today's Record
  const todayKey = formatDateKey(today);
  const todayRecord = getDayRecord(mealData, todayKey);

  // Handle CSV export
  const handleExportCSV = () => {
    exportMonthCSV(selectedYear, selectedMonth, mealData, settings);
  };

  // Handle data reset confirmation
  const handleConfirmResetData = () => {
    const updated = clearData(
      confirmReset.allData,
      selectedYear,
      selectedMonth
    );
    setMealData(updated);
    setConfirmReset({ isOpen: false, allData: false });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Sticky Header */}
      <Header
        messName={settings.messName || 'Private Mess Tracker'}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* PWA Install Banner */}
        <InstallPwaBanner />

        {/* Month Selector Bar */}
        <MonthNavigator
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          daysInMonth={stats.daysInMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onResetToCurrentMonth={handleResetToCurrentMonth}
          isCurrentMonthSelected={isCurrentMonthSelected}
        />

        {/* Top Summary Stats */}
        <DashboardStats stats={stats} />

        {/* Today's Quick Action Bar (Only shown if current month is active or if user jumps) */}
        <TodayQuickAction
          todayDate={today}
          todayRecord={todayRecord}
          settings={settings}
          onToggleMeal={handleToggleMeal}
        />

        {/* Monthly Food Record Table / Calendar */}
        <MealTable
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          data={mealData}
          settings={settings}
          onToggleMeal={handleToggleMeal}
        />

        {/* Detailed Breakdown & Meal Attendance Stats */}
        <StatsBreakdown stats={stats} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <p>
          Private Mess Food Tracking System • Saved securely in Browser Storage
        </p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onExportCSV={handleExportCSV}
        onRequestResetData={(allData) =>
          setConfirmReset({ isOpen: true, allData })
        }
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmReset.isOpen}
        title={
          confirmReset.allData
            ? 'Clear ALL Mess Records?'
            : 'Reset Current Month Data?'
        }
        message={
          confirmReset.allData
            ? 'Are you sure you want to permanently delete ALL saved meal records across all months? This action cannot be undone.'
            : 'Are you sure you want to clear all meal entries for this selected month? This action cannot be undone.'
        }
        confirmLabel={confirmReset.allData ? 'Clear Everything' : 'Reset Month'}
        onConfirm={handleConfirmResetData}
        onCancel={() => setConfirmReset({ isOpen: false, allData: false })}
      />
    </div>
  );
}
