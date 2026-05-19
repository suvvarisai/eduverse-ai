import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import { explainTopic, askChat, generateQuiz } from '../services/gemini';
import {
  Sparkles, Play, RotateCcw, ChevronLeft, Info,
  Gauge, TrendingUp, Compass, Activity, ArrowUpRight,
  Send, Check, Award, ChevronRight, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PhysicsLab() {
  const { isDark } = useTheme();
  const { saveQuizScore, completeModule } = useProgress();

  useEffect(() => {
    completeModule('physics', 150);
  }, []);

  // Slider Simulation Variables
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [velocity, setVelocity] = useState(25); // m/s
  const [angle, setAngle] = useState(45); // degrees

  // Simulation Running State
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trail, setTrail] = useState([]);
  const [currentCoords, setCurrentCoords] = useState({ x: 0, y: 0 });
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Animation interval reference
  const animationRef = useRef(null);

  // AI explanations states
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [error, setError] = useState(null);

  // Quiz Arena states
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizStage, setQuizStage] = useState('idle'); // idle, active, result
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [hasAnsweredQuestion, setHasAnsweredQuestion] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Derived Projectile Equations (Newtonian Physics)
  const angleRad = (angle * Math.PI) / 180;
  const v_x0 = velocity * Math.cos(angleRad);
  const v_y0 = velocity * Math.sin(angleRad);
  
  // Total time of flight: T = 2 * v_y0 / g
  const timeOfFlight = (2 * v_y0) / gravity;
  
  // Horizontal Range: R = v_x0 * T
  const maxRange = v_x0 * timeOfFlight;
  
  // Maximum Height (Apex): H = (v_y0 ^ 2) / (2 * g)
  const maxHeights = (v_y0 * v_y0) / (2 * gravity);

  // Sync Gemini Concept Description
  const fetchConceptExplanation = async (conceptName) => {
    setAiLoading(true);
    try {
      const summary = await explainTopic(conceptName);
      setAiResponse(summary);
      setChatLog([{ role: 'model', parts: [{ text: summary }] }]);
    } catch (err) {
      setError('Unable to fetch Newtonian physics records.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const concept = `Classical Newtonian physics and projectile motion trajectory equations: gravity = ${gravity} m/s^2, initial velocity = ${velocity} m/s, launch angle = ${angle} degrees. Explain range, apex, flight duration, and gravity effects.`;
    fetchConceptExplanation(concept);
  }, [gravity, velocity, angle]);

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
    const quizTopic = `Classical physics, projectile motion, Newtonian gravity constant ${gravity} m/s^2, launch angle ${angle} degrees, and speed ${velocity} m/s`;

    try {
      const list = await generateQuiz(quizTopic);
      setQuizQuestions(list);
      setQuizStage('active');
      setCurrentQuestionIdx(0);
      setSelectedOptionIdx(null);
      setHasAnsweredQuestion(false);
      setQuizScore(0);
    } catch (err) {
      setError('Failed to construct custom physics deck.');
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
      saveQuizScore(`physics_${gravity.toFixed(0)}`, pct, xpEarned);
    }
  };

  const handleResetQuiz = () => {
    setQuizStage('idle');
    setQuizQuestions(null);
  };

  // Calculations for dynamic trails and telemetry
  useEffect(() => {
    if (isSimulating) {
      const startTime = Date.now();
      const speedFactor = 1.0; // Playback speed scaler

      const runAnimation = () => {
        const elapsedSec = ((Date.now() - startTime) / 1000) * speedFactor;

        if (elapsedSec >= timeOfFlight) {
          // Simulation finished
          setCurrentTime(timeOfFlight);
          const finalX = maxRange;
          const finalY = 0;
          setCurrentCoords({ x: finalX, y: finalY });
          setCurrentSpeed(0);
          setTrail(prev => [...prev, { x: finalX, y: finalY }]);
          setIsSimulating(false);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          return;
        }

        // Current coordinates
        const x = v_x0 * elapsedSec;
        const y = v_y0 * elapsedSec - 0.5 * gravity * elapsedSec * elapsedSec;

        // Current velocity components
        const vx = v_x0;
        const vy = v_y0 - gravity * elapsedSec;
        const speed = Math.sqrt(vx * vx + vy * vy);

        setCurrentTime(elapsedSec);
        setCurrentCoords({ x, y: Math.max(0, y) });
        setCurrentSpeed(speed);

        // Add coordinate to trailing trajectory path
        setTrail(prev => {
          if (prev.length > 0 && Math.abs(prev[prev.length - 1].x - x) < 0.5) return prev;
          return [...prev, { x, y: Math.max(0, y) }];
        });

        animationRef.current = requestAnimationFrame(runAnimation);
      };

      animationRef.current = requestAnimationFrame(runAnimation);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulating]);

  // Launch projectile
  const handleLaunch = () => {
    setCurrentTime(0);
    setTrail([{ x: 0, y: 0 }]);
    setCurrentCoords({ x: 0, y: 0 });
    setCurrentSpeed(velocity);
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsSimulating(true);
  };

  // Reset simulation dashboard
  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsSimulating(false);
    setCurrentTime(0);
    setTrail([]);
    setCurrentCoords({ x: 0, y: 0 });
    setCurrentSpeed(0);
  };

  // Dimensions mapping for graph viewbox
  const graphWidth = 500;
  const graphHeight = 300;
  const padding = 40;

  const scaleLimitX = Math.max(70, maxRange * 1.1);
  const scaleLimitY = Math.max(35, maxHeights * 1.3);

  const getPixelX = (metersX) => {
    return padding + (metersX / scaleLimitX) * (graphWidth - padding * 2);
  };

  const getPixelY = (metersY) => {
    return graphHeight - padding - (metersY / scaleLimitY) * (graphHeight - padding * 2);
  };

  const getTrailPathD = () => {
    if (trail.length === 0) return '';
    return trail
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getPixelX(pt.x)} ${getPixelY(pt.y)}`)
      .join(' ');
  };

  const getGuidePathD = () => {
    const steps = 30;
    const guidePoints = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * timeOfFlight;
      const x = v_x0 * t;
      const y = v_y0 * t - 0.5 * gravity * t * t;
      guidePoints.push({ x, y: Math.max(0, y) });
    }
    return guidePoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getPixelX(pt.x)} ${getPixelY(pt.y)}`)
      .join(' ');
  };

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
        title="Gravity & Motion Lab 🚀"
        subtitle="Interact with physical vectors. Adjust launch metrics, slide gravitational constants, and visualize Newtonian parabolas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* LEFT COMPONENT LAYER: Workbench, telemetry, and adjustment controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`relative rounded-3xl border p-5 relative overflow-hidden flex flex-col justify-between ${cardBg} h-[450px]`}>
            {/* Background Grid */}
            <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Header Telemetry */}
              <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-2">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Activity size={14} /> Telemetry Monitoring
                </span>
                <span className="text-[10px] font-bold text-white/40">
                  SCALE: {scaleLimitX.toFixed(0)}m × {scaleLimitY.toFixed(0)}m
                </span>
              </div>

              {/* Parabolic Trajectory Graph */}
              <div className="flex-1 w-full flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                  className="w-full max-h-[280px] overflow-visible"
                >
                  {/* Grid Guideline ticks */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                    const xMeters = frac * scaleLimitX;
                    const yMeters = frac * scaleLimitY;
                    return (
                      <g key={idx} className="opacity-15 font-mono text-[9px]" fill="white">
                        <line
                          x1={getPixelX(xMeters)} y1={getPixelY(0)}
                          x2={getPixelX(xMeters)} y2={getPixelY(scaleLimitY)}
                          stroke="white" strokeDasharray="3,3"
                        />
                        <text x={getPixelX(xMeters) - 6} y={getPixelY(0) + 16}>{xMeters.toFixed(0)}m</text>

                        <line
                          x1={getPixelX(0)} y1={getPixelY(yMeters)}
                          x2={getPixelX(scaleLimitX)} y2={getPixelY(yMeters)}
                          stroke="white" strokeDasharray="3,3"
                        />
                        <text x={getPixelX(0) - 24} y={getPixelY(yMeters) + 3}>{yMeters.toFixed(0)}m</text>
                      </g>
                    );
                  })}

                  {/* Ground Line */}
                  <line
                    x1={getPixelX(0)} y1={getPixelY(0)}
                    x2={getPixelX(scaleLimitX)} y2={getPixelY(0)}
                    stroke="rgba(255,255,255,0.15)" strokeWidth="2"
                  />

                  {/* Parabolic Guide */}
                  <path
                    d={getGuidePathD()}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.18)"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />

                  {/* Active Path */}
                  <path
                    d={getTrailPathD()}
                    fill="none"
                    stroke="url(#trail-grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Launcher Node */}
                  <circle cx={getPixelX(0)} cy={getPixelY(0)} r="6" fill="#6366f1" />

                  {/* Active Ball */}
                  {(isSimulating || currentTime > 0) && (
                    <circle
                      cx={getPixelX(currentCoords.x)}
                      cy={getPixelY(currentCoords.y)}
                      r="7"
                      fill="#e879f9"
                      stroke="white"
                      strokeWidth="1"
                    />
                  )}

                  <defs>
                    <linearGradient id="trail-grad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Telemetry instant readouts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                {[
                  { label: 'Current X', val: `${currentCoords.x.toFixed(1)} m`, color: '#6366f1' },
                  { label: 'Current Y (Height)', val: `${currentCoords.y.toFixed(1)} m`, color: '#a78bfa' },
                  { label: 'Dynamic Speed', val: `${currentSpeed.toFixed(1)} m/s`, color: '#f472b6' },
                  { label: 'Elapsed Time', val: `${currentTime.toFixed(2)} s`, color: '#34d399' }
                ].map(stat => (
                  <div key={stat.label} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-wider">{stat.label}</p>
                    <p className="text-xs font-black mt-0.5" style={{ color: stat.color }}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sliders Control Deck & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Control Sliders */}
            <div className={`p-5 rounded-2xl border ${cardBg} space-y-5`}>
              <h3 className="text-xs font-black text-white/55 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
                <Gauge size={14} /> Adjustment Knobs
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">Gravity (g)</span>
                  <span className="text-white">{gravity.toFixed(1)} m/s²</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="25.0"
                  step="0.1"
                  value={gravity}
                  onChange={e => setGravity(parseFloat(e.target.value))}
                  disabled={isSimulating}
                  className="w-full accent-indigo-500 bg-white/[0.08] h-1 rounded-full outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">Velocity (v₀)</span>
                  <span className="text-white">{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={velocity}
                  onChange={e => setVelocity(parseInt(e.target.value))}
                  disabled={isSimulating}
                  className="w-full accent-indigo-500 bg-white/[0.08] h-1 rounded-full outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white/60">Elevation Angle (θ)</span>
                  <span className="text-white">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  step="1"
                  value={angle}
                  onChange={e => setAngle(parseInt(e.target.value))}
                  disabled={isSimulating}
                  className="w-full accent-indigo-500 bg-white/[0.08] h-1 rounded-full outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleLaunch}
                  disabled={isSimSimulating => isSimulating}
                  className="flex-grow py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 active:scale-[0.99] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Play size={13} /> Launch Trajectory
                </button>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-white/70 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Readouts Metrics */}
            <div className={`p-5 rounded-2xl border ${cardBg} flex flex-col justify-between`}>
              <div className="space-y-4">
                <h3 className="text-xs font-black text-white/55 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
                  <TrendingUp size={14} /> Newtonian Solutions
                </h3>

                <div className="space-y-3 font-semibold text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-white/60">Horizontal Range (R)</span>
                    <span className="text-xs font-black text-indigo-400">{maxRange.toFixed(1)} m</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-white/60">Max Altitude (H)</span>
                    <span className="text-xs font-black text-violet-400">{maxHeights.toFixed(1)} m</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-white/60">Time of Flight (T)</span>
                    <span className="text-xs font-black text-pink-400">{timeOfFlight.toFixed(2)} s</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5 mt-4">
                <Info size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Formula values are calculated using Newtonian dynamics: R = (v₀² × sin(2θ)) / g and H = (v₀² × sin²(θ)) / 2g.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI Newtonian Tutor (Doubt Solver) and dynamic AI Quiz Arena */}
        <div className="space-y-6">
          
          {/* Section 1: AI Newtonian Tutor Doubt Solver */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} flex flex-col justify-between h-[360px] text-left`}>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={18} className="text-indigo-400" />
              <div>
                <h4 className={`text-xs font-black ${text}`}>AI Newtonian Tutor</h4>
                <p className={`text-[9px] ${subText}`}>Kinematics & Force Vectors</p>
              </div>
            </div>

            {/* Chat Log Logs */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 no-scrollbar text-xs">
              {aiLoading && chatLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`${subText} text-[9px] font-bold`}>Calculating vector formulas...</span>
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
                            ? 'bg-indigo-500/[0.04] border-indigo-500/10 text-white/90'
                            : 'bg-white/[0.02] border-white/[0.05] text-white/70'
                        }`}
                      >
                        <p className="font-extrabold uppercase text-[8px] mb-1 tracking-wider text-indigo-400">
                          {isModel ? '🧠 AI Tutor' : '👤 Student'}
                        </p>
                        <p className="whitespace-pre-wrap">{chat.parts[0].text}</p>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="text-[9px] font-black text-indigo-400 animate-pulse">
                      Tutor is thinking...
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
                placeholder="Ask: 'Why is maximum range at 45°?'..."
                className={`flex-grow px-3 py-2 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 active:scale-[0.97] transition-all text-white cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Section 2: Physics Dynamic Quiz Arena */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} min-h-[300px] text-left`}>
            {quizStage === 'idle' && (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <Award size={20} className="text-indigo-400" />
                </div>
                <h4 className={`text-xs font-black ${text}`}>Gravity & Motion Quiz</h4>
                <p className={`text-[9px] ${subText} mt-1 leading-relaxed px-2`}>
                  Test your trajectory kinematics, flight times, and horizontal vectors to score dynamic XP rewards.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            {quizStage === 'active' && quizQuestions && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-indigo-400 tracking-wide uppercase">
                    Q: {currentQuestionIdx + 1}/{quizQuestions.length}
                  </span>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                    Score: {quizScore}/{quizQuestions.length}
                  </span>
                </div>

                <div className={`h-1 rounded-full bg-white/[0.06] overflow-hidden`}>
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
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
                    className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
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
