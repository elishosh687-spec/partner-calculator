import React from 'react';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex w-full bg-black/20 p-1.5 rounded-2xl mb-8 border border-white/5 backdrop-blur-sm">
      <button
        onClick={() => setActiveTab('history')}
        className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 text-sm font-bold ${
          activeTab === 'history'
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-black/20 border border-white/5 ring-1 ring-white/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        Previous Transactions
      </button>
      <button
        onClick={() => setActiveTab('calculator')}
        className={`flex-1 py-3 text-center rounded-xl transition-all duration-300 text-sm font-bold ${
          activeTab === 'calculator'
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-cyan-300 shadow-lg shadow-black/20 border border-white/5 ring-1 ring-white/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        New Calculator
      </button>
    </div>
  );
};

export default Tabs;