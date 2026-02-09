import { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { Activity, Server, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import type { CoinData, TradeLog } from './types';
import WalletCard from './components/WalletCard';
import BotPanel from './components/BotPanel';
import HistoryPanel from './components/HistoryPanel';
import MarketTable from './components/MarketTable';

function App() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [status, setStatus] = useState("Connecting..."); 
  const [balance, setBalance] = useState(0); 
  const [totalProfit, setTotalProfit] = useState(0);
  const [history, setHistory] = useState<TradeLog[]>([]);
  
  const [isBotActive, setIsBotActive] = useState(false);
  const [botThreshold, setBotThreshold] = useState(2.5);

  const isBotActiveRef = useRef(isBotActive);
  const botThresholdRef = useRef(botThreshold);
  const lastTradeTime = useRef<number>(0);
  const fetchDataRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => { isBotActiveRef.current = isBotActive; }, [isBotActive]);
  useEffect(() => { botThresholdRef.current = botThreshold; }, [botThreshold]);

  // --- 1. THE ENGINE ---
  useEffect(() => {
    const runEngine = async () => {
      try {
        const res = await axios.get('/api'); 
        const marketData = res.data.market;

        setCoins(marketData);
        setBalance(res.data.wallet.balance);
        setTotalProfit(res.data.wallet.totalProfit);
        setHistory(res.data.history);
        setStatus("System Online");

        if (isBotActiveRef.current) {
          const now = Date.now();
          if (now - lastTradeTime.current > 3000) { 
             // LOGIC BARU: Pakai net_profit
             const bestOpp = marketData.find((c: any) => 
               parseFloat(c.net_profit) >= botThresholdRef.current && c.confidence === 'High'
             );
             
             if (bestOpp) {
               await axios.post('/api', { 
                  symbol: bestOpp.symbol, 
                  profit: (1000 * parseFloat(bestOpp.net_profit)/100), 
                  type: "AUTO" 
               });
               lastTradeTime.current = now;
             }
          }
        }
      } catch (error) {
        console.error(error);
        setStatus("Reconnecting...");
      }
    };

    fetchDataRef.current = runEngine;
    runEngine();
    const interval = setInterval(runEngine, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. FUNGSI TRADE ---
  const executeTrade = async (coin: CoinData, type: "MANUAL" | "AUTO") => {
    // LOGIC BARU: Pakai net_profit
    const profitPercent = parseFloat(coin.net_profit);
    if (profitPercent <= 0 && type === "MANUAL") {
      toast.error(`Net Yield negatif (Rugi di Fee)!`); return;
    }
    
    const tradeAmount = 1000;
    const profitAmount = tradeAmount * (profitPercent / 100);
    
    setBalance(prev => prev + profitAmount);
    setTotalProfit(prev => prev + profitAmount);

    try {
      await axios.post('/api', { symbol: coin.symbol, profit: profitAmount, type: type });
      
      if (type === "MANUAL") {
        toast.success(`Trade Executed: ${coin.symbol} -> ${coin.exchange_sell}`);
        fetchDataRef.current(); 
      }
    } catch (err) {
      toast.error("Trade Failed");
      setBalance(prev => prev - profitAmount); 
    }
  };

  return (
    <div className="min-h-screen text-gray-300 font-sans text-sm pb-20 overflow-x-hidden selection:bg-blue-500/30">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-b-slate-700/50">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" size={20} />
            <span className="font-bold tracking-wider text-white">NEXUS <span className="text-blue-500">TERMINAL</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
             <div className="flex items-center gap-2 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded bg-emerald-500/10">
               <Server size={12} /> VERCEL PROD
             </div>
             <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-slate-800 rounded text-slate-400">
               {status === "Reconnecting..." ? <AlertTriangle size={12} className="text-red-500"/> : <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
               {status}
             </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-4 lg:px-8 max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Institutional Arbitrage</h1>
             <p className="text-slate-400 relative z-10">Real-time Cross-Exchange Scanner with Liquidity Analysis.</p>
          </div>
          <WalletCard balance={balance} totalProfit={totalProfit} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <MarketTable coins={coins} onTrade={executeTrade} />
          <div className="flex flex-col gap-6 sticky top-24">
            <BotPanel isBotActive={isBotActive} setIsBotActive={setIsBotActive} botThreshold={botThreshold} setBotThreshold={setBotThreshold} />
            <HistoryPanel history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;