import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Calculator from './components/Calculator';
import HistoryView from './components/HistoryView';
import { Tab, TransactionResult } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const [transactions, setTransactions] = useState<TransactionResult[]>([]);

  const handleSaveTransaction = (transaction: TransactionResult) => {
    setTransactions([transaction, ...transactions]);
  };

  const handleClearHistory = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
      setTransactions([]);
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