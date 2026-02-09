export interface CoinData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  logo: string; // URL Logo Asli
  
  // Harga & Rute
  price_buy: number;
  price_sell: number;
  exchange_buy: string; // Misal: Binance
  exchange_sell: string; // Misal: Indodax
  
  // Kalkulasi Cuan
  spread: number;
  gross_profit: string; // Profit Kotor (%)
  trading_fee: number; // Estimasi Fee (%)
  net_profit: string; // Profit Bersih (%)
  
  // Metadata
  change24h: string;
  volume24: number;
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