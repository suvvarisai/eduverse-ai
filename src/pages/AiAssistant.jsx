import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, MessageSquare, BookOpen, FileText, Brain, Send,
  HelpCircle, Check, Copy, ArrowRight, RefreshCw, AlertCircle,
  Play, ChevronRight, Zap, Target, Award, RotateCcw, Volume2,
  VolumeX, Paperclip, FileImage, FileDown, Eye, Plus, ListTodo,
  Clock, Pause, Award as CupIcon, Flame
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import { askChat, explainTopic, summarizeText, generateQuiz } from '../services/gemini';

const WORKSPACE_TABS = [
  { id: 'chat', label: 'Tutor Chat', icon: MessageSquare, color: '#ec4899' },
  { id: 'roadmap', label: 'Roadmap & Planner', icon: Target, color: '#22d3ee' },
  { id: 'flashcards', label: '3D Flashcards', icon: Brain, color: '#a78bfa' },
  { id: 'pomodoro', label: 'Pomodoro Arena', icon: Clock, color: '#10b981' }
];

const STANDARD_SUGGESTIONS = [
  'Explain how the sodium-potassium pump works in cells',
  'What is standard enthalpy change of combustion?',
  'Analogy for understanding Big O runtime complexities',
  'Derive the time of flight equations for a projectile launch'
];

const SUBJECT_ROADMAPS = {
  chemistry: {
    title: 'Advanced Chemistry Roadmap',
    nodes: [
      { id: 'chem-1', name: 'Quantum Atom & Orbitals', desc: 'S, P, D, F shells, quantum numbers and spin mechanics.', completed: true },
      { id: 'chem-2', name: 'Electronegativity & Ionic Bonds', desc: 'Periodic trends, electron affinities, and crystalline packing lattices.', completed: false },
      { id: 'chem-3', name: 'Covalent Molecular Orbitals', desc: 'Hybridizations (sp, sp2, sp3) and sigma/pi overlapping bonds.', completed: false },
      { id: 'chem-4', name: 'Thermodynamics & Reaction Kinetics', desc: 'Enthalpies, activation energies, combustion equations and catalysts.', completed: false }
    ]
  },
  anatomy: {
    title: 'Realistic Human Anatomy Roadmap',
    nodes: [
      { id: 'anat-1', name: 'Osteological Bone Framework', desc: 'Axial vs appendicular skeletal system and marrow structure.', completed: true },
      { id: 'anat-2', name: 'Cardiovascular Circulation Loop', desc: 'Heart chambers dynamics, arterial/vein flow, capillaries gas exchange.', completed: false },
      { id: 'anat-3', name: 'Nervous Electrical Signal Pathways', desc: 'Axons action potentials, synaptic nodes, cerebral commands mapping.', completed: false },
      { id: 'anat-4', name: 'Digestive Gastric Catalysis', desc: 'Chemical acid breakdown and intestinal capillary nutrient absorption.', completed: false }
    ]
  },
  physics: {
    title: 'Newtonian Classical Dynamics Roadmap',
    nodes: [
      { id: 'phys-1', name: 'Kinematics & Vector Equations', desc: 'Two-dimensional projectile motion, elevations angles, gravity variables.', completed: true },
      { id: 'phys-2', name: 'Forces & Energy Conservations', desc: 'Potential and kinetic energies balance, normal force frictions.', completed: false },
      { id: 'phys-3', name: 'Rotational Momentums', desc: 'Torques, angular accelerations, planetary orbit gravity constants.', completed: false },
      { id: 'phys-4', name: 'Fluid & Atmospheric Dynamics', desc: 'Buoyancies, Bernoullis pressure variations, drag scale multipliers.', completed: false }
    ]
  },
  cs: {
    title: 'Data Structures & Runtimes Roadmap',
    nodes: [
      { id: 'cs-1', name: 'Linear Allocations (Stacks & Queues)', desc: 'LIFO/FIFO pointer logic, dynamic arrays limitations, memory arrays.', completed: true },
      { id: 'cs-2', name: 'Linked Nodes Structures', desc: 'Singly and doubly linked pointer addresses, memory complexity.', completed: false },
      { id: 'cs-3', name: 'Binary Tree Searching (BST)', desc: 'Pre-order, in-order, post-order recursive lookups, tree balances.', completed: false },
      { id: 'cs-4', name: 'Graph Theory & Pathfinding Algorithms', desc: 'Dijkstra shortest path matrixes, BFS, DFS node traversals.', completed: false }
    ]
  }
};

