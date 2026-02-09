import { TrendingUp, CreditCard } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

interface Props {
  balance: number;
  totalProfit: number;
}

export default function WalletCard({ balance, totalProfit }: Props) {
  return (
    <div className="glass-panel p-1 rounded-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
      
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md rounded-xl p-5 h-full flex flex-col justify-between border border-slate-700/50">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <CreditCard className="text-blue-400" size={20} />
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">DB_CONN_ACTIVE</span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-white font-mono tracking-tight">{formatCurrency(balance)}</p>
          </div>
          
          <div className="pt-4 border-t border-slate-700/50 flex items-center gap-3">
             <div className="bg-emerald-500/10 p-1.5 rounded-full">
               <TrendingUp size={14} className="text-emerald-400" />
             </div>
             <div>
               <p className="text-[10px] text-slate-400 uppercase">Net Profit</p>
               <p className="text-emerald-400 font-bold font-mono">+{formatCurrency(totalProfit)}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}