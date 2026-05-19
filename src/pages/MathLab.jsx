import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import { explainTopic, askChat, generateQuiz } from '../services/gemini';
import {
  Activity, Play, HelpCircle, Send, Award, RotateCcw,
  BookOpen, Compass, Box, BarChart2, Plus, Minus, Zap, Check, AlertCircle, ChevronRight
} from 'lucide-react';
import { LineChart, Line as ReLine, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- THREE.JS PROCEDURAL COMPONENTS ---

// 1. Trigonometry Unit Circle Component
function UnitCircle3D({ angleDegrees }) {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const targetX = Math.cos(angleRad) * 2;
  const targetY = Math.sin(angleRad) * 2;
  const vectorRef = useRef();

  // Draw circle points procedurally
  const circlePoints = [];
  const segments = 100;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    circlePoints.push([Math.cos(theta) * 2, Math.sin(theta) * 2, 0]);
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Coordinate axes */}
      <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#ffffff" opacity={0.15} lineWidth={1.5} />
      <Line points={[[0, -3, 0], [0, 3, 0]]} color="#ffffff" opacity={0.15} lineWidth={1.5} />

      {/* Main Unit Circle */}
      <Line points={circlePoints} color="#818cf8" lineWidth={2} />

      {/* Cosine Segment (x-axis) */}
      <Line points={[[0, 0, 0], [targetX, 0, 0]]} color="#ef4444" lineWidth={4} />

      {/* Sine Segment (y-axis connector) */}
      <Line points={[[targetX, 0, 0], [targetX, targetY, 0]]} color="#10b981" lineWidth={4} />

      {/* Angle Vector */}
      <Line ref={vectorRef} points={[[0, 0, 0], [targetX, targetY, 0]]} color="#eab308" lineWidth={3.5} />

      {/* Pulsing Target Node */}
      <mesh position={[targetX, targetY, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Center Pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#818cf8" />
      </mesh>

      {/* Sine/Cosine Labels inside 3D canvas */}
      <Html position={[targetX / 2, -0.3, 0]}>
        <span className="text-[10px] font-black text-red-400 bg-black/60 px-1 rounded select-none">
          cos: {Math.cos(angleRad).toFixed(2)}
        </span>
      </Html>
      <Html position={[targetX + 0.15, targetY / 2, 0]}>
        <span className="text-[10px] font-black text-emerald-400 bg-black/60 px-1 rounded select-none">
          sin: {Math.sin(angleRad).toFixed(2)}
        </span>
      </Html>
    </group>
  );
}

// 2. 3D Geometry Explorer Component
function GeometryMesh3D({ shape, radius, height, width }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} />
      
      <mesh ref={meshRef}>
        {shape === 'sphere' && <sphereGeometry args={[radius, 32, 32]} />}
        {shape === 'cube' && <boxGeometry args={[width, width, width]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[radius, radius, height, 32]} />}
        {shape === 'torus' && <torusGeometry args={[radius, radius * 0.3, 16, 100]} />}
        
        <meshStandardMaterial
          color="#818cf8"
          emissive="#312e81"
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </mesh>
    </group>
  );
}

// 3. 3D Parametric Function Graph Plotter
function FunctionPlotter3D({ functionType, coefficientA, coefficientB }) {
  const gridRef = useRef();
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
  });

  // Calculate curve points procedurally
  const curvePoints = [];
  const steps = 150;
  const range = 6; // from -3 to +3
  for (let i = 0; i <= steps; i++) {
    const x = -range / 2 + (i / steps) * range;
    let y = 0;
    
    if (functionType === 'sine') {
      y = Math.sin(x * coefficientB) * coefficientA;
    } else if (functionType === 'quadratic') {
      y = x * x * coefficientA + coefficientB;
    } else if (functionType === 'cubic') {
      y = x * x * x * coefficientA + x * coefficientB;
    }
    curvePoints.push([x, y, 0]);
  }

  return (
    <group ref={gridRef} rotation={[-0.4, 0, 0]}>
      {/* 3D Coordinate Grid mesh */}
      <gridHelper args={[10, 20, '#4f46e5', '#334155']} rotation={[Math.PI / 2, 0, 0]} />
      
      {/* Main math curve line */}
      <Line points={curvePoints} color="#22d3ee" lineWidth={4} />

      {/* Floating particles along the curve to represent wave progression */}
      {curvePoints.filter((_, idx) => idx % 15 === 0).map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      ))}
    </group>
  );
}

// --- MAIN WRAPPER LAB ---

