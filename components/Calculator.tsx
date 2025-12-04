import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, Save, Calculator as CalcIcon, Wallet, Calendar, User } from 'lucide-react';
import { Expense, TransactionResult } from '../types';
import supabaseClient from '../supabase';

interface CalculatorProps {
  onSave: (transaction: TransactionResult) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onSave }) => {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [totalRevenue, setTotalRevenue] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Percentages
  const [eliPercent, setEliPercent] = useState<number>(20);
  const [shimonPercent, setShimonPercent] = useState<number>(80);

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Result State
  const [result, setResult] = useState<TransactionResult | null>(null);

  // Supabase Realtime Subscription
  useEffect(() => {
    // יצירת מנוי Realtime להאזנה לשינויים בטבלת calculator_data
    const channel = supabaseClient
      .channel('calculator-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // האזנה לכל סוגי השינויים (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'calculator_data',
          filter: 'id=eq.1'
        },
        (payload: any) => {
          // כאשר מתקבל שינוי מהשותף, עדכן את התצוגה
          if (payload.new && payload.new.result) {
            try {
              const newResult = typeof payload.new.result === 'string' 
                ? JSON.parse(payload.new.result) 
                : payload.new.result;
              setResult(newResult);
            } catch (error) {
              console.error('שגיאה בעדכון התוצאה:', error);
            }
          }
        }
      )
      .subscribe();

    // ניקוי המנוי כאשר הקומפוננטה נסגרת
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // Calculate percentages dynamically
  const handleEliChange = (val: string) => {
    const v = Math.min(100, Math.max(0, Number(val)));
    setEliPercent(v);
    setShimonPercent(100 - v);
  };

  const handleShimonChange = (val: string) => {
    const v = Math.min(100, Math.max(0, Number(val)));
    setShimonPercent(v);
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
  const handleCalculate = async () => {
    const revenue = parseFloat(totalRevenue) || 0;
    const net = revenue - totalExpenses;
    
    const res: TransactionResult = {
      customerName: customerName || 'לקוח מזדמן',
      date,
      totalRevenue: revenue,
      totalExpenses,
      netProfit: net,
      eliPercentage: eliPercent,
      shimonPercentage: shimonPercent,
      eliShare: net * (eliPercent / 100),
      shimonShare: net * (shimonPercent / 100),
    };

    setResult(res);

    // שמירה ל-Supabase - עדכון השורה עם ID=1
    try {
      const { error } = await supabaseClient
        .from('calculator_data')
        .update({ result: res })
        .eq('id', 1);

      if (error) {
        console.error('שגיאה בשמירה ל-Supabase:', error);
        // אם השורה לא קיימת, ננסה ליצור אותה
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          const { error: insertError } = await supabaseClient
            .from('calculator_data')
            .insert({ id: 1, result: res });
          
          if (insertError) {
            console.error('שגיאה ביצירת שורה חדשה:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('שגיאה בשמירה ל-Supabase:', error);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setTotalRevenue('');
    setDate(new Date().toISOString().split('T')[0]);
    setExpenses([]);
    setResult(null);
    setEliPercent(20);
    setShimonPercent(80);
  };

  const handleSave = () => {
    if (result) {
      onSave(result);
      handleReset();
    }
  };

  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Top Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group">
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 pr-1">שם לקוח</label>
          <div className="relative">
            <User className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full input-premium rounded-xl py-3 pr-10 pl-4 text-white placeholder-slate-600 outline-none"
              placeholder="ישראל ישראלי"
            />
          </div>
        </div>

        <div className="relative group">
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 pr-1">תאריך עסקה</label>
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
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 pr-1">סך הכנסה</label>
          <div className="relative">
             <Wallet className="absolute right-3 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input
              type="number"
              value={totalRevenue}
              onChange={(e) => setTotalRevenue(e.target.value)}
              className="w-full input-premium rounded-xl py-3 pr-10 pl-4 text-white text-lg font-medium placeholder-slate-600 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

      {/* Percentages */}
      <div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 pr-1">חלוקת אחוזים</h3>
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 flex gap-4">
            <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500/50"></div>
               <label className="block text-cyan-400 text-xs mb-1 font-bold">אלי</label>
               <div className="flex items-baseline gap-1">
                 <input
                  type="number"
                  value={eliPercent}
                  onChange={(e) => handleEliChange(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                 />
                 <span className="text-slate-500 text-sm">%</span>
               </div>
            </div>
            <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500/50"></div>
               <label className="block text-indigo-400 text-xs mb-1 font-bold">שמעון</label>
               <div className="flex items-baseline gap-1">
                 <input
                  type="number"
                  value={shimonPercent}
                  onChange={(e) => handleShimonChange(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                 />
                 <span className="text-slate-500 text-sm">%</span>
               </div>
            </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-slate-900/30 rounded-2xl p-5 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
            הוצאות והפחתות
          </h3>
          <button
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="text-cyan-400 text-xs font-bold uppercase tracking-wide hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-full transition-colors"
          >
            <Plus size={14} />
            הוסף חדש
          </button>
        </div>

        {isAddingExpense && (
          <div className="flex gap-3 mb-4 animate-fadeIn">
            <input
              type="text"
              placeholder="תיאור"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="flex-[2] bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
            />
            <input
              type="number"
              placeholder="סכום"
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
                  <span className="text-red-300/80 text-sm font-mono">- {expense.amount} ₪</span>
                  <button onClick={() => removeExpense(expense.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <div className="h-px bg-slate-800 my-2"></div>
          </div>
        ) : (
          <p className="text-slate-600 text-xs mb-4 italic">לא הוזנו הוצאות</p>
        )}

        <div className="flex justify-between items-center text-sm">
           <span className="text-slate-500">סה"כ הוצאות</span>
           <span className="text-slate-200 font-medium">{formatMoney(totalExpenses)}</span>
        </div>
      </div>

      {/* Action Buttons - Calculation */}
      <button
        onClick={handleCalculate}
        className="w-full relative overflow-hidden group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-cyan-900/20 transition-all active:scale-[0.99]"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
        <div className="relative flex justify-center items-center gap-2 text-lg">
           <CalcIcon size={20} />
           בצע חישוב
        </div>
      </button>

      {/* Result Area */}
      {result && (
        <div className="relative overflow-hidden bg-slate-900/80 rounded-2xl p-1 border border-white/10 mt-8 shadow-2xl animate-fadeIn">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[50px] pointer-events-none"></div>
          
          <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-6">
            <h4 className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">תוצאות החלוקה</h4>
            
            <div className="flex gap-px bg-slate-800/50 rounded-2xl overflow-hidden mb-6 border border-white/5">
                <div className="flex-1 p-5 text-center bg-gradient-to-b from-cyan-500/5 to-transparent">
                    <p className="text-cyan-400 text-xs font-bold uppercase mb-1">חלקו של אלי</p>
                    <p className="text-3xl font-black text-white tracking-tight drop-shadow-lg">{formatMoney(result.eliShare)}</p>
                    <p className="text-slate-500 text-[10px] mt-1">{result.eliPercentage}%</p>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="flex-1 p-5 text-center bg-gradient-to-b from-indigo-500/5 to-transparent">
                    <p className="text-indigo-400 text-xs font-bold uppercase mb-1">חלקו של שמעון</p>
                    <p className="text-3xl font-black text-white tracking-tight drop-shadow-lg">{formatMoney(result.shimonShare)}</p>
                    <p className="text-slate-500 text-[10px] mt-1">{result.shimonPercentage}%</p>
                </div>
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 px-2">
              <div className="flex flex-col">
                <span>רווח נקי</span>
                <span className="text-emerald-400 font-mono text-sm">{formatMoney(result.netProfit)}</span>
              </div>
              <div className="flex flex-col text-left">
                <span>סך הכנסה</span>
                <span className="text-slate-300 font-mono text-sm">{formatMoney(result.totalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleReset}
          className="bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 text-slate-400 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 hover:text-white"
        >
          <RotateCcw size={16} />
          <span className="text-sm">איפוס</span>
        </button>
        <button
          onClick={handleSave}
          disabled={!result}
          className={`flex-1 font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all border ${
            result
              ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 shadow-lg shadow-emerald-900/20'
              : 'bg-slate-800/50 border-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Save size={18} />
          שמור לעסקאות
        </button>
      </div>
    </div>
  );
};

export default Calculator;