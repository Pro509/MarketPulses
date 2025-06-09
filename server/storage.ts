import { users, portfolios, holdings, type User, type InsertUser, type Portfolio, type InsertPortfolio, type Holding, type InsertHolding } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio methods
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  getPortfoliosByUserId(userId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  
  // Holdings methods
  getHolding(id: number): Promise<Holding | undefined>;
  getHoldingsByPortfolioId(portfolioId: number): Promise<Holding[]>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  createManyHoldings(holdings: InsertHolding[]): Promise<Holding[]>;
  updateHolding(id: number, holding: Partial<InsertHolding>): Promise<Holding | undefined>;
  deleteHolding(id: number): Promise<boolean>;
  clearPortfolioHoldings(portfolioId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolios: Map<number, Portfolio>;
  private holdings: Map<number, Holding>;
  private currentUserId: number;
  private currentPortfolioId: number;
  private currentHoldingId: number;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.holdings = new Map();
    this.currentUserId = 1;
    this.currentPortfolioId = 1;
    this.currentHoldingId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Portfolio methods
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(
      (portfolio) => portfolio.userId === userId,
    );
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = { 
      id,
      userId: insertPortfolio.userId,
      name: insertPortfolio.name,
      createdAt: new Date()
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  // Holdings methods
  async getHolding(id: number): Promise<Holding | undefined> {
    return this.holdings.get(id);
  }

  async getHoldingsByPortfolioId(portfolioId: number): Promise<Holding[]> {
    return Array.from(this.holdings.values()).filter(
      (holding) => holding.portfolioId === portfolioId,
    );
  }

  async createHolding(insertHolding: InsertHolding): Promise<Holding> {
    const id = this.currentHoldingId++;
    const holding: Holding = { 
      id,
      portfolioId: insertHolding.portfolioId,
      instrument: insertHolding.instrument,
      instrumentType: insertHolding.instrumentType,
      quantity: insertHolding.quantity,
      avgCost: insertHolding.avgCost,
      ltp: insertHolding.ltp,
      invested: insertHolding.invested,
      currentValue: insertHolding.currentValue,
      pnl: insertHolding.pnl,
      pnlPercent: insertHolding.pnlPercent,
      dayChange: insertHolding.dayChange,
      dayChangePercent: insertHolding.dayChangePercent,
      companyName: insertHolding.companyName || null,
      sector: insertHolding.sector || null,
      marketSentiment: insertHolding.marketSentiment || null
    };
    this.holdings.set(id, holding);
    return holding;
  }

  async createManyHoldings(insertHoldings: InsertHolding[]): Promise<Holding[]> {
    const holdings: Holding[] = [];
    for (const insertHolding of insertHoldings) {
      const holding = await this.createHolding(insertHolding);
      holdings.push(holding);
    }
    return holdings;
  }

  async updateHolding(id: number, updates: Partial<InsertHolding>): Promise<Holding | undefined> {
    const existing = this.holdings.get(id);
    if (!existing) return undefined;
    
    const updated: Holding = { ...existing, ...updates };
    this.holdings.set(id, updated);
    return updated;
  }

  async deleteHolding(id: number): Promise<boolean> {
    return this.holdings.delete(id);
  }

  async clearPortfolioHoldings(portfolioId: number): Promise<void> {
    const holdingsToDelete = Array.from(this.holdings.entries()).filter(
      ([_, holding]) => holding.portfolioId === portfolioId
    );
    
    for (const [id] of holdingsToDelete) {
      this.holdings.delete(id);
    }
  }
}

export const storage = new MemStorage();
