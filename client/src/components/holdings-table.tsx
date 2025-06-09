import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Holding } from "@shared/schema";

interface HoldingsTableProps {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredHoldings = holdings.filter(holding => {
    const matchesSearch = holding.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (holding.companyName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || holding.instrumentType === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (percent: string) => {
    const num = parseFloat(percent);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const getInstrumentBadge = (type: string) => {
    const variants = {
      stock: "bg-blue-100 text-blue-800",
      etf: "bg-green-100 text-green-800",
      bond: "bg-purple-100 text-purple-800"
    };
    
    return variants[type as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    
    const config = {
      bullish: { icon: "↗", class: "bg-green-100 text-green-800" },
      bearish: { icon: "↘", class: "bg-red-100 text-red-800" },
      neutral: { icon: "→", class: "bg-yellow-100 text-yellow-800" },
      stable: { icon: "🛡", class: "bg-blue-100 text-blue-800" }
    };
    
    const sentimentConfig = config[sentiment as keyof typeof config];
    if (!sentimentConfig) return null;
    
    return (
      <Badge className={`${sentimentConfig.class} text-xs`}>
        <span className="mr-1">{sentimentConfig.icon}</span>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split('').slice(0, 2).join('').toUpperCase();
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="border-b border-gray-200 dark:border-gray-600 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">Your Holdings</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search holdings..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stock">Stocks</SelectItem>
                <SelectItem value="etf">ETFs</SelectItem>
                <SelectItem value="bond">Bonds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  LTP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Invested
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredHoldings.map((holding) => {
                const pnl = parseFloat(holding.pnl);
                const pnlPercent = parseFloat(holding.pnlPercent);
                
                return (
                  <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold text-primary">
                            {getInitials(holding.instrument)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{holding.instrument}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {holding.companyName || holding.instrument}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getInstrumentBadge(holding.instrumentType)}>
                        {holding.instrumentType.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                      {parseFloat(holding.quantity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                      {formatCurrency(holding.ltp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                      {formatCurrency(holding.invested)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                      {formatCurrency(holding.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                      </div>
                      <div className={`text-xs ${pnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercent(holding.pnlPercent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getSentimentBadge(holding.marketSentiment)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredHoldings.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No holdings found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
