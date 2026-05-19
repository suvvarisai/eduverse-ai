import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Clock, CheckCircle, XCircle, ChevronRight, Trophy,
  RotateCcw, Zap, Target, Award, ShieldAlert, AlertTriangle,
  Sparkles, Sliders, Play, Settings, User, ChevronUp, AlertCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { generateQuiz } from '../services/gemini';

// --- STANDARD QUIZ SUBJECT CARDS ---
const standardQuizzes = [
  { id: '1', title: 'JavaScript ES6+', category: 'Frontend', questions: 5, time: '15s Q', difficulty: 'Medium', xp: 150, color: '#f59e0b', icon: '🟨' },
  { id: '2', title: 'React Hooks', category: 'Frontend', questions: 5, time: '15s Q', difficulty: 'Hard', xp: 200, color: '#6366f1', icon: '⚛️' },
  { id: '3', title: 'Python Basics', category: 'AI/ML', questions: 5, time: '15s Q', difficulty: 'Easy', xp: 100, color: '#22d3ee', icon: '🐍' },
  { id: '4', title: 'CSS Grid & Flexbox', category: 'Design', questions: 5, time: '15s Q', difficulty: 'Medium', xp: 120, color: '#a78bfa', icon: '🎨' },
  { id: '5', title: 'Node.js Fundamentals', category: 'Backend', questions: 5, time: '15s Q', difficulty: 'Hard', xp: 180, color: '#10b981', icon: '🟢' },
];

