export interface CoinData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  price_usd: number;
  price_local: number;
  spread: number;
  profit: string;
  change24h: string;
  change1h: string;
  volume24: number;
  market_cap: number;
  confidence: "High" | "Med" | "Risk";
  sparkline: number[];
}

export interface TradeLog {
  id: number;
  symbol: string;
  profit: number;
  type: "MANUAL" | "AUTO";
  timestamp: string;
}