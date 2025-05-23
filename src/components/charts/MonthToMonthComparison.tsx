import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/expenseUtils';
import { useExpenses } from '../../lib/ExpenseContext';

const MonthToMonthComparison = ({ 
  currentMonth, 
  previousMonths 
}: { 
  currentMonth: any; 
  previousMonths: any[] 
}) => {
  const { themeMode } = useExpenses();
  
  // Get previous month data if available
  const previousMonth = previousMonths.length > 0 
    ? previousMonths.sort((a, b) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(b.month) - months.indexOf(a.month);
      })[0] 
    : null;
  
  // If no previous month data, show placeholder
  if (!previousMonth) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-500">No previous month data available for comparison</p>
      </div>
    );
  }
  
  // Get top 5 categories from both months
  const allCategories = new Set([
    ...currentMonth.categories.map((c: any) => c.category),
    ...previousMonth.categories.map((c: any) => c.category)
  ]);
  
  // Create comparison data
  const chartData = Array.from(allCategories).map(category => {
    const currentCat = currentMonth.categories.find((c: any) => c.category === category);
    const previousCat = previousMonth.categories.find((c: any) => c.category === category);
    
    return {
      name: category,
      current: currentCat ? currentCat.total : 0,
      previous: previousCat ? previousCat.total : 0,
      change: ((currentCat ? currentCat.total : 0) - (previousCat ? previousCat.total : 0))
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentValue = payload.find((p: any) => p.dataKey === 'current')?.value || 0;
      const previousValue = payload.find((p: any) => p.dataKey === 'previous')?.value || 0;
      const change = currentValue - previousValue;
      const percentChange = previousValue !== 0 
        ? (change / previousValue) * 100 
        : currentValue > 0 ? 100 : 0;
      
      return (
        <div className={`p-3 rounded shadow-md ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <p className="font-medium">{label}</p>
          <p className="text-emerald-500">{currentMonth.month}: {formatCurrency(currentValue)}</p>
          <p className="text-blue-500">{previousMonth.month}: {formatCurrency(previousValue)}</p>
          <p className={`font-bold ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({percentChange.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="current" name={currentMonth.month} fill="#10b981" />
          <Bar dataKey="previous" name={previousMonth.month} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthToMonthComparison;
