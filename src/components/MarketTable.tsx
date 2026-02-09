import { BarChart2, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { CoinData } from '../types';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

interface Props {
  coins: CoinData[];
  onTrade: (coin: CoinData, type: "MANUAL") => void;
}

export default function MarketTable({ coins, onTrade }: Props) {
  return (
    <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
        <h3 className="font-bold text-white flex items-center gap-2">
          <BarChart2 size={18} className="text-blue-500"/> ARBITRAGE SCANNER
        </h3>
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          LIVE FEED
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-400 uppercase tracking-wider bg-slate-900/50">
              <th className="p-4 font-medium pl-6">Asset Pair</th>
              <th className="p-4 font-medium">Route (Buy <ArrowRight className="inline w-3 h-3"/> Sell)</th>
              <th className="p-4 font-medium text-right">Price Delta</th>
              <th className="p-4 font-medium text-right">Net Yield</th>
              <th className="p-4 font-medium w-24 hidden md:table-cell">Trend</th>
              <th className="p-4 font-medium text-center">Exec</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {coins.map((coin) => {
              const netProfit = parseFloat(coin.net_profit);
              const isProfitable = netProfit > 0;
              
              return (
                <tr key={coin.id} className="hover:bg-white/5 transition-colors group">
                  {/* 1. KOLOM ASSET DENGAN LOGO */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={coin.logo} 
                          alt={coin.symbol} 
                          className="w-8 h-8 rounded-full bg-slate-800 p-0.5 shadow-lg shadow-blue-500/10"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32' }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${coin.confidence === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>
                      </div>
                      <div>
                        <span className="block font-bold text-white tracking-wide">{coin.symbol}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Rank #{coin.rank}</span>
                      </div>
                    </div>
                  </td>

                  {/* 2. KOLOM RUTE EXCHANGE */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-300">{coin.exchange_buy}</span>
                      <ArrowRight size={12} className="text-slate-500" />
                      <span className="text-blue-300">{coin.exchange_sell}</span>
                    </div>
                  </td>

                  {/* 3. KOLOM PRICE DELTA (SELISIH HARGA) */}
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-slate-300 font-mono text-xs">{formatCurrency(coin.price_sell)}</span>
                      <span className={`text-[10px] ${coin.spread > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {coin.spread > 0 ? '+' : ''}{formatCurrency(coin.spread)}
                      </span>
                    </div>
                  </td>

                  {/* 4. KOLOM NET YIELD (PROFIT BERSIH) */}
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`font-bold font-mono px-2 py-0.5 rounded text-xs 
                        ${isProfitable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {coin.net_profit}%
                      </span>
                      <span className="text-[9px] text-slate-500">
                        -{coin.trading_fee}% Fee
                      </span>
                    </div>
                  </td>

                  {/* 5. SPARKLINE */}
                  <td className="p-4 hidden md:table-cell h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.sparkline.map((val, i) => ({ i, val }))}>
                          <Line type="monotone" dataKey="val" stroke={parseFloat(coin.change24h) >= 0 ? "#10B981" : "#EF4444"} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                  </td>

                  {/* 6. TOMBOL EXECUTE */}
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onTrade(coin, "MANUAL")}
                      disabled={!isProfitable}
                      className="group/btn relative overflow-hidden bg-slate-800 hover:bg-blue-600 text-white p-2 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-slate-800 shadow-lg shadow-black/20"
                    >
                      <ArrowRightLeft size={16} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}