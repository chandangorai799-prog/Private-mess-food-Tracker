export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealEntry {
  received: boolean;
  markedAt?: string; // Formatted timestamp like "8:12 AM"
  markedTimestamp?: number; // Epoch timestamp for sorting/analytics if needed
}

export interface DayRecord {
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  note?: string;
}

// Map of "YYYY-MM-DD" -> DayRecord
export type MealTrackerData = Record<string, DayRecord>;

export interface MessSettings {
  breakfastTime: string; // e.g. "08:00"
  lunchTime: string;     // e.g. "13:00"
  dinnerTime: string;    // e.g. "20:00"
  userName?: string;
  messName?: string;
}

export type DateStatus = 'past' | 'today' | 'future';

export interface MonthStats {
  daysInMonth: number;
  totalScheduled: number;
  totalReceived: number;
  totalPending: number; // Missed or pending up to today
  totalFuture: number;  // Future meal slots
  breakfastReceived: number;
  lunchReceived: number;
  dinnerReceived: number;
  elapsedScheduled: number; // Scheduled up to current day
  completionRate: number;   // Received / elapsedScheduled (or totalScheduled)
}
