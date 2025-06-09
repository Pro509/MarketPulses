import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { Holding } from "@shared/schema";

interface PerformanceChartProps {
  holdings: Holding[];
}

export default function PerformanceChart({ holdings }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState("1Y");

  const totalCurrentValue = holdings.reduce((sum, holding) => sum + parseFloat(holding.currentValue), 0);
  const totalInvested = holdings.reduce((sum, holding) => sum + parseFloat(holding.invested), 0);

  // Generate mock historical data based on current portfolio value
  const generateHistoricalData = (timeframe: string) => {
    const periods = {
      "1M": { months: 1, dataPoints: 30 },
      "3M": { months: 3, dataPoints: 90 },
      "6M": { months: 6, dataPoints: 180 },
      "1Y": { months: 12, dataPoints: 365 },
      "3Y": { months: 36, dataPoints: 1095 }
    };

    const config = periods[timeframe as keyof typeof periods] || periods["1Y"];
    const data = [];
    
    // Start from invested amount and gradually reach current value
    const growthRate = (totalCurrentValue - totalInvested) / totalInvested;
    const dailyGrowthRate = growthRate / config.dataPoints;
    
    for (let i = 0; i < config.dataPoints; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (config.dataPoints - i));
      
      // Add some volatility to make it realistic
      const volatility = (Math.random() - 0.5) * 0.02; // ±1% random volatility
      const baseValue = totalInvested * (1 + (dailyGrowthRate * i));
      const value = baseValue * (1 + volatility);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        value: Math.max(value, totalInvested * 0.8) // Ensure minimum 20% loss limit
      });
    }
    
    // Ensure the last value matches current portfolio value
    if (data.length > 0) {
      data[data.length - 1].value = totalCurrentValue;
    }
    
    return data;
  };

  const chartData = generateHistoricalData(timeframe);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const change = value - totalInvested;
      const changePercent = (change / totalInvested) * 100;
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-gray-600">
            Portfolio Value: {formatCurrency(value)}
          </p>
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
            Portfolio Performance
          </CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="3Y">3 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
