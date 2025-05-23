export interface ExpenseData {
  Amount: string;
  'Amount Paid To': string;
  Label: string;
  ToD: string;
  Date: string;
  Month: string;
  Year: string;
  Time: string;
  Mode: string;
  Notes: string;
}

export interface ProcessedExpense {
  amount: number;
  amountPaidTo: string;
  label: string;
  timeOfDay: string;
  date: Date;
  month: string;
  year: number;
  time: string;
  mode: string;
  notes: string;
}

export interface DailyTotal {
  date: Date;
  total: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface ModeTotal {
  mode: string;
  total: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  year: number;
  total: number;
  categories: CategoryTotal[];
  modes: ModeTotal[];
  dailyTotals: DailyTotal[];
}

export interface YearlyData {
  year: number;
  total: number;
  monthlyTotals: {
    month: string;
    total: number;
    categories: CategoryTotal[];
  }[];
}

export type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'custom';
export type ThemeMode = 'light' | 'dark';
