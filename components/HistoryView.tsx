import React from 'react';
import { TransactionResult } from '../types';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryViewProps {
  transactions: TransactionResult[];
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ transactions, onClearHistory }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const totalEli = transactions.reduce((sum, t) => sum + t.eliShare, 0);
  const totalShimon = transactions.reduce((sum, t) => sum + t.shimonShare, 0);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
             <TrendingUp className="text-slate-600" size={32} />
        </div>
        <p className="text-lg text-slate-300 font-medium">אין עסקאות שמורות</p>
        <p className="text-sm text-slate-500 mt-2">ההיסטוריה שלך ריקה כרגע</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-2xl border border-cyan-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-cyan-500/10 blur-xl rounded-full"></div>
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">סה"כ אלי</p>
          <p className="text-2xl md:text-3xl font-black text-white">{formatMoney(totalEli)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-2xl border border-indigo-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full"></div>
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">סה"כ שמעון</p>
          <p className="text-2xl md:text-3xl font-black text-white">{formatMoney(totalShimon)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40">
        <table className="w-full text-right text-sm">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 font-bold tracking-wider">
            <tr>
              <th className="px-5 py-4">תאריך</th>
              <th className="px-5 py-4">לקוח</th>
              <th className="px-5 py-4 text-cyan-400/80">אלי</th>
              <th className="px-5 py-4 text-indigo-400/80">שמעון</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((t, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-xs font-mono">{t.date}</td>
                <td className="px-5 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">{t.customerName}</td>
                <td className="px-5 py-4 text-cyan-200 font-medium">{formatMoney(t.eliShare)}</td>
                <td className="px-5 py-4 text-indigo-200 font-medium">{formatMoney(t.shimonShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onClearHistory}
          className="text-red-400/70 hover:text-red-400 text-xs font-medium flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-full transition-all"
        >
          <Trash2 size={14} />
          נקה היסטוריית פעולות
        </button>
      </div>
    </div>
  );
};

export default HistoryView;