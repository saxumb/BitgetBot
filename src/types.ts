/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BotMode {
  SIMULATED = "SIMULATED",
  REAL = "REAL"
}

export enum BotStatus {
  STOPPED = "STOPPED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED"
}

export enum PositionType {
  LONG = "LONG",
  SHORT = "SHORT" // For future futures extension, spot is usually long
}

export interface TechnicalIndicator {
  name: string;
  type: "RSI" | "MACD" | "EMA" | "SMA" | "BB" | "DV" | "SR";
  params: Record<string, number>;
  enabled: boolean;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  symbol: string; // e.g., "BTCUSDT"
  timeframe: string; // "1m" | "5m" | "15m" | "1h" | "4h"
  indicators: TechnicalIndicator[];
  buyTriggerCondition: string; // Trigger logic, e.g. "RSI < 30"
  sellTriggerCondition: string; // Trigger logic, e.g. "RSI > 70"
  riskManagement: {
    investmentAmount: number; // Quote currency, e.g., USDT
    stopLossPercent: number; // e.g., 2%
    trailingTakeProfitPercent: number; // e.g. Trailing TP point
    trailingActivationPercent: number; // Level to start trailing
    leverage?: number; // Leverage factor (1x - 10x)
    useTrendFilter?: boolean; // Enable 50-period EMA trend filter
  };
  aiNotes?: string;
  createdAt: string;
}

export interface Position {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  type: PositionType;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  investedAmount: number;
  highestPriceReached: number; // Tracker for trailing take-profit
  stopLossPrice: number; // Dynamic stop loss level
  takeProfitPrice: number; // Base take profit target
  pnl: number; // Absolute profit/loss
  pnlPercent: number; // Percentage PnL
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
  closeReason?: string;
  isTrailingActive: boolean;
  leverage?: number;
  volatilityAtEntry?: number;
  stopLossPercentAtEntry?: number;
}

export interface TradeLog {
  id: string;
  timestamp: string;
  type: "INFO" | "BUY" | "SELL" | "STOP_LOSS" | "TRAILING_TP" | "ERROR" | "WARNING";
  message: string;
  symbol: string;
  strategyName?: string;
  pnl?: number;
}

export interface MarketTicker {
  symbol: string;
  lastPr: string; // last price
  bidPr: string;
  askPr: string;
  high24h: string;
  low24h: string;
  open24h: string;
  change24h: string; // percentage change
}

export interface BitgetCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  sandbox: boolean;
}

export interface LiveState {
  botStatus: BotStatus;
  botMode: BotMode;
  activeStrategyId: string | null;
  strategies: TradingStrategy[];
  positions: Position[];
  tradeLogs: TradeLog[];
  tickers: Record<string, MarketTicker>;
  credentialsSet: boolean;
  simulatedBalance?: number;
}
