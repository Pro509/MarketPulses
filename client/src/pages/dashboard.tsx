import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import FileUpload from "@/components/file-upload";
import PortfolioOverview from "@/components/portfolio-overview";
import HoldingsTable from "@/components/holdings-table";
import AllocationChart from "@/components/allocation-chart";
import PerformanceChart from "@/components/performance-chart";
import SentimentOverview from "@/components/sentiment-overview";
import TopPerformers from "@/components/top-performers";
import type { Portfolio, Holding } from "@shared/schema";

interface PortfolioData {
  portfolio: Portfolio;
  holdings: Holding[];
}

export default function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  
  const { data: portfolioData, isLoading, refetch } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });

  const { data: sentimentData } = useQuery<any>({
    queryKey: ["/api/market-sentiment"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const holdings = portfolioData?.holdings || [];
  const hasHoldings = holdings.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-major-mono">MarketPulses</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowUpload(true)} className="bg-primary text-white hover:bg-blue-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
              <ThemeToggle />
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload && (
          <FileUpload 
            onSuccess={() => {
              setShowUpload(false);
              refetch();
            }}
            onCancel={() => setShowUpload(false)}
          />
        )}

        {!hasHoldings && !showUpload ? (
          <div className="text-center py-12">
            <ChartLine className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Portfolio Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your CSV file to get started with portfolio analysis</p>
            <Button onClick={() => setShowUpload(true)} className="bg-primary text-white hover:bg-blue-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV File
            </Button>
          </div>
        ) : hasHoldings ? (
          <>
            {/* Portfolio Overview Cards */}
            <PortfolioOverview holdings={holdings} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Holdings Table */}
              <div className="lg:col-span-2">
                <HoldingsTable holdings={holdings} />
              </div>

              {/* Analysis Panel */}
              <div className="space-y-6">
                <AllocationChart holdings={holdings} />
                <SentimentOverview sentimentData={sentimentData} />
                <TopPerformers holdings={holdings} />
              </div>
            </div>

            {/* Performance Chart */}
            <div className="mt-8">
              <PerformanceChart holdings={holdings} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
