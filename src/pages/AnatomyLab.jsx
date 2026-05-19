import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import { explainTopic, askChat, generateQuiz } from '../services/gemini';
import {
  Compass, Award, RotateCcw, Play, Shield, Eye, EyeOff,
  Check, AlertCircle, ChevronRight, Zap, Send, Activity, Info, Heart as HeartIcon
} from 'lucide-react';

// --- RICH DETAILED MEDICAL CATALOG DATA ---
const organsCatalog = [
  {
    id: 'brain',
    name: 'Cerebral Cortex Brain',
    system: 'Nervous',
    color: '#a855f7',
    icon: '🧠',
    details: 'Central synaptic node regulating cognitive thoughts, memory retrieval, motor reflexes, and homeostasis.',
    diseases: 'Alzheimer\'s neurodegeneration, Meningitis inflammatory, Ischemic Stroke cerebral vessel blocks.',
    fact: 'The human brain consumes about 20% of the entire body\'s oxygen supply despite being only 2% of total weight.'
  },
  {
    id: 'heart',
    name: 'Cardiac Heart Muscle',
    system: 'Circulatory',
    color: '#f43f5e',
    icon: '🫀',
    details: 'Four-chambered muscular muscular pump initiating systemic pulmonary circulation loops via rhythmic ventricles.',
    diseases: 'Coronary Artery calcifications, Myocardial Infarction tissue death, Arrhythmia electrical deviations.',
    fact: 'The heart beats approximately 100,000 times per day, pumping over 2,000 gallons of oxygenated blood.'
  },
  {
    id: 'lungs',
    name: 'Respiratory Dual Lungs',
    system: 'Respiratory',
    color: '#06b6d4',
    icon: '🫁',
    details: 'Bilateral gas-exchange lobes facilitating alveolar carbon dioxide expulsion and arterial oxygenation processes.',
    diseases: 'Chronic Obstructive Pulmonary (COPD), Pneumonia alveolar fluid, Bronchitis tubular irritation.',
    fact: 'The surface area of both lungs is roughly equivalent to a tennis court, optimized entirely for micro-gas exchange.'
  },
  {
    id: 'stomach',
    name: 'Gastric Stomach Acid Container',
    system: 'Digestive',
    color: '#f97316',
    icon: '🥗',
    details: 'Highly acidic gastrointestinal reservoir performing chemical protein digestion via pepsin and hydrochloric acids.',
    diseases: 'Gastric Peptic Ulcers, Acid Reflux (GERD), Gastritis mucosal erosion.',
    fact: 'The stomach lining is completely replaced every 3 to 4 days to prevent it from digesting itself in its pH 1.5 acid bath.'
  },
  {
    id: 'kidneys',
    name: 'Bilateral Renal Kidneys',
    system: 'Urinary',
    color: '#10b981',
    icon: '💧',
    details: 'Bilateral blood-filtration units removing metabolic wastes, maintaining fluid homeostasis, and regulating blood pressure.',
    diseases: 'Chronic Renal Failure, Nephrolithiasis (Kidney Stones), Glomerulonephritis filters inflammatory.',
    fact: 'Your kidneys filter your entire blood volume approximately 40 times every single day to remove chemical urea.'
  }
];

