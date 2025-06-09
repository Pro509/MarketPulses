import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { Holding } from "@shared/schema";

interface AllocationChartProps {
  holdings: Holding[];
}

export default function AllocationChart({ holdings }: AllocationChartProps) {
  // Calculate allocation by instrument type
  const allocation = holdings.reduce((acc, holding) => {
    const type = holding.instrumentType;
    const value = parseFloat(holding.currentValue);
    
    if (!acc[type]) {
      acc[type] = { type, value: 0, count: 0 };
    }
    acc[type].value += value;
    acc[type].count += 1;
    
    return acc;
  }, {} as Record<string, { type: string; value: number; count: number }>);

  const totalValue = Object.values(allocation).reduce((sum, item) => sum + item.value, 0);
  
  const chartData = Object.values(allocation).map(item => ({
    name: item.type.toUpperCase(),
    value: item.value,
    percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    count: item.count
  }));

  const COLORS = {
    stock: '#3B82F6',
    etf: '#10B981', 
    bond: '#8B5CF6'
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">Value: {formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-600">Percentage: {data.percentage.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Holdings: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#94A3B8'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ 
                    backgroundColor: COLORS[item.name.toLowerCase() as keyof typeof COLORS] || '#94A3B8' 
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}s</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
