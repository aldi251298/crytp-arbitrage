import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const prisma = new PrismaClient();

// Database Nama Exchange Populer
const EXCHANGES_TIER_1 = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'OKX', 'Bybit'];
const EXCHANGES_LOCAL = ['Indodax', 'Tokocrypto', 'Pintu', 'Luno', 'Upbit', 'Bithumb'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Setup (Wajib)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // --- 1. HANDLE POST (TRADE) ---
    if (req.method === 'POST') {
      const { symbol, profit, type } = req.body;
      const result = await prisma.$transaction(async (tx) => {
        const newTrade = await tx.trade.create({ data: { symbol, profit, type } });
        const updatedWallet = await tx.wallet.update({
          where: { id: 1 },
          data: { balance: { increment: profit }, totalProfit: { increment: profit } }
        });
        return { newTrade, updatedWallet };
      });
      return res.status(200).json(result);
    }

    // --- 2. HANDLE GET (PRO SCANNER ENGINE) ---
    let wallet = await prisma.wallet.findUnique({ where: { id: 1 } });
    if (!wallet) wallet = await prisma.wallet.create({ data: { balance: 10000, totalProfit: 0 }});

    const history = await prisma.trade.findMany({ orderBy: { timestamp: 'desc' }, take: 20 });

    // Fetch Data Real dari CoinLore
    const marketRes = await axios.get('https://api.coinlore.net/api/tickers/?start=0&limit=15');
    
    const enrichedData = marketRes.data.data.map((coin: any) => {
      // 1. Ambil Logo dari Aset CoinCap (Gratis & HD)
      const logoUrl = `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`;

      // 2. Simulasi Harga Antar Exchange
      const globalPrice = parseFloat(coin.price_usd);
      
      // Volatilitas acak (-1% sampai +3%)
      const volatility = 0.99 + (Math.random() * 0.04); 
      const localPrice = globalPrice * volatility;
      
      // 3. Tentukan Rute Exchange (Acak biar terlihat real)
      const exBuy = EXCHANGES_TIER_1[Math.floor(Math.random() * EXCHANGES_TIER_1.length)];
      const exSell = EXCHANGES_LOCAL[Math.floor(Math.random() * EXCHANGES_LOCAL.length)];

      // 4. Hitung Profit Bersih (Net Profit)
      // Rumus: (Harga Jual - Harga Beli) - (Fee Beli + Fee Jual)
      // Anggap fee total 0.2% (0.1% beli + 0.1% jual)
      const spread = localPrice - globalPrice;
      const grossProfitPercent = (spread / globalPrice) * 100;
      const totalFeePercent = 0.2; 
      const netProfitPercent = grossProfitPercent - totalFeePercent;

      let confidence: "High" | "Med" | "Risk" = "High";
      if (netProfitPercent > 3.0) confidence = "Med";
      if (netProfitPercent > 5.0) confidence = "Risk"; // Profit terlalu besar biasanya jebakan (wallet maintenance)
      if (netProfitPercent < 0) confidence = "Risk";

      return {
        id: coin.id,
        rank: coin.rank,
        symbol: coin.symbol,
        name: coin.name,
        logo: logoUrl, // <-- FITUR BARU
        
        price_buy: globalPrice,
        price_sell: localPrice,
        exchange_buy: exBuy, // <-- FITUR BARU
        exchange_sell: exSell, // <-- FITUR BARU
        
        spread: spread,
        gross_profit: grossProfitPercent.toFixed(2),
        trading_fee: totalFeePercent,
        net_profit: netProfitPercent.toFixed(2), // <-- FITUR BARU
        
        change24h: coin.percent_change_24h,
        volume24: parseFloat(coin.volume24),
        confidence: confidence,
        sparkline: Array.from({ length: 10 }, () => globalPrice + Math.random() * (globalPrice * 0.05))
      };
    });

    return res.status(200).json({
      market: enrichedData,
      wallet: wallet,
      history: history
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}