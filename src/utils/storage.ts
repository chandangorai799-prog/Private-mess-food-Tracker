import {
  MealTrackerData,
  MessSettings,
  DayRecord,
  MonthStats,
  PaymentRecord,
  BillingSummary,
  DEFAULT_MEAL_PRICE,
  MealEntry,
  MealType,
} from '../types';
import {
  formatDateKey,
  getDatesInMonth,
  getDateStatus,
  formatShortDate,
  getShortDayName,
  formatMonthKey,
  getPreviousMonthKey,
  formatStringDateToIndian,
  formatIndianDate,
} from './dateUtils';

const STORAGE_DATA_KEY = 'mess_tracker_records_v1';
const STORAGE_SETTINGS_KEY = 'mess_tracker_settings_v1';
const STORAGE_PAYMENTS_KEY = 'mess_tracker_payments_v1';

export const DEFAULT_SETTINGS: MessSettings = {
  breakfastTime: '08:00',
  lunchTime: '13:00',
  dinnerTime: '20:00',
  messName: 'Private Mess',
  usePreviousAdvance: true,
  mealPrice: DEFAULT_MEAL_PRICE,
};

/**
 * Load settings from localStorage
 */
export function loadSettings(): MessSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const mealPrice =
      typeof parsed.mealPrice === 'number' && parsed.mealPrice > 0
        ? parsed.mealPrice
        : DEFAULT_MEAL_PRICE;
    return { ...DEFAULT_SETTINGS, ...parsed, mealPrice };
  } catch (err) {
    console.error('Failed to load mess settings', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: MessSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save mess settings', err);
  }
}

/**
 * Migrate single meal entry to ensure rateAtTime and amount are properly set
 */
function migrateMealEntry(
  entry?: MealEntry,
  defaultPrice: number = DEFAULT_MEAL_PRICE
): MealEntry {
  if (!entry) {
    return { received: false, rateAtTime: defaultPrice, amount: 0 };
  }
  const rateAtTime = entry.rateAtTime ?? defaultPrice;
  const amount = entry.received ? (entry.amount ?? rateAtTime) : 0;
  return {
    ...entry,
    rateAtTime,
    amount,
  };
}

/**
 * Load all meal tracker data from localStorage with automatic migration
 */
export function loadMealData(): MealTrackerData {
  try {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MealTrackerData;

    // Automatic migration for existing data
    const migrated: MealTrackerData = {};
    Object.keys(parsed).forEach((dateKey) => {
      const rec = parsed[dateKey];
      migrated[dateKey] = {
        ...rec,
        breakfast: migrateMealEntry(rec.breakfast),
        lunch: migrateMealEntry(rec.lunch),
        dinner: migrateMealEntry(rec.dinner),
      };
    });

    return migrated;
  } catch (err) {
    console.error('Failed to load meal tracker data', err);
    return {};
  }
}

/**
 * Save meal tracker data to localStorage
 */
export function saveMealData(data: MealTrackerData): void {
  try {
    localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save meal tracker data', err);
  }
}

/**
 * Load all payment records
 */
export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load payments', err);
    return [];
  }
}

export const loadPaymentData = loadPayments;

/**
 * Save all payment records
 */
export function savePayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save payments', err);
  }
}

export const savePaymentData = savePayments;


/**
 * Get record for a specific date string (YYYY-MM-DD), returning default if non-existent
 */
export function getDayRecord(
  data: MealTrackerData,
  dateKey: string,
  currentPrice: number = DEFAULT_MEAL_PRICE
): DayRecord {
  if (data[dateKey]) {
    const rec = data[dateKey];
    return {
      breakfast: migrateMealEntry(rec.breakfast, currentPrice),
      lunch: migrateMealEntry(rec.lunch, currentPrice),
      dinner: migrateMealEntry(rec.dinner, currentPrice),
      note: rec.note,
    };
  }
  return {
    breakfast: { received: false, rateAtTime: currentPrice, amount: 0 },
    lunch: { received: false, rateAtTime: currentPrice, amount: 0 },
    dinner: { received: false, rateAtTime: currentPrice, amount: 0 },
  };
}

/**
 * Calculate month statistics given year, month, and meal tracker data
 */
