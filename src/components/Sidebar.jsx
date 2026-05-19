import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Brain, Settings, ChevronLeft, ChevronRight,
  Zap, Star, Trophy, Home, X, Sparkles
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#6366f1' },
  { path: '/modules', label: 'Learning Modules', icon: BookOpen, color: '#22d3ee' },
  { path: '/ai-assistant', label: 'AI Study Companion', icon: Sparkles, color: '#ec4899' },
  { path: '/quiz', label: 'Quiz Arena', icon: Brain, color: '#a78bfa' },
  { path: '/settings', label: 'Settings', icon: Settings, color: '#f59e0b' },
];

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const { isDark } = useTheme();

  const bg = isDark
    ? 'bg-[#060818] border-white/[0.06]'
    : 'bg-white/80 border-slate-200/60';
  const logoText = isDark ? 'text-white' : 'text-slate-900';
  const toggleBg = isDark ? 'bg-[#0d1224] hover:bg-[#141930] text-white/60 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800';

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      {/* Logo */}
      <div className="flex items-center px-4 mb-8 gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center glow-primary">
            <Zap size={18} className="text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full border-2 border-[#060818] pulse-glow"></span>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className={`text-xl font-bold gradient-text whitespace-nowrap`}>EduVerse</span>
              <span className={`text-xs font-medium whitespace-nowrap ml-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${isActive
                  ? isDark
                    ? 'bg-primary-500/15 text-white'
                    : 'bg-primary-50 text-primary-700'
                  : isDark
                    ? 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 rounded-xl opacity-100"
                      style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)` }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <div
                    className="relative z-10 flex-shrink-0 transition-all duration-200"
                    style={{ color: isActive ? item.color : undefined }}
                  >
                    <item.icon size={20} />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute right-3 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 mt-4">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-3 ${isDark ? 'bg-gradient-to-br from-primary-500/15 to-violet-500/10 border border-primary-500/15' : 'bg-gradient-to-br from-primary-50 to-violet-50 border border-primary-100'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} className="text-yellow-400" />
              <span className={`text-xs font-semibold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>PRO Plan</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-accent-400" style={{ width: '72%' }}></div>
            </div>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>72% of monthly quota used</p>
          </motion.div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-full mt-3 h-9 rounded-xl transition-all duration-200 ${toggleBg}`}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`hidden lg:flex flex-col h-screen sticky top-0 border-r backdrop-blur-xl flex-shrink-0 ${bg}`}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`lg:hidden fixed left-0 top-0 h-full w-64 z-50 border-r ${bg}`}
            >
              <button
                onClick={closeMobile}
                className="absolute top-4 right-4 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
