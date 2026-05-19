import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Star, Play, Search, Filter, ChevronRight, Users, Award, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/PageHeader';

const categories = ['All', 'Interactive Labs', 'Frontend', 'Backend', 'Data Science', 'Design', 'DevOps', 'AI/ML'];

const modules = [
  { id: 'biology', title: '3D Human Cell Explorer', category: 'Interactive Labs', level: 'Beginner', progress: 0, rating: 4.9, students: '4.8k', duration: '2h', color: '#38bdf8', icon: '🧬', lessons: 1, locked: false, new: true, path: '/modules/biology' },
  { id: 'physics', title: 'Gravity & Motion Simulation', category: 'Interactive Labs', level: 'Intermediate', progress: 0, rating: 4.8, students: '5.2k', duration: '3h', color: '#fb923c', icon: '⚛️', lessons: 1, locked: false, new: true, path: '/modules/physics' },
  { id: 'cs', title: 'Data Structure Visualizer', category: 'Interactive Labs', level: 'Intermediate', progress: 0, rating: 5.0, students: '8.4k', duration: '4h', color: '#a78bfa', icon: '💻', lessons: 4, locked: false, new: true, path: '/modules/cs' },
  { id: 'math', title: 'Mathematics Interactive Lab', category: 'Interactive Labs', level: 'Intermediate', progress: 0, rating: 4.9, students: '3.6k', duration: '3h', color: '#818cf8', icon: '🧮', lessons: 1, locked: false, new: true, path: '/modules/math' },
  { id: 'chemistry', title: 'Chemistry Interactive Lab', category: 'Interactive Labs', level: 'Intermediate', progress: 0, rating: 4.8, students: '2.9k', duration: '3h', color: '#34d399', icon: '🧪', lessons: 1, locked: false, new: true, path: '/modules/chemistry' },
  { id: 'anatomy', title: '3D Human Anatomy Explorer', category: 'Interactive Labs', level: 'Advanced', progress: 0, rating: 5.0, students: '6.7k', duration: '4h', color: '#f87171', icon: '🫁', lessons: 1, locked: false, new: true, path: '/modules/anatomy' },
  { id: 1, title: 'React Mastery', category: 'Frontend', level: 'Intermediate', progress: 78, rating: 4.9, students: '12.4k', duration: '24h', color: '#6366f1', icon: '⚛️', lessons: 48, locked: false, new: false },
  { id: 2, title: 'Python AI & Machine Learning', category: 'AI/ML', level: 'Advanced', progress: 45, rating: 4.8, students: '9.1k', duration: '36h', color: '#22d3ee', icon: '🐍', lessons: 62, locked: false, new: true },
  { id: 3, title: 'UI/UX Design Systems', category: 'Design', level: 'Beginner', progress: 91, rating: 4.7, students: '7.8k', duration: '18h', color: '#a78bfa', icon: '🎨', lessons: 35, locked: false, new: false },
  { id: 4, title: 'Node.js & REST APIs', category: 'Backend', level: 'Intermediate', progress: 32, rating: 4.6, students: '11.2k', duration: '20h', color: '#10b981', icon: '🟢', lessons: 40, locked: false, new: false },
  { id: 5, title: 'Docker & Kubernetes', category: 'DevOps', level: 'Advanced', progress: 0, rating: 4.9, students: '5.3k', duration: '28h', color: '#f59e0b', icon: '🐳', lessons: 54, locked: true, new: true },
  { id: 6, title: 'TypeScript Deep Dive', category: 'Frontend', level: 'Intermediate', progress: 60, rating: 4.8, students: '8.7k', duration: '16h', color: '#06b6d4', icon: '📘', lessons: 30, locked: false, new: false },
  { id: 7, title: 'Data Visualization', category: 'Data Science', level: 'Beginner', progress: 0, rating: 4.5, students: '4.2k', duration: '12h', color: '#f43f5e', icon: '📊', lessons: 24, locked: false, new: false },
  { id: 8, title: 'GraphQL & Apollo', category: 'Backend', level: 'Advanced', progress: 0, rating: 4.7, students: '3.9k', duration: '22h', color: '#ec4899', icon: '🔗', lessons: 38, locked: true, new: true },
];

const levelColors = {
  Beginner: { bg: '#10b98122', text: '#10b981' },
  Intermediate: { bg: '#f59e0b22', text: '#f59e0b' },
  Advanced: { bg: '#ef444422', text: '#ef4444' },
};

export default function Modules() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const handleCardClick = (mod) => {
    if (mod.locked) return;
    if (mod.path) {
      navigate(mod.path);
    }
  };

  const filtered = modules.filter(m => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cardBg = isDark ? 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14]' : 'bg-white border-slate-200 hover:border-primary-200 hover:shadow-xl shadow-sm';
  const inputBg = isDark ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder-white/30' : 'bg-slate-100 border-transparent text-slate-900 placeholder-slate-400';
  const subText = isDark ? 'text-white/45' : 'text-slate-500';
  const text = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div>
      <PageHeader title="Learning Modules" subtitle="Explore 500+ expert-crafted courses to level up your skills">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all ${isDark ? 'border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.05]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
          <Filter size={14} /> Filter
        </button>
      </PageHeader>

      {/* Search + Categories */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search modules..."
            className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all ${inputBg}`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary-500 to-violet-600 text-white'
                  : isDark ? 'bg-white/[0.04] border border-white/[0.07] text-white/55 hover:text-white hover:bg-white/[0.08]' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
        >
          {filtered.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => handleCardClick(mod)}
              className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 relative shine-effect ${cardBg}`}
            >
              {/* Header */}
              <div className="relative h-32 flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${mod.color}22, ${mod.color}11)` }}>
                <span className="text-5xl float-animation">{mod.icon}</span>
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 30%, ${mod.color}30, transparent 70%)` }} />
                {mod.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Lock size={28} className="text-white/70" />
                  </div>
                )}
                {mod.new && !mod.locked && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-500 to-violet-600 text-white">NEW</span>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`text-sm font-semibold leading-tight ${text}`}>{mod.title}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: levelColors[mod.level].bg, color: levelColors[mod.level].text }}>
                    {mod.level}
                  </span>
                </div>

                <div className={`flex items-center gap-3 text-xs mb-3 ${subText}`}>
                  <span className="flex items-center gap-1"><Clock size={11} /> {mod.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {mod.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {mod.students}</span>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">{mod.rating}</span>
                </div>

                {mod.progress > 0 ? (
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${subText}`}>Progress</span>
                      <span className="text-xs font-semibold" style={{ color: mod.color }}>{mod.progress}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${mod.progress}%`, background: `linear-gradient(90deg, ${mod.color}, ${mod.color}88)` }} />
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 h-1.5" />
                )}

                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={mod.locked ? { background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' } : { background: mod.color + '22', color: mod.color }}
                >
                  {mod.locked ? (
                    <><Lock size={13} /> Unlock Course</>
                  ) : mod.progress > 0 ? (
                    <><Play size={13} /> Continue</>
                  ) : (
                    <><Play size={13} /> Start Course</>
                  )}
                  {!mod.locked && <ChevronRight size={13} />}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className={`text-lg font-semibold ${text}`}>No modules found</p>
          <p className={`text-sm mt-1 ${subText}`}>Try adjusting your search or filter</p>
        </motion.div>
      )}
    </div>
  );
}
