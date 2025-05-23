import { useState, useEffect } from 'react';
import { useExpenses } from '../lib/ExpenseContext';
import { format } from 'date-fns';
import { generateMonthlyData, generateYearlyData } from '../lib/expenseUtils';
import Header from './Header';
import FilterPanel from './FilterPanel';
import MonthlySpendByLabels from './charts/MonthlySpendByLabels';
import MonthlySpendByModes from './charts/MonthlySpendByModes';
import DailySpendBreakdown from './charts/DailySpendBreakdown';
import YearToDateTrends from './charts/YearToDateTrends';
import MonthToMonthComparison from './charts/MonthToMonthComparison';
import PaymentModeDistribution from './charts/PaymentModeDistribution';
import ExpenseTable from './ExpenseTable';
import SummaryCards from './SummaryCards';

const Dashboard = () => {
  const { 
    filteredExpenses, 
    isLoading, 
    error,
    themeMode
  } = useExpenses();
  
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);
  
  useEffect(() => {
    if (filteredExpenses.length > 0) {
      // Get the most recent date from the data
      const sortedDates = [...filteredExpenses].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
      
      const latestDate = sortedDates[0].date;
      const month = format(latestDate, 'MMMM');
      const year = latestDate.getFullYear();
      
      setCurrentMonth(month);
      setCurrentYear(year);
    }
  }, [filteredExpenses]);
  
  useEffect(() => {
    if (filteredExpenses.length > 0 && currentMonth && currentYear) {
      const monthly = generateMonthlyData(filteredExpenses, currentMonth, currentYear);
      const yearly = generateYearlyData(filteredExpenses, currentYear);
      
      setMonthlyData(monthly);
      setYearlyData(yearly);
    }
  }, [filteredExpenses, currentMonth, currentYear]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your expense data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <FilterPanel 
              currentMonth={currentMonth} 
              currentYear={currentYear}
              setCurrentMonth={setCurrentMonth}
              setCurrentYear={setCurrentYear}
            />
          </div>
          
          {/* Main content */}
          <div className="lg:w-3/4">
            {monthlyData && (
              <>
                <h1 className="text-2xl font-bold mb-6">
                  {currentMonth} {currentYear} Overview
                </h1>
                
                <SummaryCards data={monthlyData} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className={`p-6 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className="text-xl font-semibold mb-4">Spend by Category</h2>
                    <MonthlySpendByLabels data={monthlyData.categories} />
                  </div>
                  
                  <div className={`p-6 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className="text-xl font-semibold mb-4">Spend by Payment Mode</h2>
                    <MonthlySpendByModes data={monthlyData.modes} />
                  </div>
                </div>
                
                <div className={`p-6 rounded-lg shadow-md mb-8 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-semibold mb-4">Daily Spend Breakdown</h2>
                  <DailySpendBreakdown data={monthlyData.dailyTotals} />
                </div>
                
                {yearlyData && (
                  <>
                    <h1 className="text-2xl font-bold mb-6">
                      {currentYear} Trends
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className={`p-6 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className="text-xl font-semibold mb-4">Year-to-Date Spending</h2>
                        <YearToDateTrends data={yearlyData.monthlyTotals} />
                      </div>
                      
                      <div className={`p-6 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className="text-xl font-semibold mb-4">Month-to-Month Comparison</h2>
                        <MonthToMonthComparison 
                          currentMonth={monthlyData}
                          previousMonths={yearlyData.monthlyTotals.filter((m: any) => m.month !== currentMonth)}
                        />
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-lg shadow-md mb-8 ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h2 className="text-xl font-semibold mb-4">Payment Mode Distribution</h2>
                      <PaymentModeDistribution data={yearlyData.monthlyTotals} />
                    </div>
                  </>
                )}
                
                <div className={`p-6 rounded-lg shadow-md ${themeMode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className="text-xl font-semibold mb-4">Expense Details</h2>
                  <ExpenseTable expenses={filteredExpenses} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