export function calculateMonthStats(
  year: number,
  month: number, // 0-indexed
  data: MealTrackerData
): MonthStats {
  const dates = getDatesInMonth(year, month);
  const daysInMonth = dates.length;
  const totalScheduled = daysInMonth * 3;

  let totalReceived = 0;
  let totalPending = 0;
  let totalFuture = 0;
  let breakfastReceived = 0;
  let lunchReceived = 0;
  let dinnerReceived = 0;

  let elapsedScheduled = 0;
  let daysWithMealsCount = 0;

  dates.forEach((d) => {
    const key = formatDateKey(d);
    const record = getDayRecord(data, key);
    const status = getDateStatus(d);

    const bReceived = record.breakfast.received;
    const lReceived = record.lunch.received;
    const dReceived = record.dinner.received;

    const dayMealCount = (bReceived ? 1 : 0) + (lReceived ? 1 : 0) + (dReceived ? 1 : 0);
    if (dayMealCount > 0) {
      daysWithMealsCount++;
    }

    if (bReceived) {
      breakfastReceived++;
      totalReceived++;
    }
    if (lReceived) {
      lunchReceived++;
      totalReceived++;
    }
    if (dReceived) {
      dinnerReceived++;
      totalReceived++;
    }

    if (status === 'future') {
      if (!bReceived) totalFuture++;
      if (!lReceived) totalFuture++;
      if (!dReceived) totalFuture++;
    } else if (status === 'past') {
      if (!bReceived) totalPending++;
      if (!lReceived) totalPending++;
      if (!dReceived) totalPending++;
      elapsedScheduled += 3;
    } else {
      elapsedScheduled += 3;
      if (!bReceived) totalPending++;
      if (!lReceived) totalPending++;
      if (!dReceived) totalPending++;
    }
  });

  const completionRate =
    elapsedScheduled > 0
      ? Math.round((totalReceived / elapsedScheduled) * 100)
      : 0;

  return {
    daysInMonth,
    totalScheduled,
    totalReceived,
    totalPending,
    totalFuture,
    breakfastReceived,
    lunchReceived,
    dinnerReceived,
    elapsedScheduled,
    completionRate: Math.min(100, Math.max(0, completionRate)),
    daysWithMealsCount,
  };
}

/**
 * Calculate full billing summary for a specific year and month
 */
export function calculateBillingSummary(
  year: number,
  month: number, // 0-indexed
  data: MealTrackerData,
  payments: PaymentRecord[],
  usePreviousAdvance: boolean = true,
  currentMealPrice: number = DEFAULT_MEAL_PRICE
): BillingSummary {
  const monthKey = formatMonthKey(year, month);
  const stats = calculateMonthStats(year, month, data);
  const totalMeals = stats.totalReceived;

  // Sum actual meal amounts for current month
  const dates = getDatesInMonth(year, month);
  let monthlyBill = 0;
  dates.forEach((d) => {
    const key = formatDateKey(d);
    const rec = getDayRecord(data, key, currentMealPrice);
    (['breakfast', 'lunch', 'dinner'] as MealType[]).forEach((mealKey) => {
      const entry = rec[mealKey];
      if (entry.received) {
        monthlyBill += entry.amount ?? entry.rateAtTime ?? currentMealPrice;
      }
    });
  });

  // Payments for current month
  const monthPayments = payments.filter((p) => p.monthKey === monthKey);
  const totalPaid = monthPayments.reduce((sum, p) => sum + p.amount, 0);

  // Check previous month advance if requested
  let previousAdvance = 0;
  if (usePreviousAdvance) {
    const prevKey = getPreviousMonthKey(year, month);
    const [prevYearStr, prevMonthStr] = prevKey.split('-');
    const prevYear = parseInt(prevYearStr, 10);
    const prevMonth = parseInt(prevMonthStr, 10) - 1; // Convert to 0-indexed

    const prevDates = getDatesInMonth(prevYear, prevMonth);
    let prevBill = 0;
    prevDates.forEach((d) => {
      const key = formatDateKey(d);
      const rec = getDayRecord(data, key, currentMealPrice);
      (['breakfast', 'lunch', 'dinner'] as MealType[]).forEach((mealKey) => {
        const entry = rec[mealKey];
        if (entry.received) {
          prevBill += entry.amount ?? entry.rateAtTime ?? currentMealPrice;
        }
      });
    });

    const prevPayments = payments.filter((p) => p.monthKey === prevKey);
    const prevPaid = prevPayments.reduce((sum, p) => sum + p.amount, 0);

    if (prevPaid > prevBill) {
      previousAdvance = prevPaid - prevBill;
    }
  }

  const effectivePaid = totalPaid + previousAdvance;

  let remainingBalance = 0;
  let advanceBalance = 0;

  if (effectivePaid < monthlyBill) {
    remainingBalance = monthlyBill - effectivePaid;
  } else {
    advanceBalance = effectivePaid - monthlyBill;
  }

  let status: BillingSummary['status'] = 'UNPAID';
  if (effectivePaid === 0 && monthlyBill > 0) {
    status = 'UNPAID';
  } else if (effectivePaid === 0 && monthlyBill === 0) {
    status = 'PAID';
  } else if (effectivePaid < monthlyBill) {
    status = 'PARTIALLY PAID';
  } else if (effectivePaid === monthlyBill) {
    status = 'PAID';
  } else {
    status = 'PAID + ADVANCE';
  }

  const daysCount = stats.daysWithMealsCount > 0 ? stats.daysWithMealsCount : 1;
  const averageDailyExpense = Math.round(monthlyBill / daysCount);

  return {
    fixedRate: currentMealPrice,
    totalMeals,
    monthlyBill,
    totalPaid,
    previousAdvance,
    effectivePaid,
    remainingBalance,
    advanceBalance,
    status,
    averageDailyExpense,
  };
}

