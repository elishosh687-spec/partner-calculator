import React, { useState } from 'react';
import { LogOut, Crown, User, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { userData, logout, updateUserName } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userData?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
      await logout();
    }
  };

  const handleStartEdit = () => {
    setNewName(userData?.name || '');
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewName(userData?.name || '');
  };

  const handleSaveName = async () => {
    if (!newName || newName.trim().length === 0) {
      alert('שם לא יכול להיות ריק');
      return;
    }

    if (newName.trim() === userData?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateUserName(newName.trim());
      setIsEditingName(false);
    } catch (error: any) {
      console.error('❌ שגיאה בעדכון שם:', error);
      alert(`שגיאה בעדכון השם: ${error.message || 'נסה שוב'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* User Info Bar */}
      <div className="flex justify-between items-center mb-4 px-2">
        {!isEditingName ? (
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
            <button
              onClick={handleStartEdit}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
              title="ערוך שם"
            >
              <Edit2 className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-500/30">
            {userData?.role === 'boss' ? (
              <Crown className="w-4 h-4 text-yellow-400" />
            ) : (
              <User className="w-4 h-4 text-cyan-400" />
            )}
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveName();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className="bg-transparent text-white text-sm font-medium outline-none border-none flex-1 min-w-[100px] max-w-[200px]"
              autoFocus
              disabled={isSaving}
            />
            <button
              onClick={handleSaveName}
              disabled={isSaving || !newName.trim()}
              className="p-1 hover:bg-green-500/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="שמור"
            >
              <Check className="w-3 h-3 text-green-400" />
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
              title="ביטול"
            >
              <X className="w-3 h-3 text-red-400" />
            </button>
          </div>
        )}
        
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