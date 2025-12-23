import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'partner' | 'boss'>('partner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name) {
          setError('נא להזין שם');
          setLoading(false);
          return;
        }
        await signup(email, password, name, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // הודעות שגיאה בעברית
      switch (err.code) {
        case 'auth/invalid-email':
          setError('כתובת אימייל לא תקינה');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('אימייל או סיסמה שגויים');
          break;
        case 'auth/email-already-in-use':
          setError('האימייל כבר קיים במערכת');
          break;
        case 'auth/weak-password':
          setError('הסיסמה חלשה מדי (לפחות 6 תווים)');
          break;
        case 'auth/invalid-credential':
          setError('פרטי התחברות שגויים');
          break;
        default:
          setError('שגיאה בהתחברות. נסה שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4">
            <LogIn className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            מחשבון שותפים
          </h1>
          <p className="text-slate-400 text-sm">
            {isSignup ? 'צור חשבון חדש' : 'התחבר לחשבונך'}
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <>
                {/* Name Input */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    שם מלא
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full input-premium rounded-xl py-3 px-4 text-white placeholder-slate-600 outline-none"
                    placeholder="ישראל ישראלי"
                    required={isSignup}
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                    תפקיד
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('partner')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        role === 'partner'
                          ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      שותף
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('boss')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        role === 'boss'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      בוס
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full input-premium rounded-xl py-3 px-4 text-white placeholder-slate-600 outline-none"
                placeholder="example@email.com"
                required
                dir="ltr"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                סיסמה
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input-premium rounded-xl py-3 px-4 pr-12 text-white placeholder-slate-600 outline-none"
                  placeholder="••••••••"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm text-center animate-fadeIn">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-xl shadow-cyan-900/20 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>מתחבר...</span>
                </>
              ) : (
                <>
                  {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
                  <span>{isSignup ? 'צור חשבון' : 'התחבר'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              {isSignup ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
            </button>
          </div>
        </div>

        {/* Demo Users Info */}
        <div className="mt-6 glass-panel rounded-xl p-4 text-center">
          <p className="text-slate-400 text-xs mb-2">💡 למשתמשים חדשים:</p>
          <p className="text-slate-500 text-[10px]">
            צור חשבון ראשון כ"בוס" כדי לראות את כל העסקאות
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

