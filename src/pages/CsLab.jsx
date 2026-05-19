import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import { explainTopic, askChat, generateQuiz } from '../services/gemini';
import {
  Sparkles, ChevronLeft, Info, HelpCircle,
  Play, Plus, Minus, ArrowRight, BookOpen, Layers,
  Send, Check, Award, ChevronRight, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STRUCTURES = {
  stack: {
    title: 'Stack (LIFO)',
    subtitle: 'Last In, First Out',
    description: 'A linear data structure where elements are inserted (Push) and removed (Pop) from the same end, called the "Top". Think of it like a stack of plates.',
    complexity: { access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    useCase: 'Browser history (Back button), Undo/Redo functions, Call stack execution.',
    code: `class Stack {
  constructor() { this.items = []; }
  push(element) { this.items.push(element); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
}`
  },
  queue: {
    title: 'Queue (FIFO)',
    subtitle: 'First In, First Out',
    description: 'A linear structure where elements are inserted at the "Rear" (Enqueue) and removed from the "Front" (Dequeue). Think of it like a line at a ticket counter.',
    complexity: { access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    useCase: 'Printer queues, CPU task scheduling, customer service routing systems.',
    code: `class Queue {
  constructor() { this.items = []; }
  enqueue(element) { this.items.push(element); }
  dequeue() { return this.items.shift(); }
  peek() { return this.items[0]; }
}`
  },
  linkedlist: {
    title: 'Linked List',
    subtitle: 'Linked Node Train',
    description: 'A dynamic data structure where each element (Node) contains its data value and a pointer (Next) to the subsequent node, allowing for efficient memory utilization.',
    complexity: { access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    useCase: 'Music playlists (Next/Previous track), Image carousel viewer, Memory allocation.',
    code: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}`
  },
  tree: {
    title: 'Binary Search Tree (BST)',
    subtitle: 'Hierarchical Search Tree',
    description: 'A branched node structure where each node has at most two children. The left subtree contains values smaller than the node, and the right subtree contains larger values.',
    complexity: { access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
    useCase: 'Database indexes, folder hierarchy, routers routing tables.',
    code: `insert(value) {
  if (value < this.value) {
    if (!this.left) this.left = new Node(value);
    else this.left.insert(value);
  } else {
    if (!this.right) this.right = new Node(value);
    else this.right.insert(value);
  }
}`
  }
};

export default function CsLab() {
  const { isDark } = useTheme();
  const { saveQuizScore, completeModule } = useProgress();
  const [activeTab, setActiveTab] = useState('stack');
  const [explainNode, setExplainNode] = useState('Select an operation to begin!');

  useEffect(() => {
    completeModule('cs', 150);
  }, []);

  // Stack State
  const [stack, setStack] = useState([45, 12, 8]);
  const [pushVal, setPushVal] = useState('');

  // Queue State
  const [queue, setQueue] = useState([60, 23, 75]);
  const [enqueueVal, setEnqueueVal] = useState('');

  // Linked List State
  const [list, setList] = useState([18, 92, 57, 43]);
  const [traversingIdx, setTraversingIdx] = useState(-1);
  const [isTraversingList, setIsTraversingList] = useState(false);

  // BST Tree State
  const [bstSearchVal, setBstSearchVal] = useState('');
  const [activeBstPath, setActiveBstPath] = useState([]); // List of highlighted Node IDs in traversal search path
  const [bstSearchStatus, setBstSearchStatus] = useState('');

  // AI CS Compiler Tutor states
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [error, setError] = useState(null);

  // CS Quiz Arena states
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizStage, setQuizStage] = useState('idle'); // idle, active, result
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [hasAnsweredQuestion, setHasAnsweredQuestion] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const structureData = STRUCTURES[activeTab];

  // Sync Gemini Concept Description
  const fetchConceptExplanation = async (conceptName) => {
    setAiLoading(true);
    try {
      const summary = await explainTopic(conceptName);
      setAiResponse(summary);
      setChatLog([{ role: 'model', parts: [{ text: summary }] }]);
    } catch (err) {
      setError('Unable to fetch computer science data structure explanations.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const concept = `Data structure: ${structureData.title} (${structureData.subtitle}). Overview: ${structureData.description}. Complexity: Access ${structureData.complexity.access}, Search ${structureData.complexity.search}, Insert ${structureData.complexity.insert}, Delete ${structureData.complexity.delete}. Use case: ${structureData.useCase}.`;
    fetchConceptExplanation(concept);
  }, [activeTab]);

  // AI Doubt Solver
  const handleDoubtSubmit = async (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    const userMsg = doubtText;
    setDoubtText('');
    const updatedChatLog = [...chatLog, { role: 'user', parts: [{ text: userMsg }] }];
    setChatLog(updatedChatLog);
    setAiLoading(true);

    try {
      const reply = await askChat(userMsg, updatedChatLog);
      setChatLog([...updatedChatLog, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err) {
      setChatLog([...updatedChatLog, { role: 'model', parts: [{ text: 'DeepMind Gemini API timed out. Try again.' }] }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Quiz Generation
  const handleStartQuiz = async () => {
    setAiLoading(true);
    const quizTopic = `Computer science data structure: ${structureData.title}. Big O time complexities, operation push pop enqueue dequeue traversal search, and use cases: ${structureData.useCase}`;

    try {
      const list = await generateQuiz(quizTopic);
      setQuizQuestions(list);
      setQuizStage('active');
      setCurrentQuestionIdx(0);
      setSelectedOptionIdx(null);
      setHasAnsweredQuestion(false);
      setQuizScore(0);
    } catch (err) {
      setError('Failed to construct dynamic CS quiz deck.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuizOptionSelect = (idx) => {
    if (hasAnsweredQuestion) return;
    setSelectedOptionIdx(idx);
    setHasAnsweredQuestion(true);
    if (idx === quizQuestions[currentQuestionIdx].correct) {
      setQuizScore(s => s + 1);
    }
  };

  const handleQuizNextQuestion = () => {
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(c => c + 1);
      setSelectedOptionIdx(null);
      setHasAnsweredQuestion(false);
    } else {
      setQuizStage('result');
      const pct = Math.round((quizScore / quizQuestions.length) * 100);
      const xpEarned = quizScore * 30;
      saveQuizScore(`cs_${activeTab}`, pct, xpEarned);
    }
  };

  const handleResetQuiz = () => {
    setQuizStage('idle');
    setQuizQuestions(null);
  };

  // Stack Push
  const handlePush = (e) => {
    if (e) e.preventDefault();
    const val = pushVal.trim() ? parseInt(pushVal) : Math.floor(Math.random() * 90) + 10;
    if (stack.length >= 6) {
      setExplainNode('Stack Overflow! The stack has reached its maximum size in this laboratory.');
      return;
    }
    setStack(prev => [val, ...prev]);
    setPushVal('');
    setExplainNode(`Pushed ${val} onto the top of the Stack!`);
  };

  // Stack Pop
  const handlePop = () => {
    if (stack.length === 0) {
      setExplainNode('Stack Underflow! The stack is already empty.');
      return;
    }
    const popped = stack[0];
    setStack(prev => prev.slice(1));
    setExplainNode(`Popped ${popped} from the top of the Stack!`);
  };

  // Queue Enqueue
  const handleEnqueue = (e) => {
    if (e) e.preventDefault();
    const val = enqueueVal.trim() ? parseInt(enqueueVal) : Math.floor(Math.random() * 90) + 10;
    if (queue.length >= 6) {
      setExplainNode('Queue Full! Clear some space first.');
      return;
    }
    setQueue(prev => [...prev, val]);
    setEnqueueVal('');
    setExplainNode(`Enqueued ${val} at the Rear of the Queue!`);
  };

  // Queue Dequeue
  const handleDequeue = () => {
    if (queue.length === 0) {
      setExplainNode('Queue Empty! Nothing left to dequeue.');
      return;
    }
    const dequeued = queue[0];
    setQueue(prev => prev.slice(1));
    setExplainNode(`Dequeued ${dequeued} from the Front of the Queue!`);
  };

  // Linked List Traversal Animation loop
  const handleListTraverse = () => {
    if (isTraversingList || list.length === 0) return;
    setIsTraversingList(true);
    setTraversingIdx(0);
    setExplainNode('Traversing head: Node index 0 (Value: ' + list[0] + ')');

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < list.length) {
        setTraversingIdx(currentIdx);
        setExplainNode(`Navigating pointer: Node index ${currentIdx} (Value: ${list[currentIdx]})`);
      } else {
        clearInterval(interval);
        setTraversingIdx(-1);
        setIsTraversingList(false);
        setExplainNode('Traversal finished: reached Tail (null).');
      }
    }, 1000);
  };

  // Binary Search Tree lookup search
  const handleBstSearch = (e) => {
    if (e) e.preventDefault();
    const val = parseInt(bstSearchVal);
    if (isNaN(val)) return;

    setBstSearchVal('');
    setExplainNode(`Searching for ${val} in the BST...`);
    setBstSearchStatus('searching');

    const searchSequence = [];
    let current = 50;

    while (current !== null) {
      searchSequence.push(current);
      if (val === current) {
        break;
      } else if (val < current) {
        if (current === 50) current = 30;
        else if (current === 30) current = 20;
        else current = null; // stop at leaves
      } else {
        if (current === 50) current = 70;
        else if (current === 70) current = 80;
        else current = null;
      }
    }

    // Step-by-step path traversal animation
    let step = 0;
    setActiveBstPath([searchSequence[0]]);

    const interval = setInterval(() => {
      step++;
      if (step < searchSequence.length) {
        const nodeVal = searchSequence[step];
        setActiveBstPath(prev => [...prev, nodeVal]);
        setExplainNode(`Comparing ${val} with Node ${nodeVal}: ${val < nodeVal ? `${val} < ${nodeVal} (Navigate Left)` : `${val} > ${nodeVal} (Navigate Right)`}`);
      } else {
        clearInterval(interval);
        const lastVal = searchSequence[searchSequence.length - 1];
        if (lastVal === val) {
          setBstSearchStatus('success');
          setExplainNode(`Element ${val} found! Search operation completed successfully.`);
        } else {
          setBstSearchStatus('failed');
          setExplainNode(`Element ${val} not found in the BST. Reached dead end.`);
        }
      }
    }, 1200);
  };

  // Reset tab states
  useEffect(() => {
    setExplainNode('Select an operation to begin visual execution.');
    setTraversingIdx(-1);
    setIsTraversingList(false);
    setActiveBstPath([]);
    setBstSearchStatus('');
  }, [activeTab]);

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-xl'
    : 'bg-white border-slate-200 shadow-xl';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-indigo-500/50' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-indigo-400';

  return (
    <div className="min-h-full pb-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="mb-4 text-left">
        <Link
          to="/modules"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            isDark
              ? 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white hover:bg-white/[0.06]'
              : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:shadow-sm'
          }`}
        >
          <ChevronLeft size={13} /> Back to Modules
        </Link>
      </div>

      <PageHeader
        title="Data Structure Visualizer 🗂️"
        subtitle="Observe computer memory operations. Run Stack, Queue, Linked List, and BST algorithms step-by-step with linear animations."
      />

      {/* Local Tab Switcher */}
      <div className="flex border-b border-white/[0.06] mb-6 gap-2 pb-1 overflow-x-auto no-scrollbar">
        {Object.keys(STRUCTURES).map((tabId) => {
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                isActive
                  ? 'border-violet-500 text-white bg-white/[0.02]'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {STRUCTURES[tabId].title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Animated Visual Board */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className={`relative rounded-3xl border overflow-hidden p-6 shadow-lg min-h-[380px] flex flex-col justify-between ${cardBg}`}>
            {/* Background Grid */}
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between flex-grow">
              <div className="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-2">
                <span className="text-xs font-extrabold uppercase text-violet-400 tracking-wider flex items-center gap-1.5">
                  <Layers size={14} /> Workbench visualizer
                </span>
                <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                  {structureData.subtitle}
                </span>
              </div>

              {/* Dynamic Workbench Areas */}
              <div className="flex-grow flex items-center justify-center py-6 min-h-[220px]">
                
                {/* 1. Stack Visualizer */}
                {activeTab === 'stack' && (
                  <div className="w-56 h-64 border-x-2 border-b-2 border-dashed border-white/20 rounded-b-2xl p-4 flex flex-col justify-end gap-2 overflow-hidden bg-white/[0.01]">
                    <AnimatePresence>
                      {stack.map((item, idx) => (
                        <motion.div
                          key={item + '-' + idx}
                          initial={{ opacity: 0, y: -100, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 200, scale: 0.9 }}
                          transition={{ type: 'spring', damping: 15 }}
                          className={`w-full py-3.5 rounded-xl border font-bold text-sm shadow-sm relative overflow-hidden flex items-center justify-center ${
                            idx === 0
                              ? 'bg-gradient-to-r from-violet-500 to-indigo-600 border-transparent text-white'
                              : 'bg-white/[0.03] border-white/[0.07] text-white/85'
                          }`}
                        >
                          {idx === 0 && <span className="absolute top-1.5 left-2 text-[9px] font-bold text-violet-200">TOP</span>}
                          Node: {item}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {stack.length === 0 && (
                      <div className="text-center py-10 text-xs font-bold text-white/25">STACK EMPTY</div>
                    )}
                  </div>
                )}

                {/* 2. Queue Visualizer */}
                {activeTab === 'queue' && (
                  <div className="w-full max-w-xl h-24 border-y-2 border-dashed border-white/20 p-3 flex items-center gap-3 overflow-hidden bg-white/[0.01]">
                    <AnimatePresence mode="popLayout">
                      {queue.map((item, idx) => (
                        <motion.div
                          key={item + '-' + idx}
                          layout
                          initial={{ opacity: 0, x: 100, scale: 0.8 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -100, scale: 0.8 }}
                          transition={{ type: 'spring', damping: 18 }}
                          className={`flex-1 py-4 rounded-xl border font-bold text-xs flex items-center justify-center relative ${
                            idx === 0
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                              : idx === queue.length - 1
                                ? 'bg-blue-500/20 border-blue-400/40 text-blue-400'
                                : 'bg-white/[0.03] border-white/[0.07] text-white/85'
                          }`}
                        >
                          {idx === 0 && <span className="absolute top-1 left-1.5 text-[8px] font-black text-emerald-400">FRONT</span>}
                          {idx === queue.length - 1 && <span className="absolute top-1 right-1.5 text-[8px] font-black text-blue-400">REAR</span>}
                          Node: {item}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {queue.length === 0 && (
                      <div className="w-full text-center text-xs font-bold text-white/25">QUEUE EMPTY</div>
                    )}
                  </div>
                )}

                {/* 3. Linked List Visualizer */}
                {activeTab === 'linkedlist' && (
                  <div className="w-full max-w-xl flex items-center justify-center gap-2 overflow-x-auto pb-2">
                    <AnimatePresence>
                      {list.map((item, idx) => {
                        const isTraversed = traversingIdx === idx;
                        return (
                          <React.Fragment key={idx}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`px-4 py-4 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 min-w-[84px] shadow-sm relative transition-all duration-300 ${
                                isTraversed
                                  ? 'bg-pink-500/20 border-pink-400 shadow-md shadow-pink-500/10'
                                  : 'bg-white/[0.03] border-white/[0.07] text-white/85'
                              }`}
                            >
                              {idx === 0 && <span className="absolute -top-5 text-[9px] font-black text-white/40">HEAD</span>}
                              {idx === list.length - 1 && <span className="absolute -bottom-5 text-[9px] font-black text-white/40">TAIL</span>}
                              <span className="text-white font-extrabold">{item}</span>
                              <span className="text-[8px] opacity-40 font-mono">Next →</span>
                            </motion.div>
                            
                            {idx < list.length - 1 && (
                              <motion.div className="text-white/30 flex items-center">
                                <ArrowRight size={14} className={isTraversed ? 'text-pink-400 animate-pulse scale-125' : ''} />
                              </motion.div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* 4. Binary Search Tree (BST) Visualizer */}
                {activeTab === 'tree' && (
                  <div className="w-full max-w-md h-64 relative font-sans">
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border font-black text-xs flex items-center justify-center transition-all duration-300 z-10 ${
                        activeBstPath.includes(50) ? 'bg-violet-500/35 border-violet-400 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                      }`}
                    >
                      50
                    </div>

                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" stroke="white" strokeWidth="1.5">
                      <line x1="200" y1="30" x2="115" y2="100" />
                      <line x1="200" y1="30" x2="285" y2="100" />
                      <line x1="115" y1="110" x2="65" y2="180" />
                      <line x1="115" y1="110" x2="165" y2="180" />
                      <line x1="285" y1="110" x2="335" y2="180" />
                    </svg>

                    <div
                      className={`absolute top-24 left-24 w-9 h-9 rounded-full border font-black text-xs flex items-center justify-center transition-all duration-300 z-10 ${
                        activeBstPath.includes(30) ? 'bg-violet-500/35 border-violet-400 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                      }`}
                    >
                      30
                    </div>
                    <div
                      className={`absolute top-24 right-24 w-9 h-9 rounded-full border font-black text-xs flex items-center justify-center transition-all duration-300 z-10 ${
                        activeBstPath.includes(70) ? 'bg-violet-500/35 border-violet-400 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                      }`}
                    >
                      70
                    </div>

                    <div
                      className={`absolute bottom-6 left-12 w-8 h-8 rounded-full border font-black text-[10px] flex items-center justify-center transition-all duration-300 z-10 ${
                        activeBstPath.includes(20) ? 'bg-violet-500/35 border-violet-400 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                      }`}
                    >
                      20
                    </div>
                    <div
                      className={`absolute bottom-6 left-36 w-8 h-8 rounded-full border font-black text-[10px] flex items-center justify-center transition-all duration-300 z-10 ${
                        activeBstPath.includes(40) ? 'bg-violet-500/35 border-violet-400 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                      }`}
                    >
                      40
                    </div>
                    <div
                      className={`absolute bottom-6 right-12 w-8 h-8 rounded-full border font-black text-[10px] flex items-center justify-center transition-all duration-300 z-10 ${
                        activeBstPath.includes(80) ? 'bg-violet-500/35 border-violet-400 text-white' : 'bg-white/[0.03] border-white/[0.08] text-white/70'
                      }`}
                    >
                      80
                    </div>
                  </div>
                )}

              </div>

              {/* Execution Console Logs */}
              <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-left">
                <p className="text-[10px] font-extrabold uppercase text-white/35 tracking-wider flex items-center gap-1.5">
                  <Sparkles size={11} /> Visual Compiler Logs:
                </p>
                <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300 font-semibold mt-1">
                  {explainNode}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive controls workbench */}
          <div className={`p-5 rounded-3xl border text-left ${cardBg}`}>
            <h4 className="text-xs font-bold uppercase text-white/55 mb-4 tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-violet-400" /> Command Board Operations
            </h4>

            {/* A. Stack Controls */}
            {activeTab === 'stack' && (
              <form onSubmit={handlePush} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  value={pushVal}
                  onChange={e => setPushVal(e.target.value)}
                  placeholder="Enter a value to Push (or random)..."
                  className={`flex-1 px-4 py-2.5 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <Plus size={13} /> Push Node
                  </button>
                  <button
                    type="button"
                    onClick={handlePop}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white/70 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Minus size={13} /> Pop Node
                  </button>
                </div>
              </form>
            )}

            {/* B. Queue Controls */}
            {activeTab === 'queue' && (
              <form onSubmit={handleEnqueue} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  value={enqueueVal}
                  onChange={e => setEnqueueVal(e.target.value)}
                  placeholder="Enter a value to Enqueue (or random)..."
                  className={`flex-1 px-4 py-2.5 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <Plus size={13} /> Enqueue Node
                  </button>
                  <button
                    type="button"
                    onClick={handleDequeue}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white/70 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Minus size={13} /> Dequeue Node
                  </button>
                </div>
              </form>
            )}

            {/* C. Linked List Controls */}
            {activeTab === 'linkedlist' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleListTraverse}
                  disabled={isTraversingList}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Play size={13} /> Traverse Pointer (Next →)
                </button>
                <span className="text-[10px] font-bold text-white/35 uppercase">
                  Steps through node pointers from Head to Tail
                </span>
              </div>
            )}

            {/* D. BST Controls */}
            {activeTab === 'tree' && (
              <form onSubmit={handleBstSearch} className="flex gap-3 w-full">
                <select
                  value={bstSearchVal}
                  onChange={e => setBstSearchVal(e.target.value)}
                  required
                  className={`flex-1 px-4 py-2.5 text-xs rounded-xl outline-none border transition-all ${
                    isDark ? 'bg-[#020310] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="" disabled className="text-white/40">Select value to lookup...</option>
                  {[50, 30, 70, 20, 40, 80].map(val => (
                    <option key={val} value={val} className={isDark ? 'bg-[#020310] text-white' : 'bg-white text-slate-700'}>Find Node: {val}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <Play size={13} /> Search Node
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Big O metrics, AI doubt tutoring solver, and AI CS Quiz Arena */}
        <div className="flex flex-col gap-6 text-left">
          
          {/* 1. Complexity Card */}
          <div className={`rounded-3xl p-5 border space-y-4 ${cardBg}`}>
            <h3 className="text-xs font-bold text-white/55 uppercase tracking-widest border-b border-white/[0.06] pb-2 flex items-center gap-1.5">
              <BookOpen size={14} className="text-violet-400" /> Big O Complexities
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] text-white/40 font-bold uppercase">Access</p>
                <p className="text-sm font-black text-white mt-0.5">{structureData.complexity.access}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] text-white/40 font-bold uppercase">Search</p>
                <p className="text-sm font-black text-white mt-0.5">{structureData.complexity.search}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] text-white/40 font-bold uppercase">Insertion</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">{structureData.complexity.insert}</p>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] text-white/40 font-bold uppercase">Deletion</p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">{structureData.complexity.delete}</p>
              </div>
            </div>
          </div>

          {/* 2. Details Sidebar panel */}
          <div className={`rounded-3xl p-5 border flex flex-col justify-between ${cardBg}`}>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {structureData.title}
                </h3>
                <p className="text-[10px] text-white/35 font-semibold tracking-wider uppercase mt-0.5">
                  Algorithm Analysis
                </p>
              </div>

              <div className="h-px bg-white/[0.06]" />

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Concept Overview</h4>
                <p className="text-xs text-white/70 leading-relaxed font-sans font-medium">
                  {structureData.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Real-World Application</h4>
                <p className="text-xs text-white/60 leading-relaxed font-sans font-semibold">
                  {structureData.useCase}
                </p>
              </div>
            </div>

            {/* Code Block Snippet */}
            <div className="mt-6 border border-white/[0.06] rounded-xl bg-black/40 overflow-hidden font-mono text-[10px]">
              <div className="flex justify-between items-center px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.04]">
                <span className="text-[8px] text-white/30 uppercase tracking-wider font-bold">Standard Class Structure</span>
                <span className="text-violet-400 font-bold">ES6+</span>
              </div>
              <pre className="p-3 text-emerald-400 overflow-x-auto text-left leading-relaxed">
                <code>{structureData.code}</code>
              </pre>
            </div>
          </div>

          {/* 3. AI CS Compiler Tutor Chat Panel */}
          <div className={`rounded-3xl border p-4.5 ${cardBg} flex flex-col justify-between h-[360px] text-left`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-violet-400 animate-pulse" />
              <div>
                <h4 className={`text-xs font-black ${text}`}>AI CS Compiler Tutor</h4>
                <p className={`text-[9px] ${subText}`}>Memory Allocations & Big O</p>
              </div>
            </div>

            {/* Chat Log Logs */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 no-scrollbar text-xs">
              {aiLoading && chatLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`${subText} text-[9px] font-bold`}>Compiling logic models...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatLog.map((chat, index) => {
                    const isModel = chat.role === 'model';
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border leading-relaxed ${
                          isModel
                            ? 'bg-violet-500/[0.04] border-violet-500/10 text-white/90 font-mono text-[10px]'
                            : 'bg-white/[0.02] border-white/[0.05] text-white/70'
                        }`}
                      >
                        <p className="font-extrabold uppercase text-[8px] mb-1 tracking-wider text-violet-400 font-sans">
                          {isModel ? '🧠 AI Tutor' : '👤 Student'}
                        </p>
                        <p className="whitespace-pre-wrap">{chat.parts[0].text}</p>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="text-[9px] font-black text-violet-400 animate-pulse">
                      Tutor compiling reply...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Doubt Input form */}
            <form onSubmit={handleDoubtSubmit} className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]">
              <input
                type="text"
                value={doubtText}
                onChange={e => setDoubtText(e.target.value)}
                placeholder="Ask: 'Explain access search complexity'..."
                className={`flex-grow px-3 py-2 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 active:scale-[0.97] transition-all text-white cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* 4. CS Dynamic Quiz Arena */}
          <div className={`rounded-3xl border p-4.5 ${cardBg} min-h-[300px] text-left`}>
            {quizStage === 'idle' && (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                  <Award size={20} className="text-violet-400" />
                </div>
                <h4 className={`text-xs font-black ${text}`}>Data Structures Quiz</h4>
                <p className={`text-[9px] ${subText} mt-1 leading-relaxed px-2`}>
                  Test your Big O analysis, pointers tracking, and memory complexity to score dynamic XP rewards.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-violet-500/10"
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            {quizStage === 'active' && quizQuestions && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-violet-400 tracking-wide uppercase">
                    Q: {currentQuestionIdx + 1}/{quizQuestions.length}
                  </span>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                    Score: {quizScore}/{quizQuestions.length}
                  </span>
                </div>

                <div className={`h-1 rounded-full bg-white/[0.06] overflow-hidden`}>
                  <div
                    className="h-full bg-violet-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                <h5 className={`text-xs font-bold leading-normal ${text} pt-1`}>
                  {quizQuestions[currentQuestionIdx].question}
                </h5>

                <div className="space-y-2">
                  {quizQuestions[currentQuestionIdx].options.map((optText, optIdx) => {
                    const isSelected = selectedOptionIdx === optIdx;
                    const isCorrect = optIdx === quizQuestions[currentQuestionIdx].correct;
                    let optionStyle = isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-white/80' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700';

                    if (hasAnsweredQuestion) {
                      if (isCorrect) {
                        optionStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                      } else if (isSelected) {
                        optionStyle = 'bg-red-500/10 border-red-500/30 text-red-400';
                      } else {
                        optionStyle = 'opacity-40 border-white/[0.04]';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleQuizOptionSelect(optIdx)}
                        disabled={hasAnsweredQuestion}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${optionStyle} ${
                          !hasAnsweredQuestion ? 'cursor-pointer hover:scale-[1.005]' : 'cursor-default'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-lg border border-white/10 flex items-center justify-center text-[9px] font-extrabold bg-white/[0.04] flex-shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-grow leading-tight">{optText}</span>
                        {hasAnsweredQuestion && isCorrect && <Check size={12} className="text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {hasAnsweredQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-3 text-[10px] border leading-normal ${
                      selectedOptionIdx === quizQuestions[currentQuestionIdx].correct
                        ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300'
                        : 'bg-red-400/10 border-red-400/20 text-red-300'
                    }`}
                  >
                    <p className="font-bold mb-1 flex items-center gap-1">
                      {selectedOptionIdx === quizQuestions[currentQuestionIdx].correct ? '🎉 Correct +30 XP' : '❌ Incorrect'}
                    </p>
                    <p className="opacity-95">{quizQuestions[currentQuestionIdx].explanation}</p>
                  </motion.div>
                )}

                {hasAnsweredQuestion && (
                  <button
                    onClick={handleQuizNextQuestion}
                    className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-violet-500/10"
                  >
                    {currentQuestionIdx + 1 < quizQuestions.length ? 'Next Question' : 'Complete Quiz'} <ChevronRight size={13} />
                  </button>
                )}
              </div>
            )}

            {quizStage === 'result' && (
              <div className="text-center py-6 space-y-4">
                <div className="text-4xl float-animation">🏆</div>
                <h4 className={`text-sm font-black ${text}`}>Excellent Practice!</h4>
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <span className="text-lg font-black text-white">
                    {Math.round((quizScore / quizQuestions.length) * 100)}%
                  </span>
                </div>
                <p className={`text-xs ${subText}`}>
                  Scored {quizScore} out of {quizQuestions.length} correct. Earned +{quizScore * 30} XP.
                </p>
                <button
                  onClick={handleResetQuiz}
                  className="px-6 py-2 rounded-xl text-xs font-bold border border-white/[0.08] text-white/70 hover:bg-white/[0.05] hover:text-white transition-all cursor-pointer"
                >
                  Close Results
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
