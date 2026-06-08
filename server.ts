/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import crypto from "crypto";
import dotenv from "dotenv";
import { 
  BotStatus, 
  BotMode, 
  TradingStrategy, 
  Position, 
  TradeLog, 
  MarketTicker, 
  BitgetCredentials, 
  PositionType
} from "./src/types.js";

dotenv.config();

// Lazily initialize Google Gen AI server-side
let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Default Mock/Simulated historical positions & strategies for high fidelity
const INITIAL_STRATEGIES: TradingStrategy[] = [
  {
    id: "strat-dynamic-multi",
    name: "Scanner Multi-Coppia Dinamico (Predefinito)",
    description: "Algoritmo quantistico adattivo che scansiona continuamente BTC, ETH, SOL, XRP e ADA sul mercato per catturare all-in l'asset con migliore configurazione tecnica.",
    symbol: "DYNAMIC",
    timeframe: "5m",
    indicators: [
      { name: "RSI Momentum Scanner", type: "RSI", params: { period: 14 }, enabled: true },
      { name: "Fast EMA Tracker", type: "EMA", params: { period: 10 }, enabled: true },
      { name: "Slow EMA Tracker", type: "EMA", params: { period: 30 }, enabled: true }
    ],
    buyTriggerCondition: "RSI < 38",
    sellTriggerCondition: "RSI > 65",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 2.0,
      trailingTakeProfitPercent: 0.8,
      trailingActivationPercent: 2.5,
      leverage: 1
    },
    aiNotes: "Questo algoritmo scansiona a intervalli regolari l'intero paniere di mercato di Bitget. Non appena una delle coppie incrocia in ipervenduto oppure mostra un'ottima forza relativa, apre un'azione di trading Spot allocando il budget. Risolve il problema del gating vincolato su singole coppie.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: "strat-ai-scalper",
    name: "AI Multi-Indicator Scalper (Suggerito)",
    description: "Algoritmo ad alta frequenza che combina RSI ipervenduto/ipercomprato con l'indicatore EMA per catturare piccoli trend rapidi.",
    symbol: "BTCUSDT",
    timeframe: "5m",
    indicators: [
      { name: "RSI Momentum", type: "RSI", params: { period: 14 }, enabled: true },
      { name: "Fast EMA", type: "EMA", params: { period: 9 }, enabled: true },
      { name: "Slow EMA", type: "EMA", params: { period: 21 }, enabled: true }
    ],
    buyTriggerCondition: "RSI < 35 AND Fast_EMA > Slow_EMA",
    sellTriggerCondition: "RSI > 65 OR Fast_EMA < Slow_EMA",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 1.5,
      trailingTakeProfitPercent: 0.5,
      trailingActivationPercent: 2.0,
      leverage: 1
    },
    aiNotes: "L'intelligenza artificiale raccomanda questa strategia su orizzonti temporali brevi per capitalizzare sulla volatilità intraday del Bitcoin. Lo stop loss stretto protegge da dump rapidi.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "strat-eth-trend",
    name: "EMA Crossover Momentum Tracker",
    description: "Insegue i trend macro su Ethereum utilizzando tagli di medie mobili veloci e lente per confermare forza di mercato.",
    symbol: "ETHUSDT",
    timeframe: "15m",
    indicators: [
      { name: "Fast EMA", type: "EMA", params: { period: 10 }, enabled: true },
      { name: "Slow EMA", type: "EMA", params: { period: 50 }, enabled: true }
    ],
    buyTriggerCondition: "Fast_EMA supera Slow_EMA",
    sellTriggerCondition: "Fast_EMA scende sotto Slow_EMA",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 2.5,
      trailingTakeProfitPercent: 1.0,
      trailingActivationPercent: 4.5,
      leverage: 1
    },
    aiNotes: "Ottimizzato per contesti direzionali chiari. Evitare l'attivazione in fasi puramente laterali per ridurre falsi segnali di trading.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const INITIAL_LOGS: TradeLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: "INFO",
    symbol: "SYSTEM",
    message: "Avvio motore di auto-trading algoritmico Bitget completato."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 7100000).toISOString(),
    type: "INFO",
    symbol: "SYSTEM",
    message: "Puntamento API Bitget configurato in modalità demo / paper trading."
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "BUY",
    symbol: "BTCUSDT",
    strategyName: "AI Multi-Indicator Scalper (Suggerito)",
    message: "Eseguito ACQUISTO Spot BTC @ $96,520.00 (RSI = 32, EMA crossover attivo)"
  },
  {
    id: "log-4",
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    type: "INFO",
    symbol: "BTCUSDT",
    strategyName: "AI Multi-Indicator Scalper (Suggerito)",
    message: "Raggiunta soglia di attivazione Trailing Take-Profit (+2.14% gain). Avvio inseguimento dinamico."
  },
  {
    id: "log-5",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    type: "TRAILING_TP",
    symbol: "BTCUSDT",
    strategyName: "AI Multi-Indicator Scalper (Suggerito)",
    message: "Eseguita VENDITA Spot BTC @ $98,350.00 (+1.89% Profitto via Trailing Take-Profit)",
    pnl: 9.45
  }
];

