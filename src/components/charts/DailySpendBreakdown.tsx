import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DailyTotal } from '../../lib/types';
import { formatCurrency } from '../../lib/expenseUtils';
import { format } from 'date-fns';
import { useExpenses } from '../../lib/ExpenseContext';

const DailySpendBreakdown = ({ data }: { data: DailyTotal[] }) => {
  const { themeMode } = useExpenses();
  
  const chartData = data.map(item => ({
    date: format(item.date, 'dd MMM'),
    value: item.total,
    fullDate: item.date
  }));
  
  // Calculate moving average
  const movingAverageWindow = 3;
  const chartDataWithMA = chartData.map((item, index, array) => {
    let maValue = 0;
    if (index >= movingAverageWindow - 1) {
      const sum = array
        .slice(index - (movingAverageWindow - 1), index + 1)
        .reduce((acc, curr) => acc + curr.value, 0);
      maValue = sum / movingAverageWindow;
    }
    return {
      ...item,
      ma: maValue
    };
  });
  
  // Calculate average spend
  const totalSpend = data.reduce((sum, day) => sum + day.total, 0);
  const avgSpend = data.length > 0 ? totalSpend / data.length : 0;
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = payload[0].payload.fullDate;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      return (
        <div className={`p-3 rounded shadow-md ${themeMode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <p className="font-medium">
            {format(date, 'EEEE, d MMMM')}
            {isWeekend && <span className="ml-2 text-yellow-500">(Weekend)</span>}
          </p>
          <p className="text-emerald-500 font-bold">{formatCurrency(payload[0].value)}</p>
          {payload[1] && payload[1].value > 0 && (
            <p className="text-sm text-blue-500">
              3-day avg: {formatCurrency(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartDataWithMA}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avgSpend} stroke="#8884d8" strokeDasharray="3 3" label="Avg" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="ma"
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailySpendBreakdown;
