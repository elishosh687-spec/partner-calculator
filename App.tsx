import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Calculator from './components/Calculator';
import HistoryView from './components/HistoryView';
import { Tab, TransactionResult } from './types';
import supabaseClient from './supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);

  // טעינת עסקאות מ-Supabase + Realtime Subscription
  useEffect(() => {
    console.log('📥 טוען עסקאות מ-Supabase...');
    
    // 1. טעינת עסקאות קיימות
    const loadTransactions = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ שגיאה בטעינת עסקאות:', error);
        } else if (data) {
          console.log('✅ טעינתי עסקאות:', data.length);
          // המרת הנתונים מ-Supabase ל-TransactionResult
          const formattedTransactions: TransactionResult[] = data.map((row: any) => ({
            customerName: row.customer_name,
            date: row.date,
            totalRevenue: parseFloat(row.total_revenue),
            totalExpenses: parseFloat(row.total_expenses),
            netProfit: parseFloat(row.net_profit),
            eliShare: parseFloat(row.eli_share),
            shimonShare: parseFloat(row.shimon_share),
            eliPercentage: parseFloat(row.eli_percentage),
            shimonPercentage: parseFloat(row.shimon_percentage),
          }));
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('❌ שגיאה בטעינת עסקאות:', error);
      }
    };

    loadTransactions();

    // 2. יצירת מנוי Realtime להאזנה לשינויים בטבלת transactions
    console.log('🔌 מתחבר ל-Supabase Realtime לעסקאות...');
    const channel = supabaseClient
      .channel('transactions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        async (payload: any) => {
          console.log('📨 קיבלתי עדכון על עסקאות:', payload);
          
          // רענון רשימת העסקאות
          const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            const formattedTransactions: TransactionResult[] = data.map((row: any) => ({
              customerName: row.customer_name,
              date: row.date,
              totalRevenue: parseFloat(row.total_revenue),
              totalExpenses: parseFloat(row.total_expenses),
              netProfit: parseFloat(row.net_profit),
              eliShare: parseFloat(row.eli_share),
              shimonShare: parseFloat(row.shimon_share),
              eliPercentage: parseFloat(row.eli_percentage),
              shimonPercentage: parseFloat(row.shimon_percentage),
            }));
            setTransactions(formattedTransactions);
          }
        }
      )
      .subscribe((status: string) => {
        console.log('📡 סטטוס Realtime subscription לעסקאות:', status);
      });

    return () => {
      console.log('🔌 מנתק חיבור Realtime לעסקאות...');
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const handleSaveTransaction = async (transaction: TransactionResult) => {
    try {
      console.log('💾 שומר עסקה ב-Supabase...', transaction);
      
      const { data, error } = await supabaseClient
        .from('transactions')
        .insert({
          customer_name: transaction.customerName,
          date: transaction.date,
          total_revenue: transaction.totalRevenue,
          total_expenses: transaction.totalExpenses,
          net_profit: transaction.netProfit,
          eli_share: transaction.eliShare,
          shimon_share: transaction.shimonShare,
          eli_percentage: transaction.eliPercentage,
          shimon_percentage: transaction.shimonPercentage,
        })
        .select();

      if (error) {
        console.error('❌ שגיאה בשמירת עסקה:', error);
        alert('שגיאה בשמירת העסקה. נסה שוב.');
      } else {
        console.log('✅ עסקה נשמרה בהצלחה:', data);
        // ה-Realtime subscription יעדכן את הרשימה אוטומטית
      }
    } catch (error) {
      console.error('❌ שגיאה בשמירת עסקה:', error);
      alert('שגיאה בשמירת העסקה. נסה שוב.');
    }
  };

  const handleClearHistory = async () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
      try {
        console.log('🗑️ מוחק את כל העסקאות...');
        
        const { error } = await supabaseClient
          .from('transactions')
          .delete()
          .neq('id', 0); // מחק הכל (תמיד נכון כי id > 0)

        if (error) {
          console.error('❌ שגיאה במחיקת עסקאות:', error);
          alert('שגיאה במחיקת ההיסטוריה. נסה שוב.');
        } else {
          console.log('✅ כל העסקאות נמחקו');
          setTransactions([]);
        }
      } catch (error) {
        console.error('❌ שגיאה במחיקת עסקאות:', error);
        alert('שגיאה במחיקת ההיסטוריה. נסה שוב.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto">
        <Header />
        
        <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="p-6 md:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="animate-fadeIn">
              {activeTab === 'calculator' ? (
                <Calculator onSave={handleSaveTransaction} />
              ) : (
                <HistoryView 
                  transactions={transactions} 
                  onClearHistory={handleClearHistory} 
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-10 text-slate-600/50 text-[10px] uppercase tracking-widest font-light">
          <p>© 2025 Premium Partner Calc</p>
        </div>
      </div>
    </div>
  );
};

export default App;