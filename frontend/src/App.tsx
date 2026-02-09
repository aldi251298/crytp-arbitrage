import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Zap, Server, Activity } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import type { CoinData, TradeLog } from './types';
import WalletCard from './components/WalletCard';
import BotPanel from './components/BotPanel';
import HistoryPanel from './components/HistoryPanel';
import MarketTable from './components/MarketTable';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const socket = io(BACKEND_URL, { transports: ['websocket'] });
const API_URL = `${BACKEND_URL}/api`;

function App() {
  // ... (KODE STATE & LOGIC JANGAN DIUBAH, SAMA SEPERTI SEBELUMNYA) ...
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [status, setStatus] = useState("Initializing...");
  const [balance, setBalance] = useState(0); 
  const [totalProfit, setTotalProfit] = useState(0);
  const [history, setHistory] = useState<TradeLog[]>([]);
  const [isBotActive, setIsBotActive] = useState(false);
  const [botThreshold, setBotThreshold] = useState(2.5);
  const lastTradeTime = useRef<number>(0);

  const executeTrade = async (coin: CoinData, type: "MANUAL" | "AUTO") => {
    // ... (Logic Trade Sama) ...
    const profitPercent = parseFloat(coin.profit);
    if (profitPercent <= 0 && type === "MANUAL") {
      toast.error(`Spread ${coin.symbol} negatif!`); return;
    }
    const tradeAmount = 1000;
    const profitAmount = tradeAmount * (profitPercent / 100);
    setBalance(prev => prev + profitAmount);
    setTotalProfit(prev => prev + profitAmount);
    try {
      const res = await axios.post(`${API_URL}/trade`, { symbol: coin.symbol, profit: profitAmount, type: type });
      if (res.data.updatedWallet) {
        setBalance(res.data.updatedWallet.balance);
        setTotalProfit(res.data.updatedWallet.totalProfit);
      }
      setHistory(prev => [res.data.newTrade, ...prev].slice(0, 50));
      if (type === "MANUAL") toast.success(`Manual Trade: ${coin.symbol} (+${profitAmount.toFixed(2)})`);
      else toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-purple-900/90 border border-purple-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}>
            <Zap size={16} className="text-yellow-400 fill-yellow-400" />
            <div><p className="font-bold text-xs">BOT SNIPED: {coin.symbol}</p><p className="text-xs text-purple-200">Profit: +${profitAmount.toFixed(2)}</p></div>
          </div>
        ));
    } catch (err) { console.error(err); toast.error("DB Error"); setBalance(prev => prev - profitAmount); }
  };

  useEffect(() => {
    // ... (UseEffect Sama) ...
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard`);
        if (res.data.wallet) { setBalance(res.data.wallet.balance); setTotalProfit(res.data.wallet.totalProfit); }
        if (res.data.history) setHistory(res.data.history);
      } catch (err) { console.error(err); }
    };
    fetchDashboardData();
    socket.on('connect', () => setStatus("Online"));
    socket.on('disconnect', () => setStatus("Offline"));
    socket.on('market_update', (data: CoinData[]) => {
      setCoins(data);
      if (isBotActive) {
        const now = Date.now();
        if (now - lastTradeTime.current > 3000) { 
           const bestOpp = data.find(c => parseFloat(c.profit) >= botThreshold && c.confidence === 'High');
           if (bestOpp) { executeTrade(bestOpp, "AUTO"); lastTradeTime.current = now; }
        }
      }
    });
    return () => { socket.off('market_update'); };
  }, [isBotActive, botThreshold]); 

  // --- TAMPILAN BARU ---
  return (
    <div className="min-h-screen text-gray-300 font-sans text-sm pb-20 overflow-x-hidden selection:bg-blue-500/30">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      
      {/* NAVBAR GLASS */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-b-slate-700/50">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" size={20} />
            <span className="font-bold tracking-wider text-white">NEXUS <span className="text-blue-500">TERMINAL</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400">SYSTEM ONLINE</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
               <Server size={12} />
               <span>{status}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-24 px-4 lg:px-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">
              Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Arbitrage</span>
            </h1>
            <p className="text-slate-400 max-w-lg relative z-10">
              Real-time latency arbitrage scanner utilizing high-frequency proxy nodes for maximum yield generation.
            </p>
          </div>

          <WalletCard balance={balance} totalProfit={totalProfit} />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <MarketTable coins={coins} onTrade={executeTrade} />
          
          <div className="flex flex-col gap-6 sticky top-24">
            <BotPanel 
              isBotActive={isBotActive} 
              setIsBotActive={setIsBotActive}
              botThreshold={botThreshold}
              setBotThreshold={setBotThreshold}
            />
            <HistoryPanel history={history} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;