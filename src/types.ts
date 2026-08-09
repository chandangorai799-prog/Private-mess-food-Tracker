export type MealType = 'breakfast' | 'lunch' | 'dinner';

export const DEFAULT_MEAL_PRICE = 44; // Default ₹44 per meal fallback
export const FIXED_MEAL_RATE = 44;   // Legacy alias fallback

export interface MealEntry {
  received: boolean;
  markedAt?: string; // Formatted timestamp like "8:12 AM"
  markedTimestamp?: number; // Epoch timestamp
  amount?: number;       // Actual cost for this meal (e.g. 44, 50, etc)
  rateAtTime?: number;   // Active rate when marked
}

export interface DayRecord {
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  note?: string;
}

// Map of "YYYY-MM-DD" -> DayRecord
export type MealTrackerData = Record<string, DayRecord>;

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export interface PaymentRecord {
  id: string;
  monthKey: string; // "YYYY-MM"
  date: string;     // "YYYY-MM-DD"
  formattedDate?: string; // "09 Aug 2026"
  amount: number;
  method: PaymentMethod;
  note?: string;
  createdAt: number;
}

export type PaymentStatus = 'UNPAID' | 'PARTIALLY PAID' | 'PAID' | 'PAID + ADVANCE';

export interface BillingSummary {
  fixedRate: number; // Current active device meal rate
  totalMeals: number;
  monthlyBill: number; // Sum of actual meal amounts for the month
  totalPaid: number;
  previousAdvance: number;
  effectivePaid: number;
  remainingBalance: number;
  advanceBalance: number;
  status: PaymentStatus;
  averageDailyExpense: number;
}

export interface MessSettings {
  breakfastTime: string; // e.g. "08:00"
  lunchTime: string;     // e.g. "13:00"
  dinnerTime: string;    // e.g. "20:00"
  userName?: string;
  messName?: string;
  usePreviousAdvance?: boolean;
  mealPrice?: number;    // Independent device meal price (e.g. 44, 50, 60)
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
  completionRate: number;   // Received / elapsedScheduled
  daysWithMealsCount: number;
}

