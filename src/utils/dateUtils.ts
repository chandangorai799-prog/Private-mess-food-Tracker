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
 * Get current time string in 12-hour format with AM/PM (e.g. "1:00 PM")
 */
export function getCurrentFormattedTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format 24-hour time string ("13:00") to 12-hour string ("1:00 PM")
 */
export function format12HourTime(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (
    trimmed.includes('AM') ||
    trimmed.includes('PM') ||
    trimmed.includes('am') ||
    trimmed.includes('pm')
  ) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2) || '00';
  if (isNaN(hours)) return timeStr;

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
 * Get month name from 0-indexed month number (e.g. 7 -> "August")
 */
export function getMonthName(monthIndex: number): string {
  const date = new Date(2026, monthIndex, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
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
 * Format Date to YYYY-MM string (e.g. "2026-08")
 */
export function formatMonthKey(year: number, month: number): string {
  const m = String(month + 1).padStart(2, '0');
  return `${year}-${m}`;
}

/**
 * Get previous month key (e.g. "2026-08" -> "2026-07")
 */
export function getPreviousMonthKey(year: number, month: number): string {
  if (month === 0) {
    return `${year - 1}-12`;
  }
  const m = String(month).padStart(2, '0');
  return `${year}-${m}`;
}

/**
 * Format Date to Indian date display "09 Aug 2026"
 */
export function formatIndianDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${monthStr} ${year}`;
}

/**
 * Format date string "YYYY-MM-DD" to Indian date display "09 Aug 2026"
 */
export function formatStringDateToIndian(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return formatIndianDate(d);
}

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
