import { DateStatus } from '../types';

/**
 * Format Date to YYYY-MM-DD string
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time string in 12-hour format with AM/PM (e.g. "8:12 AM")
 */
export function getCurrentFormattedTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format 24-hour time string ("13:00") to 12-hour string ("1:00 PM")
 */
export function format12HourTime(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Get all dates in a specified year and month (0-indexed month)
 */
export function getDatesInMonth(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

/**
 * Get month name and year string (e.g. "August 2026")
 */
export function getMonthYearString(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Format day display (e.g. "1 Aug")
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

/**
 * Get day of week name (e.g. "Sat", "Sun", "Mon")
 */
export function getShortDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Check if given date is Today
 */
export function isTodayDate(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Get status of date relative to today ('past' | 'today' | 'future')
 */
export function getDateStatus(date: Date): DateStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return 'today';
  } else if (compareDate.getTime() < today.getTime()) {
    return 'past';
  } else {
    return 'future';
  }
}
