import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, Save, Calculator as CalcIcon, Wallet, Calendar, User, Users, X, Crown } from 'lucide-react';
import { Expense, TransactionResult } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface CalculatorProps {
  onSave: (transaction: TransactionResult) => void;
  currentUserId: string;
  editingTransaction?: TransactionResult | null;
  onCancelEdit?: () => void;
}

interface Partner {
  id: string;
  name: string;
}

interface Boss {
  id: string;
  name: string;
}

const Calculator: React.FC<CalculatorProps> = ({ onSave, currentUserId, editingTransaction, onCancelEdit }) => {
  const { userData } = useAuth();
  
  // Helper to get EcoBrothers name
  const getEcoBrothersName = () => {
    return bosses.find(b => b.id === selectedBossId)?.name || 'EcoBrothers';
  };
  
  // Partners list
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [loadingPartners, setLoadingPartners] = useState(true);
  
  // Bosses list
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [selectedBossId, setSelectedBossId] = useState<string>('');
  const [loadingBosses, setLoadingBosses] = useState(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [totalRevenue, setTotalRevenue] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Percentages
  const [eliPercent, setEliPercent] = useState<number>(20);
  const [ecobrothersPercent, setEcobrothersPercent] = useState<number>(80);
  
  // Payment status (only for boss)
  const [isPaidToPartner, setIsPaidToPartner] = useState<boolean>(false);

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Result State
  const [result, setResult] = useState<TransactionResult | null>(null);

  // טעינת נתוני עסקה לעריכה
  useEffect(() => {
    if (editingTransaction) {
      setCustomerName(editingTransaction.customerName);
      setTotalRevenue(editingTransaction.totalRevenue.toString());
      setDate(editingTransaction.date);
      setEliPercent(editingTransaction.eliPercentage);
      setEcobrothersPercent(editingTransaction.ecobrothersPercentage);
      setIsPaidToPartner(editingTransaction.isPaidToPartner || false);
      
      // טעינת הוצאות אם יש
      if (editingTransaction.expenses && editingTransaction.expenses.length > 0) {
        setExpenses(editingTransaction.expenses);
      } else {
        setExpenses([]);
      }
      
      // בדיקה אם השותף המקורי קיים ברשימה
      const originalPartnerExists = partners.some(p => p.id === editingTransaction.partnerId);
        if (originalPartnerExists) {
          setSelectedPartnerId(editingTransaction.partnerId);
        } else {
          // If original partner not found, select first partner from list
          if (partners.length > 0) {
            console.warn(`⚠️ Original partner (${editingTransaction.partnerId}) not found in list. Selecting new partner: ${partners[0].name}`);
            setSelectedPartnerId(partners[0].id);
          } else {
            console.warn('⚠️ No partners available');
            setSelectedPartnerId('');
          }
        }
        
        // Check if original boss exists in list
        if (editingTransaction.bossId) {
          const originalBossExists = bosses.some(b => b.id === editingTransaction.bossId);
          if (originalBossExists) {
            setSelectedBossId(editingTransaction.bossId);
          } else {
            // If original boss not found, select first boss from list
            if (bosses.length > 0) {
              console.warn(`⚠️ Original boss (${editingTransaction.bossId}) not found in list. Selecting new boss: ${bosses[0].name}`);
              setSelectedBossId(bosses[0].id);
            } else {
              console.warn('⚠️ No bosses available');
              setSelectedBossId('');
            }
          }
        } else if (bosses.length > 0) {
          // If no bossId in old transaction, select first boss
          setSelectedBossId(bosses[0].id);
        }
      
      // Recalculate to display the result
      const revenue = editingTransaction.totalRevenue;
      const net = revenue - editingTransaction.totalExpenses;
      setResult({
        ...editingTransaction,
        netProfit: net,
        eliShare: net * (editingTransaction.eliPercentage / 100),
        ecobrothersShare: net * (editingTransaction.ecobrothersPercentage / 100),
      });
    } else {
      // If no editingTransaction, reset expenses
      setExpenses([]);
      setIsPaidToPartner(false);
    }
  }, [editingTransaction, partners, bosses]);

  // Load partners from Firestore
  useEffect(() => {
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
        if (partnersList.length > 0) {
          setSelectedPartnerId(partnersList[0].id);
        }
      } catch (error) {
        console.error('❌ Error loading partners:', error);
      } finally {
        setLoadingPartners(false);
      }
    };

    loadPartners();
  }, [editingTransaction]);

  // Load bosses from Firestore
  useEffect(() => {
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
        
        setBosses(bossesList);
        if (bossesList.length > 0 && !editingTransaction) {
          setSelectedBossId(bossesList[0].id);
        }
      } catch (error) {
        console.error('❌ Error loading bosses:', error);
      } finally {
        setLoadingBosses(false);
      }
    };

    loadBosses();
  }, [editingTransaction]);

  // Calculate percentages dynamically
  const handleEliChange = (val: string) => {
    const v = Math.min(100, Math.max(0, Number(val)));
    setEliPercent(v);
    setShimonPercent(100 - v);
  };

  const handleEcobrothersChange = (val: string) => {
    const v = Math.min(100, Math.max(0, Number(val)));
    setEcobrothersPercent(v);
    setEliPercent(100 - v);
  };

  // Expenses Logic
  const addExpense = () => {
    if (!newExpenseName || !newExpenseAmount) return;
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      name: newExpenseName,
      amount: parseFloat(newExpenseAmount),
    };
    setExpenses([...expenses, expense]);
    setNewExpenseName('');
    setNewExpenseAmount('');
    setIsAddingExpense(false);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculation Logic
  const handleCalculate = () => {
    if (!selectedPartnerId) {
      alert('Please select a partner');
      return;
    }

    if (!selectedBossId) {
      alert('Please select EcoBrothers');
      return;
    }

    const revenue = parseFloat(totalRevenue) || 0;
    const net = revenue - totalExpenses;
    const selectedPartner = partners.find(p => p.id === selectedPartnerId);
    const selectedBoss = bosses.find(b => b.id === selectedBossId);
    
    const res: TransactionResult = {
      // Save id if this is an edit
      ...(editingTransaction?.id && { id: editingTransaction.id }),
      partnerId: selectedPartnerId,
      partnerName: selectedPartner?.name || 'Partner',
      bossId: selectedBossId,
      bossName: selectedBoss?.name || 'EcoBrothers',
      customerName: customerName || 'Walk-in Customer',
      date,
      totalRevenue: revenue,
      totalExpenses,
      netProfit: net,
      eliPercentage: eliPercent,
      ecobrothersPercentage: ecobrothersPercent,
      eliShare: net * (eliPercent / 100),
      ecobrothersShare: net * (ecobrothersPercent / 100),
      expenses: expenses, // Save detailed expenses list
      isPaidToPartner: isPaidToPartner,
    };

    setResult(res);
    console.log('✅ Calculation completed:', res);
  };

  const handleReset = () => {
    setCustomerName('');
    setTotalRevenue('');
    setDate(new Date().toISOString().split('T')[0]);
    setExpenses([]);
    setResult(null);
    setEliPercent(20);
    setEcobrothersPercent(80);
    setIsPaidToPartner(false);
    if (partners.length > 0) {
      setSelectedPartnerId(partners[0].id);
    }
    if (bosses.length > 0) {
      setSelectedBossId(bosses[0].id);
    }
    // אם יש editingTransaction, נבטל את מצב העריכה
    if (editingTransaction && onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleSave = () => {
    if (result) {
      onSave(result);
      if (!editingTransaction) {
        handleReset();
      }
    }
  };

  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  if (loadingPartners || loadingBosses) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 mt-4">Loading data...</p>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
          <Users className="text-slate-600" size={28} />
        </div>
        <p className="text-base text-slate-300 font-medium">No partners in system</p>
        <p className="text-xs text-slate-500 mt-2">Need to add partners to create transactions</p>
      </div>
    );
  }

  if (bosses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
          <Users className="text-slate-600" size={28} />
        </div>
        <p className="text-base text-slate-300 font-medium">No EcoBrothers in system</p>
        <p className="text-xs text-slate-500 mt-2">Need to add EcoBrothers to create transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Partner Selection */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4 sm:p-5 rounded-2xl border border-white/10">
        <label className="block text-slate-300 text-sm font-bold mb-3 flex items-center gap-2">
          <Users size={18} />
          Select Partner for Transaction
        </label>
        <select
          value={selectedPartnerId}
          onChange={(e) => setSelectedPartnerId(e.target.value)}
          className="w-full input-premium rounded-xl py-3 px-4 text-white text-lg font-medium outline-none appearance-none cursor-pointer"
          style={{ backgroundImage: 'none' }}
        >
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id} className="bg-slate-900">
              {partner.name}
            </option>
          ))}
        </select>
        <p className="text-slate-500 text-xs mt-2">Transaction will be assigned to {partners.find(p => p.id === selectedPartnerId)?.name}</p>
      </div>

      {/* Top Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <div className="relative group">
          <label className="block text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 pr-1">Customer Name</label>
          <div className="relative">
            <User className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full input-premium rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-600 outline-none"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="block text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 pr-1">Transaction Date</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full input-premium rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-600 outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="md:col-span-2 relative group">
          <label className="block text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 pr-1">Total Revenue</label>
          <div className="relative">
             <Wallet className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="number"
              value={totalRevenue}
              onChange={(e) => setTotalRevenue(e.target.value)}
              className="w-full input-premium rounded-xl py-2.5 sm:py-3 pr-10 pl-4 text-white text-base sm:text-lg font-medium placeholder-slate-600 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

      {/* Percentages */}
      <div>
        <h3 className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 pr-1">Percentage Split</h3>
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-3 sm:gap-4">
            <div className="flex-1 bg-black/40 rounded-xl p-3 sm:p-4 border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500/50"></div>
               <label className="block text-cyan-400 text-[10px] sm:text-xs mb-1 font-bold">
                 {partners.find(p => p.id === selectedPartnerId)?.name || 'Partner'}
               </label>
               <div className="flex items-baseline gap-1">
                 <input
                  type="number"
                  value={eliPercent}
                  onChange={(e) => handleEliChange(e.target.value)}
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white outline-none"
                 />
                 <span className="text-slate-500 text-xs sm:text-sm">%</span>
               </div>
            </div>
            <div className="flex-1 bg-black/40 rounded-xl p-3 sm:p-4 border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500/50"></div>
               <label className="block text-indigo-400 text-[10px] sm:text-xs mb-1 font-bold">{bosses.find(b => b.id === selectedBossId)?.name || 'EcoBrothers'}</label>
               <div className="flex items-baseline gap-1">
                 <input
                  type="number"
                  value={ecobrothersPercent}
                  onChange={(e) => handleEcobrothersChange(e.target.value)}
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white outline-none"
                 />
                 <span className="text-slate-500 text-xs sm:text-sm">%</span>
               </div>
            </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-slate-900/30 rounded-2xl p-4 sm:p-5 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
            Expenses and Deductions
          </h3>
          <button
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="text-cyan-400 text-xs font-bold uppercase tracking-wide hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus size={14} />
            Add New
          </button>
        </div>

        {isAddingExpense && (
          <div className="flex gap-3 mb-4 animate-fadeIn">
            <input
              type="text"
              placeholder="Description"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="flex-[2] bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={addExpense}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-cyan-900/20"
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        {expenses.length > 0 ? (
          <div className="space-y-2 mb-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center group">
                <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">{expense.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-red-300/80 text-sm font-mono">- ${expense.amount}</span>
                  <button onClick={() => removeExpense(expense.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <div className="h-px bg-slate-800 my-2"></div>
          </div>
        ) : (
          <p className="text-slate-600 text-xs mb-4 italic">No expenses entered</p>
        )}

        <div className="flex justify-between items-center text-sm">
           <span className="text-slate-500">Total Expenses</span>
           <span className="text-slate-200 font-medium">{formatMoney(totalExpenses)}</span>
        </div>
      </div>

      {/* Payment Status Checkbox (only for boss) */}
      {userData?.role === 'boss' && (
        <div className="bg-slate-900/30 rounded-2xl p-4 sm:p-5 border border-white/5">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPaidToPartner"
              checked={isPaidToPartner}
              onChange={(e) => setIsPaidToPartner(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="isPaidToPartner" className="text-slate-300 text-sm font-medium cursor-pointer">
              Paid to Partner
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons - Calculation */}
      <button
        onClick={handleCalculate}
        className="w-full relative overflow-hidden group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 sm:py-4 rounded-xl shadow-xl shadow-cyan-900/20 transition-all active:scale-[0.99]"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
        <div className="relative flex justify-center items-center gap-2 text-base sm:text-lg">
           <CalcIcon size={18} className="sm:w-5 sm:h-5" />
           Calculate
        </div>
      </button>

      {/* Result Area */}
      {result && (
        <div className="relative overflow-hidden bg-slate-900/80 rounded-2xl p-1 border border-white/10 mt-5 sm:mt-6 md:mt-8 shadow-2xl animate-fadeIn">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[50px] pointer-events-none"></div>
          
          <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6">
            <h4 className="text-center text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-5 md:mb-6">Split Results</h4>
            
            <div className="flex gap-px bg-slate-800/50 rounded-2xl overflow-hidden mb-4 sm:mb-5 md:mb-6 border border-white/5">
                <div className="flex-1 p-3 sm:p-4 md:p-5 text-center bg-gradient-to-b from-cyan-500/5 to-transparent">
                    <p className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase mb-1">
                      {partners.find(p => p.id === selectedPartnerId)?.name || 'Partner'}'s Share
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg">{formatMoney(result.eliShare)}</p>
                    <p className="text-slate-500 text-[9px] sm:text-[10px] mt-1">{result.eliPercentage}%</p>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="flex-1 p-3 sm:p-4 md:p-5 text-center bg-gradient-to-b from-indigo-500/5 to-transparent">
                    <p className="text-indigo-400 text-[10px] sm:text-xs font-bold uppercase mb-1">{getEcoBrothersName()}'s Share</p>
                    <p className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg">{formatMoney(result.ecobrothersShare)}</p>
                    <p className="text-slate-500 text-[9px] sm:text-[10px] mt-1">{result.ecobrothersPercentage}%</p>
                </div>
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 px-2">
              <div className="flex flex-col">
                <span>Net Profit</span>
                <span className="text-emerald-400 font-mono text-sm">{formatMoney(result.netProfit)}</span>
              </div>
              <div className="flex flex-col text-left">
                <span>Total Revenue</span>
                <span className="text-slate-300 font-mono text-sm">{formatMoney(result.totalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
        {editingTransaction && onCancelEdit ? (
          <button
            onClick={onCancelEdit}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 text-slate-400 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 hover:text-white"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Cancel Edit</span>
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 text-slate-400 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 hover:text-white"
          >
            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Reset</span>
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!result}
          className={`flex-1 font-bold py-2.5 sm:py-3 rounded-xl flex justify-center items-center gap-2 transition-all border text-sm sm:text-base ${
            result
              ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 shadow-lg shadow-emerald-900/20'
              : 'bg-slate-800/50 border-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
          {editingTransaction ? 'Update Transaction' : 'Save to Transactions'}
        </button>
      </div>
    </div>
  );
};

export default Calculator;