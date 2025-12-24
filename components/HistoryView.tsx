import React, { useState, useMemo, useEffect } from 'react';
import { TransactionResult, Expense } from '../types';
import { Trash2, TrendingUp, Filter, User, Edit2, X, Check, Crown, Pencil, Settings, FileEdit, Info, DollarSign, Percent, Receipt, Eye } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface Partner {
  id: string;
  name: string;
}

interface Boss {
  id: string;
  name: string;
}

interface HistoryViewProps {
  transactions: TransactionResult[];
  onClearHistory: () => void;
  onUpdateTransaction?: (transactionId: string, newPartnerId: string, newPartnerName: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onEditTransaction?: (transaction: TransactionResult) => void;
  userRole: 'partner' | 'boss';
}

const HistoryView: React.FC<HistoryViewProps> = ({ transactions, onClearHistory, onUpdateTransaction, onDeleteTransaction, onEditTransaction, userRole }) => {
  const { userData } = useAuth();
  const bossName = userData?.role === 'boss' ? userData.name : 'שמעון';
  
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<string>('');
  const [selectedBossForEdit, setSelectedBossForEdit] = useState<string>('');
  const [selectedTransactionForDetails, setSelectedTransactionForDetails] = useState<TransactionResult | null>(null);

  // טעינת רשימת שותפים (רק לבוס)
  useEffect(() => {
    if (userRole !== 'boss' || !onUpdateTransaction) return;

    const loadPartners = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'partner'));
        const querySnapshot = await getDocs(q);
        const partnersList: Partner[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          partnersList.push({
            id: doc.id,
            name: data.name,
          });
        });
        
