import { pgTable, text, serial, integer, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const holdings = pgTable("holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  instrument: text("instrument").notNull(),
  instrumentType: text("instrument_type").notNull(), // 'stock', 'etf', 'bond'
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  avgCost: decimal("avg_cost", { precision: 10, scale: 2 }).notNull(),
  ltp: decimal("ltp", { precision: 10, scale: 2 }).notNull(),
  invested: decimal("invested", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
  pnl: decimal("pnl", { precision: 15, scale: 2 }).notNull(),
  pnlPercent: decimal("pnl_percent", { precision: 10, scale: 4 }).notNull(),
  dayChange: decimal("day_change", { precision: 15, scale: 2 }).notNull(),
  dayChangePercent: decimal("day_change_percent", { precision: 10, scale: 4 }).notNull(),
  companyName: text("company_name"),
  sector: text("sector"),
  marketSentiment: text("market_sentiment"), // 'bullish', 'bearish', 'neutral', 'stable'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  name: true,
}).extend({
  userId: z.number(),
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
}).extend({
  portfolioId: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;

// CSV Upload schema
export const csvUploadSchema = z.object({
  data: z.array(z.object({
    instrument: z.string(),
    quantity: z.string(),
    avgCost: z.string(),
    ltp: z.string(),
    invested: z.string(),
    currentValue: z.string(),
    pnl: z.string(),
    netChange: z.string(),
    dayChange: z.string(),
  }))
});

export type CSVUploadData = z.infer<typeof csvUploadSchema>;
