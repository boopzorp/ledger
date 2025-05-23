import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/expenseUtils';
import { useExpenses } from '../../lib/ExpenseContext';

const PaymentModeDistribution = ({ data }: { data: any[] }) => {
  const { themeMode } = useExpenses();
  
  // Process data to show payment mode distribution over months
  const processedData = data.map(month => {
    // Get total for the month
    const total = month.total;
    
    // Get payment modes from the expenses
    const modes = month.categories.reduce((acc: any, cat: any) => {
      // This is a simplification - in a real app we'd need to calculate actual mode totals
      // For this demo, we'll simulate mode distribution
      if (cat.category === 'Commute') {
        acc.Debit = (acc.Debit || 0) + cat.total * 0.7;
        acc.CC = (acc.CC || 0) + cat.total * 0.3;
      } else if (cat.category === 'Food') {
        acc.CC = (acc.CC || 0) + cat.total * 0.6;
        acc.Debit = (acc.Debit || 0) + cat.total * 0.4;
      } else {
        acc.CC = (acc.CC || 0) + cat.total * 0.5;
        acc.Debit = (acc.Debit || 0) + cat.total * 0.5;
      }
      return acc;
    }, {});
    
    return {
      name: month.month,
      ...modes,
      total
    };
  });
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className={`p-3 rounded shadow-md ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)} ({((entry.value / total) * 100).toFixed(1)}%)
            </p>
          ))}
          <p className="font-bold mt-1">Total: {formatCurrency(total)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          stackOffset="expand"
          barSize={60}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="CC" name="Credit Card" stackId="a" fill="#10b981" />
          <Bar dataKey="Debit" name="Debit" stackId="a" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentModeDistribution;
