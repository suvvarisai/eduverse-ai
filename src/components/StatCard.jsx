import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function StatCard({ title, value, subtitle, icon: Icon, color, gradient, trend, index = 0 }) {
  const { isDark } = useTheme();

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]'
    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-lg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3 }}
      className={`relative rounded-2xl border p-5 overflow-hidden cursor-default transition-all duration-300 shine-effect ${cardBg}`}
    >
      {/* Background gradient blob */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 blur-2xl"
        style={{ background: gradient }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: color + '22' }}
          >
            <Icon size={20} style={{ color }} />
          </div>

          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              trend >= 0
                ? 'bg-emerald-400/10 text-emerald-400'
                : 'bg-red-400/10 text-red-400'
            }`}>
              <TrendingUp size={11} className={trend < 0 ? 'rotate-180' : ''} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        <p className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{title}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${isDark ? 'text-white/35' : 'text-slate-400'}`}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
