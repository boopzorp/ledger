import { formatCurrency } from '../lib/expenseUtils';
import { MonthlyData } from '../lib/types';
import { useExpenses } from '../lib/ExpenseContext';

const SummaryCards = ({ data }: { data: MonthlyData }) => {
  const { themeMode } = useExpenses();
  
  // Calculate average daily spend
  const avgDailySpend = data.dailyTotals.length > 0
    ? data.total / data.dailyTotals.filter(day => day.total > 0).length
    : 0;
  
  // Find highest spending day
  const highestSpendDay = data.dailyTotals.reduce(
    (max, day) => day.total > max.total ? day : max,
    { date: new Date(), total: 0 }
  );
  
  // Find top spending category
  const topCategory = data.categories.length > 0 ? data.categories[0].category : 'None';
  
  // Calculate percentage of top category
  const topCategoryPercentage = data.categories.length > 0 ? data.categories[0].percentage : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className={`p-4 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spend</h3>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.total)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.month} {data.year}</p>
      </div>
      
      <div className={`p-4 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Daily Spend</h3>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(avgDailySpend)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per active day</p>
      </div>
      
      <div className={`p-4 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Spend Day</h3>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(highestSpendDay.total)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {highestSpendDay.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      
      <div className={`p-4 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Category</h3>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{topCategory}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {topCategoryPercentage.toFixed(1)}% of total
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
