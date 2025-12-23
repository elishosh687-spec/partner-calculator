import React, { useState, useMemo } from 'react';
import { TransactionResult } from '../types';
import { Trash2, TrendingUp, Filter, User } from 'lucide-react';

interface HistoryViewProps {
  transactions: TransactionResult[];
  onClearHistory: () => void;
  userRole: 'partner' | 'boss';
}

const HistoryView: React.FC<HistoryViewProps> = ({ transactions, onClearHistory, userRole }) => {
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  // רשימת שותפים ייחודיים (רק למנהל)
  const uniquePartners = useMemo(() => {
    if (userRole !== 'boss') return [];
    const partners = new Map<string, string>();
    transactions.forEach(t => {
      if (t.partnerId && t.partnerName) {
        partners.set(t.partnerId, t.partnerName);
      }
    });
    return Array.from(partners.entries()).map(([id, name]) => ({ id, name }));
  }, [transactions, userRole]);

  // סינון עסקאות לפי שותף נבחר
  const filteredTransactions = useMemo(() => {
    if (userRole !== 'boss' || selectedPartner === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.partnerId === selectedPartner);
  }, [transactions, selectedPartner, userRole]);

  const totalEli = filteredTransactions.reduce((sum, t) => sum + t.eliShare, 0);
  const totalShimon = filteredTransactions.reduce((sum, t) => sum + t.shimonShare, 0);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/5">
             <TrendingUp className="text-slate-600" size={28} />
        </div>
        <p className="text-base sm:text-lg text-slate-300 font-medium">אין עסקאות שמורות</p>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">ההיסטוריה שלך ריקה כרגע</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fadeIn">
      {/* סינון לפי שותף - רק למנהל */}
      {userRole === 'boss' && uniquePartners.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 text-sm font-medium">סינון לפי שותף</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPartner('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPartner === 'all'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              כולם ({transactions.length})
            </button>
            {uniquePartners.map(partner => {
              const count = transactions.filter(t => t.partnerId === partner.id).length;
              return (
                <button
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedPartner === partner.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3 h-3" />
                  {partner.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-3 sm:p-4 md:p-5 rounded-2xl border border-cyan-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-cyan-500/10 blur-xl rounded-full"></div>
          <p className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">סה"כ אלי</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{formatMoney(totalEli)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-3 sm:p-4 md:p-5 rounded-2xl border border-indigo-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full"></div>
          <p className="text-indigo-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">סה"כ שמעון</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{formatMoney(totalShimon)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/40">
        <table className="w-full text-right text-xs sm:text-sm">
          <thead className="text-[10px] sm:text-xs text-slate-400 uppercase bg-slate-900/80 font-bold tracking-wider">
            <tr>
              <th className="px-2 sm:px-3 md:px-5 py-3 sm:py-4">תאריך</th>
              <th className="px-2 sm:px-3 md:px-5 py-3 sm:py-4">לקוח</th>
              {userRole === 'boss' && (
                <th className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-purple-400/80">שותף</th>
              )}
              <th className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-cyan-400/80">אלי</th>
              <th className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-indigo-400/80">שמעון</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransactions.map((t, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                <td className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-slate-400 whitespace-nowrap text-[10px] sm:text-xs font-mono">{t.date}</td>
                <td className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 font-medium text-slate-200 group-hover:text-white transition-colors text-xs sm:text-sm">{t.customerName}</td>
                {userRole === 'boss' && (
                  <td className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-purple-200/80 text-xs sm:text-sm flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {t.partnerName || 'לא ידוע'}
                  </td>
                )}
                <td className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-cyan-200 font-medium text-xs sm:text-sm">{formatMoney(t.eliShare)}</td>
                <td className="px-2 sm:px-3 md:px-5 py-3 sm:py-4 text-indigo-200 font-medium text-xs sm:text-sm">{formatMoney(t.shimonShare)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center pt-3 sm:pt-4">
        <button 
          onClick={onClearHistory}
          className="text-red-400/70 hover:text-red-400 text-[10px] sm:text-xs font-medium flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-red-500/10 rounded-full transition-all"
        >
          <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
          נקה היסטוריית פעולות
        </button>
      </div>
    </div>
  );
};

export default HistoryView;