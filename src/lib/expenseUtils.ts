import Papa from 'papaparse';
import { ExpenseData, ProcessedExpense, CategoryTotal, ModeTotal, DailyTotal, MonthlyData, YearlyData } from './types';
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

// Helper to parse the amount string (₹) to number
export const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;
  // Remove currency symbol and commas, then parse as float
  return parseFloat(amountStr.replace(/[₹,]/g, '')) || 0;
};

// Parse date string in DD/MM/YYYY format
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
  return isValid(parsedDate) ? parsedDate : new Date();
};

// Process raw expense data
export const processExpenseData = (data: ExpenseData[]): ProcessedExpense[] => {
  return data
    .filter(item => item.Amount && item.Date) // Filter out empty rows
    .map(item => ({
      amount: parseAmount(item.Amount),
      amountPaidTo: item['Amount Paid To'] || '',
      label: item.Label || 'Uncategorized',
      timeOfDay: item.ToD || '',
      date: parseDate(item.Date),
      month: item.Month || '',
      year: parseInt(item.Year) || new Date().getFullYear(),
      time: item.Time || '',
      mode: item.Mode || 'Unknown',
      notes: item.Notes || ''
    }));
};

// Load and parse CSV data
export const loadExpenseData = async (): Promise<ProcessedExpense[]> => {
  try {
    const response = await fetch('/expense-data.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const processedData = processExpenseData(results.data as ExpenseData[]);
          resolve(processedData);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading expense data:', error);
    return [];
  }
};

// Filter expenses by date range
export const filterExpensesByDateRange = (
  expenses: ProcessedExpense[],
  startDate: Date,
  endDate: Date
): ProcessedExpense[] => {
  return expenses.filter(expense => {
    const expenseDate = expense.date;
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

// Calculate category totals
export const calculateCategoryTotals = (expenses: ProcessedExpense[]): CategoryTotal[] => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryMap = expenses.reduce((acc, expense) => {
    const category = expense.label || 'Uncategorized';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryMap)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);
};

// Calculate payment mode totals
export const calculateModeTotals = (expenses: ProcessedExpense[]): ModeTotal[] => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const modeMap = expenses.reduce((acc, expense) => {
    const mode = expense.mode || 'Unknown';
    acc[mode] = (acc[mode] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(modeMap)
    .map(([mode, total]) => ({
      mode,
      total,
      percentage: totalAmount > 0 ? (total / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);
};

// Calculate daily totals for a month
export const calculateDailyTotals = (
  expenses: ProcessedExpense[],
  month: string,
  year: number
): DailyTotal[] => {
  // Create a map for all days in the month
  const firstDay = startOfMonth(new Date(year, getMonthIndex(month), 1));
  const lastDay = endOfMonth(firstDay);
  
  // Create an array with all days in the month
  const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  // Initialize with zero totals
  const dailyTotalsMap = allDays.reduce((acc, day) => {
    acc[format(day, 'yyyy-MM-dd')] = { date: day, total: 0 };
    return acc;
  }, {} as Record<string, DailyTotal>);
  
  // Fill in actual expense data
  expenses.forEach(expense => {
    const dateKey = format(expense.date, 'yyyy-MM-dd');
    if (dailyTotalsMap[dateKey]) {
      dailyTotalsMap[dateKey].total += expense.amount;
    }
  });
  
  // Convert map to array and sort by date
  return Object.values(dailyTotalsMap).sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
};

// Helper to get month index from name
export const getMonthIndex = (monthName: string): number => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
};

// Generate monthly data summary
export const generateMonthlyData = (
  expenses: ProcessedExpense[],
  month: string,
  year: number
): MonthlyData => {
  const monthExpenses = expenses.filter(
    expense => expense.month.toLowerCase() === month.toLowerCase() && expense.year === year
  );
  
  const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return {
    month,
    year,
    total,
    categories: calculateCategoryTotals(monthExpenses),
    modes: calculateModeTotals(monthExpenses),
    dailyTotals: calculateDailyTotals(monthExpenses, month, year)
  };
};

// Generate yearly data summary
export const generateYearlyData = (
  expenses: ProcessedExpense[],
  year: number
): YearlyData => {
  const yearExpenses = expenses.filter(expense => expense.year === year);
  
  const monthlyTotals = Array.from(
    new Set(yearExpenses.map(expense => expense.month))
  ).map(month => {
    const monthExpenses = yearExpenses.filter(
      expense => expense.month.toLowerCase() === month.toLowerCase()
    );
    
    return {
      month,
      total: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      categories: calculateCategoryTotals(monthExpenses)
    };
  });
  
  return {
    year,
    total: yearExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    monthlyTotals
  };
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Export data to CSV
export const exportToCSV = (expenses: ProcessedExpense[]): string => {
  const data = expenses.map(expense => ({
    ...expense,
    date: format(expense.date, 'dd/MM/yyyy'),
    amount: formatCurrency(expense.amount)
  }));
  
  return Papa.unparse(data);
};

// Download data as CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