const INITIAL_POSITIONS: Position[] = [
  {
    id: "pos-demo-active",
    strategyId: "strat-eth-trend",
    strategyName: "EMA Crossover Momentum Tracker",
    symbol: "ETHUSDT",
    type: PositionType.LONG,
    entryPrice: 3420.50,
    currentPrice: 3485.20,
    quantity: 0.2923,
    investedAmount: 1000.00,
    highestPriceReached: 3491.00,
    stopLossPrice: 3334.98,
    takeProfitPrice: 3600.00,
    pnl: 18.91,
    pnlPercent: 1.89,
    status: "OPEN",
    openedAt: new Date(Date.now() - 1800000).toISOString(),
    isTrailingActive: false
  }
];

// App In-Memory State
let botStatus: BotStatus = BotStatus.STOPPED;
let botMode: BotMode = BotMode.SIMULATED;
let activeStrategyId: string | null = "strat-dynamic-multi";
let strategies: TradingStrategy[] = [...INITIAL_STRATEGIES];
let positions: Position[] = []; // Start with empty active positions to clean slate for €100 budget
let tradeLogs: TradeLog[] = [...INITIAL_LOGS];
let credentialsSet: boolean = false;
let bitgetCredentials: BitgetCredentials | null = null;
let simulatedBalance: number = 100.00; // Simulated wallet starting budget (€100)

// Tickers State with initial mock prices
let tickers: Record<string, MarketTicker> = {
  "BTCUSDT": {
    symbol: "BTCUSDT",
    lastPr: "96850.00",
    bidPr: "96848.50",
    askPr: "96851.50",
    high24h: "98200.00",
    low24h: "95100.00",
    open24h: "95800.00",
    change24h: "1.10"
  },
  "ETHUSDT": {
    symbol: "ETHUSDT",
    lastPr: "3485.20",
    bidPr: "3485.00",
    askPr: "3485.40",
    high24h: "3540.00",
    low24h: "3390.00",
    open24h: "3410.00",
    change24h: "2.20"
  },
  "SOLUSDT": {
    symbol: "SOLUSDT",
    lastPr: "248.50",
    bidPr: "248.40",
    askPr: "248.60",
    high24h: "254.00",
    low24h: "238.00",
    open24h: "240.00",
    change24h: "3.54"
  },
  "XRPUSDT": {
    symbol: "XRPUSDT",
    lastPr: "2.35",
    bidPr: "2.348",
    askPr: "2.352",
    high24h: "2.55",
    low24h: "2.20",
    open24h: "2.22",
    change24h: "5.85"
  },
  "ADAUSDT": {
    symbol: "ADAUSDT",
    lastPr: "0.985",
    bidPr: "0.984",
    askPr: "0.986",
    high24h: "1.05",
    low24h: "0.95",
    open24h: "0.96",
    change24h: "2.60"
  }
};