/**
 * Export month records to enhanced CSV file
 */
export function exportMonthCSV(
  year: number,
  month: number,
  data: MealTrackerData,
  settings: MessSettings,
  payments: PaymentRecord[]
): void {
  const currentPrice = settings.mealPrice || DEFAULT_MEAL_PRICE;
  const dates = getDatesInMonth(year, month);
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const billing = calculateBillingSummary(
    year,
    month,
    data,
    payments,
    settings.usePreviousAdvance,
    currentPrice
  );

  const headers = [
    'Date',
    'Day',
    'Meals Received',
    'Rate Per Meal (INR)',
    'Daily Total (INR)',
    'Payment (INR)',
    'Payment Method',
    'Monthly Bill (INR)',
    'Total Paid (INR)',
    'Remaining Balance (INR)',
    'Payment Status',
  ];

  const rows: string[][] = [headers];

  dates.forEach((d) => {
    const dateKey = formatDateKey(d);
    const record = getDayRecord(data, dateKey, currentPrice);

    let mealCount = 0;
    let dailyCost = 0;
    (['breakfast', 'lunch', 'dinner'] as MealType[]).forEach((mealKey) => {
      const entry = record[mealKey];
      if (entry.received) {
        mealCount++;
        dailyCost += entry.amount ?? entry.rateAtTime ?? currentPrice;
      }
    });

    // Check if there were payments on this exact date
    const datePayments = payments.filter((p) => p.date === dateKey);
    const dayPaidTotal = datePayments.reduce((s, p) => s + p.amount, 0);
    const dayPayMethods = datePayments.map((p) => p.method).join('; ');

    rows.push([
      formatStringDateToIndian(dateKey),
      getShortDayName(d),
      `${mealCount}`,
      `₹${currentPrice}`,
      `₹${dailyCost}`,
      dayPaidTotal > 0 ? `₹${dayPaidTotal}` : '—',
      dayPayMethods || '—',
      `₹${billing.monthlyBill}`,
      `₹${billing.effectivePaid}`,
      `₹${billing.remainingBalance}`,
      billing.status,
    ]);
  });

  // Summary footer row
  rows.push([]);
  rows.push([
    'MONTHLY SUMMARY',
    '',
    `Total Meals: ${billing.totalMeals}`,
    `Current Device Rate: ₹${currentPrice}`,
    `Total Bill: ₹${billing.monthlyBill}`,
    `Paid: ₹${billing.totalPaid}`,
    `Prev Advance: ₹${billing.previousAdvance}`,
    `Effective Paid: ₹${billing.effectivePaid}`,
    `Remaining: ₹${billing.remainingBalance}`,
    `Advance: ₹${billing.advanceBalance}`,
    `Status: ${billing.status}`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `Mess_Bill_${monthName.replace(/\s+/g, '_')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Backup all data as JSON file
 */
export function exportBackupJSON(
  data: MealTrackerData,
  payments: PaymentRecord[],
  settings: MessSettings
): void {
  const currentPrice = settings.mealPrice || DEFAULT_MEAL_PRICE;
  const backupObj = {
    app: 'My Mess Tracker',
    version: 3,
    ratePerMeal: currentPrice,
    exportedAt: new Date().toISOString(),
    mealRecords: data,
    payments: payments,
    settings: settings,
  };

  const jsonStr = JSON.stringify(backupObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = formatDateKey(new Date());
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Mess_Tracker_Backup_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Restore all data from a JSON backup string
 */
export function restoreBackupJSON(jsonStr: string): {
  success: boolean;
  mealData?: MealTrackerData;
  payments?: PaymentRecord[];
  settings?: MessSettings;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }

    const mealData = parsed.mealRecords || parsed.mealData || {};
    const payments = parsed.payments || [];
    const settings = parsed.settings || DEFAULT_SETTINGS;

    saveMealData(mealData);
    savePayments(payments);
    saveSettings(settings);

    return {
      success: true,
      mealData,
      payments,
      settings,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to parse JSON file',
    };
  }
}

/**
 * Clear data for current month or all data
 */

export function clearData(
  all: boolean,
  currentYear?: number,
  currentMonth?: number
): { data: MealTrackerData; payments: PaymentRecord[] } {
  const currentData = loadMealData();
  const currentPayments = loadPayments();

  if (all) {
    localStorage.removeItem(STORAGE_DATA_KEY);
    localStorage.removeItem(STORAGE_PAYMENTS_KEY);
    return { data: {}, payments: [] };
  } else if (currentYear !== undefined && currentMonth !== undefined) {
    const monthKey = formatMonthKey(currentYear, currentMonth);
    const dates = getDatesInMonth(currentYear, currentMonth);

    const newData = { ...currentData };
    dates.forEach((d) => {
      const key = formatDateKey(d);
      delete newData[key];
    });

    const newPayments = currentPayments.filter((p) => p.monthKey !== monthKey);

    saveMealData(newData);
    savePayments(newPayments);
    return { data: newData, payments: newPayments };
  }

  return { data: currentData, payments: currentPayments };
}

