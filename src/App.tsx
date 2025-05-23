import { ThemeProvider } from './components/ui/theme-provider';
import { ExpenseProvider } from './lib/ExpenseContext';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ExpenseProvider>
        <Dashboard />
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;