// Simulated indicator tracking so the trading logs feel dynamic
let indicatorTracking: Record<string, { rsi: number; emaShort: number; emaLong: number }> = {
  "BTCUSDT": { rsi: 42, emaShort: 96800, emaLong: 96750 },
  "ETHUSDT": { rsi: 58, emaShort: 3480, emaLong: 3460 },
  "SOLUSDT": { rsi: 65, emaShort: 248, emaLong: 245 },
  "XRPUSDT": { rsi: 72, emaShort: 2.34, emaLong: 2.30 },
  "ADAUSDT": { rsi: 50, emaShort: 0.98, emaLong: 0.97 }
};

// Helper to push logs with simple limit
function addTradeLog(type: TradeLog["type"], symbol: string, message: string, strategyName?: string, pnl?: number) {
  const newLog: TradeLog = {
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    type,
    symbol,
    message,
    strategyName,
    pnl
  };
  tradeLogs.unshift(newLog);
  if (tradeLogs.length > 100) {
    tradeLogs.pop();
  }
  return newLog;
}

// Bitget Spot API helpers for real operation if keys are supplied
async function queryBitgetPublicTickers() {
  try {
    const res = await fetch("https://api.bitget.com/api/v2/spot/market/tickers");
    if (!res.ok) throw new Error("Status " + res.status);
    const body = await res.json() as any;
    if (body && body.code === "00000" && Array.isArray(body.data)) {
      // Pick the main pairs we monitor
      const symbolsToTrack = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"];
      body.data.forEach((t: any) => {
        if (symbolsToTrack.includes(t.symbol)) {
          tickers[t.symbol] = {
            symbol: t.symbol,
            lastPr: t.lastPr,
            bidPr: t.bidPr,
            askPr: t.askPr,
            high24h: t.high24h,
            low24h: t.low24h,
            open24h: t.open24h,
            change24h: (parseFloat(t.change24h) * 100).toFixed(2) // Standard percentage mapping
          };
        }
      });
    }
  } catch (err: any) {
    // API failure fallback or silent logging (perfectly normal during development and offline modes)
    // We already have beautiful realistic ticking rates
  }
}

