import React from 'react';
import './index.css';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { ThemeProvider } from './components/ui/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="shawarma-theme">
      <div className="App">
        <DashboardLayout />
      </div>
    </ThemeProvider>
  );
}

export default App;
