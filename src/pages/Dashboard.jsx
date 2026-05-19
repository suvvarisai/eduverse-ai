import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BookOpen, Zap, Trophy, Flame, Award, Clock, ArrowRight, Play, Star,
  TrendingUp, Calendar, ShieldCheck, ChevronRight, Activity, Cpu, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { progress } = useProgress();
  const navigate = useNavigate();

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-300'
    : 'bg-white border-slate-200/80 hover:shadow-lg shadow-sm transition-all duration-300';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-white/50' : 'text-slate-500';
  const mutedText = isDark ? 'text-white/70' : 'text-slate-700';

  // Badges catalog achievements
  const badges = [
    { id: 'first-step', title: 'First Steps', desc: 'Complete your first educational quest', icon: '👣', color: 'from-emerald-400 to-teal-600', unlocked: progress?.badges?.includes('first-step') },
    { id: 'speed-demon', title: 'Speed Demon', desc: 'Score a perfect 100% quiz score', icon: '⚡', color: 'from-amber-400 to-orange-500', unlocked: progress?.badges?.includes('speed-demon') },
    { id: 'brainiac', title: 'Brainiac', desc: 'Score a premium 90%+ average in quizzes', icon: '🧠', color: 'from-fuchsia-400 to-pink-600', unlocked: progress?.badges?.includes('brainiac') },
    { id: 'daily-devotee', title: 'Daily Devotee', desc: 'Maintain a 3+ day learning streak', icon: '🔥', color: 'from-red-400 to-rose-600', unlocked: progress?.badges?.includes('daily-devotee') },
    { id: 'code-warrior', title: 'Code Warrior', desc: 'Complete 3 learning laboratories', icon: '⚔️', color: 'from-blue-400 to-indigo-600', unlocked: progress?.badges?.includes('code-warrior') },
    { id: 'architect', title: 'Architect', desc: 'Complete 5 learning modules', icon: '🏛️', color: 'from-cyan-400 to-blue-600', unlocked: progress?.completedModules?.length >= 5 },
  ];

  // Calculations from progress context
  const completedCount = progress?.completedModules?.length || 0;
  const xpEarnedVal = progress?.totalXp || 1250;
  const levelVal = progress?.level || 1;
  const streakVal = progress?.streak || 3;

  // Next level progress bar calculations
  const nextLevelThreshold = (levelVal + 1) * 1000;
  const levelXpFloor = levelVal * 1000;
  const currentLevelXpProgress = xpEarnedVal - levelXpFloor;
  const xpToNextLevel = 1000 - (xpEarnedVal % 1000);
  const xpPercentage = Math.min(Math.max((currentLevelXpProgress / 1000) * 100, 0), 100);

  const quizScoresList = Object.values(progress?.quizScores || {});
  const avgQuizScore = quizScoresList.length > 0 
    ? Math.round(quizScoresList.reduce((sum, s) => sum + s, 0) / quizScoresList.length)
    : 85;

  const stats = [
    { title: 'Completed Modules', value: `${completedCount} / 5`, subtitle: '3D Simulation Labs', icon: BookOpen, color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#818cf8)', trend: completedCount * 20 },
    { title: 'Total Scholar XP', value: xpEarnedVal.toLocaleString(), subtitle: `Level ${levelVal} Scholar`, icon: Zap, color: '#22d3ee', gradient: 'linear-gradient(135deg,#22d3ee,#06b6d4)', trend: 15 },
    { title: 'Active Habit Streak', value: `${streakVal} Days`, subtitle: 'Maintain consecutive learning', icon: Flame, color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#f97316)', trend: streakVal * 12 },
    { title: 'Quiz Accuracy', value: `${avgQuizScore}%`, subtitle: 'Average Arena Performance', icon: Trophy, color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', trend: 6 },
  ];

  // Activities list
  const recentActivities = [
    ...(completedCount > 0 ? progress.completedModules.map((modId) => ({
      id: `module_${modId}`,
      text: `Completed "${modId === 'biology' ? 'Biology 3D explorer' : modId === 'physics' ? 'Gravity lab' : modId === 'chemistry' ? 'Chemistry lab' : 'CS Data visualizer'}" Laboratory`,
      time: 'Just now',
      icon: BookOpen,
      color: '#6366f1',
      xp: '+150 XP'
    })) : []),
    ...(Object.keys(progress?.quizScores || {}).length > 0 ? Object.entries(progress.quizScores).filter(([_, sc]) => sc > 0).map(([quizId, score]) => ({
      id: `quiz_${quizId}`,
      text: `Scored ${score}% in ${
        quizId.includes('anatomy') ? 'Anatomy lab' : quizId.includes('chemistry') ? 'Chemistry reactions' : 'EduVerse Quiz'
      } Arena`,
      time: 'Recently completed',
      icon: Star,
      color: '#f59e0b',
      xp: `+${Math.round(score * 1.5)} XP`
    })) : []),
    { id: 'streak_1', text: `Hit a ${streakVal}-day learning streak milestone`, time: '1 day ago', icon: Flame, color: '#ef4444', xp: '+100 XP' }
  ].slice(0, 4);

  const displayName = user?.displayName || 'Scholar';
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  // Programmatic consistency cells heatmap (24 cells representing past weeks)
  const heatmapCells = Array.from({ length: 24 }).map((_, idx) => {
    // Alternate levels of activity for beautiful visual display
    const intensity = idx === 0 ? 4 : idx % 5 === 0 ? 0 : idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1;
    const dateLabel = `${idx + 1} days ago`;
    return { idx, intensity, dateLabel };
  });

  return (
    <div className="space-y-6 pb-10 text-left" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Premium Header */}
      <PageHeader
        title={`Welcome Back, ${displayName}! 🚀`}
        subtitle="Unveil multi-layered visual simulations. Research elements, diagnose skeletal neural branches, or solve doubt codes."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 shadow-sm animate-pulse-glow">
          <Sparkles size={14} className="text-yellow-400" />
          <span className="text-xs font-black text-white">{xpEarnedVal.toLocaleString()} TOTAL XP</span>
        </div>
      </PageHeader>

      {/* Advanced level progression meters */}
      <div className={`rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full">
              System Level Progress
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2">Level {levelVal} Senior Researcher</h2>
            <p className="text-xs text-white/50">{xpToNextLevel} XP remaining until level {levelVal + 1}</p>
          </div>

          <div className="flex-grow w-full md:max-w-md space-y-2">
            <div className="flex justify-between text-xs font-black text-white">
              <span>{currentLevelXpProgress} / 1000 XP</span>
              <span className="text-indigo-400">{Math.round(xpPercentage)}% Done</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1.0, type: 'spring' }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Core Stats control center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <StatCard key={s.title} {...s} index={idx} />
        ))}
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Study activity area chart */}
        <div className={`lg:col-span-2 rounded-3xl border p-6 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-base font-extrabold ${text}`}>Laboratory Engagement Log</h3>
              <p className={`text-xs ${subText}`}>Total interactive simulation hours logged this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.05]">
              <Calendar size={13} className="text-white/40" />
              <span className={mutedText}>Last 7 Days</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress?.studyActivity || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardHoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    background: '#070814',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: '#ffffff',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#dashboardHoursGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill proficiency radar plot */}
        <div className={`rounded-3xl border p-6 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
          <div>
            <h3 className={`text-base font-extrabold ${text}`}>Scientific Proficiency</h3>
            <p className={`text-xs ${subText}`}>Valence elements, biology nodes, CS complexities</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={progress?.subjectPerformance || []}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 'black' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                <Radar name="Proficiency" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Badges Achievements & Study Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unlocked badges list */}
        <div className={`lg:col-span-2 rounded-3xl border p-6 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className={`text-base font-extrabold ${text}`}>Achievements & Badges</h3>
              <p className={`text-xs ${subText}`}>Complete laboratory quizzes to unlock professional badges</p>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {unlockedBadgesCount} / {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map(badge => (
              <motion.div
                key={badge.id}
                whileHover={badge.unlocked ? { scale: 1.03, y: -2 } : {}}
                className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  badge.unlocked
                    ? 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'
                    : 'opacity-35 grayscale bg-transparent border-dashed border-white/[0.08]'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl shadow-md mb-2`}>
                  {badge.icon}
                </div>
                <h4 className="text-xs font-black text-white">{badge.title}</h4>
                <p className="text-[10px] text-white/50 mt-1 font-semibold leading-normal">{badge.desc}</p>
                {!badge.unlocked && (
                  <span className="absolute top-2 right-2 text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded bg-black/40 text-white/35 uppercase">
                    Locked
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dynamic Heatmap Consistency Tracker */}
        <div className={`rounded-3xl border p-6 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame size={20} className="text-orange-500 animate-pulse fill-orange-500" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${text}`}>{streakVal}-Day Streak</h3>
                <p className={`text-xs ${subText}`}>Active study consistency map</p>
              </div>
            </div>

            {/* Heatmap Grid blocks (24 blocks representing study frequency) */}
            <div>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2.5">Consistency blocks</p>
              <div className="grid grid-cols-6 gap-2">
                {heatmapCells.map(cell => (
                  <div
                    key={cell.idx}
                    title={cell.dateLabel}
                    className={`aspect-square rounded-lg border transition-all duration-300 cursor-help ${
                      cell.intensity === 4
                        ? 'bg-orange-500 border-orange-400 shadow-md shadow-orange-500/20'
                        : cell.intensity === 3
                          ? 'bg-orange-500/60 border-orange-500/40'
                          : cell.intensity === 2
                            ? 'bg-orange-500/30 border-orange-500/20'
                            : cell.intensity === 1
                              ? 'bg-orange-500/10 border-orange-500/10'
                              : 'bg-white/[0.02] border-white/[0.04]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-300 text-xs flex items-start gap-2.5 leading-relaxed mt-4">
            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Focus Streak Multiplier!</span>
              <p className="opacity-80 mt-0.5">Maintain your daily revision streak to earn a bonus +50 XP on every quiz completed.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Live Recent Actions Log */}
      <div className={`rounded-3xl border p-6 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className={`text-base font-extrabold ${text}`}>Recent Actions & Quests</h3>
            <p className={`text-xs ${subText}`}>Your dynamic simulation progress logs and earned accomplishments</p>
          </div>
          <button
            onClick={() => navigate('/modules')}
            className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            Enter Laboratories <ArrowRight size={12} />
          </button>
        </div>

        <div className="divide-y divide-white/[0.06] text-xs">
          {recentActivities.map((act) => (
            <div key={act.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: act.color + '15' }}>
                  <act.icon size={16} style={{ color: act.color }} />
                </div>
                <div>
                  <p className="font-bold text-white/90 leading-tight">{act.text}</p>
                  <p className={`text-[10px] mt-0.5 ${subText}`}>{act.time}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-400 flex-shrink-0">{act.xp}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
