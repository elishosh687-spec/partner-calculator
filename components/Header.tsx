import React from 'react';
import { LogOut, Crown, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
      await logout();
    }
  };

  return (
    <div className="relative">
      {/* User Info Bar */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          {userData?.role === 'boss' ? (
            <Crown className="w-4 h-4 text-yellow-400" />
          ) : (
            <User className="w-4 h-4 text-cyan-400" />
          )}
          <span className="text-white text-sm font-medium">{userData?.name}</span>
          {userData?.role === 'boss' && (
            <span className="text-[10px] text-yellow-400/80 font-bold uppercase">מנהל</span>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 px-4 py-2 rounded-full transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">יציאה</span>
        </button>
      </div>

      {/* Main Header */}
      <div className="text-center py-6 sm:py-8 md:py-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 tracking-tight drop-shadow-2xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 filter drop-shadow-lg">
            מחשבון שותפים
          </span>
        </h1>
        <p className="text-slate-400/80 text-sm sm:text-base md:text-lg font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase">
          ניהול עסקאות והכנסות
        </p>
      </div>
    </div>
  );
};

export default Header;