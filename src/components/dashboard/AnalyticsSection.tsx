import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders } from '../../hooks/useOrders';

const AnalyticsSection: React.FC = () => {
  const { orders } = useOrders();

  // Calculate popular items from actual sales data
  const getPopularItems = () => {
    const itemCounts: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemCounts[item.item]) {
          itemCounts[item.item] += item.quantity;
        } else {
          itemCounts[item.item] = item.quantity;
        }
      });
    });

    // Convert to chart format and sort by quantity
    return Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Show top 6 items
  };

  const popularItems = getPopularItems();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          {popularItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularItems} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  // angle={-0}
                  textAnchor="end"
                  // height={100}
                  // interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`Quantity Sold: ${value}`, 'Items']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No sales data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection; 