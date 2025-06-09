import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { csvUploadSchema, insertHoldingSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

function parseCSVData(csvContent: string) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    if (values.length >= 9 && values[0]) { // Ensure we have valid data
      data.push({
        instrument: values[0],
        quantity: values[1],
        avgCost: values[2],
        ltp: values[3],
        invested: values[4],
        currentValue: values[5],
        pnl: values[6],
        netChange: values[7],
        dayChange: values[8]
      });
    }
  }
  
  return data;
}

function classifyInstrument(instrumentName: string): string {
  const name = instrumentName.toUpperCase();
  
  // ETF patterns
  if (name.includes('ETF') || name.includes('BEES') || name.includes('IETF') || 
      name.includes('NV20') || name.includes('MOM100') || name.includes('MON100') ||
      name.includes('MIDCAP') || name.includes('NIFTY')) {
    return 'etf';
  }
  
  // Bond patterns (numbers followed by letters, typically bonds)
  if (/^\d+[A-Z]+\d+/.test(name) || name.includes('FL') || name.includes('SL')) {
    return 'bond';
  }
  
  // Default to stock
  return 'stock';
}

function generateMarketSentiment(): string {
  const sentiments = ['bullish', 'bearish', 'neutral', 'stable'];
  const weights = [0.4, 0.2, 0.3, 0.1]; // Higher probability for bullish
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < sentiments.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return sentiments[i];
    }
  }
  
  return 'neutral';
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get or create default portfolio
  app.get("/api/portfolio", async (req, res) => {
    try {
      // For demo purposes, create a default user and portfolio if they don't exist
      let user = await storage.getUserByUsername("default");
      if (!user) {
        user = await storage.createUser({ username: "default", password: "password" });
      }
      
      let portfolios = await storage.getPortfoliosByUserId(user.id);
      let portfolio = portfolios[0];
      
      if (!portfolio) {
        portfolio = await storage.createPortfolio({
          userId: user.id,
          name: "My Portfolio"
        });
      }
      
      const holdings = await storage.getHoldingsByPortfolioId(portfolio.id);
      
      res.json({
        portfolio,
        holdings
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Upload CSV file
  app.post("/api/upload-csv", upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const parsedData = parseCSVData(csvContent);
      
      // Validate parsed data
      const validation = csvUploadSchema.safeParse({ data: parsedData });
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid CSV format",
          errors: validation.error.errors
        });
      }

      // Get or create default portfolio
      let user = await storage.getUserByUsername("default");
      if (!user) {
        user = await storage.createUser({ username: "default", password: "password" });
      }
      
      let portfolios = await storage.getPortfoliosByUserId(user.id);
      let portfolio = portfolios[0];
      
      if (!portfolio) {
        portfolio = await storage.createPortfolio({
          userId: user.id,
          name: "My Portfolio"
        });
      }

      // Clear existing holdings
      await storage.clearPortfolioHoldings(portfolio.id);

      // Process and create holdings
      const holdings = parsedData.map(row => {
        const quantity = parseFloat(row.quantity) || 0;
        const avgCost = parseFloat(row.avgCost) || 0;
        const ltp = parseFloat(row.ltp) || 0;
        const invested = parseFloat(row.invested) || 0;
        const currentValue = parseFloat(row.currentValue) || 0;
        const pnl = parseFloat(row.pnl) || 0;
        const dayChange = parseFloat(row.dayChange) || 0;
        
        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
        const dayChangePercent = currentValue > 0 ? (dayChange / (currentValue - dayChange)) * 100 : 0;
        
        return {
          portfolioId: portfolio.id,
          instrument: row.instrument,
          instrumentType: classifyInstrument(row.instrument),
          quantity: quantity.toString(),
          avgCost: avgCost.toString(),
          ltp: ltp.toString(),
          invested: invested.toString(),
          currentValue: currentValue.toString(),
          pnl: pnl.toString(),
          pnlPercent: pnlPercent.toString(),
          dayChange: dayChange.toString(),
          dayChangePercent: dayChangePercent.toString(),
          companyName: row.instrument, // In real app, fetch from API
          sector: "Technology", // In real app, fetch from API
          marketSentiment: generateMarketSentiment()
        };
      });

      // Validate each holding
      const validatedHoldings = holdings.map(holding => {
        const validation = insertHoldingSchema.safeParse(holding);
        if (!validation.success) {
          throw new Error(`Invalid holding data for ${holding.instrument}`);
        }
        return validation.data;
      });

      await storage.createManyHoldings(validatedHoldings);
      
      res.json({ 
        message: "CSV uploaded and processed successfully",
        holdingsCount: validatedHoldings.length
      });
      
    } catch (error) {
      console.error("Error processing CSV:", error);
      res.status(500).json({ 
        message: "Failed to process CSV file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get market sentiment data
  app.get("/api/market-sentiment", async (req, res) => {
    try {
      // In a real app, this would fetch from a financial API
      res.json({
        overallSentiment: "bullish",
        marketTrend: 2.3,
        volatilityIndex: "moderate",
        sectorPerformance: [
          { sector: "Technology", performance: 5.2 },
          { sector: "Energy", performance: 3.1 },
          { sector: "Banking", performance: -1.8 },
          { sector: "Healthcare", performance: 2.7 },
          { sector: "Consumer Goods", performance: 1.9 }
        ]
      });
    } catch (error) {
      console.error("Error fetching market sentiment:", error);
      res.status(500).json({ message: "Failed to fetch market sentiment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
