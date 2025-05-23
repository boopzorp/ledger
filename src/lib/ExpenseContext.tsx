import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProcessedExpense, TimeFilter, ThemeMode } from '../lib/types';
import { loadExpenseData } from '../lib/expenseUtils';

interface ExpenseContextType {
  expenses: ProcessedExpense[];
  filteredExpenses: ProcessedExpense[];
  isLoading: boolean;
  error: string | null;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedModes: string[];
  setSelectedModes: (modes: string[]) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  refreshData: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<ProcessedExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ProcessedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  
  // Theme
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  
  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await loadExpenseData();
      setExpenses(data);
      setFilteredExpenses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load expense data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    loadData();
  }, []);
  
  // Apply filters whenever filter state changes
  useEffect(() => {
    if (expenses.length === 0) return;
    
    let filtered = [...expenses];
    
    // Apply date range filter if both dates are set
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(expense => 
        expense.date >= dateRange[0]! && expense.date <= dateRange[1]!
      );
    }
    
    // Apply category filter if any categories are selected
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense => 
        selectedCategories.includes(expense.label)
      );
    }
    
    // Apply payment mode filter if any modes are selected
    if (selectedModes.length > 0) {
      filtered = filtered.filter(expense => 
        selectedModes.includes(expense.mode)
      );
    }
    
    setFilteredExpenses(filtered);
  }, [expenses, dateRange, selectedCategories, selectedModes]);
  
  // Function to refresh data
  const refreshData = async () => {
    await loadData();
  };
  
  const value = {
    expenses,
    filteredExpenses,
    isLoading,
    error,
    timeFilter,
    setTimeFilter,
    dateRange,
    setDateRange,
    selectedCategories,
    setSelectedCategories,
    selectedModes,
    setSelectedModes,
    themeMode,
    setThemeMode,
    refreshData
  };
  
  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
