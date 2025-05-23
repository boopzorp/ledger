import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ModeTotal } from '../../lib/types';
import { formatCurrency } from '../../lib/expenseUtils';
import { useExpenses } from '../../lib/ExpenseContext';

const MonthlySpendByModes = ({ data }: { data: ModeTotal[] }) => {
  const { themeMode } = useExpenses();
  
  const chartData = data.map(item => ({
    name: item.mode,
    value: item.total,
    percentage: item.percentage
  }));
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded shadow-md ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <p className="font-medium">{label}</p>
          <p className="text-emerald-500 font-bold">{formatCurrency(payload[0].value)}</p>
          <p className="text-sm">{payload[0].payload.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
          <YAxis type="category" dataKey="name" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySpendByModes;
