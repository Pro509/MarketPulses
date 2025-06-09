import { Wallet, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Holding } from "@shared/schema";

interface PortfolioOverviewProps {
  holdings: Holding[];
}

export default function PortfolioOverview({ holdings }: PortfolioOverviewProps) {
  const totalInvested = holdings.reduce((sum, holding) => sum + parseFloat(holding.invested), 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + parseFloat(holding.currentValue), 0);
  const totalPnL = holdings.reduce((sum, holding) => sum + parseFloat(holding.pnl), 0);
  const totalDayChange = holdings.reduce((sum, holding) => sum + parseFloat(holding.dayChange), 0);
  
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const dayChangePercent = totalCurrentValue > 0 ? (totalDayChange / (totalCurrentValue - totalDayChange)) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Invested */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Wallet className="text-primary h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Value */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalCurrentValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <BarChart3 className="text-success h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total P&L */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
              </p>
              <p className={`text-sm ${totalPnLPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercent(totalPnLPercent)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              totalPnL >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <TrendingUp className={`h-6 w-6 ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Change */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Change</p>
              <p className={`text-2xl font-bold ${totalDayChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalDayChange >= 0 ? '+' : ''}{formatCurrency(totalDayChange)}
              </p>
              <p className={`text-sm ${dayChangePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercent(dayChangePercent)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              totalDayChange >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <Calendar className={`h-6 w-6 ${totalDayChange >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
