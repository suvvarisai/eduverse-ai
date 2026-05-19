import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, Menu, Zap, ChevronDown, User, LogOut, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

const notifications = [
  { id: 1, title: 'New quiz available', desc: 'Python Advanced Quiz is now live', time: '2m ago', color: '#6366f1' },
  { id: 2, title: 'Course completed!', desc: 'You finished React Fundamentals', time: '1h ago', color: '#22d3ee' },
  { id: 3, title: 'Achievement unlocked', desc: 'You earned the "Fast Learner" badge', time: '3h ago', color: '#a78bfa' },
];

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { toggleMobile } = useSidebar();
  const { user, logout, getUserInitials } = useAuth();
  const { progress } = useProgress();
  const navigate = useNavigate();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const navBg = isDark
    ? 'bg-[#060818]/80 border-white/[0.06]'
    : 'bg-white/80 border-slate-200/60';
  const inputBg = isDark ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder-white/30 focus:border-primary-500/50' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400 focus:border-primary-300';
  const dropBg = isDark ? 'bg-[#0d1224] border-white/[0.08]' : 'bg-white border-slate-200';
  const dropItem = isDark ? 'hover:bg-white/[0.05] text-white/70 hover:text-white' : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900';
  const iconBtn = isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.08]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100';
  const divider = isDark ? 'border-white/[0.06]' : 'border-slate-100';

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = user?.displayName || 'Learner';
  const displayEmail = user?.email || 'learner@eduverse.ai';
  const totalXp = progress?.totalXp || 1200;

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${navBg}`}>
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobile}
          className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${iconBtn}`}
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search courses, topics..."
            className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none transition-all duration-200 ${inputBg}`}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* XP Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isDark ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-yellow-50 border border-yellow-200'}`}>
            <Zap size={13} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{totalXp.toLocaleString()} XP</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all duration-200 ${iconBtn}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
              className={`p-2 rounded-xl transition-all duration-200 relative ${iconBtn}`}
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-transparent pulse-glow"></span>
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-12 w-80 rounded-2xl border shadow-2xl overflow-hidden ${dropBg}`}
                >
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</p>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${dropItem}`}>
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: n.color + '22' }}>
                        <Bell size={14} style={{ color: n.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{n.desc}</p>
                      </div>
                      <span className={`text-xs flex-shrink-0 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{n.time}</span>
                    </div>
                  ))}
                  <div className={`px-4 py-2.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                    <button className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">View all notifications</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
              className={`flex items-center gap-2 p-1 pl-1 pr-2 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/[0.08]' : 'hover:bg-slate-100'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {getUserInitials()}
              </div>
              <ChevronDown size={14} className={isDark ? 'text-white/40' : 'text-slate-400'} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 top-12 w-52 rounded-2xl border shadow-2xl overflow-hidden ${dropBg}`}
                >
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayName}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{displayEmail}</p>
                  </div>
                  
                  <button onClick={() => { setShowProfile(false); navigate('/settings'); }} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${dropItem}`}>
                    <User size={15} />
                    My Profile
                  </button>
                  <button onClick={() => setShowProfile(false)} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${dropItem}`}>
                    <HelpCircle size={15} />
                    Help Center
                  </button>
                  <button onClick={handleSignOut} className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors border-t ${divider} ${dropItem} text-red-500 hover:text-red-600`}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