// --- EXTENSIVE MULTI-TOPIC FALLBACK QUESTIONS POOL ---
const fallbackQuestionsPool = {
  '1': [
    { q: 'What does the spread operator (...) do in JavaScript?', options: ['Multiplies values', 'Spreads iterable elements', 'Creates a new function', 'Declares variables'], correct: 1, explanation: 'The spread operator (...) expands an iterable (like an array) into individual elements.' },
    { q: 'Which ES6 feature allows extracting values from arrays or objects easily?', options: ['Destructuring', 'Spread operator', 'Rest parameters', 'Template literals'], correct: 0, explanation: 'Destructuring assignment allows extracting properties from objects or items from arrays into distinct variables.' },
    { q: 'What is the default value of a variable declared with let but not initialized?', options: ['null', 'undefined', '0', 'NaN'], correct: 1, explanation: 'Variables declared with let or var that are not given an initial value are assigned a default value of undefined.' },
    { q: 'Which method returns a new array with all elements that pass a test?', options: ['map()', 'filter()', 'forEach()', 'reduce()'], correct: 1, explanation: 'filter() creates a shallow copy of a portion of a given array, filtered down to just the elements that pass the test.' },
    { q: 'Which standard structure is used to hold unique values of any type?', options: ['Map', 'List', 'Set', 'WeakMap'], correct: 2, explanation: 'Set is a standard ES6 object that lets you store unique values of any type, whether primitive values or object references.' }
  ],
  '2': [
    { q: 'Which hook is used to manage side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1, explanation: 'useEffect is the React hook designed for managing side effects like data fetching, subscriptions, and DOM mutations.' },
    { q: 'What must you pass as the second argument to useEffect to run it only once on mount?', options: ['null', 'An empty array []', 'A callback function', 'undefined'], correct: 1, explanation: 'Passing an empty dependency array [] tells React that the effect doesn\'t depend on any values, so it runs only once.' },
    { q: 'How can you memoize a computed value between renders in React?', options: ['useCallback', 'useMemo', 'useRef', 'useContext'], correct: 1, explanation: 'useMemo returns a memoized value, recalculating it only when one of its dependencies changes.' },
    { q: 'Which hook provides a direct reference to a DOM element?', options: ['useState', 'useRef', 'useEffect', 'useMemo'], correct: 1, explanation: 'useRef returns a mutable ref object whose .current property is initialized to the passed argument, often used to access DOM elements directly.' },
    { q: 'What is a restriction when calling React Hooks?', options: ['Call them inside loops', 'Call them only at the top level', 'Call them inside helper functions', 'Call them inside class components'], correct: 1, explanation: 'Hooks must always be called at the top level of React functions, before any early returns or conditional paths.' }
  ],
  '3': [
    { q: 'What is the correct syntax to output "Hello World" in Python?', options: ['echo "Hello World"', 'print("Hello World")', 'console.log("Hello World")', 'p("Hello World")'], correct: 1, explanation: 'Python uses the print() function to output text to the console.' },
    { q: 'How do you insert comments in Python code?', options: ['// comment', '/* comment */', '# comment', '<!-- comment -->'], correct: 2, explanation: '# is used to mark a single-line comment in Python.' },
    { q: 'Which data type in Python is ordered, mutable, and allows duplicate elements?', options: ['Set', 'Tuple', 'Dictionary', 'List'], correct: 3, explanation: 'A List in Python is ordered, mutable (changeable), and allows duplicate members.' },
    { q: 'How do you define a function in Python?', options: ['function myFunc():', 'def myFunc():', 'func myFunc() {}', 'define myFunc():'], correct: 1, explanation: 'Python uses the def keyword to define functions.' },
    { q: 'Which keyword is used to create a loop in Python?', options: ['while', 'foreach', 'loop', 'until'], correct: 0, explanation: 'Python utilizes the for and while keywords to construct loop structures.' }
  ],
  '4': [
    { q: 'Which CSS property defines whether an element is a flex container?', options: ['display: flex', 'float: left', 'align-items: center', 'flex-direction: row'], correct: 0, explanation: 'display: flex converts the target element into a flex container.' },
    { q: 'What is the default value of the flex-direction property?', options: ['column', 'row', 'row-reverse', 'column-reverse'], correct: 1, explanation: 'The default value for flex-direction is row, laying out flex items horizontally.' },
    { q: 'How do you align items along the main axis in Flexbox?', options: ['align-items', 'justify-content', 'align-content', 'justify-items'], correct: 1, explanation: 'justify-content aligns flex items along the main (horizontal by default) axis.' },
    { q: 'Which grid property is used to define the size of grid columns?', options: ['grid-template-rows', 'grid-template-columns', 'grid-gap', 'grid-column-span'], correct: 1, explanation: 'grid-template-columns defines the columns of a grid container.' },
    { q: 'How do you specify a grid item to span exactly two rows?', options: ['grid-row: span 2', 'grid-template-rows: double', 'row-gap: 2', 'grid-row-span: 2'], correct: 0, explanation: 'grid-row: span 2 spans the grid item across two horizontal row lanes.' }
  ],
  '5': [
    { q: 'Which module is used in Node.js to handle file paths?', options: ['fs', 'path', 'http', 'os'], correct: 1, explanation: 'The path module provides utilities for working with file and directory paths.' },
    { q: 'How do you import a module in CommonJS (standard Node.js)?', options: ['import module from "name"', 'require("name")', 'include("name")', 'using "name"'], correct: 1, explanation: 'CommonJS uses the require() function to import packages and modules.' },
    { q: 'What is the default package manager for Node.js?', options: ['yarn', 'composer', 'npm', 'pip'], correct: 2, explanation: 'npm is the default package manager that comes bundled with Node.js.' },
    { q: 'Which standard module allows Node.js to read and write files?', options: ['path', 'fs', 'http', 'stream'], correct: 1, explanation: 'The fs (File System) module allows interacting with the file system on your computer.' },
    { q: 'Which object allows logging outputs to Node terminal shell?', options: ['system', 'console', 'window', 'process'], correct: 1, explanation: 'The console object provides simple logging capabilities comparable to browser inspector environments.' }
  ]
};

const diffColors = {
  Easy: { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  Medium: { bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
  Hard: { bg: 'bg-red-500/10 border-red-500/20 text-red-400' }
};

export default function Quiz() {
  const { isDark } = useTheme();
  const { progress, saveQuizScore } = useProgress();
  const { user } = useAuth();

  const [stage, setStage] = useState('list'); // list | active | result
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);

  // Question Timer State
  const [timeLeft, setTimeLeft] = useState(15);

  // Custom Quiz Builder State
  const [customTopic, setCustomTopic] = useState('');
  const [customDiff, setCustomDiff] = useState('Medium');
  const [customCount, setCustomCount] = useState(5);

  // Theme Styling helpers
  const cardBg = isDark ? 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14] backdrop-blur-xl' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xl shadow-sm';
  const subText = isDark ? 'text-white/45' : 'text-slate-500';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const panelBg = isDark ? 'bg-white/[0.03] border-white/[0.07] backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm';
  const inputBg = isDark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-indigo-500/50' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-indigo-400';

  // --- ADAPTIVE TUTOR REVIEWS & PERFORMANCE CALCULUS ---
  const attemptsKeys = Object.keys(progress?.quizScores || {});
  const totalScores = Object.values(progress?.quizScores || {});
  
  const averageScore = totalScores.length > 0 
    ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
    : 0;

  // Dynamic Difficulty recommendation
  let recommendedDifficulty = 'Medium';
  if (totalScores.length > 0) {
    if (averageScore >= 80) recommendedDifficulty = 'Hard';
    else if (averageScore < 50) recommendedDifficulty = 'Easy';
  }

  // Scan weak subjects
  const weakSubjects = [];
  attemptsKeys.forEach((key) => {
    const sc = progress.quizScores[key];
    if (sc < 60) {
      const match = standardQuizzes.find(q => q.id === key);
      if (match) weakSubjects.push(match.title);
    }
  });

  // Peer Leaderboard calculation using Real User XP
  const userXp = progress?.totalXp || 1200;
  const rawLeaderboard = [
    { name: 'Elena Rostova (Peer)', xp: 2450, accuracy: '94%', avatar: '👩‍💻' },
    { name: 'Devon Lane (Peer)', xp: 1980, accuracy: '88%', avatar: '🧑‍💻' },
    { name: user?.displayName || user?.email?.split('@')[0] || 'You', xp: userXp, accuracy: `${averageScore || 75}%`, avatar: '🧠', isUser: true },
    { name: 'Marcus Sterling (Peer)', xp: 1450, accuracy: '82%', avatar: '👨‍🎓' },
    { name: 'Yuki Sato (Peer)', xp: 950, accuracy: '70%', avatar: '👩‍🎓' }
  ];
  const sortedLeaderboard = [...rawLeaderboard].sort((a, b) => b.xp - a.xp);

  // Dynamic Timer Loop
  useEffect(() => {
    if (stage !== 'active' || answered) return;

    setTimeLeft(15);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSelect(-1); // Timeout status
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [current, answered, stage]);

  // Entering Arena: Fetch AI questions on the fly with Fallback support
  const enterArena = async (quiz, isCustom = false, customDetails = null) => {
    setLoadingQuiz(true);
    setQuizError(null);
    setActiveQuiz(quiz);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setAnswers([]);

    let topic = quiz.title;
    let diff = quiz.difficulty;
    let count = quiz.questions;

    if (isCustom && customDetails) {
      topic = customDetails.topic;
      diff = customDetails.diff;
      count = customDetails.count;
    }

    try {
      // Direct call to Gemini API Custom Generation
      const generated = await generateQuiz(topic, count, diff);
      setQuizQuestions(generated);
      setStage('active');
    } catch (err) {
      console.warn("AI Quiz generation failed, deploying procedural question cards.", err);
      // Fallback matrix mapping standard topics
      let fallbackCards = fallbackQuestionsPool[quiz.id];
      if (!fallbackCards) {
        // Fallback for custom topics
        fallbackCards = [
          { q: `What is a primary concept behind ${topic}?`, options: ['It is a fundamental operational structure', 'It represents a design aesthetic', 'It describes variable states', 'It manages memory limits'], correct: 0, explanation: `Correct! The subject revolves closely around system definitions within ${topic}.` },
          { q: `Which standard rule is essential for ${topic}?`, options: ['Proper syntax structure', 'Global storage bypass', 'Immediate thread execution', 'Sequential buffer mapping'], correct: 0, explanation: 'Syntax rules define instructions clearly across core architectures.' },
          { q: `How does difficulty level ${diff} approach this concept?`, options: ['It breaks parameters into simple logic blocks', 'It manages complex calculations', 'It represents basic templates', 'It bypasses errors'], correct: 1, explanation: 'Calculations adapt dynamically to maintain operational balance.' }
        ];
      }
      setQuizQuestions(fallbackCards.slice(0, count));
      setStage('active');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const activeQ = quizQuestions[current];
    const correct = idx === activeQ.correct;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [
      ...a,
      {
        selected: idx,
        correct: activeQ.correct,
        isCorrect: correct,
        timeout: idx === -1
      }
    ]);
  };

  const handleNext = () => {
    if (current + 1 < quizQuestions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      // Completed! Compute final percentage
      const pct = Math.round((score / quizQuestions.length) * 100);
      const xpEarned = Math.round((pct / 100) * (activeQuiz?.xp || 120));
      
      // Save directly to Firebase / State
      saveQuizScore(activeQuiz.id, pct, xpEarned);
      setStage('result');
    }
  };

  const handleCustomQuizSubmit = (e) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    const mockQuizCard = {
      id: 'custom_' + Date.now(),
      title: customTopic,
      category: 'Custom AI',
      questions: customCount,
      time: '15s Q',
      difficulty: customDiff,
      xp: customCount * 30,
      color: '#8b5cf6',
      icon: '🧠'
    };

    enterArena(mockQuizCard, true, {
      topic: customTopic,
      diff: customDiff,
      count: customCount
    });
  };

  const currentQ = quizQuestions[current];
  const finalPct = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;

  // Calculated Badges Lists
  const totalAttempts = Object.values(progress?.quizAttempts || {}).reduce((a, b) => a + b, 0);
  const bestScoreVal = Object.values(progress?.quizScores || {}).reduce((a, b) => Math.max(a, b), 0);
  const badgesList = [
    { id: 'first-step', name: 'First Step Taken', desc: 'Completed your first study module or quiz.', icon: '🏆', unlocked: progress?.badges?.includes('first-step') },
    { id: 'brainiac', name: 'Enlightened Thinker', desc: 'Scored 90% or above in any quiz.', icon: '🧠', unlocked: progress?.badges?.includes('brainiac') },
    { id: 'speed-demon', name: 'Speed Demon', desc: 'Achieved a perfect 100% score.', icon: '⚡', unlocked: progress?.badges?.includes('speed-demon') },
    { id: 'daily-devotee', name: 'Daily Devotee', desc: 'Logged on 3 days in a row.', icon: '🔥', unlocked: progress?.badges?.includes('daily-devotee') },
    { id: 'code-warrior', name: 'Code Warrior', desc: 'Completed 3 lab modules.', icon: '⚔️', unlocked: progress?.badges?.includes('code-warrior') }
  ];

  return (
    <div className="min-h-full pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <PageHeader title="Adaptive Quiz Arena 🧠" subtitle="Challenge your intellect in an AI-powered quiz system. Earn XP, rank up peer leaderboards, and adapt difficulty dynamically.">
        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-200'}`}>
          <Zap size={14} className="text-indigo-400 animate-pulse fill-indigo-400" />
          <span className="text-xs font-black text-indigo-400">{progress?.totalXp?.toLocaleString() || '1,200'} XP</span>
        </div>
      </PageHeader>

      {/* Loading Overlay */}
      {loadingQuiz && (
        <div className="fixed inset-0 bg-[#020310]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h4 className="text-lg font-black text-white flex items-center gap-2 justify-center">
              <Sparkles size={20} className="text-indigo-400 animate-pulse" /> Consulting Gemini AI...
            </h4>
            <p className="text-xs text-white/50">Assembling interactive questions, options, and explanations...</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Stage 1: Listing and Leaderboards */}
        {stage === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="text-left space-y-6"
          >
            {/* Row 1: Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { icon: Target, label: 'Quizzes Taken', val: totalAttempts || '0', color: '#6366f1' },
                { icon: Trophy, label: 'Highest Record', val: `${bestScoreVal || 0}%`, color: '#f59e0b' },
                { icon: Award, label: 'Badges Unlocked', val: badgesList.filter(b => b.unlocked).length, color: '#a78bfa' },
                { icon: Sliders, label: 'Adaptive Diff', val: recommendedDifficulty, color: '#10b981' }
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border p-4 flex flex-col gap-2 ${panelBg} shadow-sm relative overflow-hidden`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '15' }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <p className={`text-lg font-black ${text}`}>{s.val}</p>
                  <p className={`text-[10px] uppercase font-black tracking-wider ${subText}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Row 2: Adaptive Learning Guide Advisor */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between`}>
              <div className="flex gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-1">
                  <Brain size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-extrabold text-indigo-400 flex items-center gap-1.5`}>
                    Adaptive Study Advisor
                  </h4>
                  <p className={`text-xs ${text} font-medium mt-1`}>
                    {totalScores.length === 0 ? (
                      "Welcome! Take a quiz below to initialize your AI learning performance index."
                    ) : averageScore >= 80 ? (
                      "🧠 Performance: Excellent! We recommend raising the difficulty to Hard. You have demonstrated superb conceptual understanding."
                    ) : averageScore < 50 ? (
                      "💡 Suggestion: We recommend testing at Easy difficulty first. Let's focus on foundational subject parameters."
                    ) : (
                      "🚀 Progressing Nicely: Keep testing at Medium. Focus on solidifying weak subjects to boost your overall accuracy."
                    )}
                  </p>
                  {weakSubjects.length > 0 && (
                    <p className="text-[10px] text-red-400 font-bold mt-2 flex items-center gap-1">
                      <AlertCircle size={10} /> Needs Revision: {weakSubjects.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Interactive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: standard quizzes list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-black uppercase tracking-wider ${text}`}>Academic Topic Decks</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {standardQuizzes.map((quiz, i) => {
                    const bestScore = progress?.quizScores?.[quiz.id] !== undefined ? progress.quizScores[quiz.id] : null;
                    const attemptsCount = progress?.quizAttempts?.[quiz.id] || 0;
                    
                    return (
                      <motion.div
                        key={quiz.id}
                        whileHover={{ y: -3 }}
                        className={`rounded-2xl border overflow-hidden transition-all duration-300 relative ${cardBg}`}
                      >
                        <div className="h-16 flex items-center justify-between px-4 relative" style={{ background: `linear-gradient(135deg, ${quiz.color}15, ${quiz.color}03)` }}>
                          <span className="text-3xl">{quiz.icon}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 uppercase" style={{ background: quiz.color + '15', color: quiz.color }}>
                            {quiz.difficulty}
                          </span>
                        </div>
                        
                        <div className="p-4 flex flex-col justify-between">
                          <div>
                            <h3 className={`text-sm font-bold leading-tight ${text} mb-1.5`}>{quiz.title}</h3>
                            <div className={`flex items-center gap-3 text-[10px] mb-3 font-semibold ${subText}`}>
                              <span className="flex items-center gap-0.5"><Brain size={10} /> {quiz.questions} Qs</span>
                              <span className="flex items-center gap-0.5"><Zap size={10} /> +{quiz.xp} XP</span>
                            </div>

                            {bestScore !== null && (
                              <div className="space-y-1 mb-4">
                                <div className="flex justify-between text-[9px] font-bold">
                                  <span className={subText}>Best score ({attemptsCount} attempts)</span>
                                  <span style={{ color: quiz.color }}>{bestScore}%</span>
                                </div>
                                <div className={`w-full h-1 rounded-full ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
                                  <div className="h-1 rounded-full animate-pulse" style={{ width: `${bestScore}%`, background: quiz.color }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => enterArena(quiz)}
                            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer text-white shadow-sm hover:opacity-90 active:scale-[0.99]"
                            style={{ background: `linear-gradient(135deg, ${quiz.color}, ${quiz.color}d0)` }}
                          >
                            <Brain size={12} /> Enter Arena <ChevronRight size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Section: Custom AI Quiz Generator Form */}
                <div className={`p-5 rounded-3xl border ${panelBg} space-y-4`}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <h3 className={`text-sm font-black uppercase tracking-wider ${text}`}>Custom AI Quiz Builder</h3>
                  </div>
                  <p className={`text-xs ${subText} leading-relaxed`}>
                    Input any conceptual subject (e.g. *Node Streams, Organic Chemistry, Calculus Derivatives*). The AI study companion will synthesize a tailored question deck.
                  </p>

                  <form onSubmit={handleCustomQuizSubmit} className="space-y-3.5">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={e => setCustomTopic(e.target.value)}
                        placeholder="Enter quiz topic (e.g. Angular Lifecycle, Mitochondria)..."
                        required
                        className={`flex-1 px-4 py-2.5 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
                      />
                      <div className="flex gap-2">
                        <select
                          value={customDiff}
                          onChange={e => setCustomDiff(e.target.value)}
                          className={`px-3 py-2.5 text-xs rounded-xl border ${isDark ? 'bg-[#080a1c] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>

                        <select
                          value={customCount}
                          onChange={e => setCustomCount(parseInt(e.target.value))}
                          className={`px-3 py-2.5 text-xs rounded-xl border ${isDark ? 'bg-[#080a1c] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                        >
                          <option value="3">3 Qs</option>
                          <option value="5">5 Qs</option>
                          <option value="10">10 Qs</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      <Sparkles size={13} /> Assemble Custom AI Deck
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: simulated leaderboards & achievements */}
              <div className="space-y-6">
                {/* Peer Leaderboard card */}
                <div className={`p-4 rounded-3xl border ${panelBg} space-y-4 text-left`}>
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <Trophy size={15} className="text-yellow-400" />
                    <h3 className={`text-xs font-black uppercase tracking-wider ${text}`}>Interactive Leaderboard</h3>
                  </div>

                  <div className="space-y-2">
                    {sortedLeaderboard.map((student, idx) => (
                      <div
                        key={student.name}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all text-xs font-semibold ${
                          student.isUser
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                            : 'bg-white/[0.01] border-transparent text-white/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white/40 w-4">#{idx + 1}</span>
                          <span>{student.avatar}</span>
                          <span className={student.isUser ? 'font-black' : ''}>{student.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-white/30">{student.accuracy}</span>
                          <span className="font-bold text-yellow-400 flex items-center gap-0.5"><Zap size={10} />{student.xp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievement Badges catalog */}
                <div className={`p-4 rounded-3xl border ${panelBg} space-y-4 text-left`}>
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                    <Award size={15} className="text-indigo-400" />
                    <h3 className={`text-xs font-black uppercase tracking-wider ${text}`}>Unlocked Badges</h3>
                  </div>

                  <div className="space-y-3">
                    {badgesList.map((badge) => (
                      <div key={badge.id} className="flex gap-2.5 items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border flex-shrink-0 ${
                          badge.unlocked
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-white/[0.02] border-white/5 opacity-30'
                        }`}>
                          {badge.icon}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-normal ${badge.unlocked ? text : 'text-white/30'}`}>
                            {badge.name} {badge.unlocked ? '✓' : '(Locked)'}
                          </p>
                          <p className={`text-[9px] ${subText} leading-normal`}>{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Active AI Quiz Game */}
        {stage === 'active' && quizQuestions.length > 0 && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto text-left"
          >
            {/* Header telemetry */}
            <div className="flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider">
              <span style={{ color: activeQuiz?.color }} className="flex items-center gap-1">
                <Brain size={13} /> {activeQuiz?.title}
              </span>
              <span className={subText}>{current + 1} / {quizQuestions.length}</span>
            </div>

            {/* Progress bar */}
            <div className={`h-1.5 rounded-full mb-6 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
              <motion.div
                className="h-1.5 rounded-full"
                animate={{ width: `${((current) / quizQuestions.length) * 100}%` }}
                style={{ background: activeQuiz?.color || '#8b5cf6' }}
              />
            </div>

            {/* Countdown clock panel */}
            <div className={`rounded-2xl p-4 border mb-4 flex items-center justify-between ${
              timeLeft <= 5
                ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Clock size={16} className={timeLeft <= 5 ? 'animate-bounce text-red-500' : 'text-indigo-400'} />
                <span className="text-xs font-semibold">Ticking Timer:</span>
              </div>
              <div className="flex items-center gap-2 flex-grow mx-4">
                <div className="flex-grow h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${(timeLeft / 15) * 100}%` }}
                    style={{ backgroundColor: timeLeft <= 5 ? '#ef4444' : activeQuiz?.color || '#8b5cf6' }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>
              <span className="text-sm font-black tracking-widest">{timeLeft}s</span>
            </div>

            {/* Active Question Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`rounded-3xl border p-6 mb-4 ${panelBg} shadow-md`}>
                  <p className={`text-base font-bold mb-6 leading-relaxed ${text}`}>{currentQ.q}</p>
                  
                  <div className="space-y-3">
                    {currentQ.options.map((opt, idx) => {
                      let style = isDark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:border-white/[0.2] hover:bg-white/[0.07]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300';
                      
                      if (answered) {
                        if (idx === currentQ.correct) {
                          style = 'bg-emerald-500/15 border-emerald-400 text-emerald-400 shadow-sm';
                        } else if (idx === selected && idx !== currentQ.correct) {
                          style = 'bg-red-500/15 border-red-400 text-red-400';
                        } else {
                          style = 'opacity-40 border-transparent bg-transparent';
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          disabled={answered}
                          whileHover={!answered ? { scale: 1.01 } : {}}
                          whileTap={!answered ? { scale: 0.99 } : {}}
                          className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-xs font-bold text-left transition-all duration-200 ${style} ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className={`w-6 h-6 rounded-xl border flex items-center justify-center text-[10px] flex-shrink-0 font-extrabold transition-colors ${
                            answered && idx === currentQ.correct
                              ? 'bg-emerald-500 border-transparent text-white'
                              : answered && idx === selected
                                ? 'bg-red-500 border-transparent text-white'
                                : isDark ? 'border-white/10' : 'border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                          {answered && idx === currentQ.correct && <CheckCircle size={15} className="ml-auto text-emerald-400 flex-shrink-0" />}
                          {answered && idx === selected && idx !== currentQ.correct && <XCircle size={15} className="ml-auto text-red-400 flex-shrink-0" />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Tutor Card */}
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-4 border leading-normal ${
                      selected === currentQ.correct
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-2">
                      {selected === currentQ.correct ? (
                        <><CheckCircle size={14} /> Correct Response! +25 XP</>
                      ) : selected === -1 ? (
                        <><AlertTriangle size={14} className="text-red-400 animate-pulse" /> Time Expired!</>
                      ) : (
                        <><XCircle size={14} /> Incorrect Answer</>
                      )}
                    </p>
                    <p className="text-xs leading-relaxed opacity-90 mt-1 font-semibold">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setStage('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.05]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                ← Surrender Quest
              </button>
              
              {answered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 glow-primary cursor-pointer active:scale-[0.99]"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {current + 1 < quizQuestions.length ? 'Next Question' : 'Seal Results'}
                  <ChevronRight size={14} />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Stage 3: Results Scoreboard */}
        {stage === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className={`rounded-3xl border p-8 ${panelBg} shadow-xl relative overflow-hidden`}>
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="text-6xl mb-4"
              >
                {finalPct >= 80 ? '🏆' : finalPct >= 50 ? '🎉' : '📚'}
              </motion.div>
              
              <h2 className={`text-xl font-extrabold ${text}`}>
                {finalPct >= 80 ? 'Splendid Victory!' : finalPct >= 50 ? 'Successful Quest!' : 'Keep Practicing!'}
              </h2>
              <p className={`text-xs mt-1 ${subText}`}>{activeQuiz?.title} Complete</p>

              {/* Progress Ring */}
              <div className="flex justify-center my-6">
                <div className="relative w-28 h-28">
                  <svg width="112" height="112" className="rotate-[-90deg]">
                    <circle cx="56" cy="56" r="48" stroke={isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} strokeWidth="7" fill="none" />
                    <motion.circle
                      cx="56" cy="56" r="48"
                      stroke={finalPct >= 80 ? '#10b981' : finalPct >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="7" fill="none" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 48}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - finalPct / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                    <span className={`text-2xl font-black ${text}`}>{finalPct}%</span>
                    <span className={`text-[10px] font-bold ${subText}`}>{score}/{quizQuestions.length}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Readout Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Correct', val: score, color: '#10b981' },
                  { label: 'Timeouts / Wrong', val: quizQuestions.length - score, color: '#ef4444' },
                  { label: 'Dynamic XP Gained', val: `+${Math.round((finalPct / 100) * (activeQuiz?.xp || 120))} XP`, color: '#f59e0b' },
                  { label: 'Status Grade', val: finalPct >= 80 ? 'Rank S' : finalPct >= 50 ? 'Rank B' : 'Rank D', color: '#22d3ee' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-left ${isDark ? 'bg-white/[0.04]' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>{s.label}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Operations buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => enterArena(activeQuiz)}
                  className={`flex-grow flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isDark ? 'border-white/[0.1] text-white/60 hover:bg-white/[0.05] hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <RotateCcw size={13} /> Replay Quiz
                </button>
                
                <button
                  onClick={() => setStage('list')}
                  className="flex-grow flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all glow-primary cursor-pointer active:scale-[0.99]"
                >
                  <Trophy size={13} /> Exit Arena
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
