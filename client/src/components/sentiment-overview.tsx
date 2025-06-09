import { TrendingUp, TrendingDown, Minus, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SentimentData {
  overallSentiment: string;
  marketTrend: number;
  volatilityIndex: string;
  sectorPerformance: {
    sector: string;
    performance: number;
  }[];
}

interface SentimentOverviewProps {
  sentimentData?: SentimentData;
}

export default function SentimentOverview({ sentimentData }: SentimentOverviewProps) {
  if (!sentimentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Loading market data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4" />;
      case 'neutral':
        return <Minus className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'bg-green-100 text-green-800';
      case 'bearish':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance > 0) return 'bg-green-500';
    if (performance < 0) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getPerformanceProgress = (performance: number) => {
    // Convert performance to a 0-100 scale for progress bar
    const maxRange = 10; // Assume max ±10% range
    return Math.min(Math.max((performance + maxRange) / (2 * maxRange) * 100, 0), 100);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Sentiment</span>
            <Badge className={`${getSentimentColor(sentimentData.overallSentiment)} flex items-center gap-1`}>
              {getSentimentIcon(sentimentData.overallSentiment)}
              {sentimentData.overallSentiment.charAt(0).toUpperCase() + sentimentData.overallSentiment.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Market Trend</span>
            <span className={`text-sm font-medium ${
              sentimentData.marketTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {sentimentData.marketTrend >= 0 ? '+' : ''}{sentimentData.marketTrend.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Volatility Index</span>
            <span className="text-sm font-medium text-yellow-600 capitalize">
              {sentimentData.volatilityIndex}
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Sector Performance</h4>
          <div className="space-y-3">
            {sentimentData.sectorPerformance.map((sector, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0 flex-1 truncate">
                  {sector.sector}
                </span>
                <div className="flex items-center ml-2">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
                    <div 
                      className={`h-2 rounded-full ${getPerformanceColor(sector.performance)}`}
                      style={{ width: `${getPerformanceProgress(sector.performance)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium min-w-0 ${
                    sector.performance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
