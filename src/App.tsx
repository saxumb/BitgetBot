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
  ArrowRight
} from "lucide-react";
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
    name: "Scanner Multi-Coppia Dinamico Futures (10x)",
    description: "Algoritmo quantistico adattivo futures che scansiona continuamente BTC, ETH, SOL, XRP e ADA sul mercato per catturare all-in l'asset con migliore configurazione tecnica con leva fino a 10x.",
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
      leverage: 10
    },
    aiNotes: "Questo algoritmo scansiona l'intero paniere futures di Bitget. Non appena una delle coppie incrocia in ipervenduto oppure mostra un'ottima forza relativa, apre un'azione di trading Futures allocando il budget a leva 10x. Risolve il problema del gating vincolato su singole coppie.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: "strat-ai-scalper",
    name: "AI Multi-Indicator Futures Scalper (10x)",
    description: "Algoritmo futures ad alta frequenza che combina RSI ipervenduto/ipercomprato con l'indicatore EMA per catturare piccoli trend rapidi con leva 10x.",
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
      leverage: 10
    },
    aiNotes: "L'intelligenza artificiale raccomanda questa strategia su orizzonti temporali brevi per capitalizzare sulla volatilità intraday del Bitcoin con leva a 10x. Lo stop loss stretto protegge da dump rapidi.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "strat-eth-trend",
    name: "EMA Crossover Futures Tracker (10x)",
    description: "Insegue i trend macro futures su Ethereum utilizzando incroci di medie mobili veloci e lente per confermare forza di mercato con leva 10x.",
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
      leverage: 10
    },
    aiNotes: "Ottimizzato per contesti direzionali futures chiari. Evitare l'attivazione in fasi puramente laterali per ridurre falsi segnali di trading.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "strat-dv-absorption-sol",
    name: "Delta Volume Absorption Futures (LONG 10x)",
    description: "Cavalca l'assorbimento rialzista dei pesi massimi sui futures. Quando i trader short aggressively aggrediscono il mercato (DV negativo) ma le balene assorbono gli ordini, apre un LONG a leva 10x su SOL.",
    symbol: "SOLUSDT",
    timeframe: "15m",
    indicators: [
      { name: "Delta Volume Imbalance", type: "DV", params: { threshold: 5 }, enabled: true },
      { name: "Fast EMA Tracker", type: "EMA", params: { period: 9 }, enabled: true },
      { name: "Slow EMA Tracker", type: "EMA", params: { period: 21 }, enabled: true }
    ],
    buyTriggerCondition: "DV < -5% AND Prezzo Stabile (LONG)",
    sellTriggerCondition: "Fast_EMA < Slow_EMA",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 2.0,
      trailingTakeProfitPercent: 0.8,
      trailingActivationPercent: 2.5,
      leverage: 10
    },
    aiNotes: "Ideata appositamente su SOLUSDT futures. Rileva anomalie di divergence volumetrica dove il Delta Volume è fortemente ribassista ma il prezzo rifiuta di scendere (forte assorbimento bid), indicando inversioni di tendenza imminenti con leva 10x.",
    createdAt: new Date().toISOString()
  },
  {
    id: "strat-dv-distribution-xrp",
    name: "Delta Volume Distribution Futures (SHORT 10x)",
    description: "Cavalca la distribuzione futures. Quando i trader long aggressively aggrediscono l’ask (DV positivo) ma grandi seller assorbono l'ascesa, apre uno SHORT a leva 10x su XRP.",
    symbol: "XRPUSDT",
    timeframe: "15m",
    indicators: [
      { name: "Delta Volume Imbalance", type: "DV", params: { threshold: 5 }, enabled: true },
      { name: "Fast EMA Tracker", type: "EMA", params: { period: 9 }, enabled: true },
      { name: "Slow EMA Tracker", type: "EMA", params: { period: 21 }, enabled: true }
    ],
    buyTriggerCondition: "DV > 5% AND Prezzo Faticoso (SHORT)",
    sellTriggerCondition: "Fast_EMA > Slow_EMA",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 2.5,
      trailingTakeProfitPercent: 0.8,
      trailingActivationPercent: 2.5,
      leverage: 10
    },
    aiNotes: "Applicata su XRPUSDT futures per ritracciamenti. Trova la massima deviazione dove un Delta Volume positivo non si traduce in un rialzo proporzionale del prezzo, anticipando un esausto ritracciamento.",
    createdAt: new Date().toISOString()
  },
  {
    id: "strat-dv-multicoin-bidirectional",
    name: "Delta Volume Futures Bi-Direzionale (10x)",
    description: "Campiona e scansiona continuativamente tutte le coppie abilitate (BTC, ETH, SOL, XRP, ADA) alla ricerca di anomalie volumetriche futures. Apre posizioni LONG (con DV negativo) o SHORT (con DV positivo) con leva 10x.",
    symbol: "DYNAMIC",
    timeframe: "15m",
    indicators: [
      { name: "Delta Volume Integrale", type: "DV", params: { threshold: 4.5 }, enabled: true },
      { name: "Fast EMA Tracker", type: "EMA", params: { period: 9 }, enabled: true },
      { name: "Slow EMA Tracker", type: "EMA", params: { period: 21 }, enabled: true }
    ],
    buyTriggerCondition: "Delta Volume Divergence (LONG/SHORT)",
    sellTriggerCondition: "Dynamic DV / EMA Reverse Exit",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 2.0,
      trailingTakeProfitPercent: 0.8,
      trailingActivationPercent: 2.5,
      leverage: 10
    },
    aiNotes: "Strategia ammiraglia futures bi-direzionale con leva 10x. Sfrutta forti anomalie volumetriche sia al rialzo che al ribasso.",
    createdAt: new Date().toISOString()
  },
  {
    id: "strat-sr-breakout-retest",
    name: "Breakout & Retest Supporto/Resistenza Futures (10x)",
    description: "Identifica supporti e resistenze chiave tramite massimi/minimi locali. Attende il breakout direzionale (sopra la resistenza o sotto il supporto) e apre la posizione solo sul successivo retest di conferma (ritracciamento senza perforazione) con leva 10x.",
    symbol: "DYNAMIC",
    timeframe: "15m",
    indicators: [
      { name: "Support & Resistance Tracker", type: "SR", params: { period: 10 }, enabled: true },
      { name: "Fast EMA Tracker", type: "EMA", params: { period: 9 }, enabled: true },
      { name: "Slow EMA Tracker", type: "EMA", params: { period: 21 }, enabled: true }
    ],
    buyTriggerCondition: "BREAKOUT_RETEST_SR",
    sellTriggerCondition: "EMA Crossover / Trailing SL",
    riskManagement: {
      investmentAmount: 100,
      stopLossPercent: 2.0,
      trailingTakeProfitPercent: 0.8,
      trailingActivationPercent: 2.5,
      leverage: 10
    },
    aiNotes: "Ottimizzato per contesti con chiari livelli di congestione. Il breakout conferma l'inversione di polarità (S/R flip), offrendo un ottimo rapporto rischio/rendimento sul retest.",
    createdAt: new Date().toISOString()
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
  const [strategies, setStrategies] = useState<TradingStrategy[]>(() => {
    const loaded = getLocalVar("bitget_strategies", DEFAULT_STRATEGIES);
    // Auto-update any default strategy in local storage to match the new 10x leverage and names
    const upgraded = loaded.map((loadedStrat) => {
      const defaultStrat = DEFAULT_STRATEGIES.find((ds) => ds.id === loadedStrat.id);
      if (defaultStrat) {
        return {
          ...loadedStrat,
          name: defaultStrat.name,
          description: defaultStrat.description,
          riskManagement: {
            ...loadedStrat.riskManagement,
            leverage: defaultStrat.riskManagement.leverage
          }
        };
      }
      return loadedStrat;
    });

    const hasNewDV = upgraded.some(s => s.id === "strat-dv-multicoin-bidirectional");
    let updatedList = [...upgraded];
    if (!hasNewDV) {
      const dvStrategies = DEFAULT_STRATEGIES.filter(s => s.id.startsWith("strat-dv-"));
      dvStrategies.forEach(ds => {
        if (!updatedList.some(s => s.id === ds.id)) {
          updatedList.push(ds);
        }
      });
    }

    // Auto-append Support & Resistance strategy if missing
    if (!updatedList.some(s => s.id === "strat-sr-breakout-retest")) {
      const srStrat = DEFAULT_STRATEGIES.find(s => s.id === "strat-sr-breakout-retest");
      if (srStrat) {
        updatedList.push(srStrat);
      }
    }
    return updatedList;
  });
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

  // Backtest Management Variables
  const [isBacktestOpen, setIsBacktestOpen] = useState<boolean>(false);
  const [backtestStrategy, setBacktestStrategy] = useState<TradingStrategy | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<number>(30); // 1, 7, 30, 90 days
  const [backtestRegime, setBacktestRegime] = useState<string>("real"); // "real", "bull", "bear", "sideways", "volatile"
  const [backtestStartingBalance, setBacktestStartingBalance] = useState<number>(1000);
  const [backtestCoin, setBacktestCoin] = useState<string>("BTC"); // BTC, ETH, SOL, XRP, ADA
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [backtestWarning, setBacktestWarning] = useState<string | null>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  // Local push notifications logs & container
  const [notifications, setNotifications] = useState<InstantNotification[]>([]);
  
  // Reference tracker for logs to detect new executions for alerts
  const lastLogIdRef = useRef<string | null>(null);
  const indicatorTrackingRef = useRef<Record<string, { rsi: number; emaShort: number; emaLong: number; dv?: number }>>({});

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
              emaLong: p,
              dv: (Math.random() - 0.5) * 14
            };
          } else {
            const ind = indicatorTrackingRef.current[sym];
            ind.emaShort = ind.emaShort * 0.4 + p * 0.6;
            ind.emaLong = ind.emaLong * 0.6 + p * 0.4;
            if (ind.dv === undefined) {
              ind.dv = (Math.random() - 0.5) * 14;
            } else {
              const trendBias = ((ind.emaShort - ind.emaLong) / ind.emaLong) * 15;
              ind.dv = Math.max(-15, Math.min(15, ind.dv * 0.85 + (Math.random() - 0.5) * 3 + trendBias));
            }
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
      const tracker: Record<string, { rsi: number; emaShort: number; emaLong: number; dv?: number }> = {};
      Object.keys(tickers).forEach((sym) => {
        const t = tickers[sym];
        const val = t ? parseFloat(t.lastPr) : 100;
        tracker[sym] = {
          rsi: 40 + Math.random() * 20,
          emaShort: val,
          emaLong: val,
          dv: (Math.random() - 0.5) * 14
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
          
          if (ind.dv === undefined) {
            ind.dv = (Math.random() - 0.5) * 14;
          } else {
            const trendBias = ((ind.emaShort - ind.emaLong) / ind.emaLong) * 15;
            ind.dv = Math.max(-15, Math.min(15, ind.dv * 0.85 + (Math.random() - 0.5) * 3 + trendBias));
          }
          
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
            const isShort = nextPos.type === PositionType.SHORT;
            
            // P&L and deltaPercent calculations
            const deltaPercent = isShort
              ? ((nextPos.entryPrice - currentPrice) / nextPos.entryPrice) * 100
              : ((currentPrice - nextPos.entryPrice) / nextPos.entryPrice) * 100;
            
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
                message: `💥 LIQUIDAZIONE! Posizione ${isShort ? "SHORT" : "LONG"} su ${nextPos.symbol} liquidata a $${currentPrice.toLocaleString()} a causa della leva ${leverage}x (PnL: -100%, perdita: -$${nextPos.investedAmount.toFixed(2)})`
              });

              if (botMode === BotMode.SIMULATED) {
                currentBalance += (nextPos.investedAmount + nextPos.pnl);
              }
              return nextPos;
            }

            // Trailing Peak / Extreme detection (best price since entry)
            const isNewPeak = isShort 
              ? (currentPrice < nextPos.highestPriceReached) // For short, highestPriceReached tracks the lowest price seen
              : (currentPrice > nextPos.highestPriceReached);

            if (isNewPeak) {
              nextPos.highestPriceReached = currentPrice;
              if (deltaPercent > 1.5) {
                // Adjust dynamic stop loss level:
                // For LONG: new stop loss moves UP
                // For SHORT: new stop loss moves DOWN
                const slShift = (deltaPercent * 0.4);
                const newStopPrice = isShort
                  ? nextPos.entryPrice * (1 + slShift / 100) // moving stop down for short (which is safe entryPrice + shift)
                  : nextPos.entryPrice * (1 - slShift / 100); // moving stop up for long is incorrect here because stop was originally (1 - SL), wait.
                // Let's think:
                // Originally, for LONG, the trailing stop loss is calculated as:
                // nextPos.entryPrice * (1 + (deltaPercent * 0.4) / 100) (as deltaPercent increases, stopLossPrice increases, which is correct!).
                // If it's SHORT, we want the stop loss to move DOWN as deltaPercent increases!
                // So stopLossPrice should decrease!
                // Formula for SHORT trailing stop: nextPos.entryPrice * (1 - (deltaPercent * 0.4) / 100).
                // Let's double check this:
                // Yes, as deltaPercent increases, the short stop loss price decreases (moving closer to the exit and protecting gains).
                const newStopPriceLong = nextPos.entryPrice * (1 + (deltaPercent * 0.4) / 100);
                const newStopPriceShort = nextPos.entryPrice * (1 - (deltaPercent * 0.4) / 100);
                const newStopPriceCalculated = isShort ? newStopPriceShort : newStopPriceLong;

                const isBetterSL = isShort 
                  ? (newStopPriceCalculated < nextPos.stopLossPrice) 
                  : (newStopPriceCalculated > nextPos.stopLossPrice);

                if (isBetterSL) {
                  const decimalPoints = nextPos.symbol.includes("XRP") || nextPos.symbol.includes("ADA") ? 4 : 2;
                  nextPos.stopLossPrice = parseFloat(newStopPriceCalculated.toFixed(decimalPoints));
                }
              }
            }

            // Trailing Take Profit Activation
            const activeStrat = strategies.find(s => s.id === nextPos.strategyId);
            const risk = activeStrat ? activeStrat.riskManagement : { stopLossPercent: 2, trailingTakeProfitPercent: 0.5, trailingActivationPercent: 1.5 };
            
            // Activation Level
            const activationLevel = isShort
              ? nextPos.entryPrice * (1 - risk.trailingActivationPercent / 100)
              : nextPos.entryPrice * (1 + risk.trailingActivationPercent / 100);

            const isActivated = isShort 
              ? (currentPrice <= activationLevel)
              : (currentPrice >= activationLevel);

            if (!nextPos.isTrailingActive && isActivated) {
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
            // 1) Trailing TP (Checked first to preserve profit-taking priority if active)
            if (nextPos.isTrailingActive) {
              const dropThreshold = isShort
                ? nextPos.highestPriceReached * (1 + risk.trailingTakeProfitPercent / 100)
                : nextPos.highestPriceReached * (1 - risk.trailingTakeProfitPercent / 100);

              const isTrailingTriggered = isShort
                ? (currentPrice >= dropThreshold)
                : (currentPrice <= dropThreshold);

              if (isTrailingTriggered) {
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
                  message: `📈 Trailing Take-Profit scattato! Posizione ${isShort ? "SHORT" : "LONG"} chiusa su ${nextPos.symbol} a $${currentPrice.toLocaleString()} dopo ritracciamento dal picco di $${nextPos.highestPriceReached.toLocaleString()} (PnL: ${nextPos.pnlPercent.toFixed(2)}%, profitto: $${nextPos.pnl.toFixed(2)})`
                });

                if (botMode === BotMode.SIMULATED) {
                  currentBalance += (nextPos.investedAmount + nextPos.pnl);
                }
                return nextPos;
              }
            }

            // 2) Stop Loss
            const isStopTriggered = isShort
              ? (currentPrice >= nextPos.stopLossPrice)
              : (currentPrice <= nextPos.stopLossPrice);

            if (isStopTriggered) {
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
                message: `🚨 Stop Loss dinamico attivato! Posizione ${isShort ? "SHORT" : "LONG"} chiusa su ${nextPos.symbol} a $${currentPrice.toLocaleString()} (PnL: ${nextPos.pnlPercent.toFixed(2)}%, profitto: $${nextPos.pnl.toFixed(2)})`
              });

              if (botMode === BotMode.SIMULATED) {
                currentBalance += (nextPos.investedAmount + nextPos.pnl);
              }
              return nextPos;
            }

            // 3) Sell Signal
            if (activeStrat) {
              const ind = indicatorTrackingRef.current[nextPos.symbol] || { rsi: 50, emaShort: currentPrice, emaLong: currentPrice };
              let metSell = false;
              if (activeStrat.buyTriggerCondition.includes("RSI")) {
                if (ind.rsi > 65) metSell = true;
              } else if (activeStrat.buyTriggerCondition.includes("supera") || activeStrat.buyTriggerCondition.includes("EMA")) {
                if (isShort ? ind.emaShort > ind.emaLong : ind.emaShort < ind.emaLong) metSell = true;
              } else if (activeStrat.buyTriggerCondition.includes("DV")) {
                const imbalancedDV = ind.dv || 0;
                if (isShort) {
                  // Exit short if DV turns negative (buyer capitulation/buyer exhaustion and seller aggression)
                  if (imbalancedDV < -4) metSell = true;
                } else {
                  // Exit long if DV turns highly positive
                  if (imbalancedDV > 4) metSell = true;
                }
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
                let isShort = false;

                if (activeStrat.buyTriggerCondition === "BREAKOUT_RETEST_SR") {
                  const indicatorRefCast = ind as any;
                  
                  // Initialize buffers
                  if (!indicatorRefCast.lastPrices) {
                    indicatorRefCast.lastPrices = [currentPrice];
                    indicatorRefCast.resistances = [currentPrice * 1.012, currentPrice * 1.025];
                    indicatorRefCast.supports = [currentPrice * 0.988, currentPrice * 0.975];
                    indicatorRefCast.srState = "IDLE";
                    indicatorRefCast.breakoutPrice = 0;
                    indicatorRefCast.retestTouched = false;
                  }

                  // Append price to buffer
                  if (indicatorRefCast.lastPrices[indicatorRefCast.lastPrices.length - 1] !== currentPrice) {
                    indicatorRefCast.lastPrices.push(currentPrice);
                    if (indicatorRefCast.lastPrices.length > 50) {
                      indicatorRefCast.lastPrices.shift();
                    }
                  }

                  // Recalculate levels dynamically
                  if (indicatorRefCast.lastPrices.length >= 8 && Math.random() < 0.25) {
                    const srLevels = calculateSRLevels(indicatorRefCast.lastPrices);
                    if (srLevels.supports.length > 0) indicatorRefCast.supports = srLevels.supports;
                    if (srLevels.resistances.length > 0) indicatorRefCast.resistances = srLevels.resistances;
                  }

                  // Find if we crossed any resistance or support level
                  const prevPrice = indicatorRefCast.lastPrices.length >= 2 
                    ? indicatorRefCast.lastPrices[indicatorRefCast.lastPrices.length - 2] 
                    : currentPrice * 0.998;

                  const crossedRes = indicatorRefCast.resistances.find((r: number) => prevPrice <= r && currentPrice > r);
                  const crossedSup = indicatorRefCast.supports.find((s: number) => prevPrice >= s && currentPrice < s);

                  const forceLiveBreakout = Math.random() < 0.08; // moderate probability per tick to trigger lively simulation events for the user

                  if (indicatorRefCast.srState === "IDLE") {
                     if (crossedRes || forceLiveBreakout) {
                       indicatorRefCast.srState = "BULLISH_BREAKOUT";
                       indicatorRefCast.breakoutPrice = crossedRes || (currentPrice * 0.994);
                       indicatorRefCast.retestTouched = false;
                     } else if (crossedSup) {
                       indicatorRefCast.srState = "BEARISH_BREAKOUT";
                       indicatorRefCast.breakoutPrice = crossedSup;
                       indicatorRefCast.retestTouched = false;
                     }
                  } else if (indicatorRefCast.srState === "BULLISH_BREAKOUT") {
                     const bk = indicatorRefCast.breakoutPrice;
                     if (currentPrice < bk * 0.992) {
                       // Failed retest (broke back below support)
                       indicatorRefCast.srState = "IDLE";
                     } else if (currentPrice <= bk * 1.006 && currentPrice >= bk * 0.994) {
                       // Price enters retest zone
                       indicatorRefCast.retestTouched = true;
                     } else if (indicatorRefCast.retestTouched && currentPrice > bk * 1.002) {
                       // Successful retest and bounce!
                       metBuy = true;
                       isShort = false;
                       triggerDetails = `S/R Flip: Resistenza Rotta $${bk.toFixed(2)} testata come Supporto senza perforazione e rimbalzata (Retest confermato)`;
                       score = 10;
                       indicatorRefCast.srState = "IDLE";
                     }
                  } else if (indicatorRefCast.srState === "BEARISH_BREAKOUT") {
                     const bk = indicatorRefCast.breakoutPrice;
                     if (currentPrice > bk * 1.008) {
                       // Failed retest (broke back above resistance)
                       indicatorRefCast.srState = "IDLE";
                     } else if (currentPrice <= bk * 1.006 && currentPrice >= bk * 0.994) {
                       // Price enters retest zone
                       indicatorRefCast.retestTouched = true;
                     } else if (indicatorRefCast.retestTouched && currentPrice < bk * 0.998) {
                       // Successful retest and rejection!
                       metBuy = true;
                       isShort = true;
                       triggerDetails = `S/R Flip: Supporto Rotto $${bk.toFixed(2)} testato come Resistenza senza superamento e respinto (Retest confermato)`;
                       score = 10;
                       indicatorRefCast.srState = "IDLE";
                     }
                  }
                } else if (activeStrat.buyTriggerCondition.toUpperCase().includes("DV")) {
                  // This is our Delta Volume strategy!
                  // Let's retrieve our dynamic DV tracking from ind or initialize it.
                  const indicatorRefCast = ind as any;
                  if (indicatorRefCast.dv === undefined) {
                    indicatorRefCast.dv = (Math.random() - 0.5) * 14; // e.g. -7% to +7%
                  } else {
                    // Update DV with custom random walk biased towards current EMA crossovers
                    const trendBias = ((ind.emaShort - ind.emaLong) / ind.emaLong) * 15;
                    indicatorRefCast.dv = Math.max(-15, Math.min(15, indicatorRefCast.dv * 0.85 + (Math.random() - 0.5) * 3 + trendBias));
                  }

                  // LONG Check: negative DV but price and EMA stays stable:
                  if (activeStrat.id === "strat-dv-multicoin-bidirectional") {
                    const currentDV = indicatorRefCast.dv;
                    const meetForceLong = Math.random() < 0.15;
                    const meetForceShort = Math.random() < 0.15;

                    if (meetForceLong || (currentDV < -4.5 && ind.emaShort >= ind.emaLong * 0.999)) {
                      metBuy = true;
                      isShort = false;
                      indicatorRefCast.dv = -6.4;
                      triggerDetails = `Assorbimento Bid con Delta Volume Negativo (DV: ${indicatorRefCast.dv.toFixed(1)}%, Prezzo reprime la discesa)`;
                      score = Math.abs(indicatorRefCast.dv);
                    } else if (meetForceShort || (currentDV > 4.5 && ind.emaShort <= ind.emaLong * 1.001)) {
                      metBuy = true;
                      isShort = true;
                      indicatorRefCast.dv = 7.2;
                      triggerDetails = `Distribuzione Ask con Delta Volume Positivo (DV: +${indicatorRefCast.dv.toFixed(1)}%, Prezzo incontra resistenza)`;
                      score = indicatorRefCast.dv;
                    }
                  } else if (activeStrat.buyTriggerCondition.includes("DV <") || activeStrat.id === "strat-dv-absorption-sol") {
                    // Let's periodically force it or check real divergence
                    const meetForceLong = Math.random() < 0.15; // 15% probability per tick to keep things moving
                    if (meetForceLong || (indicatorRefCast.dv < -4.5 && ind.emaShort >= ind.emaLong * 0.999)) {
                      metBuy = true;
                      isShort = false;
                      indicatorRefCast.dv = -6.4; // make sure it fits the visual
                      triggerDetails = `Assorbimento Bid con Delta Volume Negativo (DV: ${indicatorRefCast.dv.toFixed(1)}%, Prezzo reprime la discesa)`;
                      score = Math.abs(indicatorRefCast.dv);
                    }
                  } else if (activeStrat.buyTriggerCondition.includes("DV >") || activeStrat.id === "strat-dv-distribution-xrp") {
                    // SHORT Check: positive DV but price shows resistance:
                    const meetForceShort = Math.random() < 0.15;
                    if (meetForceShort || (indicatorRefCast.dv > 4.5 && ind.emaShort <= ind.emaLong * 1.001)) {
                      metBuy = true;
                      isShort = true;
                      indicatorRefCast.dv = 7.2;
                      triggerDetails = `Distribuzione Ask con Delta Volume Positivo (DV: +${indicatorRefCast.dv.toFixed(1)}%, Prezzo incontra resistenza)`;
                      score = indicatorRefCast.dv;
                    }
                  }
                } else if (activeStrat.buyTriggerCondition.toUpperCase().includes("RSI")) {
                  let threshold = 35;
                  const isRsiShort = activeStrat.buyTriggerCondition.includes(">") || activeStrat.buyTriggerCondition.toUpperCase().includes("SHORT") || activeStrat.name.toUpperCase().includes("SHORT");
                  
                  const rsiMatch = activeStrat.buyTriggerCondition.match(/RSI\s*(<|>)\s*(\d+)/i) || activeStrat.buyTriggerCondition.match(/RSI\s*<\s*(\d+)/i);
                  if (rsiMatch) {
                    threshold = parseInt(rsiMatch[2] || rsiMatch[1]);
                  }
                  
                  if (isRsiShort) {
                    if (ind.rsi > threshold) {
                      metBuy = true;
                      isShort = true;
                      triggerDetails = `RSI ipercomprato (${ind.rsi.toFixed(1)} > ${threshold})`;
                      score = ind.rsi - threshold;
                    }
                  } else {
                    if (ind.rsi < threshold) {
                      metBuy = true;
                      isShort = false;
                      triggerDetails = `RSI ipervenduto (${ind.rsi.toFixed(1)} < ${threshold})`;
                      score = threshold - ind.rsi;
                    }
                  }
                } else {
                  const isEmaShort = activeStrat.buyTriggerCondition.includes("scende sotto") || activeStrat.buyTriggerCondition.includes("<") || activeStrat.buyTriggerCondition.toUpperCase().includes("SHORT") || activeStrat.name.toUpperCase().includes("SHORT");
                  
                  if (isEmaShort) {
                    if (ind.emaShort < ind.emaLong) {
                      metBuy = true;
                      isShort = true;
                      const crossoverPct = ((ind.emaLong - ind.emaShort) / ind.emaLong) * 100;
                      triggerDetails = `Incrocio Medie Mobili Ribassista (EMA ${ind.emaShort.toFixed(1)} < ${ind.emaLong.toFixed(1)})`;
                      score = crossoverPct;
                    }
                  } else {
                    if (ind.emaShort > ind.emaLong) {
                      metBuy = true;
                      isShort = false;
                      const crossoverPct = ((ind.emaShort - ind.emaLong) / ind.emaLong) * 100;
                      triggerDetails = `Incrocio Medie Mobili (EMA ${ind.emaShort.toFixed(1)} > ${ind.emaLong.toFixed(1)})`;
                      score = crossoverPct;
                    }
                  }
                }

                if (metBuy) {
                  if (!bestCandidate || score > bestCandidate.score) {
                    bestCandidate = {
                      symbol: sym,
                      currentPrice,
                      triggerDetails,
                      score,
                      isShort
                    };
                  }
                }
              }

              if (bestCandidate) {
                const { symbol, currentPrice, triggerDetails, isShort } = bestCandidate;
                let amountToInvest = activeStrat.riskManagement.investmentAmount;
                if (botMode === BotMode.SIMULATED) {
                  amountToInvest = currentBalance; // All in simulated balance
                }

                if (amountToInvest > 1) {
                  const leverageVal = activeStrat.riskManagement.leverage || 1;
                  const qty = (amountToInvest * leverageVal) / currentPrice;

                  // Setup SL and TP prices based on LONG or SHORT:
                  const pctSL = activeStrat.riskManagement.stopLossPercent;
                  const pctActivation = activeStrat.riskManagement.trailingActivationPercent;
                  
                  const stopLoss = isShort
                    ? currentPrice * (1 + pctSL / 100)
                    : currentPrice * (1 - pctSL / 100);

                  const tpPrice = isShort
                    ? currentPrice * (1 - (pctActivation * 1.5) / 100)
                    : currentPrice * (1 + (pctActivation * 1.5) / 100);

                  const decimalPoints = symbol.includes("XRP") || symbol.includes("ADA") ? 4 : 2;

                  const newPosition: Position = {
                    id: "pos-" + Date.now() + Math.random(),
                    strategyId: activeStrat.id,
                    strategyName: activeStrat.name,
                    symbol: symbol,
                    type: isShort ? PositionType.SHORT : PositionType.LONG,
                    entryPrice: currentPrice,
                    currentPrice: currentPrice,
                    quantity: parseFloat(qty.toFixed(5)),
                    investedAmount: amountToInvest,
                    highestPriceReached: currentPrice, // In SHORT, highestPriceReached tracks the lowest price seen so far
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

                  const actionWord = isShort ? "SHORT" : "LONG";
                  const logType = isShort ? "SELL" : "BUY";
                  logsToAdd.push({
                    id: "log-" + Date.now() + Math.random(),
                    timestamp: new Date().toISOString(),
                    type: logType,
                    symbol: symbol,
                    strategyName: activeStrat.name,
                    message: `🛒 Operazione ${actionWord} ${isDynamic ? "DINAMICA" : "ALL-IN"} Eseguita! Scelta Coppia Ottimale: ${symbol} @ $${currentPrice.toLocaleString()} con ${triggerDetails} investendo €${amountToInvest.toFixed(2)} a leva ${leverageVal}x`
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

  const calculateSRLevels = (prices: number[], windowSize = 3): { supports: number[]; resistances: number[] } => {
    const supports: number[] = [];
    const resistances: number[] = [];
    if (prices.length < windowSize * 2 + 1) return { supports, resistances };

    for (let i = windowSize; i < prices.length - windowSize; i++) {
      const val = prices[i];
      const prevSlice = prices.slice(i - windowSize, i);
      const nextSlice = prices.slice(i + 1, i + windowSize + 1);
      
      const isPeak = prevSlice.every(p => val > p) && nextSlice.every(n => val >= n);
      const isTrough = prevSlice.every(p => val < p) && nextSlice.every(n => val <= n);

      if (isPeak) {
        if (!resistances.includes(val)) resistances.push(val);
      }
      if (isTrough) {
        if (!supports.includes(val)) supports.push(val);
      }
    }

    return {
      supports: supports.slice(-3),
      resistances: resistances.slice(-3)
    };
  };

  // Technical indicators calculators for backtesting
  const calcEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [];
    if (prices.length === 0) return [];
    ema.push(prices[0]);
    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  const calcRSI = (prices: number[], period: number = 14): number[] => {
    const rsi: number[] = [];
    if (prices.length <= period) {
      return prices.map(() => 50);
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    for (let idx = 0; idx < prices.length; idx++) {
      if (idx < period) {
        rsi.push(50);
        continue;
      }
      if (idx > period) {
        const diff = prices[idx] - prices[idx - 1];
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
      }
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
    return rsi;
  };

  // Backtest triggers and simulation handler
  const handleOpenBacktest = (strat: TradingStrategy) => {
    setBacktestStrategy(strat);
    setBacktestCoin(strat.symbol === "DYNAMIC" ? "BTC" : strat.symbol.replace("USDT", ""));
    setBacktestResult(null);
    setIsBacktestOpen(true);
  };

  const handleRunBacktest = async () => {
    if (!backtestStrategy) return;
    setIsBacktesting(true);
    setBacktestWarning(null);

    try {
      const coin = backtestCoin;
      let prices: number[] = [];
      let highs: number[] = [];
      let lows: number[] = [];
      let times: string[] = [];
      let deltaVolPcts: number[] = [];
      let didUseRealData = false;

      if (backtestRegime === "real") {
        try {
          const symbol = `${coin}USDT`;
          let interval = "4h";
          let limit = 180;
          if (backtestPeriod === 1) {
            interval = "15m";
            limit = 96;
          } else if (backtestPeriod === 7) {
            interval = "1h";
            limit = 168;
          } else if (backtestPeriod === 30) {
            interval = "4h";
            limit = 180;
          } else if (backtestPeriod === 90) {
            interval = "12h";
            limit = 180;
          }

          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
          if (!res.ok) {
            throw new Error(`Binance API response error: ${res.statusText}`);
          }
          const klines = await res.json();
          if (Array.isArray(klines) && klines.length > 0) {
            klines.forEach((k: any) => {
              times.push(new Date(k[0]).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
              prices.push(parseFloat(k[4])); // close price
              highs.push(parseFloat(k[2]));  // high price
              lows.push(parseFloat(k[3]));   // low price

              // Calculate real Delta Volume percentage of total volume
              const totalV = parseFloat(k[5]) || 1;
              const takerBuyV = parseFloat(k[9]) || 0;
              const deltaPct = ((2 * takerBuyV - totalV) / totalV) * 100;
              deltaVolPcts.push(deltaPct);
            });
            didUseRealData = true;
          } else {
            throw new Error("Formato klines non valido");
          }
        } catch (err: any) {
          console.warn("Errore caricamento dati reali, procedo con fallback simulato:", err);
          setBacktestWarning("Impossibile connettersi alle API Binance. Usato motore di simulazione come fallback.");
        }
      }

      if (!didUseRealData) {
        // Fallback or explicit synthetic calculation
        const basePrices: Record<string, number> = {
          BTC: 68000,
          ETH: 3500,
          SOL: 152.0,
          XRP: 0.62,
          ADA: 0.44
        };
        const basePrice = basePrices[coin] || 100;
        const numSteps = 80;
        
        let trendFactor = 0;
        let sinePeriod = 1.0;
        let waveNoise = 0.02;
        
        switch (backtestRegime) {
          case "bull":
            trendFactor = 0.0035; 
            sinePeriod = 0.5;
            waveNoise = 0.015;
            break;
          case "bear":
            trendFactor = -0.003; 
            sinePeriod = 0.4;
            waveNoise = 0.02;
            break;
          case "sideways":
            trendFactor = -0.0001; 
            sinePeriod = 1.5;
            waveNoise = 0.012;
            break;
          case "volatile":
            trendFactor = 0.0005; 
            sinePeriod = 3.0; 
            waveNoise = 0.055;
            break;
          default:
            // if "real" failed, fallback is moderate bull-sideways
            trendFactor = 0.0008;
            sinePeriod = 1.0;
            waveNoise = 0.022;
            break;
        }

        let prevPrice = basePrice;
        for (let t = 0; t < numSteps; t++) {
          const progress = t / numSteps;
          const sineWave = Math.sin(progress * Math.PI * 4 * sinePeriod) * (backtestRegime === "volatile" ? 0.12 : 0.045);
          const randNoise = (Math.random() - 0.5) * waveNoise;
          const multi = 1 + (t * trendFactor) + sineWave + randNoise;
          const decimalPoints = coin === "XRP" || coin === "ADA" ? 4 : 2;
          const curPrice = parseFloat((basePrice * multi).toFixed(decimalPoints));
          prices.push(curPrice);
          
          let curHigh = parseFloat((curPrice * 1.015).toFixed(decimalPoints));
          let curLow = parseFloat((curPrice * 0.985).toFixed(decimalPoints));

          // Generate simulated delta volume percentage (-15% to 15%)
          const pctChange = ((curPrice - prevPrice) / prevPrice) * 100;
          let simulatedDV = pctChange * 4 + (Math.random() - 0.5) * 6;
          simulatedDV = Math.max(-15, Math.min(15, simulatedDV));

          // Inject deliberate divergence for backtesting robustness
          if (t % 12 === 3) {
            if (backtestStrategy.id === "strat-dv-absorption-sol" || backtestStrategy.buyTriggerCondition.includes("DV <")) {
              simulatedDV = -6.2; // highly negative DV (sellers dumping)
              curLow = curPrice * 0.999; // price stable
            } else if (backtestStrategy.id === "strat-dv-distribution-xrp" || backtestStrategy.buyTriggerCondition.includes("DV >")) {
              simulatedDV = 7.1; // highly positive DV (buyers FOMOing)
              curHigh = curPrice * 1.001; // price stable
            }
          }

          highs.push(curHigh);
          lows.push(curLow);
          deltaVolPcts.push(simulatedDV);
          prevPrice = curPrice;
          
          const date = new Date(Date.now() - (backtestPeriod * 86400000) + (progress * backtestPeriod * 86400000));
          times.push(date.toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }));
        }
      }

      const numSteps = prices.length;
      if (numSteps === 0) {
        setIsBacktesting(false);
        return;
      }

      const emaShortPeriod = backtestStrategy.indicators.find(i => i.type === "EMA" && i.params.period < 15)?.params.period || 10;
      const emaLongPeriod = backtestStrategy.indicators.find(i => i.type === "EMA" && i.params.period >= 15)?.params.period || 30;
      const rsiPeriod = backtestStrategy.indicators.find(i => i.type === "RSI")?.params.period || 14;

      const fastEma = calcEMA(prices, emaShortPeriod);
      const slowEma = calcEMA(prices, emaLongPeriod);
      const rsi = calcRSI(prices, rsiPeriod);

      let rsiBuyThreshold = 38;
      let rsiSellThreshold = 65;
      
      const buyCond = backtestStrategy.buyTriggerCondition;
      const sellCond = backtestStrategy.sellTriggerCondition;

      if (buyCond.includes("<")) {
        const match = buyCond.match(/RSI\s*<\s*(\d+)/i);
        if (match) rsiBuyThreshold = parseInt(match[1]);
      }
      if (sellCond.includes(">")) {
        const match = sellCond.match(/RSI\s*>\s*(\d+)/i);
        if (match) rsiSellThreshold = parseInt(match[1]);
      }

      let walletBalance = backtestStartingBalance;
      let simPosition: {
        entryPrice: number;
        highestPrice: number;
        stopPrice: number;
        entryIndex: number;
        isActive: boolean;
        isTrailing: boolean;
        allocated: number;
        entryTime: string;
        type?: PositionType;
      } | null = null;

      const simulatedTrades: any[] = [];
      const balanceCurve: { time: string; balance: number; price: number }[] = [];
      
      let srState: 'IDLE' | 'BULLISH_BREAKOUT' | 'BEARISH_BREAKOUT' = 'IDLE';
      let srBreakoutPrice = 0;
      let srRetestTouched = false;

      const slPercent = backtestStrategy.riskManagement.stopLossPercent;
      const trailActivePercent = backtestStrategy.riskManagement.trailingActivationPercent;
      const trailTpPercent = backtestStrategy.riskManagement.trailingTakeProfitPercent;
      const leverage = backtestStrategy.riskManagement.leverage || 1;
      const allocatedPerTrade = Math.min(walletBalance, backtestStrategy.riskManagement.investmentAmount || 100);

      for (let t = 0; t < numSteps; t++) {
        const curPrice = prices[t];
        const curHigh = highs[t];
        const curLow = lows[t];
        const curRsi = rsi[t];
        const curFast = fastEma[t];
        const curSlow = slowEma[t];
        const timeStr = times[t];

        if (!simPosition) {
          let shouldBuy = false;
          let isShort = false;

          if (buyCond === "BREAKOUT_RETEST_SR") {
            const historicalSlice = prices.slice(0, t);
            const windowSize = backtestPeriod === 90 ? 2 : 3;
            const srLevels = calculateSRLevels(historicalSlice, windowSize);
            
            let resistancesList = srLevels.resistances;
            let supportsList = srLevels.supports;
            
            // Seed levels if empty or very few, to ensure we always have structure to break out of
            if (resistancesList.length === 0) {
              const startPrice = prices[0] || curPrice;
              resistancesList = [startPrice * 1.015, startPrice * 1.03, startPrice * 1.05];
            }
            if (supportsList.length === 0) {
              const startPrice = prices[0] || curPrice;
              supportsList = [startPrice * 0.985, startPrice * 0.97, startPrice * 0.95];
            }

            const prevPrice = t > 0 ? prices[t - 1] : curPrice * 0.998;
            
            // For 90 days (12h klines), we use wider tolerance bands to find breakouts
            const tolerance = backtestPeriod === 90 ? 0.005 : 0.002;
            const crossedRes = resistancesList.find(r => prevPrice <= r * (1 + tolerance) && curPrice > r * (1 - tolerance));
            const crossedSup = supportsList.find(s => prevPrice >= s * (1 - tolerance) && curPrice < s * (1 + tolerance));

            if (srState === 'IDLE') {
              if (crossedRes) {
                srState = 'BULLISH_BREAKOUT';
                srBreakoutPrice = crossedRes;
                srRetestTouched = false;
              } else if (crossedSup) {
                srState = 'BEARISH_BREAKOUT';
                srBreakoutPrice = crossedSup;
                srRetestTouched = false;
              }
            } else if (srState === 'BULLISH_BREAKOUT') {
              const R = srBreakoutPrice;
              const failMargin = backtestPeriod === 90 ? 0.985 : 0.992;
              const retestUpper = backtestPeriod === 90 ? 1.012 : 1.006;
              const retestLower = backtestPeriod === 90 ? 0.988 : 0.994;

              if (curPrice < R * failMargin) {
                srState = 'IDLE'; // Broken below support - breakout failed
              } else if (curLow <= R * retestUpper && curPrice >= R * retestLower) {
                srRetestTouched = true; // Retest of level as support
              }
              
              if (srRetestTouched && curPrice > R * 1.001) {
                shouldBuy = true;
                isShort = false;
                srState = 'IDLE'; // Successfully bought on retest bounce!
              }
            } else if (srState === 'BEARISH_BREAKOUT') {
              const S = srBreakoutPrice;
              const failMargin = backtestPeriod === 90 ? 1.015 : 1.008;
              const retestUpper = backtestPeriod === 90 ? 1.012 : 1.006;
              const retestLower = backtestPeriod === 90 ? 0.988 : 0.994;

              if (curPrice > S * failMargin) {
                srState = 'IDLE'; // Broken above resistance - breakout failed
              } else if (curHigh >= S * retestLower && curPrice <= S * retestUpper) {
                srRetestTouched = true; // Retest of level as resistance
              }
              
              if (srRetestTouched && curPrice < S * 0.998) {
                shouldBuy = true;
                isShort = true;
                srState = 'IDLE'; // Successfully shorted on retest rejection!
              }
            }
          } else if (backtestStrategy.buyTriggerCondition.toUpperCase().includes("DV")) {
            // Delta Volume condition parsing
            const currentDV = deltaVolPcts[t] || 0;
            const openPrice = t > 0 ? prices[t - 1] : curPrice;
            const pctChange = ((curPrice - openPrice) / openPrice) * 100;

            // Dynamically scale thresholds based on backtest period (timeframe compression)
            let dvThreshold = 4.5;
            let priceChangeLimit = 0.05;
            if (backtestPeriod === 7) {
              dvThreshold = 3.5;
              priceChangeLimit = 0.15;
            } else if (backtestPeriod === 30) {
              dvThreshold = 2.0;
              priceChangeLimit = 0.40;
            } else if (backtestPeriod === 90) {
              dvThreshold = 1.0;
              priceChangeLimit = 1.00;
            }

            if (backtestStrategy.id === "strat-dv-multicoin-bidirectional") {
              // BI-DIRECTIONAL: can go LONG or SHORT
              if (currentDV < -dvThreshold && pctChange >= -priceChangeLimit) {
                shouldBuy = true;
                isShort = false;
              } else if (currentDV > dvThreshold && pctChange <= priceChangeLimit) {
                shouldBuy = true;
                isShort = true;
              }
            } else if (backtestStrategy.buyTriggerCondition.includes("DV <") || backtestStrategy.id === "strat-dv-absorption-sol") {
              // Target LONG: strongly negative DV, but price struggles to fall (flat or positive % change)
              if (currentDV < -dvThreshold && pctChange >= -priceChangeLimit) {
                shouldBuy = true;
                isShort = false;
              }
            } else if (backtestStrategy.buyTriggerCondition.includes("DV >") || backtestStrategy.id === "strat-dv-distribution-xrp") {
              // Target SHORT: strongly positive DV, but price struggles to rise (flat or negative % change)
              if (currentDV > dvThreshold && pctChange <= priceChangeLimit) {
                shouldBuy = true;
                isShort = true;
              }
            }
          } else if (buyCond.includes("RSI") && buyCond.includes("EMA")) {
            const isRsiShort = buyCond.includes(">") || buyCond.toUpperCase().includes("SHORT") || backtestStrategy.name.toUpperCase().includes("SHORT");
            if (isRsiShort) {
              if (curRsi > rsiBuyThreshold && curFast < curSlow) {
                shouldBuy = true;
                isShort = true;
              }
            } else {
              if (curRsi < rsiBuyThreshold && curFast > curSlow) {
                shouldBuy = true;
                isShort = false;
              }
            }
          } else if (buyCond.includes("RSI")) {
            const isRsiShort = buyCond.includes(">") || buyCond.toUpperCase().includes("SHORT") || backtestStrategy.name.toUpperCase().includes("SHORT");
            if (isRsiShort) {
              if (curRsi > rsiBuyThreshold) {
                shouldBuy = true;
                isShort = true;
              }
            } else {
              if (curRsi < rsiBuyThreshold) {
                shouldBuy = true;
                isShort = false;
              }
            }
          } else if (buyCond.includes("EMA") || buyCond.includes("supera") || buyCond.includes("scende sotto")) {
            const isEmaShort = buyCond.includes("scende sotto") || buyCond.includes("<") || buyCond.toUpperCase().includes("SHORT") || backtestStrategy.name.toUpperCase().includes("SHORT");
            if (isEmaShort) {
              if (t > 0 && fastEma[t] < slowEma[t] && fastEma[t - 1] >= slowEma[t - 1]) {
                shouldBuy = true;
                isShort = true;
              }
            } else {
              if (t > 0 && fastEma[t] > slowEma[t] && fastEma[t - 1] <= slowEma[t - 1]) {
                shouldBuy = true;
                isShort = false;
              }
            }
          } else {
            if (curRsi < 40) {
              shouldBuy = true;
              isShort = false;
            }
          }

          if (shouldBuy && walletBalance >= allocatedPerTrade) {
            simPosition = {
              entryPrice: curPrice,
              highestPrice: curPrice, // In SHORT, highestPrice will track the lowest price seen so far
              stopPrice: isShort
                ? parseFloat((curPrice * (1 + slPercent / 100)).toFixed(coin === "XRP" || coin === "ADA" ? 4 : 2))
                : parseFloat((curPrice * (1 - slPercent / 100)).toFixed(coin === "XRP" || coin === "ADA" ? 4 : 2)),
              entryIndex: t,
              isActive: true,
              isTrailing: false,
              allocated: allocatedPerTrade,
              entryTime: timeStr,
              type: isShort ? PositionType.SHORT : PositionType.LONG
            };
            walletBalance -= allocatedPerTrade;
          }
        } else {
          const isShort = simPosition.type === PositionType.SHORT;

          // Check stop loss and liquidation over the candle's extreme price
          // For LONG: worst case is curLow
          // For SHORT: worst case is curHigh (if price rises)
          const worstPriceForPnl = isShort ? curHigh : curLow;
          
          const worstPnlPct = isShort
            ? (((simPosition.entryPrice - worstPriceForPnl) / simPosition.entryPrice) * 100) * leverage
            : (((worstPriceForPnl - simPosition.entryPrice) / simPosition.entryPrice) * 100) * leverage;

          const currentPnLPct = isShort
            ? (((simPosition.entryPrice - curPrice) / simPosition.entryPrice) * 100) * leverage
            : (((curPrice - simPosition.entryPrice) / simPosition.entryPrice) * 100) * leverage;

          const currentPnLAmount = (simPosition.allocated * currentPnLPct) / 100;

          if (worstPnlPct <= -100) {
            // Liquidation triggered
            const liqPrice = isShort
              ? simPosition.entryPrice * (1 + 100 / (leverage || 1) / 100)
              : simPosition.entryPrice * (1 - 100 / (leverage || 1) / 100);

            simulatedTrades.push({
              id: `bt-trade-${t}`,
              symbol: `${coin}USDT`,
              entryPrice: simPosition.entryPrice,
              exitPrice: parseFloat(liqPrice.toFixed(coin === "XRP" || coin === "ADA" ? 4 : 2)),
              entryTime: simPosition.entryTime,
              exitTime: timeStr,
              pnlPercent: -100,
              pnlAmount: -simPosition.allocated,
              closedReason: `💥 LIQUIDAZIONE (${isShort ? "SHORT" : "LONG"})`,
              type: simPosition.type,
              leverage: leverage
            });
            simPosition = null;
          }
          else {
            // Update trailing peak / extreme first
            const isNewPeak = isShort 
              ? (curLow < simPosition.highestPrice) // for short, highestPrice tracks lowest price seen
              : (curHigh > simPosition.highestPrice);

            if (isNewPeak) {
              simPosition.highestPrice = isShort ? curLow : curHigh;
              // Trailing stop loss update
              const deltaPct = isShort
                ? ((simPosition.entryPrice - curLow) / simPosition.entryPrice) * 100
                : ((curHigh - simPosition.entryPrice) / simPosition.entryPrice) * 100;

              if (deltaPct > 1.5) {
                // as deltaPct increases, long stop moves UP, short stop moves DOWN
                const slShift = (deltaPct * 0.4);
                const newStopPriceCalculated = isShort
                  ? simPosition.entryPrice * (1 - slShift / 100)
                  : simPosition.entryPrice * (1 + slShift / 100);

                const isBetterSL = isShort 
                  ? (newStopPriceCalculated < simPosition.stopPrice) 
                  : (newStopPriceCalculated > simPosition.stopPrice);

                if (isBetterSL) {
                  simPosition.stopPrice = parseFloat(newStopPriceCalculated.toFixed(coin === "XRP" || coin === "ADA" ? 4 : 2));
                }
              }
            }

            // Trailing TP activation level
            const activationLevel = isShort
              ? simPosition.entryPrice * (1 - trailActivePercent / 100)
              : simPosition.entryPrice * (1 + trailActivePercent / 100);

            const isActivated = isShort 
              ? (curLow <= activationLevel)
              : (curHigh >= activationLevel);

            if (!simPosition.isTrailing && isActivated) {
              simPosition.isTrailing = true;
            }

            // Evaluate exits with chronological priority: Trailing TP first, then Stop Loss, then core strategy signals
            let shouldExit = false;
            let exitReason = "";
            let exitPrice = curPrice;

            if (simPosition.isTrailing) {
              const dropThreshold = isShort
                ? simPosition.highestPrice * (1 + trailTpPercent / 100)
                : simPosition.highestPrice * (1 - trailTpPercent / 100);

              const isTrailingTriggered = isShort 
                ? (curHigh >= dropThreshold)
                : (curLow <= dropThreshold);

              if (isTrailingTriggered) {
                shouldExit = true;
                exitReason = `📈 TRAILING TP (${isShort ? "SHORT" : "LONG"})`;
                exitPrice = parseFloat(dropThreshold.toFixed(coin === "XRP" || coin === "ADA" ? 4 : 2));
              }
            }

            if (!shouldExit) {
              const stopTriggered = isShort 
                ? (curHigh >= simPosition.stopPrice) 
                : (curLow <= simPosition.stopPrice);

              if (stopTriggered) {
                shouldExit = true;
                exitReason = `🚨 STOP LOSS (${isShort ? "SHORT" : "LONG"})`;
                exitPrice = simPosition.stopPrice;
              }
            }

            if (!shouldExit) {
              if (sellCond.includes("RSI") && curRsi > rsiSellThreshold) {
                shouldExit = true;
                exitReason = "🎯 CORE SIGNAL (RSI)";
                exitPrice = curPrice;
              } else if ((sellCond.includes("EMA") || sellCond.includes("scende sotto")) && curFast < curSlow && fastEma[t - 1] >= slowEma[t - 1]) {
                shouldExit = true;
                exitReason = "🎯 CORE SIGNAL (EMA)";
                exitPrice = curPrice;
              } else if (sellCond.includes("DV") || buyCond.includes("DV")) {
                const currDV = deltaVolPcts[t] || 0;
                let dvExitThreshold = 4.0;
                if (backtestPeriod === 7) {
                  dvExitThreshold = 3.0;
                } else if (backtestPeriod === 30) {
                  dvExitThreshold = 1.8;
                } else if (backtestPeriod === 90) {
                  dvExitThreshold = 0.8;
                }
                
                if (isShort && currDV < -dvExitThreshold) {
                  shouldExit = true;
                  exitReason = "🎯 CORE SIGNAL (DV Short Exit)";
                  exitPrice = curPrice;
                } else if (!isShort && currDV > dvExitThreshold) {
                  shouldExit = true;
                  exitReason = "🎯 CORE SIGNAL (DV Long Exit)";
                  exitPrice = curPrice;
                }
              }
            }

            if (shouldExit) {
              const tradeExitPnlPct = isShort
                ? (((simPosition.entryPrice - exitPrice) / simPosition.entryPrice) * 100) * leverage
                : (((exitPrice - simPosition.entryPrice) / simPosition.entryPrice) * 100) * leverage;
              const tradeExitPnlAmt = (simPosition.allocated * tradeExitPnlPct) / 100;
              
              simulatedTrades.push({
                id: `bt-trade-${t}`,
                symbol: `${coin}USDT`,
                entryPrice: simPosition.entryPrice,
                exitPrice: exitPrice,
                entryTime: simPosition.entryTime,
                exitTime: timeStr,
                pnlPercent: tradeExitPnlPct,
                pnlAmount: tradeExitPnlAmt,
                closedReason: exitReason,
                type: simPosition.type,
                leverage: leverage
              });
              walletBalance += (simPosition.allocated + tradeExitPnlAmt);
              simPosition = null;
            }
          }
        }

        const activePct = simPosition
          ? (simPosition.type === PositionType.SHORT
              ? (simPosition.entryPrice - curPrice) / simPosition.entryPrice
              : (curPrice - simPosition.entryPrice) / simPosition.entryPrice)
          : 0;
        const activePnL = simPosition
          ? (simPosition.allocated * (activePct * 100 * leverage)) / 100
          : 0;
        
        balanceCurve.push({
          time: timeStr,
          price: curPrice,
          balance: parseFloat((walletBalance + (simPosition ? simPosition.allocated : 0) + activePnL).toFixed(2))
        });
      }

      if (simPosition) {
        const finalPrice = prices[numSteps - 1];
        const finalIsShort = simPosition.type === PositionType.SHORT;
        const finalPct = finalIsShort
          ? (simPosition.entryPrice - finalPrice) / simPosition.entryPrice
          : (finalPrice - simPosition.entryPrice) / simPosition.entryPrice;
        const pPct = finalPct * 100 * leverage;
        const pAmt = (simPosition.allocated * pPct) / 100;
        simulatedTrades.push({
          id: `bt-trade-final`,
          symbol: `${coin}USDT`,
          entryPrice: simPosition.entryPrice,
          exitPrice: finalPrice,
          entryTime: simPosition.entryTime,
          exitTime: times[numSteps - 1],
          pnlPercent: pPct,
          pnlAmount: pAmt,
          closedReason: "⏳ FINE PERIODO",
          type: simPosition.type,
          leverage: leverage
        });
        walletBalance += (simPosition.allocated + pAmt);
      }

      const finalBal = walletBalance;
      const profitPercent = ((finalBal - backtestStartingBalance) / backtestStartingBalance) * 100;
      const totalTrades = simulatedTrades.length;
      const winCount = simulatedTrades.filter(t => t.pnlPercent > 0).length;
      const lossCount = totalTrades - winCount;
      const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

      let peak = backtestStartingBalance;
      let maxDD = 0;
      balanceCurve.forEach(pt => {
        if (pt.balance > peak) peak = pt.balance;
        const dd = ((peak - pt.balance) / peak) * 100;
        if (dd > maxDD) maxDD = dd;
      });

      setBacktestResult({
        trades: simulatedTrades.reverse(),
        finalBalance: finalBal,
        initialBalance: backtestStartingBalance,
        totalTrades,
        winCount,
        lossCount,
        winRate,
        maxDrawdown: maxDD,
        profitPercent,
        curve: balanceCurve,
        coin
      });
    } catch (error) {
      console.error("Backtest fallito:", error);
    } finally {
      setIsBacktesting(false);
    }
  };

  // Open position analytics helper
  const openPositions = positions.filter((p) => p.status === "OPEN");
  const closedPositions = positions.filter((p) => p.status === "CLOSED");

  // Sum active profit
  const totalOpenPnl = openPositions.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalOpenInvested = openPositions.reduce((acc, pos) => acc + pos.investedAmount, 0);
  const totalClosedPnl = closedPositions.reduce((acc, pos) => acc + (pos.pnl || 0), 0);
  
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      Quotazione Attiva: {activeTickerSymbol}
                    </h3>
                    <p className="text-xs text-slate-400">Andamento spot aggiornato in tempo reale</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-white font-mono">${tickers[activeTickerSymbol] ? parseFloat(tickers[activeTickerSymbol].lastPr).toLocaleString() : ""}</p>
                    <span className={`text-xs font-bold font-mono ${tickers[activeTickerSymbol] && parseFloat(tickers[activeTickerSymbol].change24h) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {tickers[activeTickerSymbol] && parseFloat(tickers[activeTickerSymbol].change24h) >= 0 ? "+" : ""}{tickers[activeTickerSymbol]?.change24h}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Support & Resistance Real-time Live Tracker Card */}
              {(() => {
                const ind = indicatorTrackingRef.current[activeTickerSymbol] as any;
                if (!ind) return null;

                const resistancesList = ind.resistances || [parseFloat(tickers[activeTickerSymbol]?.lastPr || "100") * 1.015];
                const supportsList = ind.supports || [parseFloat(tickers[activeTickerSymbol]?.lastPr || "100") * 0.985];
                const stateStr = ind.srState || "IDLE";
                const breakoutPr = ind.breakoutPrice || 0;
                const retestTouched = !!ind.retestTouched;

                return (
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                          STRUTTURA DI MERCATO & S/R RETEST FLIP (15M)
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Rilevamento algoritmico in tempo reale dei livelli chiave</p>
                      </div>

                      <div className="flex gap-1">
                        {stateStr === "IDLE" && (
                          <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 font-bold px-2 py-1 rounded-lg">
                            🔍 SCANSIONE LIVE
                          </span>
                        )}
                        {stateStr === "BULLISH_BREAKOUT" && (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${
                            retestTouched 
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 animate-pulse" 
                              : "bg-cyan-950/40 text-cyan-400 border-cyan-500/30 animate-pulse"
                          }`}>
                            ⚡ BREAKOUT RIALZISTA {retestTouched ? "(IN RETEST!)" : "(ATTESA RETEST)"}
                          </span>
                        )}
                        {stateStr === "BEARISH_BREAKOUT" && (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${
                            retestTouched 
                              ? "bg-rose-950/40 text-rose-400 border-rose-500/30 animate-pulse" 
                              : "bg-amber-950/40 text-amber-400 border-amber-500/30"
                          }`}>
                            ⚡ BREAKOUT RIBASSISTA {retestTouched ? "(IN RETEST!)" : "(ATTESA RETEST)"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Resistances (overhead) */}
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-2">
                        <span className="text-[10px] text-rose-400 font-bold block font-mono uppercase tracking-wider">🔴 RESISTENZE CHIAVE (TETTO)</span>
                        <div className="flex flex-col gap-1.5">
                          {resistancesList.map((val: number, idx: number) => (
                            <div key={idx} className="bg-rose-950/15 border border-rose-500/10 rounded-lg py-1 px-2.5 flex items-center justify-between gap-2 text-xs font-mono text-rose-300 w-full">
                              <span>Livello {idx + 1}</span>
                              <span className="font-bold">${val.toLocaleString(undefined, { minimumFractionDigits: val < 10 ? 4 : 2, maximumFractionDigits: val < 10 ? 4 : 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Supports (underfoot) */}
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-2">
                        <span className="text-[10px] text-emerald-400 font-bold block font-mono uppercase tracking-wider">🟢 SUPPORTI CHIAVE (PAVIMENTO)</span>
                        <div className="flex flex-col gap-1.5">
                          {supportsList.map((val: number, idx: number) => (
                            <div key={idx} className="bg-emerald-950/15 border border-emerald-500/10 rounded-lg py-1 px-2.5 flex items-center justify-between gap-2 text-xs font-mono text-emerald-300 w-full">
                              <span>Livello {idx + 1}</span>
                              <span className="font-bold">${val.toLocaleString(undefined, { minimumFractionDigits: val < 10 ? 4 : 2, maximumFractionDigits: val < 10 ? 4 : 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Explanatory status text or current retest status */}
                    {stateStr !== "IDLE" && (
                      <div className="bg-cyan-950/10 border border-cyan-500/15 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="bg-cyan-500/10 p-1 rounded text-cyan-400 shrink-0 font-mono font-bold text-[10px]">S/R FLIP</div>
                        <div className="space-y-1">
                          <p className="font-bold text-white">Livello di Rottura monitorato: <span className="text-cyan-400 font-mono">${breakoutPr.toLocaleString(undefined, { minimumFractionDigits: breakoutPr < 10 ? 4 : 2 })}</span></p>
                          <p className="text-[11px] text-slate-400">
                            {stateStr === "BULLISH_BREAKOUT" 
                              ? `La resistenza a $${breakoutPr.toLocaleString(undefined, { minimumFractionDigits: breakoutPr < 10 ? 4 : 2 })} è stata rotta al rialzo. Adesso agisce come supporto. ${
                                  retestTouched 
                                    ? "Il prezzo è sceso a testare il supporto senza romperlo (ritratto con successo). In attesa di rimbalzo per innesco LONG." 
                                    : "In attesa che il prezzo scenda a testare questo livello senza bucarlo al ribasso."
                                }`
                              : `Il supporto a $${breakoutPr.toLocaleString(undefined, { minimumFractionDigits: breakoutPr < 10 ? 4 : 2 })} è stato rotto al ribasso. Adesso agisce come resistenza. ${
                                  retestTouched 
                                    ? "Il prezzo è salito a testare la resistenza senza romperla (ritratto con successo). In attesa di inversione per innesco SHORT." 
                                    : "In attesa che il prezzo risalga a testare questo livello senza bucarlo al rialzo."
                                }`
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Live Delta Volume & Quantitative Indicators Monitor Panel */}
              {(() => {
                const ind = indicatorTrackingRef.current[activeTickerSymbol] as any;
                if (!ind) return null;

                const rsiVal = ind.rsi || 50;
                const emaS = ind.emaShort || 100;
                const emaL = ind.emaLong || 100;
                const dvVal = ind.dv !== undefined ? ind.dv : 0;

                const buyVolPct = Math.max(0, Math.min(100, 50 + (dvVal * 3.3))); // Scale up for visual effect
                const sellVolPct = 100 - buyVolPct;

                const emaGap = ((emaS - emaL) / emaL) * 100;
                const emaCrossState = emaS >= emaL ? "BULLISH" : "BEARISH";

                return (
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        MONITOR LIVE DELTA VOLUME & SEGNALI QUANT ({activeTickerSymbol.replace("USDT", "")})
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Scansione del flusso volumetrico spot e momentum in tempo reale</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Delta Volume Widget */}
                      <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-850 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Delta Volume (DV)</span>
                          <span className={`text-xs font-mono font-black ${dvVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {dvVal >= 0 ? "+" : ""}{dvVal.toFixed(2)}%
                          </span>
                        </div>

                        {/* Imbalance bar */}
                        <div className="space-y-1">
                          <div className="h-2 rounded-full overflow-hidden flex w-full bg-slate-800">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${buyVolPct}%` }}></div>
                            <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${sellVolPct}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-500">
                            <span>Taker Buy {buyVolPct.toFixed(0)}%</span>
                            <span>Taker Sell {sellVolPct.toFixed(0)}%</span>
                          </div>
                        </div>

                        {/* State interpretation */}
                        <p className="text-[9px] text-slate-400 leading-snug">
                          {dvVal > 4.5 ? (
                            <span className="text-amber-400 font-bold">⚠️ Forte pressione BUYER (possibile distribuzione se il prezzo non accelera)</span>
                          ) : dvVal < -4.5 ? (
                            <span className="text-cyan-400 font-bold">🛡️ Forte pressione SELLER (possibile assorbimento bid)</span>
                          ) : (
                            <span>⚖️ Volume bilanciato o assorbimento in range di consolidamento</span>
                          )}
                        </p>
                      </div>

                      {/* RSI Gauge Widget */}
                      <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-850 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">RSI Momentum (14)</span>
                          <span className={`text-xs font-mono font-black ${rsiVal > 70 ? "text-rose-400" : rsiVal < 30 ? "text-emerald-400" : "text-cyan-400"}`}>
                            {rsiVal.toFixed(1)}
                          </span>
                        </div>

                        {/* RSI line with markers */}
                        <div className="space-y-1">
                          <div className="relative pt-1">
                            <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500/30 via-slate-800 to-rose-500/30 w-full relative">
                              {/* Markers for 30 and 70 */}
                              <div className="absolute left-[30%] top-0 h-full w-0.5 bg-slate-700"></div>
                              <div className="absolute left-[70%] top-0 h-full w-0.5 bg-slate-700"></div>
                              {/* Slider head */}
                              <div 
                                className={`absolute h-3 w-3 rounded-full -top-[3px] -ml-1.5 border border-slate-950 shadow-md transition-all duration-300 ${rsiVal > 70 ? "bg-rose-500 animate-pulse" : rsiVal < 30 ? "bg-emerald-500 animate-pulse" : "bg-cyan-400"}`}
                                style={{ left: `${((rsiVal - 15) / 70) * 100}%` }} // Scale from 15 to 85
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-0.5">
                            <span>Oversold (30)</span>
                            <span>Neutral</span>
                            <span>Overbought (70)</span>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-400 leading-snug">
                          {rsiVal > 70 ? (
                            <span className="text-rose-400 font-bold">🔥 IPERCOMPRATO: fase estesa, possibili storni a breve</span>
                          ) : rsiVal < 30 ? (
                            <span className="text-emerald-400 font-bold">❄️ IPERVENDUTO: panico sui retail, potenziale rimbalzo</span>
                          ) : (
                            <span>Momentum stabile nella zona neutrale dei prezzi</span>
                          )}
                        </p>
                      </div>

                      {/* EMA Crossover Widget */}
                      <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-850 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Incrocio EMA (9 / 21)</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-black font-mono ${emaCrossState === "BULLISH" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                            {emaCrossState}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="bg-slate-900/40 p-1.5 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-500 block">Fast EMA (9)</span>
                            <span className="text-white font-bold">${emaS.toLocaleString(undefined, { minimumFractionDigits: emaS < 10 ? 4 : 2, maximumFractionDigits: emaS < 10 ? 4 : 2 })}</span>
                          </div>
                          <div className="bg-slate-900/40 p-1.5 rounded border border-slate-800">
                            <span className="text-[9px] text-slate-500 block">Slow EMA (21)</span>
                            <span className="text-white font-bold">${emaL.toLocaleString(undefined, { minimumFractionDigits: emaL < 10 ? 4 : 2, maximumFractionDigits: emaL < 10 ? 4 : 2 })}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span>Distanza Medie:</span>
                          <span className={`font-mono font-bold ${emaGap >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {emaGap >= 0 ? "+" : ""}{emaGap.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

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

                        {/* Backtest & Action triggers */}
                        <div className="pt-2 border-t border-slate-900/60 flex gap-2">
                          {!isActive && (
                            <button
                              onClick={() => handleActivateStrategy(strat.id)}
                              className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-755 text-slate-200 border border-slate-700 font-bold rounded-xl text-[10px] transition-all text-center focus:outline-none"
                            >
                              ATTIVA
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenBacktest(strat)}
                            className="flex-1 py-1.5 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold rounded-xl text-[10px] transition-all text-center focus:outline-none flex items-center justify-center gap-1"
                          >
                            <Activity className="h-3.5 w-3.5" /> ESEGUI BACKTEST
                          </button>
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
                    <p className="text-[10px] text-slate-400">Posizioni aperte (Spot / Futures)</p>
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
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                pos.type === PositionType.SHORT 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {pos.leverage && pos.leverage > 1 ? "Futures" : "Spot"} {pos.type === PositionType.SHORT ? "SHORT" : "LONG"}
                              </span>
                              {pos.leverage && pos.leverage > 1 && (
                                <span className="text-[9px] bg-cyan-500/15 text-cyan-400 px-1.5 py-0.2 rounded font-bold border border-cyan-500/20 font-mono">Leva {pos.leverage}x</span>
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
                            <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}</span>
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

      {/* ALGORITHMIC BACKTESTING MODAL */}
      <AnimatePresence>
        {isBacktestOpen && backtestStrategy && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsBacktestOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold tracking-tight text-md">Laboratorio di Backtesting Algoritmico</h3>
                  <p className="text-[10px] text-slate-400">Strategia: <span className="text-cyan-400 font-bold">{backtestStrategy.name}</span></p>
                </div>
              </div>

              {/* Configurations Form Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Coppia Spot</label>
                  <select
                    disabled={backtestStrategy.symbol !== "DYNAMIC"}
                    value={backtestCoin}
                    onChange={(e) => {
                      setBacktestCoin(e.target.value);
                      setBacktestResult(null);
                    }}
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500 disabled:opacity-50"
                  >
                    <option value="BTC">BTC / USDT</option>
                    <option value="ETH">ETH / USDT</option>
                    <option value="SOL">SOL / USDT</option>
                    <option value="XRP">XRP / USDT</option>
                    <option value="ADA">ADA / USDT</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Periodo Storico</label>
                  <select
                    value={backtestPeriod}
                    onChange={(e) => {
                      setBacktestPeriod(parseInt(e.target.value));
                      setBacktestResult(null);
                    }}
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500"
                  >
                    <option value="1">1 Giorno</option>
                    <option value="7">7 Giorni</option>
                    <option value="30">30 Giorni</option>
                    <option value="90">90 Giorni</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Fonte Dati / Trend</label>
                  <select
                    value={backtestRegime}
                    onChange={(e) => {
                      setBacktestRegime(e.target.value);
                      setBacktestResult(null);
                    }}
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="real">Real Binance API 🌐</option>
                    <option value="bull">Sim. Rialzista 📈</option>
                    <option value="bear">Sim. Ribassista 📉</option>
                    <option value="sideways">Sim. Laterale ↔️</option>
                    <option value="volatile">Sim. Volatile ⚡</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-bold block mb-1">Capitale ($)</label>
                  <input
                    type="number"
                    value={backtestStartingBalance}
                    onChange={(e) => {
                      setBacktestStartingBalance(parseFloat(e.target.value) || 100);
                      setBacktestResult(null);
                    }}
                    className="w-full bg-slate-950 text-white rounded-xl p-2.5 text-xs border border-slate-800 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Run Trigger */}
              <div className="flex justify-center">
                <button
                  onClick={handleRunBacktest}
                  disabled={isBacktesting}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-850 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/10 focus:outline-none flex items-center justify-center gap-2"
                >
                  {isBacktesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      SIMULAZIONE IN CORSO...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      ESEGUI BACKTEST
                    </>
                  )}
                </button>
              </div>

              {/* Show report if exists */}
              {backtestResult && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  {backtestWarning && (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 flex gap-2 items-center text-amber-400 text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{backtestWarning}</span>
                    </div>
                  )}

                  {/* Performance Statistics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-2.5">
                      <span className="text-[9px] text-slate-400 block font-bold mb-1">Capitale Finale</span>
                      <span className="text-xs font-bold text-slate-100 font-mono">${backtestResult.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-2.5">
                      <span className="text-[9px] text-slate-400 block font-bold mb-1">P&L Totale (%)</span>
                      <span className={`text-xs font-bold font-mono ${backtestResult.profitPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {backtestResult.profitPercent >= 0 ? "+" : ""}{backtestResult.profitPercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-2.5">
                      <span className="text-[9px] text-slate-400 block font-bold mb-1">Operazioni Chiuse</span>
                      <span className="text-xs font-bold text-slate-100 font-mono">{backtestResult.totalTrades}</span>
                    </div>

                    <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-2.5">
                      <span className="text-[9px] text-slate-400 block font-bold mb-1">Win Rate %</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{backtestResult.winRate.toFixed(1)}%</span>
                    </div>

                    <div className="bg-slate-950/20 border border-slate-850 rounded-2xl p-2.5 col-span-2 sm:col-span-1">
                      <span className="text-[9px] text-slate-400 block font-bold mb-1">Max Drawdown</span>
                      <span className="text-xs font-bold text-rose-400 font-mono">-{backtestResult.maxDrawdown.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* SVG Equity Sparkline Graph */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Curva di Equità Saldo (USDT)</span>
                      <span className="text-[9px] text-slate-400 font-mono">Valore Iniziale: ${backtestStartingBalance.toLocaleString()}</span>
                    </div>
                    {(() => {
                      const balances = backtestResult.curve.map((pt: any) => pt.balance);
                      const minBal = Math.min(...balances, backtestStartingBalance) * 0.99;
                      const maxBal = Math.max(...balances, backtestStartingBalance) * 1.01;
                      const balRange = maxBal - minBal || 1;
                      
                      const pointsString = backtestResult.curve.map((pt: any, i: number) => {
                        const x = (i / (backtestResult.curve.length - 1)) * 580;
                        const y = 90 - ((pt.balance - minBal) / balRange) * 80;
                        return `${x},${y}`;
                      }).join(" ");

                      return (
                        <div className="relative">
                          <svg viewBox="0 0 580 100" className="w-full h-24 overflow-visible">
                            <defs>
                              <linearGradient id="backtestGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={backtestResult.profitPercent >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0.25"/>
                                <stop offset="100%" stopColor={backtestResult.profitPercent >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            <line x1="0" y1="100" x2="580" y2="100" stroke="#1e293b" strokeWidth="1" />
                            <line x1="0" y1="50" x2="580" y2="50" stroke="#1e293b" strokeDasharray="3" strokeWidth="1" />
                            <line x1="0" y1="10" x2="580" y2="10" stroke="#1e293b" strokeWidth="1" />
                            
                            <polygon
                              points={`0,100 ${pointsString} 580,100`}
                              fill="url(#backtestGrad)"
                            />
                            
                            <polyline
                              fill="none"
                              stroke={backtestResult.profitPercent >= 0 ? "#10b981" : "#ef4444"}
                              strokeWidth="2.5"
                              points={pointsString}
                            />
                          </svg>
                          <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-900">
                            <span>$ {minBal.toFixed(1)}</span>
                            <span>Linea Mediana v2.0</span>
                            <span>$ {maxBal.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Trades ledger list */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider font-mono font-bold">Libro Registro Operazioni Simulate ({backtestResult.trades.length})</span>
                    <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/60 scrollbar-thin">
                      {backtestResult.trades.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs font-mono">
                          Nessuna operazione di trading innescata. Prova a cambiare trend o coppia spot.
                        </div>
                      ) : (
                        <table className="w-full text-[11px] text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] font-mono">
                              <th className="p-2.5 font-bold">Data/Step</th>
                              <th className="p-2.5 font-bold">Direzione</th>
                              <th className="p-2.5 font-bold">Prezzi (In / Out)</th>
                              <th className="p-2.5 font-bold">Causa Chiusura</th>
                              <th className="p-2.5 font-bold text-right">Ritorni / PnL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {backtestResult.trades.map((tr: any) => (
                              <tr key={tr.id} className="hover:bg-slate-900/30 font-mono">
                                <td className="p-2.5 text-slate-400 whitespace-nowrap">{tr.exitTime}</td>
                                <td className="p-2.5 text-slate-200">
                                  <span className={`px-1.5 py-0.5 rounded font-bold border text-[10px] ${
                                    tr.type === PositionType.SHORT 
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}>
                                    {tr.type === PositionType.SHORT ? "SHORT" : "LONG"} {(tr.leverage || backtestStrategy.riskManagement.leverage || 1)}x
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-300">
                                  ${tr.entryPrice.toLocaleString(undefined, { minimumFractionDigits: tr.entryPrice < 10 ? 4 : 2 })} → ${tr.exitPrice.toLocaleString(undefined, { minimumFractionDigits: tr.exitPrice < 10 ? 4 : 2 })}
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    tr.closedReason.includes("STOP") ? "bg-rose-500/10 text-rose-400 border border-rose-500/10" :
                                    tr.closedReason.includes("TRAILING") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" :
                                    "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                                  }`}>{tr.closedReason}</span>
                                </td>
                                <td className={`p-2.5 text-right font-bold ${tr.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                  {tr.pnlPercent >= 0 ? "+" : ""}{tr.pnlPercent.toFixed(2)}% (${tr.pnlAmount.toFixed(2)})
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBacktestOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                >
                  Chiudi Laboratorio
                </button>
              </div>
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
