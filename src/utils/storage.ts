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
  theme: 'emerald',
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
 * Load all meal tracker data from localStorage with automatic migration and defensive parsing
 */
export function loadMealData(): MealTrackerData {
  try {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) return {};
    let parsed = JSON.parse(raw);

    // Auto-fix if raw was stored as { data: {...}, payments: [...] } due to object mutation bug
    if (parsed && typeof parsed === 'object' && 'data' in parsed && typeof parsed.data === 'object') {
      parsed = parsed.data;
    }

    // Automatic migration for existing data
    const migrated: MealTrackerData = {};
    if (parsed && typeof parsed === 'object') {
      Object.keys(parsed).forEach((dateKey) => {
        const rec = parsed[dateKey];
        if (rec && typeof rec === 'object' && ('breakfast' in rec || 'lunch' in rec || 'dinner' in rec)) {
          migrated[dateKey] = {
            ...rec,
            breakfast: migrateMealEntry(rec.breakfast),
            lunch: migrateMealEntry(rec.lunch),
            dinner: migrateMealEntry(rec.dinner),
          };
        }
      });
    }

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
 * Calculate the total meal bill for a specific month
 */
export function calculateMonthBill(
  year: number,
  month: number, // 0-indexed
  data: MealTrackerData,
  currentMealPrice: number = DEFAULT_MEAL_PRICE
): number {
  const dates = getDatesInMonth(year, month);
  let bill = 0;
  dates.forEach((d) => {
    const key = formatDateKey(d);
    const rec = getDayRecord(data, key, currentMealPrice);
    (['breakfast', 'lunch', 'dinner'] as MealType[]).forEach((mealKey) => {
      const entry = rec[mealKey];
      if (entry.received) {
        bill += entry.amount ?? entry.rateAtTime ?? currentMealPrice;
      }
    });
  });
  return bill;
}

/**
 * Calculate total direct payments made in a specific month
 */
export function calculateMonthPayments(
  year: number,
  month: number, // 0-indexed
  payments: PaymentRecord[]
): number {
  const monthKey = formatMonthKey(year, month);
  const monthPayments = payments.filter((p) => p.monthKey === monthKey);
  return monthPayments.reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Calculate the carried-over opening balance (advance) for a target month
 * by reliably propagating previous months' final closing balances.
 *
 * OPENING BALANCE = Previous month's FINAL CLOSING BALANCE
 * FINAL CLOSING BALANCE = Opening Balance + Payments - Meal Charges
 * If closing balance is positive, it carries over as advance credit.
 */
export function calculatePreviousAdvance(
  year: number,
  month: number, // 0-indexed
  data: MealTrackerData,
  payments: PaymentRecord[],
  usePreviousAdvance: boolean = true,
  currentMealPrice: number = DEFAULT_MEAL_PRICE
): number {
  if (!usePreviousAdvance) {
    return 0;
  }

  const targetMonthKey = formatMonthKey(year, month);

  // Collect all month keys that have any meals or payment records
  const monthKeySet = new Set<string>();

  if (data && typeof data === 'object') {
    Object.keys(data).forEach((dateKey) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        monthKeySet.add(dateKey.substring(0, 7));
      }
    });
  }

  if (Array.isArray(payments)) {
    payments.forEach((p) => {
      if (p.monthKey && /^\d{4}-\d{2}$/.test(p.monthKey)) {
        monthKeySet.add(p.monthKey);
      } else if (p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
        monthKeySet.add(p.date.substring(0, 7));
      }
    });
  }

  if (monthKeySet.size === 0) {
    return 0;
  }

  const sortedMonths = Array.from(monthKeySet).sort();
  const earliestMonthKey = sortedMonths[0];

  // If earliest activity is at or after target month, there is no prior month with data
  if (earliestMonthKey >= targetMonthKey) {
    return 0;
  }

  const [eYearStr, eMonthStr] = earliestMonthKey.split('-');
  let curYear = parseInt(eYearStr, 10);
  let curMonth = parseInt(eMonthStr, 10) - 1; // Convert to 0-indexed

  let runningAdvance = 0;
  let iterations = 0;
  const maxIterations = 240; // Max 20 years safety limit

  while (iterations < maxIterations) {
    const curKey = formatMonthKey(curYear, curMonth);
    if (curKey >= targetMonthKey) {
      break;
    }

    const monthBill = calculateMonthBill(curYear, curMonth, data, currentMealPrice);
    const monthPaid = calculateMonthPayments(curYear, curMonth, payments);
    const effectivePaid = monthPaid + runningAdvance;

    if (effectivePaid > monthBill) {
      runningAdvance = effectivePaid - monthBill;
    } else {
      runningAdvance = 0;
    }

    // Advance to next calendar month
    if (curMonth === 11) {
      curMonth = 0;
      curYear += 1;
    } else {
      curMonth += 1;
    }

    iterations++;
  }

  return runningAdvance;
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
  const stats = calculateMonthStats(year, month, data);
  const totalMeals = stats.totalReceived;

  // Sum actual meal amounts for current month
  const monthlyBill = calculateMonthBill(year, month, data, currentMealPrice);

  // Payments for current month
  const totalPaid = calculateMonthPayments(year, month, payments);

  // Check previous month advance if requested (chained from historical closing balances)
  const previousAdvance = usePreviousAdvance
    ? calculatePreviousAdvance(
        year,
        month,
        data,
        payments,
        usePreviousAdvance,
        currentMealPrice
      )
    : 0;

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

  // Ensure clean data structure
  let cleanData: MealTrackerData = data;
  if (data && typeof data === 'object' && 'data' in data && typeof (data as any).data === 'object') {
    cleanData = (data as any).data;
  }

  const backupObj = {
    app: 'My Mess Tracker',
    version: 3,
    ratePerMeal: currentPrice,
    exportedAt: new Date().toISOString(),
    mealRecords: cleanData || {},
    payments: payments || [],
    settings: settings || DEFAULT_SETTINGS,
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

    let rawMealData = parsed.mealRecords || parsed.mealData || parsed.records || parsed.data || {};
    if (rawMealData && typeof rawMealData === 'object' && 'data' in rawMealData && typeof rawMealData.data === 'object') {
      rawMealData = rawMealData.data;
    }

    const mealData: MealTrackerData = rawMealData;
    const payments: PaymentRecord[] = parsed.payments || parsed.paymentRecords || parsed.paymentData || [];
    const settings: MessSettings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings || parsed.preferences || {}),
    };

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