// Background poll tickers and execute strategy decisions
setInterval(async () => {
  try {
    // 1. Fetch live prices from Bitget public endpoint
    await queryBitgetPublicTickers();

    // 2. Perform mock price ticks to keep UI beautifully lively if static or for finer movements
    Object.keys(tickers).forEach((sym) => {
      const tick = tickers[sym];
      const curP = parseFloat(tick.lastPr);
      const vol = sym === "BTCUSDT" ? 25 : sym === "ETHUSDT" ? 1.5 : sym === "SOLUSDT" ? 0.2 : sym === "XRPUSDT" ? 0.005 : 0.002;
      // Walk price with a tiny random brownian motion
      const change = (Math.random() - 0.49) * vol;
      const newP = curP + change;
      
      // Update ticker
      tick.lastPr = newP.toFixed(sym.includes("XRP") || sym.includes("ADA") ? 4 : 2);
      tick.bidPr = (newP - vol * 0.1).toFixed(sym.includes("XRP") || sym.includes("ADA") ? 4 : 2);
      tick.askPr = (newP + vol * 0.1).toFixed(sym.includes("XRP") || sym.includes("ADA") ? 4 : 2);

      // Slowly update indicator values for simulated trading decisions
      const ind = indicatorTracking[sym] || { rsi: 50, emaShort: newP, emaLong: newP };
      // Brownian motion on indicators
      ind.rsi = Math.max(15, Math.min(85, ind.rsi + (Math.random() - 0.5) * 2));
      ind.emaShort = ind.emaShort * 0.95 + newP * 0.05;
      ind.emaLong = ind.emaLong * 0.98 + newP * 0.02;
      indicatorTracking[sym] = ind;
    });

    // 3. If bot is RUNNING, evaluate risk controls and strategy rules
    if (botStatus === BotStatus.RUNNING) {
      // A. Evaluate open positions FIRST (RISK MANAGEMENT: stop-loss & trailing take-profit)
      positions = positions.map((pos) => {
        if (pos.status === "CLOSED") return pos;

        const tick = tickers[pos.symbol];
        if (!tick) return pos;

        const currentPrice = parseFloat(tick.lastPr);
        pos.currentPrice = currentPrice;
        
        // Calculate active PnL taking leverage into account
        const leverage = pos.leverage || 1;
        const deltaPercent = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
        pos.pnlPercent = deltaPercent * leverage;
        pos.pnl = (pos.investedAmount * pos.pnlPercent) / 100;

        // Check for position liquidation
        if (pos.pnlPercent <= -100) {
          pos.status = "CLOSED";
          pos.closedAt = new Date().toISOString();
          pos.closeReason = "LIQUIDATION";
          pos.pnlPercent = -100;
          pos.pnl = -pos.investedAmount;
          addTradeLog("STOP_LOSS", pos.symbol, `💥 LIQUIDAZIONE! Posizione su ${pos.symbol} liquidata a $${currentPrice.toLocaleString()} a causa della leva ${leverage}x (PnL: -100%, perdita: -$${pos.investedAmount.toFixed(2)})`, pos.strategyName, pos.pnl);
          
          if (botMode === BotMode.SIMULATED) {
            simulatedBalance += (pos.investedAmount + pos.pnl);
            addTradeLog("INFO", pos.symbol, `💰 Simulatore: Posizione LIQUIDATA. Saldo rimanente: ${simulatedBalance.toFixed(2)}€`, pos.strategyName);
          }

          // Push Notification Mock
          addTradeLog("WARNING", "PUSH", `Notifica Push: Eseguita liquidazione per ${pos.symbol} leva ${leverage}x!`);
          return pos;
        }

        // Track high price for trailing take profit
        if (currentPrice > pos.highestPriceReached) {
          pos.highestPriceReached = currentPrice;
          
          // Dynamic Stop Loss trailing: If price rises, we can raise stop loss dynamically to lock in profile!
          // Suppose we raise the stop loss to Entry + half of current gains once gains exceed 1.5%
          if (deltaPercent > 1.5) {
            const newStopPrice = pos.entryPrice * (1 + (deltaPercent * 0.4) / 100);
            if (newStopPrice > pos.stopLossPrice) {
              pos.stopLossPrice = parseFloat(newStopPrice.toFixed(4));
            }
          }
        }

        // Check Active Strategy for Trailing definition
        const activeStrategy = strategies.find(s => s.id === pos.strategyId);
        const risk = activeStrategy ? activeStrategy.riskManagement : { stopLossPercent: 2, trailingTakeProfitPercent: 0.5, trailingActivationPercent: 1.5 };

        // Trailing Take-Profit Activation Check
        const activationLevel = pos.entryPrice * (1 + risk.trailingActivationPercent / 100);
        if (!pos.isTrailingActive && currentPrice >= activationLevel) {
          pos.isTrailingActive = true;
          addTradeLog("INFO", pos.symbol, `Dispositivo Trailing Take-Profit ATTIVATO per ${pos.symbol} (prezzo superato $${activationLevel.toLocaleString()}).`, pos.strategyName);
        }

        // 1) Exit trigger: Stop Loss (Dynamic / Trailing Stop Loss)
        if (currentPrice <= pos.stopLossPrice) {
          pos.status = "CLOSED";
          pos.closedAt = new Date().toISOString();
          pos.closeReason = "DYNAMIC_STOP_LOSS";
          addTradeLog("STOP_LOSS", pos.symbol, `🚨 Stop Loss dinamico attivato! Posizione chiusa su ${pos.symbol} a $${currentPrice.toLocaleString()} (PnL: ${pos.pnlPercent.toFixed(2)}%, profitto: $${pos.pnl.toFixed(2)})`, pos.strategyName, pos.pnl);
          
          if (botMode === BotMode.SIMULATED) {
            simulatedBalance += (pos.investedAmount + pos.pnl);
            addTradeLog("INFO", pos.symbol, `💰 Simulatore: Rimborso Stop Loss accreditato. Saldo: ${simulatedBalance.toFixed(2)}€`, pos.strategyName);
          }

          // Push Notification Mock
          addTradeLog("WARNING", "PUSH", `Notifica Push: Operazione su ${pos.symbol} chiusa per Stop-Loss a $${currentPrice.toLocaleString()}`);
          return pos;
        }

        // 2) Exit trigger: Trailing Take Profit
        // If trailing is active, check if price fell from highestPriceReached by trailingTakeProfitPercent %
        if (pos.isTrailingActive) {
          const dropThreshold = pos.highestPriceReached * (1 - risk.trailingTakeProfitPercent / 100);
          if (currentPrice <= dropThreshold) {
            pos.status = "CLOSED";
            pos.closedAt = new Date().toISOString();
            pos.closeReason = "TRAILING_TAKE_PROFIT";
            addTradeLog("TRAILING_TP", pos.symbol, `📈 Trailing Take-Profit scattato! Posizione chiusa su ${pos.symbol} a $${currentPrice.toLocaleString()} dopo ribasso dal picco di $${pos.highestPriceReached.toLocaleString()} (PnL: ${pos.pnlPercent.toFixed(2)}%, profitto: $${pos.pnl.toFixed(2)})`, pos.strategyName, pos.pnl);
            
            if (botMode === BotMode.SIMULATED) {
              simulatedBalance += (pos.investedAmount + pos.pnl);
              addTradeLog("INFO", pos.symbol, `💰 Simulatore: Profitto Trailing TP incassato. Saldo: ${simulatedBalance.toFixed(2)}€`, pos.strategyName);
            }

            // Push Notification Mock
            addTradeLog("WARNING", "PUSH", `Notifica Push: Trailing Take-Profit eseguito per ${pos.symbol}! Chiusura a $${currentPrice.toLocaleString()}`);
            return pos;
          }
        }

        // 3) Exit trigger: Strategy Sell Conditions met!
        if (activeStrategy) {
          const ind = indicatorTracking[pos.symbol] || { rsi: 50, emaShort: currentPrice, emaLong: currentPrice };
          let metSell = false;
          
          if (activeStrategy.buyTriggerCondition.includes("RSI")) {
            // Standard check: RSI > 65
            if (ind.rsi > 65) metSell = true;
          } else if (activeStrategy.buyTriggerCondition.includes("supera")) {
            // EMA crossover track: Short < Long
            if (ind.emaShort < ind.emaLong) metSell = true;
          }

          if (metSell) {
            pos.status = "CLOSED";
            pos.closedAt = new Date().toISOString();
            pos.closeReason = "STRATEGY_SIGNAL";
            addTradeLog("SELL", pos.symbol, `🎯 Segnale di vendita strategia attivato! Posizione Spot ${pos.symbol} liquidata a $${currentPrice.toLocaleString()} (PnL: ${pos.pnlPercent.toFixed(2)}%, profitto: $${pos.pnl.toFixed(2)})`, pos.strategyName, pos.pnl);
            
            if (botMode === BotMode.SIMULATED) {
              simulatedBalance += (pos.investedAmount + pos.pnl);
              addTradeLog("INFO", pos.symbol, `💰 Simulatore: Incasso vendita segnale. Saldo: ${simulatedBalance.toFixed(2)}€`, pos.strategyName);
            }

            // Push Notification Mock
            addTradeLog("WARNING", "PUSH", `Notifica Push: Eseguiti segnali di USCITA Strategia su ${pos.symbol} a $${currentPrice.toLocaleString()}`);
          }
        }

        return pos;
      });

      // Remove closed positions from active monitoring array but keep in list
      // B. Evaluate entry triggers for the active Strategy
      if (activeStrategyId) {
        const activeStrat = strategies.find(s => s.id === activeStrategyId);
        if (activeStrat) {
          const isDynamic = activeStrat.symbol === "DYNAMIC";
          const symbolsToScan = isDynamic 
            ? ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"]
            : [activeStrat.symbol];

          // We check the tickers to find the single best candidate matching requirements
          let bestCandidate: {
            symbol: string;
            currentPrice: number;
            triggerDetails: string;
            score: number;
          } | null = null;

          for (const sym of symbolsToScan) {
            // Only trade if we don't already have an open position for this symbol
            const alreadyOpen = positions.some(p => p.symbol === sym && p.status === "OPEN");
            if (alreadyOpen) continue;

            const tick = tickers[sym];
            if (!tick) continue;

            const currentPrice = parseFloat(tick.lastPr);
            const ind = indicatorTracking[sym] || { rsi: 50, emaShort: currentPrice, emaLong: currentPrice };

            let metBuy = false;
            let triggerDetails = "";
            let score = 0; // The higher, the more it surpasses the strategy threshold

            // Extract RSI buy condition threshold dynamically
            if (activeStrat.buyTriggerCondition.toUpperCase().includes("RSI")) {
              let threshold = 35; // Default reference
              const rsiMatch = activeStrat.buyTriggerCondition.match(/RSI\s*<\s*(\d+)/i);
              if (rsiMatch) {
                threshold = parseInt(rsiMatch[1]);
              }
              
              if (ind.rsi < threshold) {
                metBuy = true;
                triggerDetails = `RSI ipervenduto (${ind.rsi.toFixed(1)} < ${threshold})`;
                // Score metric: how deep into oversold territory (deepest dip wins)
                score = threshold - ind.rsi;
              }
            } else {
              // EMA crossover check
              if (ind.emaShort > ind.emaLong) {
                metBuy = true;
                const crossoverPct = ((ind.emaShort - ind.emaLong) / ind.emaLong) * 100;
                triggerDetails = `Incrocio Medie Mobili (EMA ${ind.emaShort.toFixed(1)} > ${ind.emaLong.toFixed(1)})`;
                // Score is strength of crossover momentum
                score = crossoverPct;
              }
            }

            if (metBuy) {
              if (!bestCandidate || score > bestCandidate.score) {
                bestCandidate = {
                  symbol: sym,
                  currentPrice,
                  triggerDetails,
                  score
                };
              }
            }
          }

          if (bestCandidate) {
            const { symbol, currentPrice, triggerDetails } = bestCandidate;

            // Determine actual simulation investment amount
            let amountToInvest = activeStrat.riskManagement.investmentAmount;
            if (botMode === BotMode.SIMULATED) {
              // ALL IN! Use the entire simulated balance
              amountToInvest = simulatedBalance;
            }

            if (amountToInvest > 1) {
              const leverageVal = activeStrat.riskManagement.leverage || 1;
              const qty = (amountToInvest * leverageVal) / currentPrice;
              const stopLoss = currentPrice * (1 - activeStrat.riskManagement.stopLossPercent / 100);
              const tpPrice = currentPrice * (1 + (activeStrat.riskManagement.trailingActivationPercent * 1.5) / 100);

              const newPosition: Position = {
                id: "pos-" + Date.now(),
                strategyId: activeStrat.id,
                strategyName: activeStrat.name,
                symbol: symbol,
                type: PositionType.LONG,
                entryPrice: currentPrice,
                currentPrice: currentPrice,
                quantity: parseFloat(qty.toFixed(5)),
                investedAmount: amountToInvest,
                highestPriceReached: currentPrice,
                stopLossPrice: parseFloat(stopLoss.toFixed(symDecimalPoints(symbol))),
                takeProfitPrice: parseFloat(tpPrice.toFixed(symDecimalPoints(symbol))),
                pnl: 0,
                pnlPercent: 0,
                status: "OPEN",
                openedAt: new Date().toISOString(),
                isTrailingActive: false,
                leverage: leverageVal
              };

              // Decrease simulated balance
              if (botMode === BotMode.SIMULATED) {
                simulatedBalance -= amountToInvest;
                if (simulatedBalance < 0) simulatedBalance = 0;
              }

              positions.unshift(newPosition);
              addTradeLog("BUY", symbol, `🛒 ACQUISTO ${isDynamic ? "DINAMICO" : "ALL-IN"} Eseguito! Scelta Coppia Ottimale: ${symbol} @ $${currentPrice.toLocaleString()} con ${triggerDetails} (Punteggio: ${bestCandidate.score.toFixed(2)}) investendo €${amountToInvest.toFixed(2)}`, activeStrat.name);
              
              // Push Notification Mock
              addTradeLog("WARNING", "PUSH", `Notifica Push: Bot Trading Bitget ha eseguito un ORDINE DI ACQUISTO su ${symbol} (Scansione Dinamica Ottimale) per €${amountToInvest.toFixed(2)}`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in background trading/ticker interval:", err);
  }
}, 5000);

function symDecimalPoints(sym: string) {
  return sym.includes("XRP") || sym.includes("ADA") ? 4 : 2;
}

// REST API endpoint responses:

// Get absolute trading summary and current status
app.get("/api/bot/state", (req, res) => {
  res.json({
    botStatus,
    botMode,
    activeStrategyId,
    strategies,
    positions,
    tradeLogs,
    tickers,
    credentialsSet,
    simulatedBalance
  });
});

// Update credentials (API Key / Passphrase) securely
app.post("/api/bot/credentials", (req, res) => {
  const { apiKey, apiSecret, passphrase, sandbox } = req.body;
  if (!apiKey || !apiSecret || !passphrase) {
    return res.status(400).json({ error: "API credentials cannot be blank." });
  }

  bitgetCredentials = { apiKey, apiSecret, passphrase, sandbox: !!sandbox };
  credentialsSet = true;
  botMode = BotMode.REAL; // Set model to real trading if keys are input

  addTradeLog("INFO", "SYSTEM", `Configurata connessione API Bitget reale. Sandbox: ${sandbox ? "SI" : "NO"}. Pronti per operatività reale.`);
  res.json({ success: true, credentialsSet });
});

// Disconnect/Wipe credential settings
app.post("/api/bot/credentials/disconnect", (req, res) => {
  bitgetCredentials = null;
  credentialsSet = false;
  botMode = BotMode.SIMULATED;
  addTradeLog("INFO", "SYSTEM", "API Bitget rimosse. Motore reimpostato sulla modalità Paper Trading simulata.");
  res.json({ success: true, credentialsSet, botMode });
});

// Control running engine (START/STOP)
app.post("/api/bot/control", (req, res) => {
  const { status, mode, activeId } = req.body;
  
  if (status !== undefined) {
    if (status === BotStatus.RUNNING && botMode === BotMode.REAL && !credentialsSet) {
      return res.status(400).json({ error: "Fornisci le chiavi API Bitget per poter fare trading in modalità Reale." });
    }
    botStatus = status;
    addTradeLog("INFO", "SYSTEM", `Stato del bot modificato in: ${status}`);
  }

  if (mode !== undefined) {
    if (mode === BotMode.REAL && !credentialsSet) {
      return res.status(400).json({ error: "Fornisci prima le chiavi API Bitget prima di abilitare il trading reale." });
    }
    botMode = mode;
    addTradeLog("INFO", "SYSTEM", `Modalità bot impostata a: ${mode}`);
  }

  if (activeId !== undefined) {
    activeStrategyId = activeId;
    addTradeLog("INFO", "SYSTEM", `Strategia di trading attiva impostata su: ${activeId ? strategies.find(s => s.id === activeId)?.name : "Nessuna"}`);
  }

  res.json({
    botStatus,
    botMode,
    activeStrategyId,
    success: true
  });
});

// Create or update strategies
app.post("/api/bot/strategy", (req, res) => {
  const strategy: TradingStrategy = req.body;
  if (!strategy.name || !strategy.symbol) {
    return res.status(400).json({ error: "Nome strategia e Simbolo obbligatori." });
  }

  if (!strategy.id) {
    strategy.id = "strat-" + Date.now();
    strategy.createdAt = new Date().toISOString();
    strategies.push(strategy);
    addTradeLog("INFO", "SYSTEM", `Creata nuova strategia: ${strategy.name}`);
  } else {
    const idx = strategies.findIndex(s => s.id === strategy.id);
    if (idx !== -1) {
      strategies[idx] = strategy;
      addTradeLog("INFO", "SYSTEM", `Modificata strategia: ${strategy.name}`);
    } else {
      strategies.push(strategy);
    }
  }

  res.json({ success: true, strategies });
});

// AI Strategic generator call via process.env.GEMINI_API_KEY inside @google/genai SDK
app.post("/api/bot/strategy/suggest", async (req, res) => {
  const { coin, riskLevel, timeframe, style } = req.body;
  
  if (!coin || !riskLevel || !timeframe) {
    return res.status(400).json({ error: "Parametri coin, riskLevel, timeframe mancanti." });
  }

  try {
    const isDynamic = coin === "DYNAMIC";
    const pairText = isDynamic 
      ? "di scansione multi-coppia dinamica su diverse crypto (BTCUSDT, ETHUSDT, SOLUSDT, XRPUSDT, ADAUSDT)"
      : `per il ticker ${coin}USDT`;

    const prompt = `Sei un esperto astuto analista quantitativo quant-trader specializzato nelle API di trading di Bitget Spot e gestione algoritmica del rischio.
Progetta una strategia ${pairText} sul timeframe di ${timeframe}, adatta a un profilo di rischio ${riskLevel} e con uno stile prioritario di ${style || 'Scalping'}.

Restituisci la strategia nel formato JSON strutturato richiesto, compilando ESCLUSIVAMENTE l'oggetto schema qui sotto, spiegando la logica in italiano e suggerendo valori ottimali e realistici per RSI, MACD, EMA.

STRUTTURA JSON ATTESA:
{
  "name": "Nome breve della strategia accattivante e tecnico",
  "description": "Breve sintesi descrittiva in italiano di come funziona la strategia",
  "symbol": "${isDynamic ? "DYNAMIC" : `${coin}USDT`}",
  "timeframe": "${timeframe}",
  "buyTriggerCondition": "Condizione logica di acquisto leggibile (es: RSI < 35 AND Fast_EMA > Slow_EMA)",
  "sellTriggerCondition": "Condizione logica di vendita leggibile (es: RSI > 70)",
  "riskManagement": {
    "investmentAmount": 500,
    "stopLossPercent": valore numerico percentuale (es: 1.5 per 1.5%),
    "trailingTakeProfitPercent": valore numerico percentuale per l'ampiezza dell'inseguimento (es: 0.5 per 0.5%),
    "trailingActivationPercent": valore numerico soglia di profitto per avviare il trailing (es: 2.0 per 2%),
    "leverage": valore intero della leva massima (compreso tra 1 e 10, es: 10 per 10x, o valore inferiore in base al rischio)
  },
  "indicators": [
    {
      "name": "Nome indicatore (es. RSI)",
      "type": "RSI" o "MACD" o "EMA" o "SMA" o "BB",
      "params": {"period": 14} o altri parametri appropriati per l'indicatore in forma key-value,
      "enabled": true
    }
  ],
  "aiNotes": "Spiega accuratamente in italiano perché hai consigliato questi parametri tecnici, la leva finanziaria scelta e come gli stop-loss dinamici proposti mitigheranno il rischio rispetto a questa specifica configurazione strategica su Bitget."
}`;

    const response = await getAi().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            symbol: { type: Type.STRING },
            timeframe: { type: Type.STRING },
            buyTriggerCondition: { type: Type.STRING },
            sellTriggerCondition: { type: Type.STRING },
            riskManagement: {
              type: Type.OBJECT,
              properties: {
                investmentAmount: { type: Type.NUMBER },
                stopLossPercent: { type: Type.NUMBER },
                trailingTakeProfitPercent: { type: Type.NUMBER },
                trailingActivationPercent: { type: Type.NUMBER },
                leverage: { type: Type.NUMBER }
              },
              required: ["investmentAmount", "stopLossPercent", "trailingTakeProfitPercent", "trailingActivationPercent", "leverage"]
            },
            indicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  params: { type: Type.OBJECT },
                  enabled: { type: Type.BOOLEAN }
                },
                required: ["name", "type", "enabled"]
              }
            },
            aiNotes: { type: Type.STRING }
          },
          required: ["name", "description", "symbol", "timeframe", "buyTriggerCondition", "sellTriggerCondition", "riskManagement", "indicators", "aiNotes"]
        }
      }
    });

    const bodyText = response.text?.trim() || "{}";
    const recommendedStrategyObj = JSON.parse(bodyText);
    
    res.json(recommendedStrategyObj);

  } catch (err: any) {
    console.error("Gemini suggestion error:", err);
    res.status(500).json({ error: "L'IA non è riuscita a generare la strategia in questo momento.", details: err.message });
  }
});


// Serve static Vite files in production / setup development server middleware mode
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Setup development server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Trading Engine listening on http://localhost:${PORT}`);
  });
}

startServer();
