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
  where,
  updateDoc,
  doc
} from 'firebase/firestore';

const App: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<TransactionResult | null>(null);

  // Load transactions from Firebase + Realtime Listener
  useEffect(() => {
    if (!currentUser || !userData) {
      setTransactions([]);
      return;
    }

    console.log('📥 Connecting to Firebase...', userData.role);
    
    // Create Query - if boss sees all, partner only sees their own
    const baseQuery = collection(db, 'transactions');
    const q = userData.role === 'boss'
      ? query(baseQuery, orderBy('createdAt', 'desc'))
      : query(
          baseQuery,
          where('partnerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

    // Listen to real-time changes
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const loadedTransactions: TransactionResult[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedTransactions.push({
            id: doc.id,
            partnerId: data.partnerId,
            partnerName: data.partnerName,
            bossId: data.bossId,
            bossName: data.bossName,
            customerName: data.customerName,
            date: data.date,
            totalRevenue: data.totalRevenue,
            totalExpenses: data.totalExpenses,
            netProfit: data.netProfit,
            eliShare: data.eliShare,
            ecobrothersShare: data.ecobrothersShare || data.shimonShare || 0, // Support legacy data
            eliPercentage: data.eliPercentage,
            ecobrothersPercentage: data.ecobrothersPercentage || data.shimonPercentage || 0, // Support legacy data
            expenses: data.expenses || [], // Load detailed expenses list
            isPaidToPartner: data.isPaidToPartner || false,
          });
        });
        console.log('✅ Loaded transactions from Firebase:', loadedTransactions.length);
        setTransactions(loadedTransactions);
      },
      (error) => {
        console.error('❌ Error loading transactions from Firebase:', error);
      }
    );

    // Cleanup - unsubscribe when component unmounts
    return () => {
      console.log('🔌 Disconnecting from Firebase...');
      unsubscribe();
    };
  }, [currentUser, userData]);

  const handleSaveTransaction = async (transaction: TransactionResult) => {
    if (!currentUser || !userData) {
      alert('You must be logged in to save a transaction');
      return;
    }

    try {
      // If there's an id, this is an update to an existing transaction
      if (transaction.id) {
        console.log('✏️ Updating existing transaction in Firebase...', transaction);
        
        const { id, ...updateData } = transaction;
        await updateDoc(doc(db, 'transactions', id), {
          ...updateData,
          // Don't update createdAt - keep the original date
        });
        
        console.log('✅ Transaction updated successfully in Firebase');
        setEditingTransaction(null); // End edit mode
        return;
      }

      // Otherwise, this is a new transaction
      console.log('💾 Saving new transaction to Firebase...', transaction);
      console.log('📋 Transaction details:', {
        partnerId: transaction.partnerId,
        partnerName: transaction.partnerName,
        customerName: transaction.customerName,
        hasAllFields: !!(
          transaction.partnerId && 
          transaction.partnerName && 
          transaction.customerName &&
          transaction.date &&
          transaction.totalRevenue !== undefined &&
          transaction.totalExpenses !== undefined &&
          transaction.netProfit !== undefined &&
          transaction.eliShare !== undefined &&
          transaction.ecobrothersShare !== undefined &&
          transaction.eliPercentage !== undefined &&
          transaction.ecobrothersPercentage !== undefined
        )
      });
      
      // If the transaction already contains partnerId and partnerName (from selected partner), use them
      // Otherwise, use current user values (only for partner creating transaction for themselves)
      const transactionData = {
        ...transaction,
        // partnerId and partnerName already exist in transaction from partner selected in Calculator
        // Don't overwrite them so boss doesn't appear as partner in table
        createdAt: Timestamp.now()
      };
      
      console.log('📤 Sending to Firebase:', transactionData);
      
      await addDoc(collection(db, 'transactions'), transactionData);
      
      console.log('✅ Transaction saved successfully to Firebase');
    } catch (error: any) {
      console.error('❌ Error saving transaction:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      alert(`Error saving transaction: ${error.message || 'Check Firebase connection'}`);
    }
  };

  const handleUpdateTransaction = async (transactionId: string, newPartnerId: string, newPartnerName: string, newBossId?: string, newBossName?: string) => {
    if (!currentUser || !userData || userData.role !== 'boss') {
      alert('Only the manager can update transactions');
      return;
    }

    try {
      console.log('✏️ Updating transaction in Firebase...', { transactionId, newPartnerId, newPartnerName, newBossId, newBossName });
      
      const updateData: any = {
        partnerId: newPartnerId,
        partnerName: newPartnerName
      };
      
      if (newBossId && newBossName) {
        updateData.bossId = newBossId;
        updateData.bossName = newBossName;
      }
      
      await updateDoc(doc(db, 'transactions', transactionId), updateData);
      
      console.log('✅ Transaction updated successfully in Firebase');
      // Update will be reflected automatically via onSnapshot
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      alert(`Error updating transaction: ${error.message || 'Check Firebase connection'}`);
    }
  };

  const handleUpdatePaymentStatus = async (transactionId: string, isPaid: boolean) => {
    if (!currentUser || !userData || userData.role !== 'boss') {
      alert('Only the manager can update payment status');
      return;
    }

    try {
      console.log('✏️ Updating payment status in Firebase...', { transactionId, isPaid });
      
      await updateDoc(doc(db, 'transactions', transactionId), {
        isPaidToPartner: isPaid
      });
      
      console.log('✅ Payment status updated successfully in Firebase');
      // Update will be reflected automatically via onSnapshot
    } catch (error: any) {
      console.error('❌ Error updating payment status:', error);
      alert(`Error updating payment status: ${error.message || 'Check Firebase connection'}`);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!currentUser || !userData) return;

    try {
      console.log('🗑️ Deleting transaction from Firebase...', transactionId);
      await deleteDoc(doc(db, 'transactions', transactionId));
      console.log('✅ Transaction deleted from Firebase');
    } catch (error: any) {
      console.error('❌ Error deleting transaction:', error);
      alert(`Error deleting transaction: ${error.message || 'Try again'}`);
    }
  };

  const handleEditTransaction = (transaction: TransactionResult) => {
    setEditingTransaction(transaction);
    setActiveTab('calculator');
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleUpdateFullTransaction = async (transaction: TransactionResult) => {
    if (!currentUser || !userData || !editingTransaction?.id) return;

    try {
      console.log('✏️ Updating full transaction in Firebase...', transaction);
      
      await updateDoc(doc(db, 'transactions', editingTransaction.id), {
        partnerId: transaction.partnerId,
        partnerName: transaction.partnerName,
        customerName: transaction.customerName,
        date: transaction.date,
        totalRevenue: transaction.totalRevenue,
        totalExpenses: transaction.totalExpenses,
        netProfit: transaction.netProfit,
        eliShare: transaction.eliShare,
        ecobrothersShare: transaction.ecobrothersShare,
        eliPercentage: transaction.eliPercentage,
        ecobrothersPercentage: transaction.ecobrothersPercentage,
        isPaidToPartner: transaction.isPaidToPartner || false,
      });
      
      console.log('✅ Transaction updated successfully in Firebase');
      setEditingTransaction(null);
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error);
      alert(`Error updating transaction: ${error.message || 'Check Firebase connection'}`);
    }
  };

  const handleClearHistory = async () => {
    if (!currentUser || !userData) return;

    const confirmMessage = userData.role === 'boss'
      ? 'Are you sure you want to delete all history for all partners?'
      : 'Are you sure you want to delete all your history?';

    if (confirm(confirmMessage)) {
      try {
        console.log('🗑️ Deleting transactions from Firebase...');
        
        // If partner - delete only their transactions
        const baseQuery = collection(db, 'transactions');
        const q = userData.role === 'boss'
          ? baseQuery
          : query(baseQuery, where('partnerId', '==', currentUser.uid));
        
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        console.log('✅ Transactions deleted from Firebase');
      } catch (error) {
        console.error('❌ Error deleting transactions:', error);
        alert('Error deleting history. Try again.');
      }
    }
  };

  // If user is not logged in - show login page
  if (!currentUser || !userData) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-8">
      <div className={`w-full mx-auto ${activeTab === 'calculator' ? 'max-w-lg' : 'max-w-7xl'}`}>
        <Header />
        
        <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="animate-fadeIn">
              {activeTab === 'calculator' ? (
                userData.role === 'boss' ? (
                  <Calculator 
                    onSave={handleSaveTransaction} 
                    currentUserId={currentUser.uid}
                    editingTransaction={editingTransaction}
                    onCancelEdit={handleCancelEdit}
                  />
                ) : (
                  <div className="text-center py-12 sm:py-16 md:py-20">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-white/5">
                      <span className="text-3xl">🔒</span>
                    </div>
                    <p className="text-base sm:text-lg text-slate-300 font-medium">Only the manager can enter transactions</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">Contact the manager to enter a new transaction</p>
                  </div>
                )
              ) : (
                <HistoryView 
                  transactions={transactions} 
                  onClearHistory={handleClearHistory}
                  onUpdateTransaction={userData.role === 'boss' ? handleUpdateTransaction : undefined}
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditTransaction={userData.role === 'boss' ? handleEditTransaction : undefined}
                  onUpdatePaymentStatus={userData.role === 'boss' ? handleUpdatePaymentStatus : undefined}
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