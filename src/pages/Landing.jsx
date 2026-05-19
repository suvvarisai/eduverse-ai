import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, BookOpen, Brain, Trophy, BarChart2, Globe, Shield, CheckCircle, Play, ChevronRight, Users, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: Brain, title: 'AI-Powered Learning', desc: 'Adaptive algorithms personalize every lesson to your pace and learning style.', color: '#6366f1' },
  { icon: BarChart2, title: 'Real-time Analytics', desc: 'Track progress with beautiful dashboards and actionable insights.', color: '#22d3ee' },
  { icon: Trophy, title: 'Gamified XP System', desc: 'Earn XP, badges, and climb leaderboards as you master new skills.', color: '#a78bfa' },
  { icon: Globe, title: '500+ Courses', desc: 'Expert-curated content across tech, design, business, and more.', color: '#f59e0b' },
  { icon: Users, title: 'Community Learning', desc: 'Collaborate with peers, join study groups, and learn together.', color: '#10b981' },
  { icon: Shield, title: 'Certified Programs', desc: 'Industry-recognized certificates to boost your career.', color: '#ef4444' },
];

const stats = [
  { value: '500K+', label: 'Active Learners' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '500+', label: 'Expert Courses' },
  { value: '50+', label: 'Countries' },
];

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}>
    {children}
  </motion.div>
);

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();
  const bg = isDark ? 'bg-[#020314] text-white' : 'bg-white text-slate-900';
  const navBg = isDark ? 'bg-[#020314]/80 border-white/[0.06]' : 'bg-white/80 border-slate-200';
  const cardBg = isDark ? 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.15]' : 'bg-white border-slate-200 hover:border-primary-200 shadow-sm hover:shadow-xl';

  return (
    <div className={`min-h-screen ${bg} overflow-x-hidden`} style={{ fontFamily: "'Outfit', sans-serif" }}>
      {isDark && <div className="fixed inset-0 grid-bg pointer-events-none" />}
      {isDark && <>
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/3" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/3" />
      </>}

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center glow-primary">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduVerse</span>
            <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-slate-400'}`}>AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 ml-8">
            {['Features', 'Courses', 'Pricing', 'Community'].map(item => (
              <a key={item} href="#" className={`text-sm font-medium transition-colors ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all ${isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.08]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/dashboard" className={`hidden sm:block text-sm font-medium px-4 py-2 rounded-xl transition-all ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Sign In</Link>
            <Link to="/dashboard" className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white hover:opacity-90 transition-opacity glow-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium border ${isDark ? 'bg-primary-500/10 border-primary-500/20 text-primary-300' : 'bg-primary-50 border-primary-200 text-primary-600'}`}>
            <Zap size={14} className="text-primary-400" />
            AI-Powered Learning Platform
            <ChevronRight size={14} className="opacity-60" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Learn Smarter with{' '}<span className="gradient-text">AI-Driven</span>{' '}Education
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
            EduVerse AI adapts to your learning style, delivering personalized courses, interactive quizzes, and real-time feedback to accelerate your growth.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold text-base hover:opacity-90 transition-all glow-primary hover:scale-105">
              Start Learning Free <ArrowRight size={18} />
            </Link>
            <button className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base border transition-all hover:scale-105 ${isDark ? 'border-white/[0.12] text-white hover:bg-white/[0.05]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <Play size={16} /> Watch Demo
            </button>
          </motion.div>

          {/* Hero Preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-16">
            <div className={`rounded-3xl border overflow-hidden shadow-2xl ${isDark ? 'border-white/[0.08] bg-[#060818]' : 'border-slate-200 bg-slate-50'}`}>
              <div className={`flex gap-2 items-center px-4 py-3 ${isDark ? 'bg-[#0d1224]' : 'bg-slate-100'}`}>
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className={`ml-4 text-xs px-12 py-1 rounded-md ${isDark ? 'bg-white/[0.05] text-white/30' : 'bg-white text-slate-400'}`}>app.eduverse.ai/dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[{ label: 'Courses Done', val: '24', color: '#6366f1' }, { label: 'XP Earned', val: '2,840', color: '#22d3ee' }, { label: 'Streak', val: '14d', color: '#a78bfa' }, { label: 'Rank', val: '#42', color: '#f59e0b' }].map(m => (
                  <div key={m.label} className={`rounded-xl p-4 border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                    <div className="text-xl font-bold mb-1" style={{ color: m.color }}>{m.val}</div>
                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className={`py-12 border-y ${isDark ? 'border-white/[0.06] bg-white/[0.01]' : 'border-slate-100 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">{s.value}</p>
                <p className={`text-sm ${isDark ? 'text-white/45' : 'text-slate-500'}`}>{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeUp>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3 gradient-text">Why EduVerse AI?</p>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Everything you need to <span className="gradient-text">master any skill</span></h2>
            <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-white/45' : 'text-slate-500'}`}>Cutting-edge technology meets world-class pedagogy.</p>
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.07}>
              <motion.div whileHover={{ y: -4 }} className={`rounded-2xl border p-6 cursor-default transition-all duration-300 shine-effect ${cardBg}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.color + '22' }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/45' : 'text-slate-500'}`}>{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className={`rounded-3xl p-12 border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-primary-500/10 to-violet-500/10 border-primary-500/15' : 'bg-gradient-to-br from-primary-50 to-violet-50 border-primary-100'}`}>
              <div className="absolute inset-0 grid-bg opacity-40" />
              <div className="relative z-10">
                <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to supercharge your learning?</h2>
                <p className={`text-lg mb-8 ${isDark ? 'text-white/55' : 'text-slate-500'}`}>Join 500,000+ learners already transforming their careers.</p>
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-all glow-primary hover:scale-105">
                  Get Started — It's Free <ArrowRight size={18} />
                </Link>
                <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                  {['No credit card', 'Cancel anytime', 'Free tier forever'].map(t => (
                    <div key={t} className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span className={`text-sm ${isDark ? 'text-white/55' : 'text-slate-500'}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold gradient-text">EduVerse AI</span>
          </div>
          <p className={`text-sm ${isDark ? 'text-white/30' : 'text-slate-400'}`}>© 2026 EduVerse AI. Built with ❤️ for learners worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
