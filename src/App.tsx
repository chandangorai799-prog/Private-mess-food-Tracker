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
  PaymentRecord,
  DEFAULT_MEAL_PRICE,
  ThemePalette,
} from './types';
import {
  loadMealData,
  saveMealData,
  loadSettings,
  saveSettings,
  loadPaymentData,
  savePaymentData,
  getDayRecord,
  calculateMonthStats,
  calculateBillingSummary,
  exportMonthCSV,
  exportBackupJSON,
  restoreBackupJSON,
  clearData,
} from './utils/storage';
import { exportMonthPDF } from './utils/pdfGenerator';
import {
  formatDateKey,
  formatMonthKey,
  getMonthName,
  getCurrentFormattedTime,
} from './utils/dateUtils';

import { Header } from './components/Header';
import { MonthNavigator } from './components/MonthNavigator';
import { DashboardStats } from './components/DashboardStats';
import { TodayQuickAction } from './components/TodayQuickAction';
import { BillingSummaryCard } from './components/BillingSummaryCard';
import { PaymentSection } from './components/PaymentSection';
import { MealTable } from './components/MealTable';
import { StatsBreakdown } from './components/StatsBreakdown';
import { SettingsModal } from './components/SettingsModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';

export default function App() {
  const [today] = useState(() => new Date());

  // Active Year and Month state
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());

  // Meal Tracker Data, Payments & Settings State
  const [mealData, setMealData] = useState<MealTrackerData>(() => loadMealData());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => loadPaymentData());
  const [settings, setSettings] = useState<MessSettings>(() => loadSettings());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<{
    isOpen: boolean;
    allData: boolean;
  }>({
    isOpen: false,
    allData: false,
  });

  // Apply theme to document element and body
  useEffect(() => {
    const currentTheme = settings.theme || 'emerald';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
  }, [settings.theme]);

  // Save meal data whenever it changes
  useEffect(() => {
    saveMealData(mealData);
  }, [mealData]);

  // Save payment data whenever it changes
  useEffect(() => {
    savePaymentData(payments);
  }, [payments]);

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
    const activePrice =
      settings.mealPrice && settings.mealPrice > 0
        ? settings.mealPrice
        : DEFAULT_MEAL_PRICE;

    setMealData((prevData) => {
      const dayRecord = getDayRecord(prevData, dateKey, activePrice);
      const currentEntry = dayRecord[meal];

      const newReceived = !currentEntry.received;
      const rateToUse = newReceived
        ? (currentEntry.rateAtTime ?? activePrice)
        : activePrice;

      const updatedEntry = {
        received: newReceived,
        markedAt: newReceived ? getCurrentFormattedTime() : undefined,
        markedTimestamp: newReceived ? Date.now() : undefined,
        rateAtTime: rateToUse,
        amount: newReceived ? rateToUse : 0,
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

  // Clear an entire day's meal record
  const handleClearDayRecord = (dateKey: string) => {
    setMealData((prevData) => {
      const next = { ...prevData };
      delete next[dateKey];
      return next;
    });
  };

  // Payment Handlers
  const handleAddPayment = (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const newRecord: PaymentRecord = {
      ...payment,
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setPayments((prev) => [newRecord, ...prev]);
  };

  const handleEditPayment = (updated: PaymentRecord) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  const handleTogglePreviousAdvance = (useAdv: boolean) => {
    setSettings((prev) => ({ ...prev, usePreviousAdvance: useAdv }));
  };

  // Compute month statistics & billing summaries
  const stats = useMemo(() => {
    return calculateMonthStats(selectedYear, selectedMonth, mealData);
  }, [selectedYear, selectedMonth, mealData]);

  const activeMealPrice =
    settings.mealPrice && settings.mealPrice > 0
      ? settings.mealPrice
      : DEFAULT_MEAL_PRICE;

  const billing = useMemo(() => {
    return calculateBillingSummary(
      selectedYear,
      selectedMonth,
      mealData,
      payments,
      settings.usePreviousAdvance ?? true,
      activeMealPrice
    );
  }, [
    selectedYear,
    selectedMonth,
    mealData,
    payments,
    settings.usePreviousAdvance,
    activeMealPrice,
  ]);

  // Today's Record
  const todayKey = formatDateKey(today);
  const todayRecord = getDayRecord(mealData, todayKey, activeMealPrice);
  const todayMealsCount =
    (todayRecord.breakfast.received ? 1 : 0) +
    (todayRecord.lunch.received ? 1 : 0) +
    (todayRecord.dinner.received ? 1 : 0);

  const monthNameStr = getMonthName(selectedMonth).toUpperCase();

  // Export/Import Handlers
  const handleExportCSV = () => {
    exportMonthCSV(selectedYear, selectedMonth, mealData, settings, payments);
  };

  const handleExportPDF = () => {
    exportMonthPDF(selectedYear, selectedMonth, mealData, settings, payments);
  };

  const handleExportJSON = () => {
    exportBackupJSON(mealData, payments, settings);
  };

  const handleRestoreJSON = (jsonStr: string) => {
    const res = restoreBackupJSON(jsonStr);
    if (res.success && res.mealData && res.payments) {
      setMealData(res.mealData);
      setPayments(res.payments);
      if (res.settings) setSettings(res.settings);
      alert('Data restored successfully!');
    } else {
      alert(`Data restore failed: ${res.error || 'Invalid file structure'}`);
    }
  };

  // Handle data reset confirmation
  const handleConfirmResetData = () => {
    // Take an automatic backup before clearing so user data is never lost permanently
    exportBackupJSON(mealData, payments, settings);

    const updated = clearData(
      confirmReset.allData,
      selectedYear,
      selectedMonth
    );
    setMealData(updated.data);
    setPayments(updated.payments);

    setConfirmReset({ isOpen: false, allData: false });
  };

  return (
    <div className="min-h-screen theme-app-bg flex flex-col font-sans transition-colors duration-200">
      {/* Top Sticky Header */}
      <Header
        messName={settings.messName || 'Private Mess Tracker'}
        activeTheme={settings.theme || 'emerald'}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 space-y-5">
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

        {/* Top Summary Dashboard Stats */}
        <DashboardStats
          stats={stats}
          billing={billing}
          todayMealsCount={todayMealsCount}
          monthName={monthNameStr}
        />

        {/* Today's Quick Action Bar */}
        <TodayQuickAction
          todayDate={today}
          todayRecord={todayRecord}
          settings={settings}
          onToggleMeal={handleToggleMeal}
        />

        {/* Monthly Bill & Financial Summary Card */}
        <BillingSummaryCard
          monthName={`${monthNameStr} ${selectedYear}`}
          billing={billing}
          settings={settings}
          onTogglePreviousAdvance={handleTogglePreviousAdvance}
        />

        {/* Payment Record & History Section */}
        <PaymentSection
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          payments={payments}
          onAddPayment={handleAddPayment}
          onEditPayment={handleEditPayment}
          onDeletePayment={handleDeletePayment}
        />

        {/* Monthly Food Record Table / Calendar */}
        <MealTable
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          data={mealData}
          settings={settings}
          onToggleMeal={handleToggleMeal}
          onClearDayRecord={handleClearDayRecord}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
        />

        {/* Detailed Breakdown & Meal Attendance Stats */}
        <StatsBreakdown stats={stats} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs font-semibold text-slate-500">
        <p>
          Smart Mess Management • ₹{activeMealPrice} Rate per Meal • Offline PWA
        </p>
      </footer>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeSelectorOpen}
        activeTheme={settings.theme || 'emerald'}
        onSelectTheme={(newTheme) =>
          setSettings((prev) => ({ ...prev, theme: newTheme }))
        }
        onClose={() => setIsThemeSelectorOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onExportJSON={handleExportJSON}
        onRestoreJSON={handleRestoreJSON}
        onRequestResetData={(allData) =>
          setConfirmReset({ isOpen: true, allData })
        }
      />

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmReset.isOpen}
        title={
          confirmReset.allData
            ? 'Clear ALL Mess Records & Payments?'
            : 'Reset Current Month Data?'
        }
        message={
          confirmReset.allData
            ? 'Are you sure you want to permanently delete ALL saved meal records and payment entries across all months? This action cannot be undone.'
            : 'Are you sure you want to clear all meal entries and payments for this selected month? This action cannot be undone.'
        }
        confirmText={confirmReset.allData ? 'Clear Everything' : 'Reset Month'}
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmResetData}
        onCancel={() => setConfirmReset({ isOpen: false, allData: false })}
      />
    </div>
  );
}