        setPartners(partnersList);
      } catch (error) {
        console.error('❌ שגיאה בטעינת שותפים:', error);
      }
    };

    loadPartners();
  }, [userRole, onUpdateTransaction]);

  // טעינת רשימת בוסים (רק לבוס)
  useEffect(() => {
    if (userRole !== 'boss' || !onUpdateTransaction) return;

    const loadBosses = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'boss'));
        const querySnapshot = await getDocs(q);
        const bossesList: Boss[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bossesList.push({
            id: doc.id,
            name: data.name,
          });
        });
        
        console.log('✅ טעינתי בוסים:', bossesList.length, bossesList.map(b => b.name));
        setBosses(bossesList);
      } catch (error) {
        console.error('❌ שגיאה בטעינת בוסים:', error);
      }
    };

    loadBosses();
  }, [userRole, onUpdateTransaction]);

  // עדכון אוטומטי של selectedPartnerForEdit כשהרשימה נטענת
  useEffect(() => {
    // אם אנחנו במצב עריכה והרשימה נטענה, בדוק אם השותף הנוכחי קיים
    if (editingTransactionId && partners.length > 0 && selectedPartnerForEdit) {
      const partnerExists = partners.find(p => p.id === selectedPartnerForEdit);
      if (!partnerExists) {
        // השותף לא קיים, בחר את הראשון
        setSelectedPartnerForEdit(partners[0].id);
        console.warn('⚠️ השותף שנבחר לא נמצא ברשימה, נבחר שותף אחר:', partners[0].name);
      }
    }
  }, [partners, editingTransactionId, selectedPartnerForEdit]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const handleStartEdit = (transaction: TransactionResult) => {
    if (!transaction.id) return;
    setEditingTransactionId(transaction.id);
    
    // בדוק אם השותף קיים ברשימת השותפים
    const partnerExists = partners.find(p => p.id === transaction.partnerId);
    if (partnerExists) {
      setSelectedPartnerForEdit(transaction.partnerId);
    } else {
      // אם השותף לא קיים (למשל שינה role), בחר את השותף הראשון מהרשימה
      if (partners.length > 0) {
        setSelectedPartnerForEdit(partners[0].id);
        console.warn('⚠️ השותף המקורי לא נמצא ברשימה, נבחר שותף אחר:', {
          originalPartnerId: transaction.partnerId,
          originalPartnerName: transaction.partnerName,
          selectedPartner: partners[0].name
        });
      } else {
        setSelectedPartnerForEdit('');
        console.error('❌ אין שותפים במערכת');
      }
    }
    
    // בדוק אם הבוס קיים ברשימת הבוסים
    if (transaction.bossId) {
      const bossExists = bosses.find(b => b.id === transaction.bossId);
      if (bossExists) {
        setSelectedBossForEdit(transaction.bossId);
      } else {
        // אם הבוס לא קיים, בחר את הבוס הראשון מהרשימה
        if (bosses.length > 0) {
          setSelectedBossForEdit(bosses[0].id);
          console.warn('⚠️ הבוס המקורי לא נמצא ברשימה, נבחר בוס אחר:', {
            originalBossId: transaction.bossId,
            originalBossName: transaction.bossName,
            selectedBoss: bosses[0].name
          });
        } else {
          setSelectedBossForEdit('');
          console.error('❌ אין בוסים במערכת');
        }
      }
    } else if (bosses.length > 0) {
      // אם אין bossId בעסקה הישנה, בוחרים את הבוס הראשון
      setSelectedBossForEdit(bosses[0].id);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setSelectedPartnerForEdit('');
    setSelectedBossForEdit('');
  };

  const handleSaveEdit = (transactionId: string) => {
    if (!onUpdateTransaction || !selectedPartnerForEdit) {
      console.error('❌ חסר onUpdateTransaction או selectedPartnerForEdit');
      return;
    }
    
    const selectedPartner = partners.find(p => p.id === selectedPartnerForEdit);
    const selectedBoss = bosses.find(b => b.id === selectedBossForEdit);
    
    if (selectedPartner) {
      console.log('✏️ מעדכן עסקה:', { 
        transactionId, 
        partnerId: selectedPartner.id, 
        partnerName: selectedPartner.name,
        bossId: selectedBoss?.id,
        bossName: selectedBoss?.name
      });
      onUpdateTransaction(
        transactionId, 
        selectedPartner.id, 
        selectedPartner.name,
        selectedBoss?.id,
        selectedBoss?.name
      );
      setEditingTransactionId(null);
      setSelectedPartnerForEdit('');
      setSelectedBossForEdit('');
    } else {
      console.error('❌ שותף לא נמצא:', {
        searchedId: selectedPartnerForEdit,
        availablePartners: partners.map(p => ({ id: p.id, name: p.name })),
        partnersCount: partners.length
      });
      alert(`שגיאה: שותף לא נמצא. אנא רענן את הדף ונסה שוב.\n\nשותפים זמינים: ${partners.length > 0 ? partners.map(p => p.name).join(', ') : 'אין שותפים במערכת'}`);
    }
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
          <p className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">סה"כ שותפים</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{formatMoney(totalEli)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-3 sm:p-4 md:p-5 rounded-2xl border border-indigo-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full"></div>
          <p className="text-indigo-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">סה"כ {bossName}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{formatMoney(totalShimon)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm md:text-base" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '100px' }} />
            <col style={{ width: '120px' }} />
            {userRole === 'boss' && (
              <>
                <col style={{ width: '130px' }} />
                <col style={{ width: '130px' }} />
                {onUpdateTransaction && <col style={{ width: '90px' }} />}
                {onDeleteTransaction && <col style={{ width: '60px' }} />}
              </>
            )}
            <col style={{ width: '150px' }} />
            <col style={{ width: '150px' }} />
          </colgroup>
          <thead className="text-xs md:text-sm text-slate-400 uppercase bg-slate-900/80 font-bold tracking-wider">
            <tr>
              <th className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap">תאריך</th>
              <th className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap">לקוח</th>
              {userRole === 'boss' && (
                <>
                  <th className="px-3 py-3 md:px-4 md:py-4 text-purple-400/80 whitespace-nowrap">שותף</th>
                  <th className="px-3 py-3 md:px-4 md:py-4 text-yellow-400/80 whitespace-nowrap">בוס</th>
                  {onUpdateTransaction && (
                    <th className="px-3 py-3 md:px-4 md:py-4 text-slate-400/80 whitespace-nowrap">פעולות</th>
                  )}
                  {onDeleteTransaction && (
                    <th className="px-3 py-3 md:px-4 md:py-4 text-red-400/80 whitespace-nowrap">מחיקה</th>
                  )}
                </>
              )}
              <th className="px-3 py-3 md:px-4 md:py-4 text-cyan-400/80 whitespace-nowrap">חלק שותף</th>
              <th className="px-3 py-3 md:px-4 md:py-4 text-indigo-400/80 whitespace-nowrap">חלק בוס</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransactions.map((t, idx) => (
              <tr 
                key={t.id || idx}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-3 py-3 md:px-4 md:py-4 text-slate-400 whitespace-nowrap text-sm md:text-base font-mono">{t.date}</td>
                <td className="px-3 py-3 md:px-4 md:py-4 font-medium text-slate-200 group-hover:text-white transition-colors text-sm md:text-base truncate">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); setSelectedTransactionForDetails(t); }} title="לחץ לפרטים">
                    <Eye className="w-4 h-4 text-cyan-400/70 hover:text-cyan-400 flex-shrink-0" />
                    <span>{t.customerName}</span>
                  </div>
                </td>
                {userRole === 'boss' && (
                  <>
                    <td className="px-3 py-3 md:px-4 md:py-4 text-purple-200/80 text-sm md:text-base whitespace-nowrap" onClick={(e) => editingTransactionId === t.id && e.stopPropagation()}>
                      {editingTransactionId === t.id ? (
                        <select
                          value={selectedPartnerForEdit}
                          onChange={(e) => setSelectedPartnerForEdit(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-slate-800 border border-purple-500/50 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-400 w-full"
                        >
                          {partners.length === 0 ? (
                            <option value="" className="bg-slate-900">אין שותפים</option>
                          ) : (
                            partners.map((partner) => (
                              <option key={partner.id} value={partner.id} className="bg-slate-900">
                                {partner.name}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{t.partnerName || 'לא ידוע'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 md:px-4 md:py-4 text-yellow-200/80 text-sm md:text-base whitespace-nowrap" onClick={(e) => editingTransactionId === t.id && e.stopPropagation()}>
                      {editingTransactionId === t.id ? (
                        <select
                          value={selectedBossForEdit}
                          onChange={(e) => setSelectedBossForEdit(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-slate-800 border border-yellow-500/50 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400 w-full"
                        >
                          {bosses.length === 0 ? (
                            <option value="" className="bg-slate-900">אין בוסים</option>
                          ) : (
                            bosses.map((boss) => (
                              <option key={boss.id} value={boss.id} className="bg-slate-900">
                                {boss.name}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Crown className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{t.bossName || 'לא ידוע'}</span>
                        </div>
                      )}
                    </td>
                    {onUpdateTransaction && (
                      <td className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {editingTransactionId === t.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => t.id && handleSaveEdit(t.id)}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              title="שמור"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="בטל"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(t); }}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title="ערוך שותף ובוס"
                            >
                              <Pencil size={16} />
                            </button>
                            {onEditTransaction && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onEditTransaction(t); }}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="ערוך עסקה מלא"
                              >
                                <FileEdit size={16} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                    {onDeleteTransaction && t.id && (
                      <td className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (confirm('האם אתה בטוח שברצונך למחוק את העסקה הזו?')) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="מחק עסקה"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </>
                )}
                <td className="px-3 py-3 md:px-4 md:py-4 text-cyan-200 font-medium text-sm md:text-base" title={t.partnerName || 'לא ידוע'}>
                  <div className="flex flex-col">
                    <span className="text-cyan-300/70 text-xs mb-1 truncate">{t.partnerName || 'לא ידוע'}</span>
                    <span className="text-sm md:text-base font-semibold">{formatMoney(t.eliShare)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 md:px-4 md:py-4 text-indigo-200 font-medium text-sm md:text-base" title={t.bossName || bossName}>
                  <div className="flex flex-col">
                    <span className="text-indigo-300/70 text-xs mb-1 truncate">{t.bossName || bossName}</span>
                    <span className="text-sm md:text-base font-semibold">{formatMoney(t.shimonShare)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex justify-center pt-3 sm:pt-4">
        <button 
          onClick={onClearHistory}
          className="text-red-400/70 hover:text-red-400 text-sm font-medium flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-full transition-all"
        >
          <Trash2 size={16} />
          נקה היסטוריית פעולות
        </button>
      </div>

      {/* Modal להצגת פרטי עסקה */}
      {selectedTransactionForDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTransactionForDetails(null)}>
          <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Info className="w-6 h-6 text-cyan-400" />
                  פרטי עסקה
                </h2>
                <button
                  onClick={() => setSelectedTransactionForDetails(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* מידע בסיסי */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-sm mb-1">לקוח</p>
                  <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.customerName}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-sm mb-1">תאריך</p>
                  <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.date}</p>
                </div>
              </div>

              {/* שותף ובוס */}
              {userRole === 'boss' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <p className="text-purple-300 text-sm mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      שותף
                    </p>
                    <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.partnerName || 'לא ידוע'}</p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-yellow-300 text-sm mb-1 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      בוס
                    </p>
                    <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.bossName || bossName}</p>
                  </div>
                </div>
              )}

              {/* סכומים */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                <h3 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  סכומים
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">הכנסה כוללת:</span>
                    <span className="text-white text-lg font-semibold">{formatMoney(selectedTransactionForDetails.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">הוצאות כוללות:</span>
                    <span className="text-red-400 text-lg font-semibold">-{formatMoney(selectedTransactionForDetails.totalExpenses)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-semibold">רווח נקי:</span>
                      <span className="text-emerald-400 text-xl font-bold">{formatMoney(selectedTransactionForDetails.netProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* הוצאות מפורטות */}
              {selectedTransactionForDetails.expenses && selectedTransactionForDetails.expenses.length > 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                  <h3 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-red-400" />
                    הוצאות מפורטות
                  </h3>
                  <div className="space-y-2">
                    {selectedTransactionForDetails.expenses.map((expense: Expense, index: number) => (
                      <div key={expense.id || index} className="bg-slate-900/50 rounded-lg p-3 border border-white/5 flex justify-between items-center">
                        <span className="text-slate-300 font-medium">{expense.name}</span>
                        <span className="text-red-400 font-semibold">{formatMoney(expense.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">סה"כ הוצאות:</span>
                        <span className="text-red-400 text-lg font-bold">{formatMoney(selectedTransactionForDetails.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                  <h3 className="text-slate-300 text-lg font-semibold mb-2 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-red-400" />
                    הוצאות
                  </h3>
                  <p className="text-slate-400 text-sm">אין פירוט הוצאות זמין עבור עסקה זו</p>
                  <p className="text-slate-500 text-xs mt-2">סה"כ הוצאות: {formatMoney(selectedTransactionForDetails.totalExpenses)}</p>
                </div>
              )}

              {/* חלוקה */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                <h3 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-indigo-400" />
                  חלוקה
                </h3>
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-cyan-300 font-medium">{selectedTransactionForDetails.partnerName || 'שותף'}</span>
                      <span className="text-cyan-300 text-sm">{selectedTransactionForDetails.eliPercentage}%</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{formatMoney(selectedTransactionForDetails.eliShare)}</p>
                  </div>
                  <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-indigo-300 font-medium">{selectedTransactionForDetails.bossName || bossName}</span>
                      <span className="text-indigo-300 text-sm">{selectedTransactionForDetails.shimonPercentage}%</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{formatMoney(selectedTransactionForDetails.shimonShare)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;