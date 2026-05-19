import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const { isDark } = useTheme();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const containerBg = isDark
    ? 'bg-[#020314] text-white'
    : 'bg-slate-50 text-slate-900';

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.08] backdrop-blur-xl'
    : 'bg-white border-slate-200/80 shadow-xl backdrop-blur-xl';

  const inputBg = isDark
    ? 'bg-white/[0.05] border-white/[0.1] text-white focus:border-primary-500/50'
    : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-primary-400';

  const subText = isDark ? 'text-white/50' : 'text-slate-500';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      // Handled by AuthContext error state
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      // Handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden ${containerBg}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Decorative Orbs */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />
        </>
      )}

      {/* Grid Bg */}
      {isDark && <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full max-w-md rounded-3xl border p-8 relative z-10 ${cardBg}`}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center glow-primary">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">EduVerse</span>
            <span className={`text-sm font-semibold ${subText}`}>AI</span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            {isRegister ? 'Create your platform account' : 'Welcome back, Learner!'}
          </h2>
          <p className={`text-sm mt-1.5 ${subText}`}>
            {isRegister ? 'Start your customized AI-powered learning quest today' : 'Sign in to access your modules & dashboards'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2"
          >
            <span>⚠️</span>
            <p className="flex-1">{error}</p>
            <button onClick={clearError} className="hover:opacity-80">×</button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Full Name"
                className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${inputBg}`}
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email Address"
              className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${inputBg}`}
            />
          </div>

          <div className="relative">
            <Lock size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition-all ${inputBg}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold text-sm hover:opacity-95 transition-opacity glow-primary hover:scale-[1.01]"
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/[0.08] dark:border-white/[0.08] border-slate-200"></div>
          <span className={`flex-shrink mx-4 text-xs font-semibold ${subText}`}>OR</span>
          <div className="flex-grow border-t border-white/[0.08] dark:border-white/[0.08] border-slate-200"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border font-semibold text-sm transition-all ${
            isDark
              ? 'border-white/[0.1] text-white hover:bg-white/[0.05]'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              clearError();
            }}
            className={`text-xs font-semibold hover:underline transition-colors ${
              isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
