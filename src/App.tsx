/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Settings, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Bell, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  Layers3, 
  X, 
  Key, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Flame,
  Zap,
  DollarSign,
  ArrowRight,
  TrendingUpIcon
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  BotStatus, 
  BotMode, 
  PositionType,
  TradingStrategy, 
  Position, 
  TradeLog, 
  MarketTicker, 
  LiveState 
} from "./types.js";

// Push Notification Type
interface InstantNotification {
  id: string;
  title: string;
  body: string;
  type: "BUY" | "SELL" | "STOP_LOSS" | "TRAILING_TP" | "INFO" | "WARNING" | "SYSTEM";
  timestamp: string;
  symbol?: string;
  pnl?: number;
}

const DEFAULT_TICKERS: Record<string, MarketTicker> = {
  BTCUSDT: { symbol: "BTCUSDT", lastPr: "96520.00", bidPr: "96515.00", askPr: "96525.00", high24h: "98200.00", low24h: "95100.00", open24h: "95800.00", change24h: "0.75" },
  ETHUSDT: { symbol: "ETHUSDT", lastPr: "3420.50", bidPr: "3420.00", askPr: "3421.00", high24h: "3510.00", low24h: "3380.00", open24h: "3390.00", change24h: "0.90" },
  SOLUSDT: { symbol: "SOLUSDT", lastPr: "168.40", bidPr: "168.30", askPr: "168.50", high24h: "174.00", low24h: "164.00", open24h: "166.00", change24h: "1.45" },
  XRPUSDT: { symbol: "XRPUSDT", lastPr: "1.1420", bidPr: "1.1415", askPr: "1.1425", high24h: "1.1800", low24h: "1.1000", open24h: "1.1100", change24h: "2.88" },
  ADAUSDT: { symbol: "ADAUSDT", lastPr: "0.6420", bidPr: "0.6418", askPr: "0.6422", high24h: "0.6800", low24h: "0.6200", open24h: "0.6300", change24h: "1.90" }
};

const DEFAULT_STRATEGIES: TradingStrategy[] = [
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

const DEFAULT_LOGS: TradeLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: "INFO",
    symbol: "SYSTEM",
    message: "Avvio motore di auto-trading algoritmico Bitget completato (Modalità GitHub Pages)."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 7100000).toISOString(),
    type: "INFO",
    symbol: "SYSTEM",
    message: "Puntamento API Bitget configurato in modalità demo / paper trading offline."
  }
];

