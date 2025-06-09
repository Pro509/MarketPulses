import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Holding } from "@shared/schema";

interface TopPerformersProps {
  holdings: Holding[];
}

export default function TopPerformers({ holdings }: TopPerformersProps) {
  // Sort holdings by P&L percentage (descending for top performers, ascending for worst)
  const sortedByPnL = [...holdings].sort((a, b) => parseFloat(b.pnlPercent) - parseFloat(a.pnlPercent));
  
  // Get top 2 performers and worst 1 performer
  const topPerformers = sortedByPnL.slice(0, 2);
  const worstPerformer = sortedByPnL[sortedByPnL.length - 1];
  
  const displayHoldings = [
    ...topPerformers,
    ...(worstPerformer && parseFloat(worstPerformer.pnlPercent) < 0 ? [worstPerformer] : [])
  ].slice(0, 3); // Ensure we don't exceed 3 items

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (percent: string) => {
    const num = parseFloat(percent);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const getInitials = (name: string) => {
    return name.split('').slice(0, 2).join('').toUpperCase();
  };

  const getBackgroundColor = (pnlPercent: string) => {
    const percent = parseFloat(pnlPercent);
    if (percent >= 0) {
      return 'bg-green-50 dark:bg-green-900/20';
    }
    return 'bg-red-50 dark:bg-red-900/20';
  };

  const getInitialsColor = (pnlPercent: string) => {
    const percent = parseFloat(pnlPercent);
    if (percent >= 0) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-600';
    }
    return 'bg-red-100 dark:bg-red-900/30 text-red-600';
  };

  const getTextColor = (pnlPercent: string) => {
    const percent = parseFloat(pnlPercent);
    if (percent >= 0) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No holdings data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayHoldings.map((holding) => {
            const pnlPercent = parseFloat(holding.pnlPercent);
            const pnl = parseFloat(holding.pnl);
            
            return (
              <div 
                key={holding.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${getBackgroundColor(holding.pnlPercent)}`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getInitialsColor(holding.pnlPercent)}`}>
                    <span className="text-xs font-semibold">
                      {getInitials(holding.instrument)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {holding.instrument}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {holding.companyName || holding.instrument}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${getTextColor(holding.pnlPercent)}`}>
                    {formatPercent(holding.pnlPercent)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {displayHoldings.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Insufficient data for performance analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
}