const POMODORO_MOTIVATIONS = [
  "Focus is a muscle. The more you train it, the stronger it grows.",
  "Your potential is infinite. Lock in and construct your future.",
  "Small steps daily yield monumental scientific mastery.",
  "Turn off distractions. The visual universe is waiting to be solved."
];

export default function AiAssistant() {
  const { isDark } = useTheme();
  const { progress, saveQuizScore } = useProgress();
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Voice Synthesis Narration States ---
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const synthRef = useRef(window.speechSynthesis);

  // --- Doubt Solver States ---
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'model',
      content: "Welcome to your Next-Gen Scholar Workspace. I am your personal AI research tutor. Ask me to explain complex formulas, compile algorithms, or review periodic elements. You can also simulate textbook uploads! 📚💡"
    }
  ]);
  const chatEndRef = useRef(null);

  // Suggested Follow-Up Prompts
  const [suggestedPrompts, setSuggestedPrompts] = useState(STANDARD_SUGGESTIONS);

  // File Upload Simulations
  const [selectedMockFile, setSelectedMockFile] = useState(null);

  // --- Learning Planner & Roadmap States ---
  const [roadmapSubject, setRoadmapSubject] = useState('chemistry');
  const [learningMode, setLearningMode] = useState('Beginner'); // Beginner / Advanced
  const [dailyTasks, setDailyTasks] = useState([
    { id: 'task-1', text: 'Solve 3 covalent bonding chemistry quiz questions', completed: false, xp: 40 },
    { id: 'task-2', text: 'Simulate breathing cycle in 3D Anatomy explorer', completed: true, xp: 20 },
    { id: 'task-3', text: 'Compile Stack push/pop code sequence in CS Lab', completed: false, xp: 50 }
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // --- 3D Flipping Flashcards States ---
  const [flashcardsSubject, setFlashcardsSubject] = useState('chemistry');
  const [flashcardDeck, setFlashcardDeck] = useState([
    { q: "What is an ionic chemical bond?", a: "A chemical bond formed by the electrostatic attraction between oppositely charged ions, typically a metal cation and a non-metal anion." },
    { q: "What does Big O time complexity measure?", a: "It provides an asymptotic bound on the worst-case execution time or memory footprint of an algorithm relative to the input size N." },
    { q: "What forces act on a flying projectile?", a: "Under classical Newtonian projectile equations, only downward gravitational force acts on the object, ignoring air resistance." }
  ]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Pomodoro productivity states ---
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // work | break
  const [pomodoroCycles, setPomodoroCycles] = useState(0);
  const timerIntervalRef = useRef(null);

  // Auto-scroll chat logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Cleanup synthesis
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // --- Speech synthesis trigger (Voice Tutor) ---
  const handleToggleVoice = (text, idx) => {
    if (speakingIdx === idx) {
      synthRef.current.cancel();
      setSpeakingIdx(null);
      return;
    }

    synthRef.current.cancel();
    setSpeakingIdx(idx);

    // Strip markdown formatting characters for clean narration speech
    const cleanText = text
      .replace(/`[\s\S]*?`/g, '') // remove code blocks
      .replace(/[*#_`]/g, '') // remove bold/italic symbols
      .substring(0, 300); // limit spoken length

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose high quality system voices if available
    const voices = synthRef.current.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang.startsWith('en-'));
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingIdx(null);
    };

    utterance.onerror = () => {
      setSpeakingIdx(null);
    };

    synthRef.current.speak(utterance);
  };

  // --- Chat Doubts Actions ---
  const handleChatSend = async (forcedText) => {
    const query = forcedText || chatInput;
    if (!query.trim() && !selectedMockFile) return;

    let fullQuery = query;
    if (selectedMockFile) {
      fullQuery = `[Attached Document: ${selectedMockFile.name}] - ${query || "Analyze this textbook upload and summarize key formulas."}`;
    }

    setChatInput('');
    setSelectedMockFile(null);
    setChatHistory(prev => [...prev, { role: 'user', content: fullQuery }]);
    setLoading(true);
    setError(null);

    try {
      const historyToSend = chatHistory.slice(1);
      const reply = await askChat(fullQuery, historyToSend);
      setChatHistory(prev => [...prev, { role: 'model', content: reply }]);

      // Dynamically compile 3 new suggested followup questions using Gemini
      const followsPrompt = `Based on the latest topic discussion about: "${query}". Provide exactly 3 short follow-up questions a student might ask next, separated by double newlines. Do not output anything else.`;
      try {
        const followsReply = await askChat(followsPrompt, []);
        const splitFollows = followsReply
          .split('\n\n')
          .map(f => f.replace(/^\d+[\.\)]\s*/, '').trim())
          .filter(f => f.length > 5)
          .slice(0, 3);
        
        if (splitFollows.length > 0) {
          setSuggestedPrompts(splitFollows);
        } else {
          setSuggestedPrompts(STANDARD_SUGGESTIONS);
        }
      } catch (_) {
        setSuggestedPrompts(STANDARD_SUGGESTIONS);
      }

    } catch (err) {
      setError(err.message || 'Unable to fetch AI doubt solving feedback.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate file attachment
  const handleTriggerMockFile = (name, type) => {
    setSelectedMockFile({ name, type });
    setChatInput(`Analyze this textbook sheet on "${name}" and explain it.`);
  };

  // --- Add/Complete Daily Tasks Planner ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    setDailyTasks(prev => [
      ...prev,
      { id: Date.now().toString(), text: newTaskInput, completed: false, xp: 30 }
    ]);
    setNewTaskInput('');
  };

  const handleToggleTask = (taskId, xp) => {
    setDailyTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  // --- Generate AI Flashcard Decks ---
  const handleGenerateFlashcards = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Generate exactly 4 high-quality question-answer flashcard pairs for a study companion on the subject: "${flashcardsSubject}". Format the response strictly as a JSON array of objects with keys "q" and "a". Do not include markdown code block formatting in the raw text output.`;
      const reply = await askChat(prompt, []);
      const parsed = JSON.parse(reply.replace(/```json/g, '').replace(/```/g, '').trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        setFlashcardDeck(parsed);
        setCurrentCardIdx(0);
        setIsFlipped(false);
      }
    } catch (err) {
      setError('Gemini flashcard assembly timed out. Loading laboratory standard deck.');
    } finally {
      setLoading(false);
    }
  };

  // --- Pomodoro Productivity Timer Logic ---
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            // Handle timer completion
            if (timerMode === 'work') {
              setTimerMode('break');
              setTimerSeconds(300); // 5 minutes break
              setPomodoroCycles(c => c + 1);
              // Save bonus study hours in ProgressContext
              const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
              // Mock trigger bonus study hours
            } else {
              setTimerMode('work');
              setTimerSeconds(1500); // 25 min work
            }
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, timerMode]);

  const handleToggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(timerMode === 'work' ? 1500 : 300);
  };

  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMotivationalQuote = POMODORO_MOTIVATIONS[currentCardIdx % POMODORO_MOTIVATIONS.length];

  // Reusable markdown parsing helper
  const renderMarkdown = (text) => {
    if (!text) return '';
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2].trim() : part.replace(/```/g, '').trim();

        return (
          <div key={index} className="my-4 rounded-xl border border-white/[0.08] bg-[#0b0c16] overflow-hidden text-left font-mono text-xs shadow-md">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">{language || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Copy size={11} /> Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-emerald-400 font-normal leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5 text-left">
          {lines.map((line, lineIdx) => {
            const cleanLine = line.trim();
            if (!cleanLine) return <div key={lineIdx} className="h-1.5" />;

            if (cleanLine.startsWith('### ')) {
              return (
                <h4 key={lineIdx} className="text-sm font-black text-white mt-4 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-400 rounded-full" />
                  {cleanLine.replace('### ', '')}
                </h4>
              );
            }
            if (cleanLine.startsWith('## ')) {
              return (
                <h3 key={lineIdx} className="text-base font-bold text-white mt-5 mb-3 border-b border-white/[0.06] pb-1">
                  {cleanLine.replace('## ', '')}
                </h3>
              );
            }
            if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
              const htmlContent = cleanLine.substring(2)
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
                .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-pink-400 font-mono text-xs">$1</code>');
              return (
                <div key={lineIdx} className="flex items-start gap-2 text-xs text-white/80 leading-relaxed ml-2">
                  <span className="text-indigo-400 mt-1.5 flex-shrink-0">•</span>
                  <span dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              );
            }

            const htmlContent = cleanLine
              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
              .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-pink-400 font-mono text-xs">$1</code>');
            return (
              <p
                key={lineIdx}
                className="text-xs text-white/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            );
          })}
        </div>
      );
    });
  };

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-xl'
    : 'bg-white border-slate-200 shadow-xl';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-indigo-500/50' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-indigo-400';

  return (
    <div className="min-h-full pb-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <PageHeader
        title="AI Scholar Workspace 🧠"
        subtitle="Supercharge your revision speed. Access personalized roadmap branches, practice double-sided flashcards, or enter the productivity Pomodoro arena."
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm animate-pulse-glow">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-xs font-bold text-white">Gemini 2.5 Flash Autonomous Node</span>
        </div>
      </PageHeader>

      {/* Tabs Switcher menu */}
      <div className="flex border-b border-white/[0.06] mb-6 overflow-x-auto no-scrollbar gap-2 pb-1">
        {WORKSPACE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border-b-2 relative cursor-pointer ${
                isActive
                  ? 'border-transparent text-white'
                  : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeWorkspaceTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: tab.color }}
                  transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                />
              )}
              <Icon size={14} style={{ color: isActive ? tab.color : undefined }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Displays */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 flex items-start gap-3 text-xs text-left"
        >
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-bold">System Compilation Mismatch</p>
            <p className="opacity-80 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[10px] px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Content panel */}
      <div className={`rounded-3xl p-6 min-h-[500px] border relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
        {/* Dynamic Grid Background Accent */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col justify-between flex-grow">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: Advanced Doubt Solver Chat */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col h-[560px] justify-between"
              >
                {/* Chat Log Logs */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 no-scrollbar">
                  {chatHistory.map((msg, idx) => {
                    const isAi = msg.role === 'model';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-[85%] text-left ${isAi ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                            isAi ? 'bg-gradient-to-br from-pink-500 to-indigo-600 text-white' : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {isAi ? <Sparkles size={16} className="animate-pulse" /> : <MessageSquare size={16} />}
                        </div>

                        <div className="space-y-2">
                          <div
                            className={`rounded-2xl p-4 border shadow-sm ${
                              isAi ? 'bg-white/[0.02] border-white/[0.05] text-white/90' : 'bg-indigo-500/10 border-indigo-500/25 text-white'
                            }`}
                          >
                            {isAi ? renderMarkdown(msg.content) : <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                          </div>
                          
                          {/* Speak button for AI replies */}
                          {isAi && (
                            <button
                              onClick={() => handleToggleVoice(msg.content, idx)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase transition-all cursor-pointer ${
                                speakingIdx === idx
                                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 animate-pulse'
                                  : 'bg-white/[0.02] border-white/[0.04] text-white/40 hover:text-white/70'
                              }`}
                            >
                              {speakingIdx === idx ? <VolumeX size={10} /> : <Volume2 size={10} />}
                              {speakingIdx === idx ? 'Mute' : 'Speak Answer'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex gap-3 max-w-[80%] self-start mr-auto">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Sparkles size={16} className="text-white animate-spin" />
                      </div>
                      <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06] text-white/95 min-w-[120px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* suggested followups drawer */}
                {!loading && (
                  <div className="mb-4 text-left">
                    <p className="text-[9px] font-black text-white/45 tracking-widest mb-2 flex items-center gap-1">
                      <HelpCircle size={11} /> SUGGESTED FOLLOW-UP QUESTIONS:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestedPrompts.map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleChatSend(promptText)}
                          className="px-3.5 py-2.5 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.05] hover:border-pink-500/20 text-xs text-white/70 hover:text-white transition-all text-left flex items-center justify-between group cursor-pointer"
                        >
                          <span className="line-clamp-1">{promptText}</span>
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all text-pink-400 group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input & attachments bar */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  {selectedMockFile && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-left">
                      <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1.5">
                        <Paperclip size={12} /> ATTACHED: {selectedMockFile.name} ({selectedMockFile.type})
                      </span>
                      <button onClick={() => setSelectedMockFile(null)} className="text-[9px] font-black text-red-400 hover:text-red-300">
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Simulated Attachment tools */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleTriggerMockFile("biology_cell_diagram.png", "Image")}
                        className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.05] text-white/50 hover:text-white transition-all cursor-pointer"
                        title="Attach mock screenshot image"
                      >
                        <FileImage size={15} />
                      </button>
                      <button
                        onClick={() => handleTriggerMockFile("chemistry_equations.pdf", "PDF Document")}
                        className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.05] text-white/50 hover:text-white transition-all cursor-pointer"
                        title="Attach mock textbook PDF"
                      >
                        <FileDown size={15} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                      disabled={loading}
                      placeholder="Ask the AI Tutor any doubt..."
                      className={`flex-grow px-4 py-3 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
                    />
                    <button
                      onClick={() => handleChatSend()}
                      disabled={loading || (!chatInput.trim() && !selectedMockFile)}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white flex items-center justify-center font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-pink-500/10"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Interactive Roadmap & Planner */}
            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left"
              >
                {/* 1. Roadmap nodes visualization */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white">AI Learning Roadmap</h3>
                      <p className="text-[10px] text-white/40">Visualized branches of technological progression</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={roadmapSubject}
                        onChange={e => setRoadmapSubject(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                          isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="chemistry">Chemistry</option>
                        <option value="anatomy">Anatomy</option>
                        <option value="physics">Physics</option>
                        <option value="cs">Computer Science</option>
                      </select>

                      <button
                        onClick={() => setLearningMode(l => l === 'Beginner' ? 'Advanced' : 'Beginner')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer border ${
                          learningMode === 'Advanced'
                            ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-400 animate-pulse'
                            : 'bg-white/[0.02] border-white/[0.06] text-white/50'
                        }`}
                      >
                        Mode: {learningMode}
                      </button>
                    </div>
                  </div>

                  {/* Flow Map Visual path */}
                  <div className="relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden space-y-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {SUBJECT_ROADMAPS[roadmapSubject].title}
                    </h4>

                    <div className="space-y-4 relative z-10">
                      {SUBJECT_ROADMAPS[roadmapSubject].nodes.map((node, nIdx) => (
                        <div key={node.id} className="flex gap-4 items-start relative group">
                          {/* Visual vertical node connections */}
                          {nIdx < SUBJECT_ROADMAPS[roadmapSubject].nodes.length - 1 && (
                            <div className="absolute top-8 left-4 bottom-0 w-0.5 bg-dashed border-l border-white/10 group-hover:border-indigo-500/30 transition-all" />
                          )}

                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                              node.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/[0.02] border-white/[0.06] text-white/30'
                            }`}
                          >
                            {node.completed ? <Check size={16} /> : <span className="text-[10px] font-black">{nIdx + 1}</span>}
                          </div>

                          <div className="flex-grow p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] group-hover:bg-white/[0.03] transition-all">
                            <h5 className="text-xs font-black text-white flex items-center gap-2">
                              {node.name}
                              {node.completed && (
                                <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                  Mastered
                                </span>
                              )}
                            </h5>
                            <p className="text-[10px] text-white/50 leading-relaxed mt-1">{node.desc}</p>
                            <button
                              onClick={() => {
                                setActiveTab('chat');
                                handleChatSend(`Explain topic: ${node.name} in my roadmap. ${learningMode === 'Advanced' ? "Explain the advanced theoretical mathematics or chemical formulas." : "Explain it simply using analogies."}`);
                              }}
                              className="mt-2 text-[9px] font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1"
                            >
                              Study Node <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Study Planner tasks */}
                <div className="space-y-5">
                  <div className="border-b border-white/[0.06] pb-3">
                    <h3 className="text-sm font-black text-white">Daily Study Planner</h3>
                    <p className="text-[10px] text-white/40">Check off items to log study XP</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-4">
                    <form onSubmit={handleAddTask} className="flex gap-2">
                      <input
                        type="text"
                        value={newTaskInput}
                        onChange={e => setNewTaskInput(e.target.value)}
                        placeholder="Add study goal today..."
                        className="flex-grow px-3 py-2 text-xs rounded-xl outline-none border border-white/10 bg-black/20 text-white placeholder-white/30"
                      />
                      <button
                        type="submit"
                        className="p-2.5 rounded-xl bg-indigo-500 hover:opacity-90 active:scale-95 transition-all text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                    </form>

                    <div className="space-y-2">
                      {dailyTasks.map(t => (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            t.completed
                              ? 'bg-emerald-500/[0.02] border-emerald-500/10 opacity-60'
                              : 'bg-white/[0.01] border-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => handleToggleTask(t.id, t.xp)}
                              className="w-3.5 h-3.5 accent-indigo-500 bg-white/10 rounded cursor-pointer"
                            />
                            <span className={`text-xs ${t.completed ? 'line-through text-white/40' : 'text-white/80 font-semibold'}`}>
                              {t.text}
                            </span>
                          </div>
                          <span className="text-[8px] font-black text-indigo-400 uppercase">+{t.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: 3D Flashcards Deck */}
            {activeTab === 'flashcards' && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center py-6 h-[500px]"
              >
                <div className="w-full max-w-sm mb-6 flex justify-between items-center text-left">
                  <div>
                    <h3 className="text-sm font-black text-white">3D Revision Flashcards</h3>
                    <p className="text-[10px] text-white/40">Flip cards to commit formulas to memory</p>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={flashcardsSubject}
                      onChange={e => setFlashcardsSubject(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                        isDark ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="chemistry">Chemistry</option>
                      <option value="anatomy">Anatomy</option>
                      <option value="physics">Physics</option>
                      <option value="cs">Computer Science</option>
                    </select>

                    <button
                      onClick={handleGenerateFlashcards}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all text-white text-[10px] font-bold cursor-pointer"
                    >
                      Gen AI Deck
                    </button>
                  </div>
                </div>

                {/* 3D Flipping Card Container */}
                <div className="w-full max-w-sm h-64 perspective" onClick={() => setIsFlipped(!isFlipped)}>
                  <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', damping: 15 }}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-white/10 bg-[#090b16] flex flex-col justify-between p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Question {currentCardIdx + 1}/{flashcardDeck.length}</span>
                        <Brain size={14} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 flex items-center justify-center py-4">
                        <p className="text-sm font-extrabold text-white text-center leading-normal">
                          {flashcardDeck[currentCardIdx].q}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/35">Tap to flip answer</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-indigo-500/20 bg-[#05060f] flex flex-col justify-between p-6 shadow-2xl relative overflow-hidden"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Tutor Solution</span>
                        <Check size={14} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto pr-1 text-left no-scrollbar">
                        <p className="text-xs font-semibold text-white/90 leading-relaxed">
                          {flashcardDeck[currentCardIdx].a}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/35">Tap to return</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Navigation indicators */}
                <div className="flex gap-4 mt-6 items-center">
                  <button
                    disabled={currentCardIdx === 0}
                    onClick={(e) => { e.stopPropagation(); setCurrentCardIdx(c => c - 1); setIsFlipped(false); }}
                    className="px-4 py-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-white/70 hover:text-white transition-all text-xs font-bold disabled:opacity-30 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-bold text-white/50">
                    {currentCardIdx + 1} of {flashcardDeck.length}
                  </span>
                  <button
                    disabled={currentCardIdx + 1 === flashcardDeck.length}
                    onClick={(e) => { e.stopPropagation(); setCurrentCardIdx(c => c + 1); setIsFlipped(false); }}
                    className="px-4 py-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-white/70 hover:text-white transition-all text-xs font-bold disabled:opacity-30 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Pomodoro productivity Arena */}
            {activeTab === 'pomodoro' && (
              <motion.div
                key="pomodoro"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col items-center justify-center py-6 h-[500px]"
              >
                <div className="text-center w-full max-w-sm mb-6">
                  <h3 className="text-sm font-black text-white">Pomodoro Productivity Arena</h3>
                  <p className="text-[10px] text-white/40">Complete study blocks to lock in double XP</p>
                </div>

                {/* SVG Circular Timer Progress Ring */}
                <div className="relative w-52 h-52 flex items-center justify-center mb-6">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle
                      cx="104"
                      cy="104"
                      r="90"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="104"
                      cy="104"
                      r="90"
                      fill="none"
                      stroke="url(#pomodoro-grad)"
                      strokeWidth="8"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 - (565.48 * (timerSeconds / (timerMode === 'work' ? 1500 : 300)))}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="pomodoro-grad" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="relative flex flex-col items-center">
                    <span className="text-3xl font-black text-white tracking-widest">{formatTimerTime(timerSeconds)}</span>
                    <span className={`text-[10px] font-black uppercase mt-1 tracking-widest ${timerMode === 'work' ? 'text-indigo-400' : 'text-emerald-400 animate-pulse'}`}>
                      {timerMode === 'work' ? 'FOCUS BLOCK' : 'BREAKTIME'}
                    </span>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleToggleTimer}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      timerActive
                        ? 'bg-red-500 hover:opacity-90 shadow-red-500/10'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-emerald-500/10'
                    }`}
                  >
                    {timerActive ? <Pause size={13} /> : <Play size={13} />}
                    {timerActive ? 'Pause Session' : 'Start Focus'}
                  </button>
                  <button
                    onClick={handleResetTimer}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-white/70 hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Motivation Drawer */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] w-full max-w-sm text-center">
                  <p className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider flex items-center justify-center gap-1 mb-1">
                    <Flame size={12} className="animate-pulse" /> Focus Quote Block
                  </p>
                  <p className="text-[11px] text-white/50 leading-relaxed px-2 font-medium italic">
                    "{currentMotivationalQuote}"
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
