import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Calculator from './components/Calculator';
import HistoryView from './components/HistoryView';
import Login from './components/Login';
import { Tab, TransactionResult } from './types';
import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc,
  getDocs,
  Timestamp,
  where 
} from 'firebase/firestore';

const App: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);

  // טעינת עסקאות מ-Firebase + Realtime Listener
  useEffect(() => {
    if (!currentUser || !userData) {
      setTransactions([]);
      return;
    }

    console.log('📥 מתחבר ל-Firebase...', userData.role);
    
    // יצירת Query - אם בוס רואה הכל, שותף רק את שלו
    const baseQuery = collection(db, 'transactions');
    const q = userData.role === 'boss'
      ? query(baseQuery, orderBy('createdAt', 'desc'))
      : query(
          baseQuery,
          where('partnerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    // האזנה לשינויים בזמן אמת
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const loadedTransactions: TransactionResult[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedTransactions.push({
            id: doc.id,
            partnerId: data.partnerId,
            partnerName: data.partnerName,
            customerName: data.customerName,
            date: data.date,
            totalRevenue: data.totalRevenue,
            totalExpenses: data.totalExpenses,
            netProfit: data.netProfit,
            eliShare: data.eliShare,
            shimonShare: data.shimonShare,
            eliPercentage: data.eliPercentage,
            shimonPercentage: data.shimonPercentage,
          });
        });
        console.log('✅ טעינתי עסקאות מ-Firebase:', loadedTransactions.length);
        setTransactions(loadedTransactions);
      },
      (error) => {
        console.error('❌ שגיאה בטעינת עסקאות מ-Firebase:', error);
      }
    );

    // ניקוי - ביטול מנוי כאשר הקומפוננטה נסגרת
    return () => {
      console.log('🔌 מנתק חיבור מ-Firebase...');
      unsubscribe();
    };
  }, [currentUser, userData]);

  const handleSaveTransaction = async (transaction: TransactionResult) => {
    if (!currentUser || !userData) {
      alert('עליך להתחבר כדי לשמור עסקה');
      return;
    }

    try {
      console.log('💾 שומר עסקה ב-Firebase...', transaction);
      
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        partnerId: currentUser.uid,
        partnerName: userData.name,
        createdAt: Timestamp.now()
      });
      
      console.log('✅ עסקה נשמרה בהצלחה ב-Firebase');
    } catch (error) {
      console.error('❌ שגיאה בשמירת עסקה:', error);
      alert('שגיאה בשמירת העסקה. בדוק את החיבור ל-Firebase.');
    }
  };

  const handleClearHistory = async () => {
    if (!currentUser || !userData) return;

    const confirmMessage = userData.role === 'boss'
      ? 'האם אתה בטוח שברצונך למחוק את כל ההיסטוריה של כל השותפים?'
      : 'האם אתה בטוח שברצונך למחוק את כל ההיסטוריה שלך?';

    if (confirm(confirmMessage)) {
      try {
        console.log('🗑️ מוחק עסקאות מ-Firebase...');
        
        // אם שותף - מחיקה רק של העסקאות שלו
        const baseQuery = collection(db, 'transactions');
        const q = userData.role === 'boss'
          ? baseQuery
          : query(baseQuery, where('partnerId', '==', currentUser.uid));
        
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        console.log('✅ העסקאות נמחקו מ-Firebase');
      } catch (error) {
        console.error('❌ שגיאה במחיקת עסקאות:', error);
        alert('שגיאה במחיקת ההיסטוריה. נסה שוב.');
      }
    }
  };

  // אם המשתמש לא מחובר - הצג דף התחברות
  if (!currentUser || !userData) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-8">
      <div className="w-full max-w-lg mx-auto">
        <Header />
        
        <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="animate-fadeIn">
              {activeTab === 'calculator' ? (
                userData.role === 'boss' ? (
                  <Calculator onSave={handleSaveTransaction} currentUserId={currentUser.uid} />
                ) : (
                  <div className="text-center py-12 sm:py-16 md:py-20">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/5">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <p className="text-base sm:text-lg text-slate-300 font-medium">רק המנהל יכול להזין עסקאות</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">פנה למנהל להזנת עסקה חדשה</p>
                  </div>
                )
              ) : (
                <HistoryView 
                  transactions={transactions} 
                  onClearHistory={handleClearHistory}
                  userRole={userData.role}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 sm:mt-8 md:mt-10 text-slate-600/50 text-[9px] sm:text-[10px] uppercase tracking-widest font-light">
          <p>© 2025 Premium Partner Calc</p>
        </div>
      </div>
    </div>
  );
};

export default App;