// --- 1. SKELETAL LAYER (High-Fidelity Vertebrae & Ribs) ---
function SkeletalLayer() {
  return (
    <group>
      {/* Vertebrae Spine stack */}
      {Array.from({ length: 18 }).map((_, idx) => {
        const y = 1.0 - idx * 0.12;
        // Add realistic spinal curvature (lordosis/kyphosis curve)
        const z = Math.sin(idx * 0.4) * 0.05;
        return (
          <mesh key={`vert_${idx}`} position={[0, y, z]}>
            <cylinderGeometry args={[0.075, 0.085, 0.07, 16]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} metalness={0.2} />
          </mesh>
        );
      })}

      {/* Rib Cage symmetrical loops */}
      {Array.from({ length: 8 }).map((_, idx) => {
        const yOffset = 0.7 - idx * 0.14;
        const ribPoints = [];
        const count = 30;
        const scaleX = 0.5 + idx * 0.02;
        const scaleZ = 0.25;

        for (let i = 0; i <= count; i++) {
          const theta = (i / count) * Math.PI;
          ribPoints.push([Math.cos(theta) * scaleX, yOffset, Math.sin(theta) * scaleZ]);
        }
        return (
          <Line
            key={`rib_${idx}`}
            points={ribPoints}
            color="#e2e8f0"
            opacity={0.35}
            lineWidth={1.5}
          />
        );
      })}

      {/* Pelvis Plates */}
      <mesh position={[0, -1.0, 0]}>
        <torusGeometry args={[0.26, 0.06, 8, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Skull representation */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#f1f5f9" wireframe={true} opacity={0.35} transparent={true} />
      </mesh>
    </group>
  );
}

// --- 2. CIRCULATORY SYSTEM LAYER (Pulsing Blood Flows & Red/Blue Particles) ---
function CirculatoryLayer({ heartbeatSpeed }) {
  const particleGroupRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime() * heartbeatSpeed * 2.2;
    if (particleGroupRef.current) {
      particleGroupRef.current.children.forEach((child, idx) => {
        const offset = (idx * 0.14 + elapsed) % 1.0;
        const y = 0.8 - offset * 2.3;
        const x = Math.sin(offset * Math.PI * 5) * 0.12;
        child.position.set(idx % 2 === 0 ? -0.16 + x : 0.16 + x, y, Math.cos(offset * Math.PI * 5) * 0.05);
      });
    }
  });

  return (
    <group>
      {/* Symmetrical Descending Red Artery Pipeline */}
      <Line
        points={[[-0.14, 0.8, 0], [-0.15, 0.2, 0], [-0.18, -0.4, 0], [-0.1, -1.0, 0], [-0.3, -1.8, 0]]}
        color="#f43f5e"
        lineWidth={2.2}
      />
      {/* Symmetrical Descending Blue Vein Pipeline */}
      <Line
        points={[[0.14, 0.8, 0], [0.15, 0.2, 0], [0.18, -0.4, 0], [0.1, -1.0, 0], [0.3, -1.8, 0]]}
        color="#3b82f6"
        lineWidth={2.2}
      />

      {/* Circulatory flow blood particles */}
      <group ref={particleGroupRef}>
        {Array.from({ length: 14 }).map((_, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[0.024, 6, 6]} />
            <meshBasicMaterial color={idx % 2 === 0 ? "#ef4444" : "#3b82f6"} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --- 3. NERVOUS SYSTEM LAYER (Electric Purples & Action Potential Nodes) ---
function NervousLayer({ nerveSpeed }) {
  const particleGroupRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime() * nerveSpeed * 3.5;
    if (particleGroupRef.current) {
      particleGroupRef.current.children.forEach((child, idx) => {
        const offset = (idx * 0.25 + elapsed) % 1.0;
        const angle = (idx * 60) * Math.PI / 180;
        const radius = offset * 0.95;
        // Travel radially from spine down branches
        child.position.set(Math.cos(angle) * radius, 0.8 - radius * 0.45, Math.sin(angle) * radius * 0.25);
      });
    }
  });

  return (
    <group>
      {/* Central spinal nerve column */}
      <Line points={[[0, 1.2, 0], [0, -1.5, 0]]} color="#c084fc" lineWidth={2} />

      {/* Symmetrical neural branching branches */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx * 60) * Math.PI / 180;
        return (
          <Line
            key={idx}
            points={[[0, 0.8, 0], [Math.cos(angle) * 0.9, 0.8 - 0.45, 0]]}
            color="#c084fc"
            opacity={0.4}
            lineWidth={1}
          />
        );
      })}

      {/* Nerve impulses electric particles */}
      <group ref={particleGroupRef}>
        {Array.from({ length: 10 }).map((_, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// --- 4. HIGH-FIDELITY PROCEDURAL LOBED ORGAN GEOMETRIES ---
function Heart3D({ isSelected, onSelect, heartbeatSpeed, renderMode }) {
  const heartGroupRef = useRef();

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * heartbeatSpeed * 1.5) % Math.PI;
    // Sys/Dia systolic lub-dub heartbeat curve
    let pulse = 1.0;
    if (t < 0.25) {
      pulse = 1.0 + Math.sin((t / 0.25) * Math.PI) * 0.07; // Lub peak
    } else if (t >= 0.3 && t < 0.55) {
      pulse = 1.0 + Math.sin(((t - 0.3) / 0.25) * Math.PI) * 0.12; // Dub peak (stronger!)
    }
    if (heartGroupRef.current) {
      heartGroupRef.current.scale.set(pulse * 0.95, pulse * 0.95, pulse * 0.95);
    }
  });

  const transparent = renderMode === 'transparency' || renderMode === 'xray';
  const opacity = renderMode === 'transparency' ? 0.35 : renderMode === 'xray' ? 0.15 : 1.0;

  return (
    <group
      ref={heartGroupRef}
      position={[0, 0.35, 0.12]}
      onClick={(e) => { e.stopPropagation(); onSelect('heart'); }}
      className="cursor-pointer"
    >
      {/* Central Ventricular Muscle */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.15}
          metalness={0.4}
          emissive={isSelected ? "#f43f5e" : "#5c0e18"}
          emissiveIntensity={isSelected ? 1.5 : 0.6}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
      
      {/* Symmetrical Ascending Aorta cylinder */}
      <mesh position={[-0.06, 0.16, 0.05]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.045, 0.045, 0.18, 16]} />
        <meshStandardMaterial
          color="#ef4444"
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Symmetrical Ascending Pulmonary blue vessel */}
      <mesh position={[0.06, 0.16, 0.05]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 16]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

function Lungs3D({ isSelected, onSelect, breathingSpeed, renderMode }) {
  const lungsGroupRef = useRef();

  useFrame((state) => {
    // Breathing scale expansion loop
    const breath = 1.0 + Math.sin(state.clock.getElapsedTime() * breathingSpeed * 1.8) * 0.07;
    if (lungsGroupRef.current) {
      lungsGroupRef.current.scale.set(breath, breath, breath);
    }
  });

  const transparent = renderMode === 'transparency' || renderMode === 'xray';
  const opacity = renderMode === 'transparency' ? 0.35 : renderMode === 'xray' ? 0.12 : 1.0;

  return (
    <group
      ref={lungsGroupRef}
      position={[0, 0.36, 0.02]}
      onClick={(e) => { e.stopPropagation(); onSelect('lungs'); }}
      className="cursor-pointer"
    >
      {/* Left lung lobe */}
      <mesh position={[-0.24, 0, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color="#06b6d4"
          roughness={0.4}
          emissive={isSelected ? "#22d3ee" : "#083344"}
          emissiveIntensity={isSelected ? 1.4 : 0.5}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Right lung lobe */}
      <mesh position={[0.24, 0, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color="#06b6d4"
          roughness={0.4}
          emissive={isSelected ? "#22d3ee" : "#083344"}
          emissiveIntensity={isSelected ? 1.4 : 0.5}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

function Brain3D({ isSelected, onSelect, renderMode }) {
  const brainRef = useRef();

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  const transparent = renderMode === 'transparency' || renderMode === 'xray';
  const opacity = renderMode === 'transparency' ? 0.4 : renderMode === 'xray' ? 0.1 : 1.0;

  return (
    <group
      ref={brainRef}
      position={[0, 1.42, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect('brain'); }}
      className="cursor-pointer"
    >
      {/* Double cerebral hemisphere wireframes */}
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#c084fc"
          wireframe={true}
          emissive={isSelected ? "#a855f7" : "#3b0764"}
          emissiveIntensity={isSelected ? 1.6 : 0.6}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Small pulsing synapse spheres */}
      {Array.from({ length: 5 }).map((_, idx) => {
        const offset = (idx * 72) * Math.PI / 180;
        return (
          <mesh key={idx} position={[Math.cos(offset) * 0.16, Math.sin(offset) * 0.16, 0.05]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        );
      })}
    </group>
  );
}

function Stomach3D({ isSelected, onSelect, renderMode }) {
  const transparent = renderMode === 'transparency' || renderMode === 'xray';
  const opacity = renderMode === 'transparency' ? 0.35 : renderMode === 'xray' ? 0.12 : 1.0;

  return (
    <group
      position={[-0.04, -0.22, 0.1]}
      onClick={(e) => { e.stopPropagation(); onSelect('stomach'); }}
      className="cursor-pointer"
    >
      <mesh>
        <torusGeometry args={[0.14, 0.065, 16, 32]} />
        <meshStandardMaterial
          color="#f97316"
          roughness={0.1}
          emissive={isSelected ? "#f97316" : "#431407"}
          emissiveIntensity={isSelected ? 1.5 : 0.5}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

function Kidneys3D({ isSelected, onSelect, renderMode }) {
  const transparent = renderMode === 'transparency' || renderMode === 'xray';
  const opacity = renderMode === 'transparency' ? 0.35 : renderMode === 'xray' ? 0.12 : 1.0;

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect('kidneys'); }}
      className="cursor-pointer"
    >
      {/* Left Kidney */}
      <mesh position={[-0.2, -0.42, 0.02]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial
          color="#10b981"
          roughness={0.2}
          emissive={isSelected ? "#34d399" : "#022c22"}
          emissiveIntensity={isSelected ? 1.5 : 0.5}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Right Kidney */}
      <mesh position={[0.2, -0.42, 0.02]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial
          color="#10b981"
          roughness={0.2}
          emissive={isSelected ? "#34d399" : "#022c22"}
          emissiveIntensity={isSelected ? 1.5 : 0.5}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

// --- MAIN ANATOMICAL EXPLORER VIEWPORT ---
export default function AnatomyLab() {
  const { isDark } = useTheme();
  const { saveQuizScore, completeModule } = useProgress();

  // Active configurations
  const [selectedOrgan, setSelectedOrgan] = useState(organsCatalog[1]); // heart default
  const [isIsolated, setIsIsolated] = useState(false);
  const [renderMode, setRenderMode] = useState('normal'); // normal | transparency | xray

  // Simulation parameters
  const [heartbeatSpeed, setHeartbeatSpeed] = useState(1.0);
  const [breathingSpeed, setBreathingSpeed] = useState(1.0);
  const [nerveSpeed, setNerveSpeed] = useState(1.0);

  // Layer switches
  const [activeLayers, setActiveLayers] = useState({
    skeletal: true,
    circulatory: true,
    nervous: true,
    organs: true
  });

  // AI Tutoring & doubts solving
  const [doubtText, setDoubtText] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  // Anatomy Quiz Arena states
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizStage, setQuizStage] = useState('idle'); // idle | active | result
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [hasAnsweredQuestion, setHasAnsweredQuestion] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Synthesize stethoscope sound when selected organ switches to Heart
  useEffect(() => {
    if (selectedOrgan.id === 'heart') {
      playHeartbeatBeep();
    }
  }, [selectedOrgan]);

  // Complete module on start
  useEffect(() => {
    completeModule('anatomy', 150);
  }, []);

  const playHeartbeatBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Biphasic Sys/Dia thud oscillator
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(75, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(60, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.18);
      }, 160);
    } catch (_) {}
  };

  // Sync details from AI
  const fetchOrganicReview = async (name) => {
    setAiLoading(true);
    try {
      const prompt = `Explain the physiological details, cellular function, and micro-homeostasis roles of the human organ: "${name}". Support the response with markdown format. Keep it concise.`;
      const reply = await explainTopic(prompt);
      setChatLog([{ role: 'model', parts: [{ text: reply }] }]);
    } catch (err) {
      setError('Unable to reach clinical AI database.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganicReview(selectedOrgan.name);
  }, [selectedOrgan]);

  // Doubt solving submissions
  const handleDoubtSubmit = async (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    const userMsg = doubtText;
    setDoubtText('');
    const updated = [...chatLog, { role: 'user', parts: [{ text: userMsg }] }];
    setChatLog(updated);
    setAiLoading(true);

    try {
      const reply = await askChat(userMsg, updated);
      setChatLog([...updated, { role: 'model', parts: [{ text: reply }] }]);
    } catch (_) {
      setChatLog([...updated, { role: 'model', parts: [{ text: 'Clinical advisor is currently busy. Try again.' }] }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Quiz Generation
  const handleStartQuiz = async () => {
    setAiLoading(true);
    const quizTopic = `Human biology: ${selectedOrgan.system} nervous system, organ ${selectedOrgan.name}, structure and related medical pathologies.`;

    try {
      const list = await generateQuiz(quizTopic);
      if (list && list.length > 0) {
        setQuizQuestions(list);
        setQuizStage('active');
        setCurrentQuestionIdx(0);
        setSelectedOptionIdx(null);
        setHasAnsweredQuestion(false);
        setQuizScore(0);
      }
    } catch (_) {
      setError('Failed to construct custom anatomy deck.');
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
      saveQuizScore(`anatomy_${selectedOrgan.id}`, pct, xpEarned);
    }
  };

  const toggleLayer = (layKey) => {
    setActiveLayers(prev => ({ ...prev, [layKey]: !prev[layKey] }));
  };

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-xl'
    : 'bg-white border-slate-200 shadow-xl';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-red-500/50' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-400';

  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <PageHeader
        title="3D Human Anatomy Explorer 🫁"
        subtitle="Unveil multi-layered systems interactively. Switch transparency shaders, adjust breathing velocities, and query the clinical AI anatomist advisor."
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 flex items-center justify-between text-xs text-left">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[10px] uppercase font-black tracking-widest text-white">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDEBAR: System Layer visibility controls and Organs catalog list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Layer Visibility Toggles */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} text-left`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
              <Shield size={13} /> Anatomical Layers
            </h4>
            
            <div className="space-y-2">
              {Object.keys(activeLayers).map((layerKey) => (
                <button
                  key={layerKey}
                  onClick={() => toggleLayer(layerKey)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeLayers[layerKey]
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'border-white/[0.04] bg-white/[0.01] text-white/40'
                  }`}
                >
                  <span>{layerKey} layer</span>
                  {activeLayers[layerKey] ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Organs navigation panel */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} text-left`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
              <Activity size={13} /> Selected Organs
            </h4>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
              {organsCatalog.map((org) => {
                const isSel = selectedOrgan.id === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => { setSelectedOrgan(org); playHeartbeatBeep(); }}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-red-500/10 border-red-500 text-red-400 shadow-md shadow-red-500/5'
                        : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.02] text-white/50'
                    }`}
                  >
                    <span className="text-sm">{org.icon}</span>
                    <div className="flex-grow">
                      <p className="text-xs font-black leading-tight text-white">{org.name}</p>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-white/40 mt-0.5">{org.system} System</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER WORKSPACE: 3D human silhouette and organs canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-2xl border p-5 relative overflow-hidden flex flex-col justify-between ${cardBg} h-[520px] text-left`}>
            <div className="absolute top-4 left-4 z-10 space-y-1 select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-wider text-red-400 uppercase bg-red-500/10 px-2.5 py-1 rounded-full">
                Interactive 3D Anatomy Canvas
              </span>
              <h3 className={`text-sm font-bold ${text} pt-2`}>
                {isIsolated ? `Isolated view: ${selectedOrgan.name.toUpperCase()}` : 'Multilayer Anatomical Blueprint'}
              </h3>
            </div>

            {/* Render Toggles bar */}
            <div className="absolute top-4 right-4 z-10 flex gap-1.5">
              {['normal', 'transparency', 'xray'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setRenderMode(mode)}
                  className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all cursor-pointer border ${
                    renderMode === mode
                      ? 'bg-red-500 border-red-400 text-white'
                      : 'border-white/[0.06] text-white/45 bg-black/20 hover:bg-white/[0.02]'
                  }`}
                >
                  {mode}
                </button>
              ))}

              <button
                onClick={() => setIsIsolated(!isIsolated)}
                className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all cursor-pointer ${
                  isIsolated
                    ? 'bg-red-500 text-white border-red-400'
                    : 'border-white/[0.08] text-white/50 hover:bg-white/[0.03]'
                }`}
              >
                Isolate: {isIsolated ? "ON" : "OFF"}
              </button>
            </div>

            {/* 3D Anatomical R3F Canvas */}
            <div className="w-full flex-1 rounded-xl bg-[#030412] border border-white/[0.05] relative overflow-hidden mt-10">
              <Canvas camera={{ position: [0, 0.1, 2.2], fov: 55 }}>
                <ambientLight intensity={0.45} />
                <pointLight position={[2, 3, 2]} intensity={1.5} color="#ef4444" />
                <directionalLight position={[-2, 3, -1]} intensity={1.0} color="#3b82f6" />
                
                <OrbitControls enableZoom={true} maxDistance={3.5} minDistance={1.0} />
                
                <group position={[0, -0.1, 0]}>
                  {/* Outline blueprint Human Silhouette */}
                  {!isIsolated && (
                    <mesh position={[0, -0.2, 0]}>
                      <capsuleGeometry args={[0.42, 2.0, 8, 16]} />
                      <meshBasicMaterial color="#ef4444" wireframe={true} opacity={0.03} transparent={true} />
                    </mesh>
                  )}

                  {/* Skeletal spine layer */}
                  {activeLayers.skeletal && (!isIsolated || selectedOrgan.id === 'brain' || selectedOrgan.id === 'heart') && (
                    <SkeletalLayer />
                  )}

                  {/* Circulatory layer */}
                  {activeLayers.circulatory && (!isIsolated || selectedOrgan.id === 'heart') && (
                    <CirculatoryLayer heartbeatSpeed={heartbeatSpeed} />
                  )}

                  {/* Nervous system layer */}
                  {activeLayers.nervous && (!isIsolated || selectedOrgan.id === 'brain') && (
                    <NervousLayer nerveSpeed={nerveSpeed} />
                  )}

                  {/* Organs layer rendering */}
                  {activeLayers.organs && (
                    <group>
                      {(!isIsolated || selectedOrgan.id === 'lungs') && (
                        <Lungs3D
                          isSelected={selectedOrgan.id === 'lungs'}
                          onSelect={(id) => setSelectedOrgan(organsCatalog.find(o => o.id === id))}
                          breathingSpeed={breathingSpeed}
                          renderMode={renderMode}
                        />
                      )}
                      {(!isIsolated || selectedOrgan.id === 'heart') && (
                        <Heart3D
                          isSelected={selectedOrgan.id === 'heart'}
                          onSelect={(id) => setSelectedOrgan(organsCatalog.find(o => o.id === id))}
                          heartbeatSpeed={heartbeatSpeed}
                          renderMode={renderMode}
                        />
                      )}
                      {(!isIsolated || selectedOrgan.id === 'brain') && (
                        <Brain3D
                          isSelected={selectedOrgan.id === 'brain'}
                          onSelect={(id) => setSelectedOrgan(organsCatalog.find(o => o.id === id))}
                          renderMode={renderMode}
                        />
                      )}
                      {(!isIsolated || selectedOrgan.id === 'stomach') && (
                        <Stomach3D
                          isSelected={selectedOrgan.id === 'stomach'}
                          onSelect={(id) => setSelectedOrgan(organsCatalog.find(o => o.id === id))}
                          renderMode={renderMode}
                        />
                      )}
                      {(!isIsolated || selectedOrgan.id === 'kidneys') && (
                        <Kidneys3D
                          isSelected={selectedOrgan.id === 'kidneys'}
                          onSelect={(id) => setSelectedOrgan(organsCatalog.find(o => o.id === id))}
                          renderMode={renderMode}
                        />
                      )}
                    </group>
                  )}
                </group>
              </Canvas>

              {/* Dynamic HUD Details on screen */}
              <div className="absolute bottom-3 left-3 bg-black/75 rounded-xl border border-white/[0.08] p-3 text-[10px] font-black text-white max-w-[200px] leading-normal backdrop-blur-md select-none">
                <p className="text-red-400 font-extrabold uppercase mb-0.5">{selectedOrgan.name}</p>
                <p className="text-white/70">{selectedOrgan.details}</p>
              </div>
            </div>

            {/* Interactive Simulation Sliders */}
            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-white/[0.05]">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-white/55 uppercase">
                  <span>Heartbeat Rate</span>
                  <span className="text-red-400">{heartbeatSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={heartbeatSpeed}
                  onChange={e => setHeartbeatSpeed(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-white/10 h-1 rounded-full outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-white/55 uppercase">
                  <span>Respiration Rate</span>
                  <span className="text-cyan-400">{breathingSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={breathingSpeed}
                  onChange={e => setBreathingSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 bg-white/10 h-1 rounded-full outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-white/55 uppercase">
                  <span>Neural Velocity</span>
                  <span className="text-yellow-400">{nerveSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={nerveSpeed}
                  onChange={e => setNerveSpeed(parseFloat(e.target.value))}
                  className="w-full accent-yellow-500 bg-white/10 h-1 rounded-full outline-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: AI Clinical Explanations & Quiz Arena */}
        <div className="space-y-6 lg:col-span-1">
          {/* Organ medical details */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} text-left space-y-3`}>
            <h4 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Info size={13} /> Diagnostic Records
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">Medical Pathology Risks</p>
                <p className="text-[10px] text-white/80 font-semibold leading-relaxed mt-0.5">{selectedOrgan.diseases}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Fun Health Fact</p>
                <p className="text-[10px] text-white/80 font-semibold leading-relaxed mt-0.5">{selectedOrgan.fact}</p>
              </div>
            </div>
          </div>

          {/* Section 1: AI Explanations doubt solver */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} flex flex-col justify-between h-[300px] text-left`}>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={18} className="text-red-400" />
              <div>
                <h4 className={`text-xs font-black ${text}`}>AI Anatomist Advisor</h4>
                <p className={`text-[9px] ${subText}`}>Homeostasis & Medical Diseases</p>
              </div>
            </div>

            {/* Conversation log */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 no-scrollbar text-[10px]">
              {aiLoading && chatLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`${subText} text-[10px] font-semibold`}>Querying anatomical summary...</span>
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
                            ? 'bg-red-500/[0.04] border-red-500/10 text-white/90'
                            : 'bg-white/[0.02] border-white/[0.05] text-white/70'
                        }`}
                      >
                        <p className="font-extrabold uppercase text-[9px] mb-1 tracking-wider text-red-400">
                          {isModel ? '🧠 AI Tutor' : '👤 Student'}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">{chat.parts[0].text}</p>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="text-[10px] font-black text-red-400 animate-pulse">
                      Anatomist is thinking...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ask panel */}
            <form onSubmit={handleDoubtSubmit} className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]">
              <input
                type="text"
                value={doubtText}
                onChange={e => setDoubtText(e.target.value)}
                placeholder="Ask clinical queries..."
                className={`flex-grow px-3 py-2 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 active:scale-[0.97] transition-all text-white cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Section 2: Anatomy Quiz system */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} min-h-[220px] text-left`}>
            {quizStage === 'idle' && (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <Award size={20} className="text-red-400" />
                </div>
                <h4 className={`text-xs font-black ${text}`}>Organ System Quiz</h4>
                <p className={`text-[9px] ${subText} mt-1 leading-relaxed px-2`}>
                  Test your anatomical terminology, organ functions, and biological health facts.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-red-500/10"
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            {quizStage === 'active' && quizQuestions && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-red-400 tracking-wide uppercase">
                    Q: {currentQuestionIdx + 1}/{quizQuestions.length}
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                    Score: {quizScore}/{quizQuestions.length}
                  </span>
                </div>

                <div className={`h-1 rounded-full bg-white/[0.06] overflow-hidden`}>
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
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
                        className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-[10px] font-semibold text-left transition-all ${optionStyle} ${
                          !hasAnsweredQuestion ? 'cursor-pointer hover:scale-[1.005]' : 'cursor-default'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[9px] font-extrabold bg-white/[0.04] flex-shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-grow leading-tight">{optText}</span>
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
                    <p className="opacity-90">{quizQuestions[currentQuestionIdx].explanation}</p>
                  </motion.div>
                )}

                {hasAnsweredQuestion && (
                  <button
                    onClick={handleQuizNextQuestion}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-red-500/10"
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
