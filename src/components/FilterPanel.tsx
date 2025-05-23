import { useState } from 'react';
import { useExpenses } from '../lib/ExpenseContext';
import { format } from 'date-fns';
import { exportToCSV, downloadCSV } from '../lib/expenseUtils';

const FilterPanel = ({ 
  currentMonth, 
  currentYear,
  setCurrentMonth,
  setCurrentYear
}: { 
  currentMonth: string; 
  currentYear: number;
  setCurrentMonth: (month: string) => void;
  setCurrentYear: (year: number) => void;
}) => {
  const { 
    filteredExpenses,
    timeFilter, 
    setTimeFilter,
    selectedCategories,
    setSelectedCategories,
    selectedModes,
    setSelectedModes,
    themeMode
  } = useExpenses();
  
  const [isExporting, setIsExporting] = useState(false);
  
  // Get unique categories and payment modes
  const categories = [...new Set(filteredExpenses.map(expense => expense.label))];
  const paymentModes = [...new Set(filteredExpenses.map(expense => expense.mode))];
  
  // Get available months and years
  const availableMonths = [...new Set(filteredExpenses.map(expense => expense.month))];
  const availableYears = [...new Set(filteredExpenses.map(expense => expense.year))];
  
  const handleExport = () => {
    setIsExporting(true);
    try {
      const csvContent = exportToCSV(filteredExpenses);
      const filename = `expense-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const handleModeChange = (mode: string) => {
    if (selectedModes.includes(mode)) {
      setSelectedModes(selectedModes.filter(m => m !== mode));
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };
  
  return (
    <div className={`p-6 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Time Period</label>
        <div className="flex flex-wrap gap-2">
          {['day', 'week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period as any)}
              className={`px-3 py-1 rounded-full text-sm ${
                timeFilter === period
                  ? 'bg-emerald-500 text-white'
                  : themeMode === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Month</label>
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className={`w-full p-2 rounded border ${
            themeMode === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Year</label>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className={`w-full p-2 rounded border ${
            themeMode === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Categories</label>
        <div className="max-h-40 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor={`category-${category}`} className="text-sm">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Payment Modes</label>
        <div className="max-h-40 overflow-y-auto">
          {paymentModes.map((mode) => (
            <div key={mode} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`mode-${mode}`}
                checked={selectedModes.includes(mode)}
                onChange={() => handleModeChange(mode)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor={`mode-${mode}`} className="text-sm">
                {mode}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`w-full py-2 px-4 rounded font-medium ${
          themeMode === 'dark'
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isExporting ? 'Exporting...' : 'Export Data'}
      </button>
    </div>
  );
};

export default FilterPanel;