export default function MathLab() {
  const { isDark } = useTheme();
  const { saveQuizScore, completeModule } = useProgress();

  const [activeTab, setActiveTab] = useState('trig'); // trig, geometry, function
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Math Concept Values
  const [angle, setAngle] = useState(45);
  const [geometryShape, setGeometryShape] = useState('sphere');
  const [radius, setRadius] = useState(1.8);
  const [height, setHeight] = useState(2.5);
  const [width, setWidth] = useState(2.0);
  const [functionType, setFunctionType] = useState('sine');
  const [coeffA, setCoeffA] = useState(1.5); // Amplitude / curve scale
  const [coeffB, setCoeffB] = useState(2.0); // Frequency / translation

  // Recharts Trigonometry Wave Data
  const waveData = Array.from({ length: 37 }, (_, idx) => {
    const angleRad = (idx * 10 * Math.PI) / 180;
    return {
      angle: idx * 10,
      sin: Math.sin(angleRad),
      cos: Math.cos(angleRad)
    };
  });

  // AI explanations states
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [chatLog, setChatLog] = useState([]);

  // Quiz Arena states
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizStage, setQuizStage] = useState('idle'); // idle, active, result
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [hasAnsweredQuestion, setHasAnsweredQuestion] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Complete lab lesson automatically on load
  useEffect(() => {
    completeModule('math', 150);
  }, []);

  // Sync Gemini Concept Description
  const fetchConceptExplanation = async (conceptName) => {
    setAiLoading(true);
    try {
      const summary = await explainTopic(conceptName);
      setAiResponse(summary);
      setChatLog([{ role: 'model', parts: [{ text: summary }] }]);
    } catch (err) {
      setError('Unable to fetch concept summary. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let concept = 'Trigonometry unit circle, sine, cosine, tangent values';
    if (activeTab === 'geometry') concept = '3D geometry explorer volume surface equations sphere cube cylinder';
    if (activeTab === 'function') concept = 'Mathematical function plotter graphing waves sine waves quadratic cubic curves';
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
    setLoading(true);
    let quizTopic = 'Trigonometry Unit Circle & Functions';
    if (activeTab === 'geometry') quizTopic = '3D Geometry shapes volume and formulas';
    if (activeTab === 'function') quizTopic = 'Parametric Functions and math graphing';

    try {
      const list = await generateQuiz(quizTopic);
      setQuizQuestions(list);
      setQuizStage('active');
      setCurrentQuestionIdx(0);
      setSelectedOptionIdx(null);
      setHasAnsweredQuestion(false);
      setQuizScore(0);
    } catch (err) {
      setError('Failed to construct custom math deck. Reload page.');
    } finally {
      setLoading(false);
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
      saveQuizScore(`math_${activeTab}`, pct, xpEarned);
    }
  };

  const handleResetQuiz = () => {
    setQuizStage('idle');
    setQuizQuestions(null);
  };

  // Geometric Math Formulas Calculators
  const calculateVolume = () => {
    if (geometryShape === 'sphere') return ((4 / 3) * Math.PI * Math.pow(radius, 3)).toFixed(2);
    if (geometryShape === 'cube') return Math.pow(width, 3).toFixed(2);
    if (geometryShape === 'cylinder') return (Math.PI * Math.pow(radius, 2) * height).toFixed(2);
    if (geometryShape === 'torus') return (2 * Math.PI * Math.PI * radius * Math.pow(radius * 0.3, 2)).toFixed(2);
    return 0;
  };

  const calculateSurfaceArea = () => {
    if (geometryShape === 'sphere') return (4 * Math.PI * Math.pow(radius, 2)).toFixed(2);
    if (geometryShape === 'cube') return (6 * Math.pow(width, 2)).toFixed(2);
    if (geometryShape === 'cylinder') return (2 * Math.PI * radius * (radius + parseFloat(height))).toFixed(2);
    if (geometryShape === 'torus') return (4 * Math.PI * Math.PI * radius * (radius * 0.3)).toFixed(2);
    return 0;
  };

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-xl'
    : 'bg-white border-slate-200 shadow-xl';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-indigo-500/50' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-indigo-400';

  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <PageHeader
        title="Mathematics Interactive Lab 🧮"
        subtitle="Deconstruct algebraic transformations, trigonometric vectors, and 3D geometries."
      />

      {/* Lab Layout Concept Switcher */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('trig')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'trig'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/10'
              : isDark ? 'bg-white/[0.03] text-white/55 border border-white/[0.06] hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Compass size={14} /> Trigonometry Unit Circle
        </button>
        <button
          onClick={() => setActiveTab('geometry')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'geometry'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/10'
              : isDark ? 'bg-white/[0.03] text-white/55 border border-white/[0.06] hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Box size={14} /> 3D Geometry Explorer
        </button>
        <button
          onClick={() => setActiveTab('function')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'function'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/10'
              : isDark ? 'bg-white/[0.03] text-white/55 border border-white/[0.06] hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} /> Parametric Function Plotter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT WORKSPACE: 3D Visualization Canvas & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-2xl border p-5 relative overflow-hidden flex flex-col justify-between ${cardBg} h-[450px]`}>
            {/* HUD Indicators */}
            <div className="absolute top-4 left-4 z-10 space-y-1 select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full">
                Interactive 3D Workbench
              </span>
              <h3 className={`text-base font-bold ${text}`}>
                {activeTab === 'trig' && 'Trigonometric Space'}
                {activeTab === 'geometry' && `Geometry Solid: ${geometryShape.toUpperCase()}`}
                {activeTab === 'function' && `Parametric Function Graph: ${functionType.toUpperCase()}`}
              </h3>
            </div>

            {/* 3D Canvas */}
            <div className="w-full flex-1 rounded-xl bg-[#04061a]/80 border border-white/[0.05] relative overflow-hidden mt-8">
              <Canvas camera={{ position: [0, 0, 5], fov: 65 }}>
                <OrbitControls enableZoom={true} maxDistance={8} minDistance={2} />
                
                {activeTab === 'trig' && (
                  <UnitCircle3D angleDegrees={angle} />
                )}
                {activeTab === 'geometry' && (
                  <GeometryMesh3D
                    shape={geometryShape}
                    radius={radius}
                    height={height}
                    width={width}
                  />
                )}
                {activeTab === 'function' && (
                  <FunctionPlotter3D
                    functionType={functionType}
                    coefficientA={coeffA}
                    coefficientB={coeffB}
                  />
                )}
              </Canvas>
              
              {/* Trigonometry dynamic overlay */}
              {activeTab === 'trig' && (
                <div className="absolute bottom-3 right-3 bg-black/75 rounded-xl border border-white/[0.08] p-3 text-[10px] font-black text-white space-y-1 backdrop-blur-md select-none">
                  <p className="text-red-400">Cosine: {Math.cos((angle * Math.PI) / 180).toFixed(4)}</p>
                  <p className="text-emerald-400">Sine: {Math.sin((angle * Math.PI) / 180).toFixed(4)}</p>
                  <p className="text-yellow-400">Tangent: {Math.sin((angle * Math.PI) / 180) === 0 ? '0' : Math.tan((angle * Math.PI) / 180).toFixed(4)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Parameters Sliders Deck */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <h4 className={`text-xs font-black uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-1.5`}>
              <Zap size={13} /> Adjust Parametric Values
            </h4>

            {activeTab === 'trig' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className={text}>Vector Angle θ (Degrees)</span>
                    <span className="text-indigo-400">{angle}°</span>
                  </div>
                  <input
                    type="range" min="0" max="360" value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'geometry' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {['sphere', 'cube', 'cylinder', 'torus'].map((sh) => (
                    <button
                      key={sh}
                      onClick={() => setGeometryShape(sh)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        geometryShape === sh
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                          : 'border-white/[0.05] text-white/50 hover:bg-white/[0.02]'
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  {geometryShape !== 'cube' && (
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className={text}>Radius</span>
                        <span className="text-indigo-400">{radius.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range" min="0.8" max="2.8" step="0.1" value={radius}
                        onChange={(e) => setRadius(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  )}

                  {geometryShape === 'cylinder' && (
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className={text}>Height</span>
                        <span className="text-indigo-400">{height.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range" min="1.0" max="4.0" step="0.1" value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  )}

                  {geometryShape === 'cube' && (
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className={text}>Side Width</span>
                        <span className="text-indigo-400">{width.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range" min="1.0" max="3.0" step="0.1" value={width}
                        onChange={(e) => setWidth(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Live Formula computation cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                    <p className={`text-[10px] uppercase font-bold ${subText}`}>Volume Solution</p>
                    <p className={`text-base font-black mt-1 ${text}`}>{calculateVolume()} m³</p>
                    <p className={`text-[9px] font-semibold text-indigo-400/80 mt-0.5`}>
                      {geometryShape === 'sphere' && 'Formula: 4/3 * π * r³'}
                      {geometryShape === 'cube' && 'Formula: w³'}
                      {geometryShape === 'cylinder' && 'Formula: π * r² * h'}
                      {geometryShape === 'torus' && 'Formula: 2π² * R * r²'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                    <p className={`text-[10px] uppercase font-bold ${subText}`}>Surface Area</p>
                    <p className={`text-base font-black mt-1 ${text}`}>{calculateSurfaceArea()} m²</p>
                    <p className={`text-[9px] font-semibold text-indigo-400/80 mt-0.5`}>
                      {geometryShape === 'sphere' && 'Formula: 4 * π * r²'}
                      {geometryShape === 'cube' && 'Formula: 6 * w²'}
                      {geometryShape === 'cylinder' && 'Formula: 2πr * (r + h)'}
                      {geometryShape === 'torus' && 'Formula: 4π² * R * r'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'function' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {['sine', 'quadratic', 'cubic'].map((fn) => (
                    <button
                      key={fn}
                      onClick={() => setFunctionType(fn)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        functionType === fn
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white'
                          : 'border-white/[0.05] text-white/50 hover:bg-white/[0.02]'
                      }`}
                    >
                      {fn.toUpperCase()} CURVE
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className={text}>Coefficient A (Scale)</span>
                      <span className="text-indigo-400">{coeffA.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.5" max="3.0" step="0.1" value={coeffA}
                      onChange={(e) => setCoeffA(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className={text}>Coefficient B (Frequency)</span>
                      <span className="text-indigo-400">{coeffB.toFixed(2)}</span>
                    </div>
                    <input
                      type="range" min="0.5" max="4.0" step="0.1" value={coeffB}
                      onChange={(e) => setCoeffB(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: AI Doubt Panel & Custom Quiz Arena */}
        <div className="space-y-6">
          
          {/* Section 1: AI Step-by-Step Study Guide & doubt solver */}
          <div className={`rounded-2xl border p-5 ${cardBg} flex flex-col justify-between h-[360px]`}>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={18} className="text-indigo-400" />
              <div>
                <h4 className={`text-sm font-black ${text}`}>AI Mathematical Explainer</h4>
                <p className={`text-[10px] ${subText}`}>DeepMind Gemini Step-by-Step Proofs</p>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 no-scrollbar text-xs">
              {aiLoading && chatLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`${subText} text-[10px] font-semibold`}>Querying mathematical proofs...</span>
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
                        <p className="font-extrabold uppercase text-[9px] mb-1 tracking-wider text-indigo-400">
                          {isModel ? '🧠 AI Tutor' : '👤 Student'}
                        </p>
                        <p className="whitespace-pre-wrap">{chat.parts[0].text}</p>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="text-[10px] font-black text-indigo-400 animate-pulse">
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
                placeholder="Ask: 'Where is sine wave used?'..."
                className={`flex-grow px-3 py-2 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 active:scale-[0.97] transition-all text-white cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Section 2: Dynamic Quiz Arena */}
          <div className={`rounded-2xl border p-5 ${cardBg} min-h-[300px]`}>
            {quizStage === 'idle' && (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <Award size={20} className="text-indigo-400" />
                </div>
                <h4 className={`text-sm font-black ${text}`}>Custom Math Quiz Arena</h4>
                <p className={`text-[10px] ${subText} mt-1 leading-relaxed px-4`}>
                  Test your understanding of {activeTab === 'trig' ? 'Trigonometry' : activeTab === 'geometry' ? 'Geometry' : 'Functions'} and earn bonus XP rewards.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="mt-4 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            {quizStage === 'active' && quizQuestions && (
              <div className="space-y-4">
                {/* Score telemetry and stats */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-400 tracking-wide uppercase">
                    Q: {currentQuestionIdx + 1}/{quizQuestions.length}
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                    Score: {quizScore}/{quizQuestions.length}
                  </span>
                </div>

                <div className={`h-1 rounded-full bg-white/[0.06] overflow-hidden`}>
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Active question */}
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
                        className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold text-left transition-all ${optionStyle} ${
                          !hasAnsweredQuestion ? 'cursor-pointer hover:scale-[1.005]' : 'cursor-default'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-extrabold bg-white/[0.04] flex-shrink-0">
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
                    className={`rounded-xl p-3 text-[11px] border leading-normal ${
                      selectedOptionIdx === quizQuestions[currentQuestionIdx].correct
                        ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300'
                        : 'bg-red-400/10 border-red-400/20 text-red-300'
                    }`}
                  >
                    <p className="font-bold mb-1 flex items-center gap-1">
                      {selectedOptionIdx === quizQuestions[currentQuestionIdx].correct ? '🎉 Correct +30 XP' : '❌ Incorrect'}
                    </p>
                    <p className="opacity-90">{quizQuestions[currentQuestionIdx].explanation}</p>
                  </motion.div>
                )}

                {hasAnsweredQuestion && (
                  <button
                    onClick={handleQuizNextQuestion}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                  >
                    {currentQuestionIdx + 1 < quizQuestions.length ? 'Next Question' : 'Complete Quiz'} <ChevronRight size={13} />
                  </button>
                )}
              </div>
            )}

            {quizStage === 'result' && (
              <div className="text-center py-6 space-y-4">
                <div className="text-4xl float-animation">🏆</div>
                <h4 className={`text-base font-black ${text}`}>Excellent Practice!</h4>
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <span className="text-xl font-black text-white">
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
