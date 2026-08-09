export type MealType = 'breakfast' | 'lunch' | 'dinner';

export const FIXED_MEAL_RATE = 44; // ₹44 per meal

export interface MealEntry {
  received: boolean;
  markedAt?: string; // Formatted timestamp like "8:12 AM"
  markedTimestamp?: number; // Epoch timestamp
  amount?: number;       // ₹44
  rateAtTime?: number;   // ₹44
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
  fixedRate: number; // 44
  totalMeals: number;
  monthlyBill: number; // totalMeals * 44
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

