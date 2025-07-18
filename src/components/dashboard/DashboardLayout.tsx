import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import MetricsCards from './MetricsCards';
import SalesSection from './SalesSection';
import ExpensesSection from './ExpensesSection';
import AnalyticsSection from './AnalyticsSection';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-semibold">Shawarma Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Date Display */}
      <div className="sm:hidden px-4 py-2 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto sm:h-10">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2 text-xs sm:text-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2 text-xs sm:text-sm"
            >
              <DollarSign className="h-4 w-4" />
              <span>Sales</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2 text-xs sm:text-sm"
            >
              <Receipt className="h-4 w-4" />
              <span>Expenses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <MetricsCards />
            <AnalyticsSection />
          </TabsContent>

          <TabsContent value="sales">
            <SalesSection />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpensesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardLayout; 