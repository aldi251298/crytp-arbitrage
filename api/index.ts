import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// --- PENTING: Instansiasi Prisma DI LUAR handler ---
// Ini namanya "Connection Pooling" buat Serverless
const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Setup CORS (Biar frontend bisa akses dari mana aja)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle Preflight Request (Browser ngecek izin dulu)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // --- 1. HANDLE REQUEST POST (TRADE) ---
    if (req.method === 'POST') {
      const { symbol, profit, type } = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        const newTrade = await tx.trade.create({
          data: { symbol, profit, type }
        });
        const updatedWallet = await tx.wallet.update({
          where: { id: 1 },
          data: {
            balance: { increment: profit },
            totalProfit: { increment: profit }
          }
        });
        return { newTrade, updatedWallet };
      });
      
      return res.status(200).json(result);
    }

    // --- 2. HANDLE REQUEST GET (DASHBOARD) ---
    if (req.method === 'GET') {
        let wallet = await prisma.wallet.findUnique({ where: { id: 1 } });
        
        // Jaga-jaga kalau wallet belum ada di Supabase
        if (!wallet) {
           wallet = await prisma.wallet.create({ data: { balance: 10000, totalProfit: 0 }});
        }
    
        const history = await prisma.trade.findMany({
          orderBy: { timestamp: 'desc' },
          take: 20
        });
    
        // Ambil Data Market (CoinLore)
        const targetUrl = 'https://api.coinlore.net/api/tickers/?start=0&limit=10';
        const marketRes = await axios.get(targetUrl);
        
        const enrichedData = marketRes.data.data.map((coin: any) => {
          const globalPrice = parseFloat(coin.price_usd);
          const volatility = 1.005 + (Math.random() * 0.025); 
          const localPrice = globalPrice * volatility;
          const spread = localPrice - globalPrice;
          const profit = (spread / globalPrice) * 100;
          
          let confidence = "High";
          if (profit > 2.5) confidence = "Med";
          if (profit > 4.0) confidence = "Risk";
    
          return {
            id: coin.id,
            rank: coin.rank,
            symbol: coin.symbol,
            name: coin.name,
            price_usd: globalPrice,
            price_local: localPrice,
            spread: spread,
            profit: profit.toFixed(2),
            change24h: coin.percent_change_24h,
            change1h: coin.percent_change_1h,
            volume24: parseFloat(coin.volume24),
            market_cap: parseFloat(coin.market_cap_usd),
            confidence: confidence,
            sparkline: Array.from({ length: 10 }, () => 50000 + Math.random() * 2000)
          };
        });
    
        return res.status(200).json({
          market: enrichedData,
          wallet: wallet,
          history: history
        });
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}