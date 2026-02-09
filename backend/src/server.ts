import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import axios from 'axios';
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();
const server = Fastify({ logger: false });

server.register(cors, { origin: true });

// --- API ENDPOINTS (Jembatan ke Database) ---

// 1. Ambil Data Wallet & History (Dipanggil pas refresh)
server.get('/api/dashboard', async (request, reply) => {
  const wallet = await prisma.wallet.findUnique({ where: { id: 1 } });
  // Ambil 50 transaksi terakhir
  const history = await prisma.trade.findMany({
    orderBy: { timestamp: 'desc' },
    take: 50
  });
  return { wallet, history };
});

// 2. Eksekusi Trade (Dipanggil pas tombol BUY diklik)
interface TradeBody {
  symbol: string;
  profit: number;
  type: string;
}

server.post<{ Body: TradeBody }>('/api/trade', async (request, reply) => {
  const { symbol, profit, type } = request.body;

  // Update Database (Pakai transaction biar aman: Saldo & History update barengan)
  const result = await prisma.$transaction(async (tx) => {
    // 1. Tambah History
    const newTrade = await tx.trade.create({
      data: { symbol, profit, type }
    });

    // 2. Update Saldo
    const updatedWallet = await tx.wallet.update({
      where: { id: 1 },
      data: {
        balance: { increment: profit },
        totalProfit: { increment: profit }
      }
    });

    return { newTrade, updatedWallet };
  });

  // Kirim balik data terbaru
  return result;
});

// --- WEBSOCKET SETUP ---
const io = new Server(server.server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- MARKET ENGINE (Sama seperti sebelumnya) ---
const fetchMarketData = async () => {
  try {
    const targetUrl = 'https://api.coinlore.net/api/tickers/?start=0&limit=15';
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const response = await axios.get(proxyUrl);
    
    // (Logic generate data sama seperti sebelumnya...)
    const rawData = response.data.data;
    const enrichedData = rawData.map((coin: any) => {
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
    return enrichedData;
  } catch (error) {
    console.log('Fetching market data...');
    return [];
  }
};

const startEngine = () => {
  console.log('🚀 Engine Started with Database Connection...');
  setInterval(async () => {
    const data = await fetchMarketData();
    if (data.length > 0) io.emit('market_update', data);
  }, 4000);
};

const start = async () => {
  try {
    // GANTI PORT JADI DINAMIS
    const port = Number(process.env.PORT) || 3001; 

    // Host HARUS 0.0.0.0 buat Render
    await server.listen({ port: port, host: '0.0.0.0' });

    console.log(`🚀 Server running on port ${port}`);
    startEngine();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();