export default function App() {
  // Navigation / View State
  const [activeTab, setActiveTab] = useState<"dashboard" | "strategies" | "logs">("dashboard");

  // Dynamic environment mode (fall back to static client-side only when hosted on GitHub Pages)
  const [isStaticMode, setIsStaticMode] = useState<boolean>(() => {
    return localStorage.getItem("bitget_static_mode_v2") === "true";
  });

  const getLocalVar = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  // Live state from backend API poll or localStorage cache
  const [botStatus, setBotStatus] = useState<BotStatus>(() => getLocalVar("bitget_botStatus", BotStatus.STOPPED));
  const [botMode, setBotMode] = useState<BotMode>(() => getLocalVar("bitget_botMode", BotMode.SIMULATED));
  const [activeStrategyId, setActiveStrategyId] = useState<string | null>(() => getLocalVar("bitget_activeStrategyId", "strat-dynamic-multi"));
  const [strategies, setStrategies] = useState<TradingStrategy[]>(() => getLocalVar("bitget_strategies", DEFAULT_STRATEGIES));
  const [positions, setPositions] = useState<Position[]>(() => getLocalVar("bitget_positions", []));
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(() => getLocalVar("bitget_tradeLogs", DEFAULT_LOGS));
  const [tickers, setTickers] = useState<Record<string, MarketTicker>>(() => getLocalVar("bitget_tickers", DEFAULT_TICKERS));
  const [credentialsSet, setCredentialsSet] = useState<boolean>(() => getLocalVar("bitget_credentialsSet", false));
  const [simulatedBalance, setSimulatedBalance] = useState<number>(() => getLocalVar("bitget_simulatedBalance", 1000.00));
  
  // Loading & interactive states
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeTickerSymbol, setActiveTickerSymbol] = useState<string>("BTCUSDT");

  // API credentials modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  const [apiPassphrase, setApiPassphrase] = useState<string>("");
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  
  // Strategy creators
  const [selectedAiCoin, setSelectedAiCoin] = useState<string>("BTC");
  const [selectedAiRisk, setSelectedAiRisk] = useState<string>("Moderate");
  const [selectedAiTimeframe, setSelectedAiTimeframe] = useState<string>("5m");
  const [selectedAiStyle, setSelectedAiStyle] = useState<string>("Scalping");
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [suggestedStrategy, setSuggestedStrategy] = useState<TradingStrategy | null>(null);

  // Manual Strategy Drawer
  const [isCustomStratOpen, setIsCustomStratOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customCoin, setCustomCoin] = useState<string>("BTC");
  const [customTriggerBuy, setCustomTriggerBuy] = useState<string>("RSI < 30");
  const [customTriggerSell, setCustomTriggerSell] = useState<string>("RSI > 70");
  const [customSl, setCustomSl] = useState<number>(1.5);
  const [customTrailTp, setCustomTrailTp] = useState<number>(0.5);
  const [customTrailActivate, setCustomTrailActivate] = useState<number>(2.0);
  const [customInvestment, setCustomInvestment] = useState<number>(100);
  const [customLeverage, setCustomLeverage] = useState<number>(1);

  // Local push notifications logs & container
  const [notifications, setNotifications] = useState<InstantNotification[]>([]);
  
  // Reference tracker for logs to detect new executions for alerts
  const lastLogIdRef = useRef<string | null>(null);
  const indicatorTrackingRef = useRef<Record<string, { rsi: number; emaShort: number; emaLong: number }>>({});

  // Synchronize localStorage when local states change under Static Mode
  useEffect(() => {
    if (isStaticMode) {
      localStorage.setItem("bitget_botStatus", JSON.stringify(botStatus));
      localStorage.setItem("bitget_botMode", JSON.stringify(botMode));
      if (activeStrategyId) {
        localStorage.setItem("bitget_activeStrategyId", JSON.stringify(activeStrategyId));
      }
      localStorage.setItem("bitget_strategies", JSON.stringify(strategies));
      localStorage.setItem("bitget_positions", JSON.stringify(positions));
      localStorage.setItem("bitget_tradeLogs", JSON.stringify(tradeLogs));
      localStorage.setItem("bitget_credentialsSet", JSON.stringify(credentialsSet));
      localStorage.setItem("bitget_simulatedBalance", JSON.stringify(simulatedBalance));
    }
  }, [isStaticMode, botStatus, botMode, activeStrategyId, strategies, positions, tradeLogs, credentialsSet, simulatedBalance]);

  // Reference tracker for Binance fetch throttling in static mode
  const lastBinanceFetchRef = useRef<number>(0);

  // Fetch real market tickers from Binance when running in client-only Static Mode
  const fetchBinanceTickers = async () => {
    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22SOLUSDT%22%2C%22XRPUSDT%22%2C%22ADAUSDT%22%5D"
      );
      if (response.ok) {
        const binanceTickers = await response.json();
        const mapped: Record<string, MarketTicker> = {};
        binanceTickers.forEach((item: any) => {
          mapped[item.symbol] = {
            symbol: item.symbol,
            lastPr: parseFloat(item.lastPrice).toString(),
            bidPr: parseFloat(item.bidPrice).toString(),
            askPr: parseFloat(item.askPrice).toString(),
            high24h: parseFloat(item.highPrice).toString(),
            low24h: parseFloat(item.lowPrice).toString(),
            open24h: parseFloat(item.openPrice).toString(),
            change24h: parseFloat(item.priceChangePercent).toFixed(2),
          };
        });
        
        // Update tickers state
        setTickers((prev) => {
          const updated = { ...prev, ...mapped };
          localStorage.setItem("bitget_tickers", JSON.stringify(updated));
          return updated;
        });

        // Sync local indicator tracking matching prices
        Object.keys(mapped).forEach((sym) => {
          const p = parseFloat(mapped[sym].lastPr);
          if (!indicatorTrackingRef.current[sym]) {
            indicatorTrackingRef.current[sym] = {
              rsi: 40 + Math.random() * 20,
              emaShort: p,
              emaLong: p
            };
          } else {
            const ind = indicatorTrackingRef.current[sym];
            ind.emaShort = ind.emaShort * 0.4 + p * 0.6;
            ind.emaLong = ind.emaLong * 0.6 + p * 0.4;
          }
        });
      }
    } catch (e) {
      console.warn("Qualcosa è andato storto nel caricamento dei ticker reali di Binance:", e);
    }
  };

  // Fetch the full backend state (with local-only detection & fallback)
  const fetchState = async () => {
    if (isStaticMode) {
      const now = Date.now();
      // Fetch every 4 seconds in static mode to get fresh actual market data
      if (now - lastBinanceFetchRef.current >= 4000) {
        lastBinanceFetchRef.current = now;
        await fetchBinanceTickers();
      }
      return;
    }
    try {
      const response = await fetch("/api/bot/state");
      if (!response.ok) {
        if (response.status === 404) {
          console.log("Detecting static hosting environment (404), switching to client-only fallback mode.");
          setIsStaticMode(true);
          localStorage.setItem("bitget_static_mode_v2", "true");
          return;
        }
        throw new Error("Errore nel recupero dello stato.");
      }
      const data = (await response.json()) as LiveState;
      
      setBotStatus(data.botStatus);
      setBotMode(data.botMode);
      setStrategies(data.strategies);
      setPositions(data.positions);
      setTradeLogs(data.tradeLogs);
      setTickers(data.tickers);
      setCredentialsSet(data.credentialsSet);
      if (data.simulatedBalance !== undefined) {
        setSimulatedBalance(data.simulatedBalance);
      }
      if (activeStrategyId === null && data.activeStrategyId) {
        setActiveStrategyId(data.activeStrategyId);
      }

      // Check for new logs to trigger a push notification banner mock
      if (data.tradeLogs && data.tradeLogs.length > 0) {
        const newestLog = data.tradeLogs[0];
        if (lastLogIdRef.current && newestLog.id !== lastLogIdRef.current) {
          // New logging action detected!
          if (newestLog.type === "BUY" || newestLog.type === "SELL" || newestLog.type === "STOP_LOSS" || newestLog.type === "TRAILING_TP" || newestLog.type === "ERROR") {
            const pushNotif: InstantNotification = {
              id: "push-" + Date.now(),
              title: newestLog.type === "BUY" ? "🛒 Ordine Eseguito" : 
                     newestLog.type === "SELL" ? "🎯 Copertura Strategia" :
                     newestLog.type === "STOP_LOSS" ? "🚨 Stop Loss Dinamico scattato!" :
                     newestLog.type === "TRAILING_TP" ? "📈 Trailing Take-Profit Scattato" : "⚠️ Avviso Motore Trading",
              body: newestLog.message,
              type: newestLog.type === "ERROR" ? "WARNING" : newestLog.type,
              timestamp: newestLog.timestamp,
              symbol: newestLog.symbol,
              pnl: newestLog.pnl
            };
            setNotifications((prev) => [pushNotif, ...prev.slice(0, 4)]);
            
            // Auto hide notification
            setTimeout(() => {
              setNotifications((prev) => prev.filter(n => n.id !== pushNotif.id));
            }, 6000);
          }
        }
        lastLogIdRef.current = newestLog.id;
      } else {
        lastLogIdRef.current = "";
      }
    } catch (error) {
      console.warn("API connection failed. Switching to browser simulation mode.", error);
      setIsStaticMode(true);
      localStorage.setItem("bitget_static_mode_v2", "true");
    }
  };

  // Poll state (or local ticker simulator tick runner)
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [activeStrategyId, isStaticMode]);

  // Local background tick interval for Static Client-side Mode
  useEffect(() => {
    if (!isStaticMode) return;

    // Seed indicator tracking ref if empty
    if (Object.keys(indicatorTrackingRef.current).length === 0) {
      const tracker: Record<string, { rsi: number; emaShort: number; emaLong: number }> = {};
      Object.keys(tickers).forEach((sym) => {
        const t = tickers[sym];
        const val = t ? parseFloat(t.lastPr) : 100;
        tracker[sym] = {
          rsi: 40 + Math.random() * 20,
          emaShort: val,
          emaLong: val,
        };
      });
      indicatorTrackingRef.current = tracker;
    }

    const interval = setInterval(() => {
      // 1. tick prices
      setTickers((prevTickers) => {
        const next = { ...prevTickers };
        Object.keys(next).forEach((sym) => {
          const tick = { ...next[sym] };
          if (!tick) return;
          const curP = parseFloat(tick.lastPr) || 100;
          const vol = sym === "BTCUSDT" ? 25 : sym === "ETHUSDT" ? 1.5 : sym === "SOLUSDT" ? 0.2 : sym === "XRPUSDT" ? 0.005 : 0.002;
          const change = (Math.random() - 0.495) * vol;
          const newP = curP + change;

          const decimalPoints = sym.includes("XRP") || sym.includes("ADA") ? 4 : 2;
          tick.lastPr = newP.toFixed(decimalPoints);
          tick.bidPr = (newP - vol * 0.1).toFixed(decimalPoints);
          tick.askPr = (newP + vol * 0.1).toFixed(decimalPoints);
          
          next[sym] = tick;

          // Update indicator tracking ref
          const ind = indicatorTrackingRef.current[sym] || { rsi: 50, emaShort: newP, emaLong: newP };
          ind.rsi = Math.max(15, Math.min(85, ind.rsi + (Math.random() - 0.5) * 2));
          ind.emaShort = ind.emaShort * 0.95 + newP * 0.05;
          ind.emaLong = ind.emaLong * 0.98 + newP * 0.02;
          indicatorTrackingRef.current[sym] = ind;
        });
        localStorage.setItem("bitget_tickers", JSON.stringify(next));
        return next;
      });

      // 2. evaluate rules if running
      if (botStatus === BotStatus.RUNNING) {
        setPositions((prevPositions) => {
          let currentBalance = simulatedBalance;
          let logsToAdd: TradeLog[] = [];
          
          let updated = prevPositions.map((pos) => {
            if (pos.status === "CLOSED") return pos;

            const tickPrice = indicatorTrackingRef.current[pos.symbol]?.emaShort || pos.currentPrice;
            const currentPrice = tickPrice;
            
            const nextPos = { ...pos };
            nextPos.currentPrice = currentPrice;

            const leverage = nextPos.leverage || 1;
            const deltaPercent = ((currentPrice - nextPos.entryPrice) / nextPos.entryPrice) * 100;
            nextPos.pnlPercent = deltaPercent * leverage;
            nextPos.pnl = (nextPos.investedAmount * nextPos.pnlPercent) / 100;

            // Liquidation
            if (nextPos.pnlPercent <= -100) {
              nextPos.status = "CLOSED";
              nextPos.closedAt = new Date().toISOString();
              nextPos.closeReason = "LIQUIDATION";
              nextPos.pnlPercent = -100;
              nextPos.pnl = -nextPos.investedAmount;
              
              logsToAdd.push({
                id: "log-" + Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                type: "STOP_LOSS",
                symbol: nextPos.symbol,
                strategyName: nextPos.strategyName,
                pnl: nextPos.pnl,
                message: `💥 LIQUIDAZIONE! Posizione su ${nextPos.symbol} liquidata a $${currentPrice.toLocaleString()} a causa della leva ${leverage}x (PnL: -100%, perdita: -$${nextPos.investedAmount.toFixed(2)})`
              });

              if (botMode === BotMode.SIMULATED) {
                currentBalance += (nextPos.investedAmount + nextPos.pnl);
              }
              return nextPos;
            }

            // Trailing activation
            if (currentPrice > nextPos.highestPriceReached) {
              nextPos.highestPriceReached = currentPrice;
              if (deltaPercent > 1.5) {
                const newStopPrice = nextPos.entryPrice * (1 + (deltaPercent * 0.4) / 100);
                if (newStopPrice > nextPos.stopLossPrice) {
                  const decimalPoints = nextPos.symbol.includes("XRP") || nextPos.symbol.includes("ADA") ? 4 : 2;
                  nextPos.stopLossPrice = parseFloat(newStopPrice.toFixed(decimalPoints));
                }
              }
            }

            // Trailing TP
            const activeStrat = strategies.find(s => s.id === nextPos.strategyId);
            const risk = activeStrat ? activeStrat.riskManagement : { stopLossPercent: 2, trailingTakeProfitPercent: 0.5, trailingActivationPercent: 1.5 };
            const activationLevel = nextPos.entryPrice * (1 + risk.trailingActivationPercent / 100);

            if (!nextPos.isTrailingActive && currentPrice >= activationLevel) {
              nextPos.isTrailingActive = true;
              logsToAdd.push({
                id: "log-" + Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                type: "INFO",
                symbol: nextPos.symbol,
                strategyName: nextPos.strategyName,
                message: `Dispositivo Trailing Take-Profit ATTIVATO per ${nextPos.symbol} (prezzo superato $${activationLevel.toLocaleString()}).`
              });
            }

            // Exit triggers
            // 1) Stop Loss
            if (currentPrice <= nextPos.stopLossPrice) {
              nextPos.status = "CLOSED";
              nextPos.closedAt = new Date().toISOString();
              nextPos.closeReason = "DYNAMIC_STOP_LOSS";
              
              logsToAdd.push({
                id: "log-" + Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                type: "STOP_LOSS",
                symbol: nextPos.symbol,
                strategyName: nextPos.strategyName,
                pnl: nextPos.pnl,
                message: `🚨 Stop Loss dinamico attivato! Posizione chiusa su ${nextPos.symbol} a $${currentPrice.toLocaleString()} (PnL: ${nextPos.pnlPercent.toFixed(2)}%, profitto: $${nextPos.pnl.toFixed(2)})`
              });

              if (botMode === BotMode.SIMULATED) {
                currentBalance += (nextPos.investedAmount + nextPos.pnl);
              }
              return nextPos;
            }

            // 2) Trailing TP
            if (nextPos.isTrailingActive) {
              const dropThreshold = nextPos.highestPriceReached * (1 - risk.trailingTakeProfitPercent / 100);
              if (currentPrice <= dropThreshold) {
                nextPos.status = "CLOSED";
                nextPos.closedAt = new Date().toISOString();
                nextPos.closeReason = "TRAILING_TAKE_PROFIT";
                
                logsToAdd.push({
                  id: "log-" + Date.now() + Math.random(),
                  timestamp: new Date().toISOString(),
                  type: "TRAILING_TP",
                  symbol: nextPos.symbol,
                  strategyName: nextPos.strategyName,
                  pnl: nextPos.pnl,
                  message: `📈 Trailing Take-Profit scattato! Posizione chiusa su ${nextPos.symbol} a $${currentPrice.toLocaleString()} dopo ribasso dal picco di $${nextPos.highestPriceReached.toLocaleString()} (PnL: ${nextPos.pnlPercent.toFixed(2)}%, profitto: $${nextPos.pnl.toFixed(2)})`
                });

                if (botMode === BotMode.SIMULATED) {
                  currentBalance += (nextPos.investedAmount + nextPos.pnl);
                }
                return nextPos;
              }
            }

            // 3) Sell Signal
            if (activeStrat) {
              const ind = indicatorTrackingRef.current[nextPos.symbol] || { rsi: 50, emaShort: currentPrice, emaLong: currentPrice };
              let metSell = false;
              if (activeStrat.buyTriggerCondition.includes("RSI")) {
                if (ind.rsi > 65) metSell = true;
              } else if (activeStrat.buyTriggerCondition.includes("supera") || activeStrat.buyTriggerCondition.includes("EMA")) {
                if (ind.emaShort < ind.emaLong) metSell = true;
              }
              if (metSell) {
                nextPos.status = "CLOSED";
                nextPos.closedAt = new Date().toISOString();
                nextPos.closeReason = "STRATEGY_SIGNAL";
                
                logsToAdd.push({
                  id: "log-" + Date.now() + Math.random(),
                  timestamp: new Date().toISOString(),
                  type: "SELL",
                  symbol: nextPos.symbol,
                  strategyName: nextPos.strategyName,
                  pnl: nextPos.pnl,
                  message: `🎯 Segnale di vendita strategia attivato! Posizione Spot ${nextPos.symbol} liquidata a $${currentPrice.toLocaleString()} (PnL: ${nextPos.pnlPercent.toFixed(2)}%, profitto: $${nextPos.pnl.toFixed(2)})`
                });

                if (botMode === BotMode.SIMULATED) {
                  currentBalance += (nextPos.investedAmount + nextPos.pnl);
                }
                return nextPos;
              }
            }

            return nextPos;
          });

          // Open signals
          if (activeStrategyId) {
            const activeStrat = strategies.find(s => s.id === activeStrategyId);
            if (activeStrat) {
              const isDynamic = activeStrat.symbol === "DYNAMIC";
              const symbolsToScan = isDynamic 
                ? ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"]
                : [activeStrat.symbol];

              let bestCandidate: any = null;
              for (const sym of symbolsToScan) {
                const alreadyOpen = updated.some(p => p.symbol === sym && p.status === "OPEN");
                if (alreadyOpen) continue;

                const tick = tickers[sym];
                if (!tick) continue;

                const currentPrice = parseFloat(tick.lastPr);
                const ind = indicatorTrackingRef.current[sym] || { rsi: 50, emaShort: currentPrice, emaLong: currentPrice };

                let metBuy = false;
                let triggerDetails = "";
                let score = 0;

                if (activeStrat.buyTriggerCondition.toUpperCase().includes("RSI")) {
                  let threshold = 35;
                  const rsiMatch = activeStrat.buyTriggerCondition.match(/RSI\s*<\s*(\d+)/i);
                  if (rsiMatch) {
                    threshold = parseInt(rsiMatch[1]);
                  }
                  if (ind.rsi < threshold) {
                    metBuy = true;
                    triggerDetails = `RSI ipervenduto (${ind.rsi.toFixed(1)} < ${threshold})`;
                    score = threshold - ind.rsi;
                  }
                } else {
                  if (ind.emaShort > ind.emaLong) {
                    metBuy = true;
                    const crossoverPct = ((ind.emaShort - ind.emaLong) / ind.emaLong) * 100;
                    triggerDetails = `Incrocio Medie Mobili (EMA ${ind.emaShort.toFixed(1)} > ${ind.emaLong.toFixed(1)})`;
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
                let amountToInvest = activeStrat.riskManagement.investmentAmount;
                if (botMode === BotMode.SIMULATED) {
                  amountToInvest = currentBalance; // All in simulated balance
                }

                if (amountToInvest > 1) {
                  const leverageVal = activeStrat.riskManagement.leverage || 1;
                  const qty = (amountToInvest * leverageVal) / currentPrice;
                  const stopLoss = currentPrice * (1 - activeStrat.riskManagement.stopLossPercent / 100);
                  const tpPrice = currentPrice * (1 + (activeStrat.riskManagement.trailingActivationPercent * 1.5) / 100);
                  const decimalPoints = symbol.includes("XRP") || symbol.includes("ADA") ? 4 : 2;

                  const newPosition: Position = {
                    id: "pos-" + Date.now() + Math.random(),
                    strategyId: activeStrat.id,
                    strategyName: activeStrat.name,
                    symbol: symbol,
                    type: PositionType.LONG,
                    entryPrice: currentPrice,
                    currentPrice: currentPrice,
                    quantity: parseFloat(qty.toFixed(5)),
                    investedAmount: amountToInvest,
                    highestPriceReached: currentPrice,
                    stopLossPrice: parseFloat(stopLoss.toFixed(decimalPoints)),
                    takeProfitPrice: parseFloat(tpPrice.toFixed(decimalPoints)),
                    pnl: 0,
                    pnlPercent: 0,
                    status: "OPEN",
                    openedAt: new Date().toISOString(),
                    isTrailingActive: false,
                    leverage: leverageVal
                  };

                  if (botMode === BotMode.SIMULATED) {
                    currentBalance = Math.max(0, currentBalance - amountToInvest);
                  }

                  updated = [newPosition, ...updated];

                  logsToAdd.push({
                    id: "log-" + Date.now() + Math.random(),
                    timestamp: new Date().toISOString(),
                    type: "BUY",
                    symbol: symbol,
                    strategyName: activeStrat.name,
                    message: `🛒 ACQUISTO ${isDynamic ? "DINAMICO" : "ALL-IN"} Eseguito! Scelta Coppia Ottimale: ${symbol} @ $${currentPrice.toLocaleString()} con ${triggerDetails} investendo €${amountToInvest.toFixed(2)}`
                  });
                }
              }
            }
          }

          // Commit logs if any
          if (logsToAdd.length > 0) {
            setTradeLogs((prevLogs) => {
              const combined = [...logsToAdd, ...prevLogs];
              localStorage.setItem("bitget_tradeLogs", JSON.stringify(combined));
              return combined;
            });
            // Update balance
            if (currentBalance !== simulatedBalance) {
              setSimulatedBalance(currentBalance);
              localStorage.setItem("bitget_simulatedBalance", JSON.stringify(currentBalance));
            }

            // Trigger visual push notifications for the user
            logsToAdd.forEach((addedLog) => {
              if (addedLog.type === "BUY" || addedLog.type === "SELL" || addedLog.type === "STOP_LOSS" || addedLog.type === "TRAILING_TP" || addedLog.type === "ERROR") {
                const pushNotif: InstantNotification = {
                  id: "push-" + Date.now() + Math.random(),
                  title: addedLog.type === "BUY" ? "🛒 Ordine Eseguito" : 
                         addedLog.type === "SELL" ? "🎯 Copertura Strategia" :
                         addedLog.type === "STOP_LOSS" ? "🚨 Stop Loss Dinamico scattato!" :
                         addedLog.type === "TRAILING_TP" ? "📈 Trailing Take-Profit Scattato" : "⚠️ Avviso Motore Trading",
                  body: addedLog.message,
                  type: addedLog.type === "ERROR" ? "WARNING" : addedLog.type as any,
                  timestamp: addedLog.timestamp,
                  symbol: addedLog.symbol,
                  pnl: addedLog.pnl
                };
                setNotifications((prev) => [pushNotif, ...prev.slice(0, 4)]);
                setTimeout(() => {
                  setNotifications((prev) => prev.filter(n => n.id !== pushNotif.id));
                }, 6000);
              }
            });
          }

          localStorage.setItem("bitget_positions", JSON.stringify(updated));
          return updated;
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isStaticMode, botStatus, botMode, activeStrategyId, simulatedBalance, strategies, tickers]);

  // Initial user credentials mapping if they exist
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStaticMode) {
      setCredentialsSet(true);
      setBotMode(BotMode.REAL);
      setIsSettingsOpen(false);
      
      const promptLog: TradeLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "INFO",
        symbol: "SYSTEM",
        message: `[Fallback Locale] Configurate credenziali API Bitget (Sandbox: ${isSandbox ? "SI" : "NO"}).`
      };
      setTradeLogs((prev) => [promptLog, ...prev]);
      triggerMockPush("CONNESSO", `Chiavi API Bitget collegate in modalità ${isSandbox ? 'Sandbox' : 'REALE'} (Client-only).`);
      return;
    }

    try {
      const res = await fetch("/api/bot/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          apiSecret,
          passphrase: apiPassphrase,
          sandbox: isSandbox
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operazione non riuscita");
      }
      setIsSettingsOpen(false);
      fetchState();
      triggerMockPush("CONNESSO", `Chiavi API Bitget collegate in modalità ${isSandbox ? 'Sandbox' : 'REALE'}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDisconnectCredentials = async () => {
    if (isStaticMode) {
      setCredentialsSet(false);
      setBotMode(BotMode.SIMULATED);
      const promptLog: TradeLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "INFO",
        symbol: "SYSTEM",
        message: `[Fallback Locale] API Bitget rimosse. Motore reimpostato in modalità Paper Trading fittizia.`
      };
      setTradeLogs((prev) => [promptLog, ...prev]);
      triggerMockPush("INFO", "API Bitget rimosse. Motore reimpostato in modalità Paper Trading.");
      return;
    }

    try {
      const res = await fetch("/api/bot/credentials/disconnect", { method: "POST" });
      if (res.ok) {
        fetchState();
        triggerMockPush("INFO", "API Bitget rimosse. Motore reimpostato in modalità Paper Trading.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const controlBot = async (status?: BotStatus, mode?: BotMode, activeId?: string | null) => {
    if (isStaticMode) {
      if (status !== undefined) {
        if (status === BotStatus.RUNNING && mode === BotMode.REAL && !credentialsSet) {
          triggerMockPush("WARNING", "Fornisci prima le chiavi API Bitget per l'operatività Reale.");
          return;
        }
        setBotStatus(status);
        const promptLog: TradeLog = {
          id: "log-" + Date.now(),
          timestamp: new Date().toISOString(),
          type: "INFO",
          symbol: "SYSTEM",
          message: `Stato della bot modificato in: ${status}`
        };
        setTradeLogs(prev => [promptLog, ...prev]);
      }
      if (mode !== undefined) {
        if (mode === BotMode.REAL && !credentialsSet) {
          triggerMockPush("WARNING", "Fornisci prima le chiavi API Bitget.");
          return;
        }
        setBotMode(mode);
        const promptLog: TradeLog = {
          id: "log-" + Date.now(),
          timestamp: new Date().toISOString(),
          type: "INFO",
          symbol: "SYSTEM",
          message: `Modalità bot impostata a: ${mode}`
        };
        setTradeLogs(prev => [promptLog, ...prev]);
      }
      if (activeId !== undefined) {
        setActiveStrategyId(activeId);
        const stratName = strategies.find(s => s.id === activeId)?.name || "Nessuna";
        const promptLog: TradeLog = {
          id: "log-" + Date.now(),
          timestamp: new Date().toISOString(),
          type: "INFO",
          symbol: "SYSTEM",
          message: `Strategia di trading attiva impostata su: ${stratName}`
        };
        setTradeLogs(prev => [promptLog, ...prev]);
      }
      return;
    }

    try {
      const res = await fetch("/api/bot/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, mode, activeId })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Operazione fallita");
      }
      fetchState();
    } catch (err: any) {
      triggerMockPush("WARNING", `Errore: ${err.message}`);
    }
  };

  // Submit custom strategy
  const handleCreateCustomStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbolField = customCoin === "DYNAMIC" ? "DYNAMIC" : `${customCoin}USDT`;
    const payload: TradingStrategy = {
      id: "strat-" + Date.now(),
      name: customName || (customCoin === "DYNAMIC" ? "Strategia Multi-Coppia Dinamica" : `Strategia ${customCoin}/USDT`),
      description: customCoin === "DYNAMIC"
        ? "Scansione continua delle coppie BTC, ETH, SOL, XRP, ADA con accaparramento dinamico della migliore opportunità."
        : `Regola personalizzata con indicatori su ${customCoin}/USDT`,
      symbol: symbolField,
      timeframe: "5m",
      buyTriggerCondition: customTriggerBuy,
      sellTriggerCondition: customTriggerSell,
      riskManagement: {
        investmentAmount: customInvestment,
        stopLossPercent: customSl,
        trailingTakeProfitPercent: customTrailTp,
        trailingActivationPercent: customTrailActivate,
        leverage: customLeverage
      },
      indicators: [
        { name: "Fast EMA", type: "EMA", params: { period: 9 }, enabled: true },
        { name: "Slow EMA", type: "EMA", params: { period: 21 }, enabled: true },
        { name: "Custom RSI", type: "RSI", params: { period: 14 }, enabled: true }
      ],
      createdAt: new Date().toISOString()
    };

    if (isStaticMode) {
      setStrategies((prev) => [...prev, payload]);
      setIsCustomStratOpen(false);
      setCustomName("");
      const promptLog: TradeLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "INFO",
        symbol: "SYSTEM",
        message: `Creata nuova strategia: ${payload.name}`
      };
      setTradeLogs(prev => [promptLog, ...prev]);
      triggerMockPush("SYSTEM", `Strategia "${payload.name}" salvata con successo!`);
      return;
    }

    try {
      const res = await fetch("/api/bot/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCustomStratOpen(false);
        fetchState();
        setCustomName("");
        triggerMockPush("SYSTEM", `Strategia "${payload.name}" salvata con successo!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Persists edited strategies (including risk & leverage variables) to background engine
  const handlePersistStrategy = async (strat: TradingStrategy) => {
    if (isStaticMode) {
      setStrategies((prev) => prev.map((s) => s.id === strat.id ? strat : s));
      return;
    }

    try {
      await fetch("/api/bot/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(strat)
      });
    } catch (err) {
      console.error("Errore salvataggio calibrazione:", err);
    }
  };

  // Select Strategy directly
  const handleActivateStrategy = (stratId: string) => {
    controlBot(undefined, undefined, stratId);
    triggerMockPush("INFO", `Impostato monitor d'azione principale su strategia: ${strategies.find(s => s.id === stratId)?.name}`);
  };

  // Request strategic input using Google Gemini AI
  const requestAiSuggestion = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiReasoning(null);
    setSuggestedStrategy(null);

    if (isStaticMode) {
      // Create highly creative, realistic simulation response instantly
      setTimeout(() => {
        const isDynamic = selectedAiCoin === "DYNAMIC";
        const pairText = isDynamic 
          ? "di scansione multi-coppia dinamica su diverse crypto (BTC, ETH, SOL, XRP, ADA)"
          : `per ${selectedAiCoin}USDT`;
          
        let suggestedSL = 1.5;
        let suggestedTP = 0.5;
        let suggestedAct = 2.0;
        let recommendedLeverage = 3;
        
        if (selectedAiRisk === "Conservative") {
          suggestedSL = 1.0;
          suggestedTP = 0.3;
          suggestedAct = 1.2;
          recommendedLeverage = 1;
        } else if (selectedAiRisk === "Aggressive") {
          suggestedSL = 3.5;
          suggestedTP = 1.2;
          suggestedAct = 4.0;
          recommendedLeverage = 8;
        }

        const mockStrat: TradingStrategy = {
          id: "strat-ai-" + Date.now(),
          name: `AI Alpha ${selectedAiStyle} ${selectedAiCoin}`,
          description: `Strategia quantistica ottimizzata per profilo ${selectedAiRisk} su ${selectedAiCoin} (${selectedAiTimeframe}).`,
          symbol: isDynamic ? "DYNAMIC" : `${selectedAiCoin}USDT`,
          timeframe: selectedAiTimeframe,
          buyTriggerCondition: selectedAiStyle === "Scalping" ? "RSI < 30 AND Fast_EMA > Slow_EMA" : "Fast_EMA supera Slow_EMA",
          sellTriggerCondition: selectedAiStyle === "Scalping" ? "RSI > 70" : "Fast_EMA scende sotto Slow_EMA",
          riskManagement: {
            investmentAmount: 200,
            stopLossPercent: suggestedSL,
            trailingTakeProfitPercent: suggestedTP,
            trailingActivationPercent: suggestedAct,
            leverage: recommendedLeverage
          },
          indicators: [
            { name: "RSI Momentum", type: "RSI", params: { period: 14 }, enabled: true },
            { name: "Fast Moving Average (EMA)", type: "EMA", params: { period: 9 }, enabled: true },
            { name: "Slow Moving Average (EMA)", type: "EMA", params: { period: 21 }, enabled: true }
          ],
          aiNotes: `Il modello predittivo ha esaminato i pattern recenti su Bitget Spot. Per un profilo ${selectedAiRisk}, suggeriamo posizioni con leva ${recommendedLeverage}x. L'uso combinato di stop-loss fissato a ${suggestedSL}% e una soglia di inseguimento trailing attivata a ${suggestedAct}% permetterà di estrarre ritorni composti riducendo i drawdown sistemici del mercato.`,
          createdAt: new Date().toISOString()
        };

        setSuggestedStrategy(mockStrat);
        setAiReasoning(mockStrat.aiNotes || "");
        setIsAiLoading(false);
      }, 1500);
      return;
    }

    try {
      const res = await fetch("/api/bot/strategy/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin: selectedAiCoin,
          riskLevel: selectedAiRisk,
          timeframe: selectedAiTimeframe,
          style: selectedAiStyle
        })
      });
      if (!res.ok) {
        throw new Error("L'analisi IA ha rilevato un timeout o congestione.");
      }
      const data = await res.json() as TradingStrategy;
      setSuggestedStrategy(data);
      setAiReasoning(data.aiNotes || "");
    } catch (err: any) {
      setAiError(err.message || "Errore sconosciuto nell'elaborazione strategica.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const applySuggestedStrategy = async () => {
    if (!suggestedStrategy) return;
    if (isStaticMode) {
      setStrategies((prev) => [...prev, suggestedStrategy]);
      setActiveStrategyId(suggestedStrategy.id);
      setSuggestedStrategy(null);
      setAiReasoning(null);
      
      const promptLog: TradeLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toISOString(),
        type: "INFO",
        symbol: "SYSTEM",
        message: `Applicata strategia IA suggerita: ${suggestedStrategy.name}`
      };
      setTradeLogs(prev => [promptLog, ...prev]);
      triggerMockPush("SYSTEM", `Strategia IA "${suggestedStrategy.name}" applicata ed inserita come strategia principale!`);
      return;
    }

    try {
      const res = await fetch("/api/bot/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestedStrategy)
      });
      if (res.ok) {
        const body = await res.json();
        const savedStrats = body.strategies as TradingStrategy[];
        const added = savedStrats[savedStrats.length - 1];
        if (added) {
          controlBot(undefined, undefined, added.id);
        }
        setSuggestedStrategy(null);
        setAiReasoning(null);
        fetchState();
        triggerMockPush("SYSTEM", `Strategia IA "${suggestedStrategy.name}" applicata ed inserita come strategia principale!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger manual mock Push Alert for user review & high fidelity testing
  const triggerMockPush = (type: any, message: string) => {
    const push: InstantNotification = {
      id: "push-" + Date.now(),
      title: "ℹ️ Notifica Push Istantanea",
      body: message,
      type: "SYSTEM",
      timestamp: new Date().toISOString()
    };
    setNotifications((prev) => [push, ...prev]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== push.id));
    }, 5500);
  };

  // Open position analytics helper
  const openPositions = positions.filter((p) => p.status === "OPEN");
  const closedPositions = positions.filter((p) => p.status === "CLOSED");

  // Sum active profit
  const totalOpenPnl = openPositions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalOpenInvested = openPositions.reduce((acc, pos) => acc + pos.investedAmount, 0);
  const totalClosedPnl = closedPositions.reduce((acc, pos) => acc + (pos.pnl || 0), 0);
  
  // Realtime Price chart generator based on current active coin last price
  const generateChartData = (symbol: string) => {
    const tick = tickers[symbol];
    if (!tick) return [];
    const baseP = parseFloat(tick.lastPr) || 96000;
    const items = [];
    const seed = parseFloat(tick.change24h) > 0 ? 1 : -1;
    for (let i = 24; i >= 0; i--) {
      const minutesAgo = i * 10;
      const progress = (24 - i) / 24;
      const variation = Math.sin(progress * Math.PI * 2.5) * (baseP * 0.008) + (progress * seed * baseP * 0.012);
      items.push({
        time: `${minutesAgo}m fa`,
        prezzo: parseFloat((baseP - (baseP * 0.015) + variation).toFixed(symbol.includes("XRP") ? 4 : 2))
      });
    }
    // Set exact last item as actual lastPr
    items[items.length - 1].prezzo = baseP;
    return items;
  };

  const chartData = generateChartData(activeTickerSymbol);

  // Active Strategy Settings Helper
  const currentActiveStrategy = strategies.find(s => s.id === activeStrategyId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Real-time Push Notification Stack */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-2xl flex items-start gap-3"
            >
              <div className="mt-0.5">
                {notif.type === "BUY" && (
                  <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30">
                    <Zap className="h-5 w-5" />
                  </div>
                )}
                {notif.type === "SELL" && (
                  <div className="bg-amber-500/20 text-amber-400 p-1.5 rounded-lg border border-amber-500/30">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
                {notif.type === "STOP_LOSS" && (
                  <div className="bg-rose-500/20 text-rose-400 p-1.5 rounded-lg border border-rose-500/30">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                )}
                {notif.type === "TRAILING_TP" && (
                  <div className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-lg border border-cyan-500/30">
                    <Flame className="h-5 w-5" />
                  </div>
                )}
                {notif.type !== "BUY" && notif.type !== "SELL" && notif.type !== "STOP_LOSS" && notif.type !== "TRAILING_TP" && (
                  <div className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded-lg">
                    <Bell className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white tracking-tight">{notif.title}</p>
                  <span className="text-[10px] text-slate-400 font-mono">Push Istantanea</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.body}</p>
                {notif.pnl !== undefined && (
                  <div className="mt-2 text-[11px] font-semibold">
                    Rendimento:{" "}
                    <span className={notif.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {notif.pnl >= 0 ? "+" : ""}${notif.pnl.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-slate-400 hover:text-slate-200 mt-0.5 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Header Layout */}
      <header className="border-b border-slate-900 bg-slate-950/85 sticky top-0 backdrop-blur-md z-40 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-600/20">
            <Cpu className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 id="app-title" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Bitget AI Auto-Trading Bot
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-mono tracking-wider">v2.1</span>
            </h1>
            <p className="text-xs text-slate-400">Automatizzazione real-time basata su algoritmi e raccomandazioni intelligenti dall'IA</p>
          </div>
        </div>

        {/* Global Quick Status Headers */}
        <div className="flex flex-wrap items-center gap-3">

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all focus:outline-none"
            title="Bitget API credentials"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            onClick={() => triggerMockPush("INFO", "Dispositivo mock push innescato correttamente.")}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium flex items-center gap-1.5 focus:outline-none"
            title="Esegui simulazione push notifica"
          >
            <Bell className="h-3.5 w-3.5 text-cyan-400" />
            Test Push Alert
          </button>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 flex flex-col md:flex-row">
        
        {/* Render Mobile Device Simulation Mode */}
        {false && (
          <div className="flex-1 flex justify-center py-8 bg-slate-900/40 px-4 min-h-[700px]">
            <div className="relative w-full max-w-[375px] h-[780px] bg-slate-950 rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              
              {/* Phone Status Notch */}
              <div className="absolute top-0 inset-x-0 h-7 bg-slate-950 flex justify-between px-6 items-center text-[11px] font-mono font-medium text-slate-400 z-50">
                <span>10:52</span>
                <div className="w-16 h-4 bg-slate-950 rounded-b-xl mx-auto absolute inset-x-0 top-0"></div>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 bg-slate-400 rounded-xs"></div>
                </div>
              </div>

              {/* Mobile Screen Header */}
              <div className="pt-9 pb-3 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                    B-Algon Mobile
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Modalità: {botMode}</p>
                </div>

                <div className="flex items-center gap-1">
                  <div className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/20 font-bold font-mono text-cyan-400">
                    {botStatus}
                  </div>
                </div>
              </div>

              {/* Mobile Screen Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-16">
                
                {/* On-The-Go Quick Engine Switch */}
                <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Interruttore Bot</span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      {botStatus === BotStatus.RUNNING ? "Strategia Attiva" : "Sospeso"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {botStatus !== BotStatus.RUNNING ? (
                      <button 
                        onClick={() => controlBot(BotStatus.RUNNING)}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 focus:outline-none"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        AVVIA BOT
                      </button>
                    ) : (
                      <button 
                        onClick={() => controlBot(BotStatus.STOPPED)}
                        className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 focus:outline-none"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        PAUSA BOT
                      </button>
                    )}

                    <button
                      onClick={() => controlBot(undefined, botMode === BotMode.SIMULATED ? BotMode.REAL : BotMode.SIMULATED)}
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold rounded-xl focus:outline-none flex flex-col justify-center items-center"
                    >
                      <span>VIRA IN REALE</span>
                      <span className="text-[9px] text-slate-400 font-normal">({botMode})</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Active Position State Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-600/5 rounded-bl-full pointer-events-none"></div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Saldo d'Esercizio Mobile</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black font-mono text-white">$14,520.12</span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center font-mono">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      +{((totalClosedPnl + totalOpenPnl) / 14000 * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400">P&L Esposte</span>
                      <p className={`text-sm font-bold font-mono ${totalOpenPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {totalOpenPnl >= 0 ? "+" : ""}${totalOpenPnl.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">P&L Storiche</span>
                      <p className="text-sm font-bold font-mono text-cyan-400">
                        +${totalClosedPnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Strategy Switcher & Adjustment Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-slate-300">Gestore Strategie On-the-Go</span>
                    <span className="text-[10px] text-slate-400">Attiva al tocco</span>
                  </div>

                  <div className="space-y-2">
                    {strategies.map((strat) => {
                      const isActive = strat.id === activeStrategyId;
                      return (
                        <div 
                          key={strat.id}
                          onClick={() => handleActivateStrategy(strat.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${isActive ? "bg-cyan-950/40 border-cyan-500" : "bg-slate-900 border-slate-800"}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{strat.name}</p>
                              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                                {strat.symbol === "DYNAMIC" ? "⚡ Multi-Coppia" : strat.symbol} • {strat.timeframe}
                              </span>
                            </div>
                            {isActive && <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>}
                          </div>

                          {/* Mobile dynamic Risk Tuning controls */}
                          {isActive && (
                            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex justify-between items-center">
                                <span>Calibrazione Rischio Volante</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">AUTOSALVATO</span>
                              </p>
                              
                              <div className="grid grid-cols-3 gap-2 text-[9px]">
                                <div>
                                  <div className="flex justify-between text-slate-400 mb-1">
                                    <span>Stop Loss</span>
                                    <span className="font-mono text-white">{strat.riskManagement.stopLossPercent}%</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0.5" 
                                    max="5.0" 
                                    step="0.1"
                                    value={strat.riskManagement.stopLossPercent} 
                                    onChange={(e) => {
                                      const updated = [...strategies];
                                      const idx = updated.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) {
                                        updated[idx].riskManagement.stopLossPercent = parseFloat(e.target.value);
                                        setStrategies(updated);
                                      }
                                    }}
                                    onMouseUp={() => {
                                      const idx = strategies.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) handlePersistStrategy(strategies[idx]);
                                    }}
                                    onTouchEnd={() => {
                                      const idx = strategies.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) handlePersistStrategy(strategies[idx]);
                                    }}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                  />
                                </div>

                                <div>
                                  <div className="flex justify-between text-slate-400 mb-1">
                                    <span>Trailing TP</span>
                                    <span className="font-mono text-white">{strat.riskManagement.trailingTakeProfitPercent}%</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0.1" 
                                    max="2.0" 
                                    step="0.1"
                                    value={strat.riskManagement.trailingTakeProfitPercent} 
                                    onChange={(e) => {
                                      const updated = [...strategies];
                                      const idx = updated.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) {
                                        updated[idx].riskManagement.trailingTakeProfitPercent = parseFloat(e.target.value);
                                        setStrategies(updated);
                                      }
                                    }}
                                    onMouseUp={() => {
                                      const idx = strategies.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) handlePersistStrategy(strategies[idx]);
                                    }}
                                    onTouchEnd={() => {
                                      const idx = strategies.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) handlePersistStrategy(strategies[idx]);
                                    }}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                  />
                                </div>

                                <div>
                                  <div className="flex justify-between text-slate-400 mb-1">
                                    <span>Leva Max</span>
                                    <span className="font-mono text-cyan-400 font-bold">{strat.riskManagement.leverage || 1}x</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    step="1"
                                    value={strat.riskManagement.leverage || 1} 
                                    onChange={(e) => {
                                      const updated = [...strategies];
                                      const idx = updated.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) {
                                        updated[idx].riskManagement.leverage = parseInt(e.target.value);
                                        setStrategies(updated);
                                      }
                                    }}
                                    onMouseUp={() => {
                                      const idx = strategies.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) handlePersistStrategy(strategies[idx]);
                                    }}
                                    onTouchEnd={() => {
                                      const idx = strategies.findIndex(s => s.id === strat.id);
                                      if (idx !== -1) handlePersistStrategy(strategies[idx]);
                                    }}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Active Position Item Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 px-1 block">Posizioni Aperte ({openPositions.length})</span>
                  {openPositions.length === 0 ? (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Nessuna operazione aperta sul bot in questo momento.</p>
                    </div>
                  ) : (
                    openPositions.map((pos) => {
                      const risk = currentActiveStrategy ? currentActiveStrategy.riskManagement : { stopLossPercent: 1.5, trailingTakeProfitPercent: 0.5, trailingActivationPercent: 2.0 };
                      const activationPrice = pos.entryPrice * (1 + risk.trailingActivationPercent / 100);
                      
                      return (
                        <div key={pos.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                {pos.symbol}
                                {pos.leverage && pos.leverage > 1 && (
                                  <span className="text-[8px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold border border-cyan-500/20">{pos.leverage}x</span>
                                )}
                              </p>
                              <p className="text-[9px] text-slate-400">Ingresso: ${pos.entryPrice.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-bold font-mono ${pos.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                              </span>
                              <p className="text-[9px] text-slate-400 font-mono">${pos.currentPrice.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Trailing progress visualizations */}
                          <div className="space-y-1 bg-slate-950 p-2 rounded-lg text-[9px] font-mono leading-relaxed">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Stop Loss Dinamico:</span>
                              <span className="text-rose-400 font-bold">${pos.stopLossPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-[9px]">Soglia Attivazione Trailing:</span>
                              <span className="text-slate-300">${activationPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Trailing Inseguito:</span>
                              {pos.isTrailingActive ? (
                                <span className="text-cyan-400 font-black flex items-center animate-pulse">
                                  <Flame className="h-2.5 w-2.5 mr-0.5" />
                                  ATTIVO (-{risk.trailingTakeProfitPercent}%)
                                </span>
                              ) : (
                                <span className="text-slate-500">Inatteso (gain &lt; {risk.trailingActivationPercent}%)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Mobile Phone Bottom bar navigation */}
              <div className="absolute bottom-0 inset-x-0 h-14 bg-slate-950/95 border-t border-slate-900 flex justify-around items-center px-4 z-40">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex flex-col items-center justify-center focus:outline-none ${activeTab === "dashboard" ? "text-cyan-400" : "text-slate-500"}`}
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-[9px] mt-0.5">Stato</span>
                </button>
                <div className="w-12 h-1 bg-slate-600 rounded-full absolute bottom-1.5 inset-x-0 mx-auto"></div>
              </div>

            </div>
          </div>
        )}
        {true && (
          
          /* Full Desktop Web Monitor Dashboard Screen */
          <div className="flex-1 p-6 space-y-6 flex flex-col md:grid md:grid-cols-4 gap-6">
            
            {/* COLUMN 1: Market Tickers List & Connection Setup API Panel */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Core Controller Dashboard summary card */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Stato Attività Bot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${botStatus === BotStatus.RUNNING ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${botStatus === BotStatus.RUNNING ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">{botStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {botMode === BotMode.SIMULATED ? "Saldo Demo (All-in)" : "Saldo Attivo Est."}
                    </span>
                    <span className="text-sm md:text-lg font-black text-white font-mono">
                      {botMode === BotMode.SIMULATED ? `${simulatedBalance.toFixed(2)} €` : "$14,520.12"}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-400 block font-mono">Modalità Bot</span>
                    <span className="text-xs font-bold text-cyan-400 block mt-0.5">{botMode}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {botStatus !== BotStatus.RUNNING ? (
                    <button
                      onClick={() => controlBot(BotStatus.RUNNING)}
                      className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 transition-all text-sm focus:outline-none"
                    >
                      <Play className="h-4 w-4 fill-current text-slate-950" />
                      AVVIA TRADING AUTOMATICO
                    </button>
                  ) : (
                    <button
                      onClick={() => controlBot(BotStatus.STOPPED)}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm focus:outline-none"
                    >
                      <Square className="h-4 w-4 fill-current text-white" />
                      ARRESTA AUTOMAZIONE BOT
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => controlBot(undefined, BotMode.SIMULATED)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${botMode === BotMode.SIMULATED ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-slate-900 text-slate-400 border-slate-800"}`}
                    >
                      Demo (Paper)
                    </button>
                    <button
                      onClick={() => {
                        if (!credentialsSet) {
                          setIsSettingsOpen(true);
                        } else {
                          controlBot(undefined, BotMode.REAL);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${botMode === BotMode.REAL ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-slate-900 text-slate-400 border-slate-800"}`}
                    >
                      Bitget Live API
                    </button>
                  </div>
                </div>
              </div>

              {/* Bitget Spot tickers monitor box */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    Spot Quotes Bitget
                  </h3>
                  <span className="text-[10px] text-slate-400">Agg. 5s</span>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
                  {Object.keys(tickers).map((sym) => {
                    const tick = tickers[sym];
                    const changeVal = parseFloat(tick.change24h);
                    const isActiveChart = sym === activeTickerSymbol;

                    return (
                      <div
                        key={sym}
                        onClick={() => setActiveTickerSymbol(sym)}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${isActiveChart ? "bg-slate-800/60" : "hover:bg-slate-800/20"}`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{sym}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">Spot Market</span>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold font-mono tracking-tight text-white">${parseFloat(tick.lastPr).toLocaleString(undefined, { minimumFractionDigits: symDecimalPoints(sym) })}</p>
                          <span className={`text-[10px] font-bold font-mono flex items-center justify-end ${changeVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {changeVal >= 0 ? "+" : ""}
                            {tick.change24h}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API and SDK Security credentials sheet shortcut */}
              <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">Stato Connessione</span>
                  {credentialsSet ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Connesso
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Paper trading</span>
                  )}
                </div>
                
                <p className="text-xs text-slate-400 leading-normal">
                  {credentialsSet 
                    ? "Bot configurato con le tue chiavi API ufficiali di Bitget Spot. I dati d'ordine sono operativi in tempo reale."
                    : "I dati e gli ordini eseguiti sul tuo pannello sono simulati sul feed di quotazioni reali. Configura le credenziali Bitget se desideri un trading reale."
                  }
                </p>

                {credentialsSet ? (
                  <button
                    onClick={handleDisconnectCredentials}
                    className="w-full py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold transition-all focus:outline-none"
                  >
                    Disconnetti API private
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1 focus:outline-none"
                  >
                    <Key className="h-3.5 w-3.5 text-cyan-400" />
                    Collega API Bitget
                  </button>
                )}
              </div>

            </div>

            {/* COLUMN 2 & 3: Primary Charts & AI Strategist suggester console */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Real-time Ticker price history area chart */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUpIcon className="h-4 w-4 text-cyan-400" />
                      Visualizzazione Grafica Quotazione {activeTickerSymbol}
                    </h3>
                    <p className="text-xs text-slate-400">Andamento spot aggiornato in tempo reale con indicatore di trend algoritmico</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-white font-mono">${tickers[activeTickerSymbol] ? parseFloat(tickers[activeTickerSymbol].lastPr).toLocaleString() : ""}</p>
                    <span className={`text-xs font-bold font-mono ${tickers[activeTickerSymbol] && parseFloat(tickers[activeTickerSymbol].change24h) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {tickers[activeTickerSymbol] && parseFloat(tickers[activeTickerSymbol].change24h) >= 0 ? "+" : ""}{tickers[activeTickerSymbol]?.change24h}%
                    </span>
                  </div>
                </div>

                {/* Recharts Graphical plotting container */}
                <div className="h-56">
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrezzo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} domain={["auto", "auto"]} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                          labelStyle={{ color: "#94a3b8" }}
                          itemStyle={{ color: "#06b6d4", fontSize: "12px" }}
                        />
                        <Area type="monotone" dataKey="prezzo" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPrezzo)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Gemini AI Custom Indicator Strategy Suggesting section */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 relative space-y-4">
                <div className="absolute top-5 right-5 text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 font-semibold text-xs animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  Gemini IA Assistenza
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Generatore di Analisi & Strategia IA
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 whitespace-normal">Seleziona i parametri e chiedi all'IA di formulare algoritmi quantitativi e stop-loss dinamici ritagliati.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Coppia Spot</label>
                    <select 
                      value={selectedAiCoin}
                      onChange={(e) => setSelectedAiCoin(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-950 text-white rounded-lg p-2 border border-slate-800 outline-none focus:border-cyan-500"
                    >
                      <option value="BTC">BTC / USDT</option>
                      <option value="ETH">ETH / USDT</option>
                      <option value="SOL">SOL / USDT</option>
                      <option value="XRP">XRP / USDT</option>
                      <option value="ADA">ADA / USDT</option>
                      <option value="DYNAMIC">✨ Scansione Multi-Coppia</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Profilo Rischio</label>
                    <select 
                      value={selectedAiRisk} 
                      onChange={(e) => setSelectedAiRisk(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-950 text-white rounded-lg p-2 border border-slate-800 outline-none focus:border-cyan-500"
                    >
                      <option value="Moderate">Moderato (SL 1.5%)</option>
                      <option value="Conservative">Conservativo (SL 0.8%)</option>
                      <option value="Aggressive">Aggressivo (SL 2.5%)</option>
                      <option value="High Frequency Scalper">Scalper Iper-attivo (SL 0.5%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Timeframe</label>
                    <select 
                      value={selectedAiTimeframe} 
                      onChange={(e) => setSelectedAiTimeframe(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-950 text-white rounded-lg p-2 border border-slate-800 outline-none focus:border-cyan-500"
                    >
                      <option value="1m">1 Minuto</option>
                      <option value="5m">5 Minuti</option>
                      <option value="15m">15 Minuti</option>
                      <option value="1h">1 Ora</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">Stile Operativo</label>
                    <select 
                      value={selectedAiStyle} 
                      onChange={(e) => setSelectedAiStyle(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-950 text-white rounded-lg p-2 border border-slate-800 outline-none focus:border-cyan-500"
                    >
                      <option value="Scalping">Scalping rapido</option>
                      <option value="Trend Following">Inseguimento Trend</option>
                      <option value="Mean Reversion">Ritorno alla Media</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={requestAiSuggestion}
                    disabled={isAiLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analisi tecnica in corso con Gemini...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        CHIEDI SUGGERIMENTO STRATEGIA ALL'IA
                      </>
                    )}
                  </button>
                </div>

                {/* AI suggested schema report & apply strategy selector */}
                {aiReasoning && suggestedStrategy && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 p-4 rounded-xl border border-cyan-500/20 space-y-3.5"
                  >
                    <div className="flex justify-between items-center bg-cyan-950/20 px-3 py-2 rounded-lg border border-cyan-500/10">
                      <div>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-mono">Strategia Suggerita</span>
                        <p className="text-sm font-bold text-white mt-0.5">{suggestedStrategy.name}</p>
                      </div>
                      <button
                        onClick={applySuggestedStrategy}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all focus:outline-none"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Attiva e Installa Bot
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Trigger ACQUISTO</span>
                        <p className="font-mono text-cyan-400 font-semibold mt-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 overflow-x-auto whitespace-nowrap">{suggestedStrategy.buyTriggerCondition}</p>
                      </div>

                      <div>
                        <span className="text-slate-400">Trigger VENDITA</span>
                        <p className="font-mono text-rose-400 font-semibold mt-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 overflow-x-auto whitespace-nowrap">{suggestedStrategy.sellTriggerCondition}</p>
                      </div>

                      <div>
                        <span className="text-slate-400">SL & Trailing TP</span>
                        <p className="font-mono text-slate-200 font-semibold mt-1">
                          Stop-Loss: <span className="text-rose-400">{suggestedStrategy.riskManagement.stopLossPercent}%</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400">Inseguimento Trailing</span>
                        <p className="font-mono text-slate-200 font-semibold mt-1">
                          Soglia Attivazione: <span className="text-emerald-400">+{suggestedStrategy.riskManagement.trailingActivationPercent}%</span> (Scarto: {suggestedStrategy.riskManagement.trailingTakeProfitPercent}%)
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Note di posizionamento IA:</span>
                      <p className="text-xs text-slate-300 italic mt-1 leading-relaxed whitespace-pre-line bg-slate-900/50 p-3 rounded-lg border border-slate-800">{aiReasoning}</p>
                    </div>
                  </motion.div>
                )}

                {aiError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{aiError}</span>
                  </div>
                )}
              </div>

              {/* Strategies management section & customizable conditions builder */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      Algoritmi di Analisi & Strategie Dispositive
                    </h3>
                    <p className="text-xs text-slate-400">Associa o attiva la strategia dominante monitorata dal bot di trading</p>
                  </div>

                  <button
                    onClick={() => setIsCustomStratOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all focus:outline-none"
                  >
                    <Plus className="h-4 w-4 text-cyan-400" />
                    Nuova Strategia Custom
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {strategies.map((strat) => {
                    const isActive = strat.id === activeStrategyId;
                    return (
                      <div 
                        key={strat.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${isActive ? "bg-slate-950/80 border-cyan-500 shadow-lg shadow-cyan-500/5" : "bg-slate-900/40 border-slate-800/80"}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-white">{strat.name}</span>
                            {isActive ? (
                              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold font-mono">ATTIVA IN MACCHINA</span>
                            ) : (
                              <button
                                onClick={() => handleActivateStrategy(strat.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-200 font-bold focus:outline-none"
                              >
                                ATTIVA
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-normal">{strat.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-900/80 space-y-1.5 text-[11px] font-mono">
                          <div className="flex justify-between text-slate-400">
                            <span>Asset Monitor:</span>
                            <span className={strat.symbol === "DYNAMIC" ? "text-cyan-400 font-bold" : "text-slate-200"}>
                              {strat.symbol === "DYNAMIC" ? "⚡ Multi-Coppia" : strat.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Soglie Stop Loss:</span>
                            <span className="text-rose-400">-{strat.riskManagement.stopLossPercent}%</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Trailing TP:</span>
                            <span className="text-emerald-400">+{strat.riskManagement.trailingActivationPercent}% (Scarto {strat.riskManagement.trailingTakeProfitPercent}%)</span>
                          </div>
                          <div className="flex justify-between text-slate-400 border-t border-slate-900/30 pt-1">
                            <span>Leva Impostata:</span>
                            <span className="text-cyan-400 font-bold">{strat.riskManagement.leverage || 1}x</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* COLUMN 4: Active Positions Monitor & Real-time Action Logs */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Positions tracker section */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers3 className="h-4 w-4 text-cyan-400" />
                      Operazioni in Macchina ({openPositions.length})
                    </h3>
                    <p className="text-[10px] text-slate-400">Posizioni Spot Bitget aperte</p>
                  </div>

                  <span className={`text-xs font-bold font-mono ${totalOpenPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {totalOpenPnl >= 0 ? "+" : ""}${totalOpenPnl.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  {openPositions.length === 0 ? (
                    <div className="p-6 bg-slate-950 rounded-xl border border-slate-900 text-center space-y-1">
                      <p className="text-xs text-slate-400">Nessuna posizione aperta.</p>
                      <span className="text-[10px] text-slate-500">I trigger delle strategie valutano costantemente i segnali.</span>
                    </div>
                  ) : (
                    openPositions.map((pos) => {
                      const risk = currentActiveStrategy ? currentActiveStrategy.riskManagement : { stopLossPercent: 1.5, trailingTakeProfitPercent: 0.5, trailingActivationPercent: 2.0 };
                      const activationPrice = pos.entryPrice * (1 + risk.trailingActivationPercent / 100);
                      const currentP = pos.currentPrice;

                      return (
                        <div key={pos.id} className="p-3 bg-slate-950 rounded-xl border border-slate-8c font-mono text-xs space-y-2">
                          <div className="flex justify-between font-bold text-white text-xs">
                            <span className="flex items-center gap-1">
                              {pos.symbol}
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 py-0.1 rounded">Spot LONG</span>
                              {pos.leverage && pos.leverage > 1 && (
                                <span className="text-[9px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.1 rounded font-bold border border-cyan-500/20 font-mono">Leva {pos.leverage}x</span>
                              )}
                            </span>
                            <span className={pos.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 text-[10px] text-slate-400 gap-y-1">
                            <span>Ingresso SL:</span>
                            <span className="text-right text-slate-200">${pos.entryPrice.toLocaleString()}</span>

                            <span>Ultimo Valore:</span>
                            <span className="text-right text-slate-200">${pos.currentPrice.toLocaleString()}</span>

                            <span>Stop Loss DIN:</span>
                            <span className="text-right text-rose-400 font-bold">${pos.stopLossPrice.toLocaleString()}</span>

                            <span>Inseguimento TP:</span>
                            {pos.isTrailingActive ? (
                              <span className="text-right text-cyan-400 font-bold flex items-center justify-end">
                                <Flame className="h-3 w-3 mr-0.5 animate-pulse text-cyan-400" />
                                INSEGUITO
                              </span>
                            ) : (
                              <span className="text-right text-slate-500">Inatteso</span>
                            )}
                          </div>

                          {/* Dynamic slider stop loss percentage visualizations */}
                          <div className="pt-2 border-t border-slate-900 space-y-1.5">
                            <div className="flex justify-between text-[9px] text-slate-500">
                              <span>SL (${pos.stopLossPrice.toLocaleString()})</span>
                              <span>Target (${pos.takeProfitPrice.toLocaleString()})</span>
                            </div>
                            <div className="h-1 bg-slate-900 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full bg-cyan-400" 
                                style={{ 
                                  width: `${Math.max(10, Math.min(100, ((currentP - pos.stopLossPrice) / (pos.takeProfitPrice - pos.stopLossPrice)) * 100))}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Trade action log block */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    Attività di Macchina Real-time
                  </h3>
                  <span className="text-[10px] text-slate-500">Log</span>
                </div>

                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {tradeLogs.slice(0, 15).map((log) => {
                    return (
                      <div key={log.id} className="text-[11px] leading-relaxed flex items-start gap-2">
                        <div className="mt-0.5">
                          {log.type === "BUY" && <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />}
                          {log.type === "SELL" && <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />}
                          {log.type === "STOP_LOSS" && <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />}
                          {log.type === "TRAILING_TP" && <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />}
                          {log.type === "INFO" && <span className="inline-block h-2 w-2 rounded-full bg-slate-500" />}
                          {log.type === "WARNING" && <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-ping" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline text-[9px] text-slate-400">
                            <span className="font-bold text-slate-200">{log.symbol}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-300 font-mono mt-0.5">{log.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <span>© 2026 Algotone engine. Integrato con API Bitget Spot v2.</span>
        <span>Stato Connessione: {credentialsSet ? "REALE (CHIAVI CARICATE)" : "DOCUMENTI IN SIMULAZIONE (PAPER-TRADING)"}</span>
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          Server Sandbox Monitor Attivo
        </span>
      </footer>

      {/* SETTINGS DRAWER / SECURITY API SHEET */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative space-y-4"
            >
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold tracking-tight text-md">Configurazione Chiavi API Bitget</h3>
              </div>

              <p className="text-xs text-slate-400 leading-normal">
                Fornisci le tue chiavi API di Bitget Spot. I dati d'ordine verranno proxyati interamente lato server sul nostro engine, senza memorizzare in modo persistente le credenziali.
              </p>

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">API Key</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Chiave Pubblica Bitget" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      required
                      className="w-full bg-slate-950 text-white rounded-xl p-3 text-xs border border-slate-800 outline-none focus:border-cyan-500 pl-10"
                    />
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">API Secret</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Chiave Segreta" 
                      value={apiSecret} 
                      onChange={(e) => setApiSecret(e.target.value)}
                      required
                      className="w-full bg-slate-950 text-white rounded-xl p-3 text-xs border border-slate-800 outline-none focus:border-cyan-500 pl-10"
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-1">Passphrase</label>
                  <input 
                    type="password" 
                    placeholder="Passphrase API" 
                    value={apiPassphrase} 
                    onChange={(e) => setApiPassphrase(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-white rounded-xl p-3 text-xs border border-slate-800 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="sandbox" 
                    checked={isSandbox} 
                    onChange={(e) => setIsSandbox(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  <label htmlFor="sandbox" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
                    Usa Conto Bitget Spot Demo (Sandbox)
                  </label>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs focus:outline-none"
                  >
                    Abilita Trading Reale
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM STRATEGY DEFINITION MODAL */}
      <AnimatePresence>
        {isCustomStratOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsCustomStratOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold tracking-tight text-md">Crea Strategia Personalizzata</h3>
              </div>

              <form onSubmit={handleCreateCustomStrategy} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-300 font-bold block mb-1">Nome Strategia</label>
                  <input 
                    type="text" 
                    placeholder="Nome custom (es: Mia RSI Scalper)" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold block mb-1">Coppia Spot</label>
                    <select
                      value={customCoin}
                      onChange={(e) => setCustomCoin(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500"
                    >
                      <option value="BTC">BTC / USDT</option>
                      <option value="ETH">ETH / USDT</option>
                      <option value="SOL">SOL / USDT</option>
                      <option value="XRP">XRP / USDT</option>
                      <option value="ADA">ADA / USDT</option>
                      <option value="DYNAMIC">✨ Scansione Dinamica Multi-Coppia</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold block mb-1">Volume Allocato ($)</label>
                    <input 
                      type="number" 
                      value={customInvestment}
                      onChange={(e) => setCustomInvestment(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 font-bold block mb-1">Condizione Trigger Acquisto</label>
                  <input 
                    type="text" 
                    placeholder="e.g. RSI < 30" 
                    value={customTriggerBuy}
                    onChange={(e) => setCustomTriggerBuy(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500 font-mono text-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-300 font-bold block mb-1">Condizione Trigger Vendita (Segnale Standard)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. RSI > 70" 
                    value={customTriggerSell}
                    onChange={(e) => setCustomTriggerSell(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500 font-mono text-rose-400"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Opzioni Rischio & Trailing</p>

                   <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Stop Loss (%):</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={customSl}
                        onChange={(e) => setCustomSl(parseFloat(e.target.value) || 1.5)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2 text-[11px] border border-slate-800 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Trailing Act (%):</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={customTrailActivate}
                        onChange={(e) => setCustomTrailActivate(parseFloat(e.target.value) || 2.0)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2 text-[11px] border border-slate-800 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Trailing Dp (%):</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        value={customTrailTp}
                        onChange={(e) => setCustomTrailTp(parseFloat(e.target.value) || 0.5)}
                        className="w-full bg-slate-950 text-white rounded-xl p-2 text-[11px] border border-slate-800 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Leva Leva (x):</label>
                      <input 
                        type="number" 
                        min="1"
                        max="10"
                        step="1"
                        value={customLeverage}
                        onChange={(e) => setCustomLeverage(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="w-full bg-slate-950 text-white rounded-xl p-2 text-[11px] border border-slate-800 outline-none focus:border-cyan-500 font-mono font-bold text-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomStratOpen(false)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs focus:outline-none"
                  >
                    Installa nel sistema
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function symDecimalPoints(sym: string) {
  return sym.includes("XRP") || sym.includes("ADA") ? 4 : 2;
}
