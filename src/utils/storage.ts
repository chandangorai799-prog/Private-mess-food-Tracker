import { MealTrackerData, MessSettings, DayRecord, MonthStats } from '../types';
import {
  formatDateKey,
  getDatesInMonth,
  getDateStatus,
  formatShortDate,
  getShortDayName,
  format12HourTime,
} from './dateUtils';

const STORAGE_DATA_KEY = 'mess_tracker_records_v1';
const STORAGE_SETTINGS_KEY = 'mess_tracker_settings_v1';

export const DEFAULT_SETTINGS: MessSettings = {
  breakfastTime: '08:00',
  lunchTime: '13:00',
  dinnerTime: '20:00',
  messName: 'Private Mess',
};

/**
 * Load settings from localStorage
 */
export function loadSettings(): MessSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
 * Load all meal tracker data from localStorage
 */
export function loadMealData(): MealTrackerData {
  try {
    const raw = localStorage.getItem(STORAGE_DATA_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
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
 * Get record for a specific date string (YYYY-MM-DD), returning default if non-existent
 */
export function getDayRecord(data: MealTrackerData, dateKey: string): DayRecord {
  if (data[dateKey]) {
    return data[dateKey];
  }
  return {
    breakfast: { received: false },
    lunch: { received: false },
    dinner: { received: false },
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

  dates.forEach((d) => {
    const key = formatDateKey(d);
    const record = getDayRecord(data, key);
    const status = getDateStatus(d);

    const bReceived = record.breakfast.received;
    const lReceived = record.lunch.received;
    const dReceived = record.dinner.received;

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
      // Future meals that are not received are counted as future slots
      if (!bReceived) totalFuture++;
      if (!lReceived) totalFuture++;
      if (!dReceived) totalFuture++;
    } else if (status === 'past') {
      // Past meals that were not received are pending/missed
      if (!bReceived) totalPending++;
      if (!lReceived) totalPending++;
      if (!dReceived) totalPending++;
      elapsedScheduled += 3;
    } else {
      // Today: Count elapsed scheduled and pending based on time/status
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
  };
}

/**
 * Export month records to CSV file
 */
export function exportMonthCSV(
  year: number,
  month: number,
  data: MealTrackerData,
  settings: MessSettings
): void {
  const dates = getDatesInMonth(year, month);
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const headers = [
    'Date',
    'Day',
    'Breakfast Status',
    'Breakfast Marked Time',
    'Lunch Status',
    'Lunch Marked Time',
    'Dinner Status',
    'Dinner Marked Time',
    'Daily Total Received (out of 3)',
  ];

  const rows: string[][] = [headers];

  dates.forEach((d) => {
    const key = formatDateKey(d);
    const record = getDayRecord(data, key);

    const bStatus = record.breakfast.received ? 'Received' : 'Not Received';
    const bTime = record.breakfast.markedAt || '';

    const lStatus = record.lunch.received ? 'Received' : 'Not Received';
    const lTime = record.lunch.markedAt || '';

    const dStatus = record.dinner.received ? 'Received' : 'Not Received';
    const dTime = record.dinner.markedAt || '';

    const totalDay =
      (record.breakfast.received ? 1 : 0) +
      (record.lunch.received ? 1 : 0) +
      (record.dinner.received ? 1 : 0);

    rows.push([
      formatShortDate(d),
      getShortDayName(d),
      bStatus,
      bTime,
      lStatus,
      lTime,
      dStatus,
      dTime,
      `${totalDay}/3`,
    ]);
  });

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `Mess_Meals_${monthName.replace(/\s+/g, '_')}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Clear data for current month or all data
 */
export function clearData(
  all: boolean,
  currentYear?: number,
  currentMonth?: number
): MealTrackerData {
  const currentData = loadMealData();
  if (all) {
    localStorage.removeItem(STORAGE_DATA_KEY);
    return {};
  } else if (currentYear !== undefined && currentMonth !== undefined) {
    const dates = getDatesInMonth(currentYear, currentMonth);
    const newData = { ...currentData };
    dates.forEach((d) => {
      const key = formatDateKey(d);
      delete newData[key];
    });
    saveMealData(newData);
    return newData;
  }
  return currentData;
}
