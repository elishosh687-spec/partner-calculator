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
  onUpdateTransaction?: (transactionId: string, newPartnerId: string, newPartnerName: string, newBossId?: string, newBossName?: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onEditTransaction?: (transaction: TransactionResult) => void;
  onUpdatePaymentStatus?: (transactionId: string, isPaid: boolean) => void;
  userRole: 'partner' | 'boss';
}

const HistoryView: React.FC<HistoryViewProps> = ({ transactions, onClearHistory, onUpdateTransaction, onDeleteTransaction, onEditTransaction, onUpdatePaymentStatus, userRole }) => {
  const { userData } = useAuth();
  const ecobrothersName = userData?.role === 'boss' ? userData.name : 'EcoBrothers';
  
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<string>('');
  const [selectedBossForEdit, setSelectedBossForEdit] = useState<string>('');
  const [selectedTransactionForDetails, setSelectedTransactionForDetails] = useState<TransactionResult | null>(null);

  // Load partners list (only for boss)
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
        console.error('❌ Error loading partners:', error);
      }
    };

    loadPartners();
  }, [userRole, onUpdateTransaction]);

  // Load bosses list (only for boss)
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
        
        console.log('✅ Loaded bosses:', bossesList.length, bossesList.map(b => b.name));
        setBosses(bossesList);
      } catch (error) {
        console.error('❌ Error loading bosses:', error);
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
        // Partner doesn't exist, select first one
        setSelectedPartnerForEdit(partners[0].id);
        console.warn('⚠️ Selected partner not found in list, selecting different partner:', partners[0].name);
      }
    }
  }, [partners, editingTransactionId, selectedPartnerForEdit]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const handleStartEdit = (transaction: TransactionResult) => {
    if (!transaction.id) return;
    setEditingTransactionId(transaction.id);
    
    // Check if partner exists in partners list
    const partnerExists = partners.find(p => p.id === transaction.partnerId);
    if (partnerExists) {
      setSelectedPartnerForEdit(transaction.partnerId);
    } else {
      // If partner doesn't exist (e.g. changed role), select first partner from list
      if (partners.length > 0) {
        setSelectedPartnerForEdit(partners[0].id);
        console.warn('⚠️ Original partner not found in list, selecting different partner:', {
          originalPartnerId: transaction.partnerId,
          originalPartnerName: transaction.partnerName,
          selectedPartner: partners[0].name
        });
      } else {
        setSelectedPartnerForEdit('');
        console.error('❌ No partners in system');
      }
    }
    
    // Check if boss exists in bosses list
    if (transaction.bossId) {
      const bossExists = bosses.find(b => b.id === transaction.bossId);
      if (bossExists) {
        setSelectedBossForEdit(transaction.bossId);
      } else {
        // If boss doesn't exist, select first boss from list
        if (bosses.length > 0) {
          setSelectedBossForEdit(bosses[0].id);
          console.warn('⚠️ Original boss not found in list, selecting different boss:', {
            originalBossId: transaction.bossId,
            originalBossName: transaction.bossName,
            selectedBoss: bosses[0].name
          });
        } else {
          setSelectedBossForEdit('');
          console.error('❌ No bosses in system');
        }
      }
    } else if (bosses.length > 0) {
      // If no bossId in old transaction, select first boss
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
      console.error('❌ Missing onUpdateTransaction or selectedPartnerForEdit');
      return;
    }
    
    const selectedPartner = partners.find(p => p.id === selectedPartnerForEdit);
    const selectedBoss = bosses.find(b => b.id === selectedBossForEdit);
    
    if (selectedPartner) {
      console.log('✏️ Updating transaction:', { 
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
      console.error('❌ Partner not found:', {
        searchedId: selectedPartnerForEdit,
        availablePartners: partners.map(p => ({ id: p.id, name: p.name })),
        partnersCount: partners.length
      });
      alert(`Error: Partner not found. Please refresh the page and try again.\n\nAvailable partners: ${partners.length > 0 ? partners.map(p => p.name).join(', ') : 'No partners in system'}`);
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
  const totalEcoBrothers = filteredTransactions.reduce((sum, t) => sum + t.ecobrothersShare, 0);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/5">
             <TrendingUp className="text-slate-600" size={28} />
        </div>
        <p className="text-base sm:text-lg text-slate-300 font-medium">No saved transactions</p>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">Your history is currently empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fadeIn">
      {/* Filter by partner - only for manager */}
      {userRole === 'boss' && uniquePartners.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 text-sm font-medium">Filter by Partner</span>
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
              All ({transactions.length})
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
          <p className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Total Partners</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{formatMoney(totalEli)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-3 sm:p-4 md:p-5 rounded-2xl border border-indigo-500/10 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full"></div>
          <p className="text-indigo-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Total {ecobrothersName}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">{formatMoney(totalEcoBrothers)}</p>
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
                <col style={{ width: '90px' }} />
                <col style={{ width: '60px' }} />
              </>
            )}
            <col style={{ width: '80px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '150px' }} />
          </colgroup>
          <thead className="text-xs md:text-sm text-slate-400 uppercase bg-slate-900/80 font-bold tracking-wider">
            <tr>
              <th className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap">Date</th>
              <th className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap">Client</th>
              {userRole === 'boss' && (
                <>
                  <th className="px-3 py-3 md:px-4 md:py-4 text-purple-400/80 whitespace-nowrap">Partner</th>
                  <th className="px-3 py-3 md:px-4 md:py-4 text-yellow-400/80 whitespace-nowrap">EcoBrothers</th>
                  <th className="px-3 py-3 md:px-4 md:py-4 text-slate-400/80 whitespace-nowrap">Actions</th>
                  <th className="px-3 py-3 md:px-4 md:py-4 text-red-400/80 whitespace-nowrap">Delete</th>
                </>
              )}
              <th className="px-3 py-3 md:px-4 md:py-4 text-emerald-400/80 whitespace-nowrap text-center">Paid</th>
              <th className="px-3 py-3 md:px-4 md:py-4 text-cyan-400/80 whitespace-nowrap">Partner Share</th>
              <th className="px-3 py-3 md:px-4 md:py-4 text-indigo-400/80 whitespace-nowrap">EcoBrothers Share</th>
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
                  <div className="flex items-center gap-2 cursor-pointer hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); setSelectedTransactionForDetails(t); }} title="Click for details">
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
                            <option value="" className="bg-slate-900">No partners</option>
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
                          <span className="truncate">{t.partnerName || 'Unknown'}</span>
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
                            <option value="" className="bg-slate-900">No bosses</option>
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
                          <span className="truncate">{t.bossName || 'Unknown'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {onUpdateTransaction ? (
                        editingTransactionId === t.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => t.id && handleSaveEdit(t.id)}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(t); }}
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              title="Edit partner and boss"
                            >
                              <Pencil size={16} />
                            </button>
                            {onEditTransaction && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onEditTransaction(t); }}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit full transaction"
                              >
                                <FileEdit size={16} />
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      {onDeleteTransaction && t.id ? (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this transaction?')) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                  </>
                )}
                <td className="px-3 py-3 md:px-4 md:py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center items-center">
                    {onUpdatePaymentStatus && userRole === 'boss' ? (
                      <input
                        type="checkbox"
                        checked={t.isPaidToPartner || false}
                        onChange={(e) => {
                          if (t.id) {
                            onUpdatePaymentStatus(t.id, e.target.checked);
                          }
                        }}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                        title="Mark as paid to partner"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={t.isPaidToPartner || false}
                        disabled
                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 cursor-not-allowed opacity-50"
                        title={t.isPaidToPartner ? "Paid" : "Not paid"}
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 md:px-4 md:py-4 text-cyan-200 font-medium text-sm md:text-base" title={t.partnerName || 'Unknown'}>
                  <div className="flex flex-col">
                    <span className="text-cyan-300/70 text-xs mb-1 truncate">{t.partnerName || 'Unknown'}</span>
                    <span className="text-sm md:text-base font-semibold">{formatMoney(t.eliShare)}</span>
                  </div>
                </td>
                <td className="px-3 py-3 md:px-4 md:py-4 text-indigo-200 font-medium text-sm md:text-base" title={t.bossName || ecobrothersName}>
                  <div className="flex flex-col">
                    <span className="text-indigo-300/70 text-xs mb-1 truncate">{t.bossName || ecobrothersName}</span>
                    <span className="text-sm md:text-base font-semibold">{formatMoney(t.ecobrothersShare)}</span>
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
          Clear Activity History
        </button>
      </div>

      {/* Modal for displaying transaction details */}
      {selectedTransactionForDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTransactionForDetails(null)}>
          <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Info className="w-6 h-6 text-cyan-400" />
                  Transaction Details
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
              {/* Basic information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-sm mb-1">Client</p>
                  <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.customerName}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-400 text-sm mb-1">Date</p>
                  <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.date}</p>
                </div>
              </div>

              {/* Partner and EcoBrothers */}
              {userRole === 'boss' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <p className="text-purple-300 text-sm mb-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Partner
                    </p>
                    <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.partnerName || 'Unknown'}</p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-yellow-300 text-sm mb-1 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      EcoBrothers
                    </p>
                    <p className="text-white text-lg font-semibold">{selectedTransactionForDetails.bossName || ecobrothersName}</p>
                  </div>
                </div>
              )}

              {/* Amounts */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                <h3 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  Amounts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Revenue:</span>
                    <span className="text-white text-lg font-semibold">{formatMoney(selectedTransactionForDetails.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Expenses:</span>
                    <span className="text-red-400 text-lg font-semibold">-{formatMoney(selectedTransactionForDetails.totalExpenses)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-semibold">Net Profit:</span>
                      <span className="text-emerald-400 text-xl font-bold">{formatMoney(selectedTransactionForDetails.netProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed expenses */}
              {selectedTransactionForDetails.expenses && selectedTransactionForDetails.expenses.length > 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                  <h3 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-red-400" />
                    Detailed Expenses
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
                        <span className="text-slate-300 font-semibold">Total Expenses:</span>
                        <span className="text-red-400 text-lg font-bold">{formatMoney(selectedTransactionForDetails.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                  <h3 className="text-slate-300 text-lg font-semibold mb-2 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-red-400" />
                    Expenses
                  </h3>
                  <p className="text-slate-400 text-sm">No expense details available for this transaction</p>
                  <p className="text-slate-500 text-xs mt-2">Total Expenses: {formatMoney(selectedTransactionForDetails.totalExpenses)}</p>
                </div>
              )}

              {/* Split */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                <h3 className="text-slate-300 text-lg font-semibold mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-indigo-400" />
                  Split
                </h3>
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-cyan-300 font-medium">{selectedTransactionForDetails.partnerName || 'Partner'}</span>
                      <span className="text-cyan-300 text-sm">{selectedTransactionForDetails.eliPercentage}%</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{formatMoney(selectedTransactionForDetails.eliShare)}</p>
                  </div>
                  <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-indigo-300 font-medium">{selectedTransactionForDetails.bossName || ecobrothersName}</span>
                      <span className="text-indigo-300 text-sm">{selectedTransactionForDetails.ecobrothersPercentage}%</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{formatMoney(selectedTransactionForDetails.ecobrothersShare)}</p>
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