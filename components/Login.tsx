import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Google Icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'partner' | 'boss'>('partner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, signInWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle(role);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('החלון נסגר לפני השלמת ההתחברות');
          break;
        case 'auth/cancelled-popup-request':
          setError('התהליך בוטל');
          break;
        case 'auth/popup-blocked':
          setError('החלון נחסם על ידי הדפדפן. אנא אפשר חלונות קופצים.');
          break;
        default:
          setError('שגיאה בהתחברות עם Google. נסה שוב.');
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">או</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                  <span>מתחבר...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>{isSignup ? 'הירשם' : 'התחבר'} עם Google</span>
                </>
              )}
            </button>

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

