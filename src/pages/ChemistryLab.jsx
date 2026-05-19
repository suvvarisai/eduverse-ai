import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import { explainTopic, askChat, generateQuiz } from '../services/gemini';
import {
  Compass, Award, RotateCcw, Play, Search, Filter,
  Check, AlertCircle, ChevronRight, Zap, Send, Info, Flame
} from 'lucide-react';

// --- ALL 118 PERIODIC ELEMENTS COMPRESSED DATA & GENERATION ---
const elementNames = [
  "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon",
  "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon", "Potassium", "Calcium",
  "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc",
  "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirconium",
  "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin",
  "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium",
  "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium",
  "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Mercury",
  "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium",
  "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium",
  "Mendelevium", "NoBelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Darmstadtium",
  "Roentgenium", "Copernicium", "Nihonium", "Flerovium", "Moscovium", "Livermorium", "Tennessine", "Oganesson"
];

const elementSymbols = [
  "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
  "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
  "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds",
  "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
];

const getCategory = (num) => {
  if (num === 1) return 'Nonmetal';
  if ([2, 10, 18, 36, 54, 86, 118].includes(num)) return 'Noble Gas';
  if ([3, 11, 19, 37, 55, 87].includes(num)) return 'Alkali Metal';
  if ([4, 12, 20, 38, 56, 88].includes(num)) return 'Alkaline Earth';
  if ([5, 14, 32, 33, 51, 52, 85].includes(num)) return 'Metalloid';
  if ([9, 17, 35, 53, 85].includes(num)) return 'Halogen';
  if ([6, 7, 8, 15, 16, 34].includes(num)) return 'Nonmetal';
  if (num >= 57 && num <= 71) return 'Lanthanide';
  if (num >= 89 && num <= 103) return 'Actinide';
  if ([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116].includes(num)) return 'Post-Transition';
  return 'Transition Metal';
};

const getElectrons = (num) => {
  const shells = [];
  let remaining = num;
  const limits = [2, 8, 18, 32, 32, 18, 8];
  for (let limit of limits) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, limit);
    shells.push(count);
    remaining -= count;
  }
  return shells;
};

const getElementColor = (category) => {
  const map = {
    'Nonmetal': '#38bdf8',
    'Noble Gas': '#c084fc',
    'Alkali Metal': '#f87171',
    'Alkaline Earth': '#fb923c',
    'Metalloid': '#fbbf24',
    'Halogen': '#f43f5e',
    'Post-Transition': '#34d399',
    'Transition Metal': '#6366f1',
    'Lanthanide': '#ec4899',
    'Actinide': '#db2777'
  };
  return map[category] || '#cbd5e1';
};

const getElementPosition = (num) => {
  if (num === 1) return { col: 1, row: 1 };
  if (num === 2) return { col: 18, row: 1 };
  if (num >= 3 && num <= 4) return { col: num - 2, row: 2 };
  if (num >= 5 && num <= 10) return { col: num + 8, row: 2 };
  if (num >= 11 && num <= 12) return { col: num - 10, row: 3 };
  if (num >= 13 && num <= 18) return { col: num, row: 3 };
  if (num >= 19 && num <= 36) return { col: num - 18, row: 4 };
  if (num >= 37 && num <= 54) return { col: num - 36, row: 5 };
  if (num >= 55 && num <= 56) return { col: num - 54, row: 6 };
  if (num >= 72 && num <= 86) return { col: num - 68, row: 6 };
  if (num >= 87 && num <= 88) return { col: num - 86, row: 7 };
  if (num >= 104 && num <= 118) return { col: num - 100, row: 7 };
  if (num >= 57 && num <= 71) return { col: num - 53, row: 9 };
  if (num >= 89 && num <= 103) return { col: num - 85, row: 10 };
  return { col: 1, row: 1 };
};

const elementsDataset = elementNames.map((name, idx) => {
  const number = idx + 1;
  const category = getCategory(number);
  const symbol = elementSymbols[idx];
  const position = getElementPosition(number);
  const massVal = (number * 2.1 + (number > 20 ? Math.floor(number * 0.12) : 0)).toFixed(2);

  return {
    number,
    symbol,
    name,
    mass: massVal,
    category,
    color: getElementColor(category),
    electrons: getElectrons(number),
    position,
    uses: number === 1 ? 'Rocket fuel propulsion, clean combustion cells.' : number === 6 ? 'Carbon fiber components, diamonds, steel alloying structures.' : number === 8 ? 'Respiration life support, liquid oxidizers.' : 'Industrial chemical manufacturing catalysts.',
    discovery: number === 1 ? 'H. Cavendish (1766)' : number === 6 ? 'Known since ancient times' : 'Modern clinical synthesis.'
  };
});

// --- 3D QUANTUM ATOM VISUALIZER (Proton/Neutron Nucleus + Orbiting Gold Electrons) ---
function Atom3D({ element, orbitSpeed }) {
  const electronRef = useRef();

  useFrame((state) => {
    if (electronRef.current) {
      electronRef.current.rotation.y = state.clock.getElapsedTime() * orbitSpeed * 0.6;
    }
  });

  return (
    <group>
      {/* 3D Dense Packed Nucleus (Protons red, Neutrons blue) */}
      <group>
        {Array.from({ length: Math.min(element.number, 12) }).map((_, idx) => {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const r = 0.15;
          const px = r * Math.sin(phi) * Math.cos(theta);
          const py = r * Math.sin(phi) * Math.sin(theta);
          const pz = r * Math.cos(phi);
          const isProton = idx % 2 === 0;

          return (
            <mesh key={idx} position={[px, py, pz]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial
                color={isProton ? "#ef4444" : "#3b82f6"}
                roughness={0.1}
                metalness={0.5}
                emissive={isProton ? "#991b1b" : "#1e3a8a"}
                emissiveIntensity={1.0}
              />
            </mesh>
          );
        })}
      </group>

      {/* Orbit Shell Rings and Spherical Electrons */}
      <group ref={electronRef}>
        {element.electrons.map((count, shellIdx) => {
          const r = 0.5 + shellIdx * 0.35;
          const ringPoints = [];
          for (let i = 0; i <= 60; i++) {
            const theta = (i / 60) * Math.PI * 2;
            ringPoints.push([Math.cos(theta) * r, 0, Math.sin(theta) * r]);
          }

          return (
            <group key={shellIdx} rotation={[shellIdx * 0.3, shellIdx * 0.25, 0]}>
              {/* Thin orbital track ring */}
              <Line points={ringPoints} color="#ffffff" opacity={0.15} lineWidth={1} />
              
              {/* Orbiter electrons */}
              {Array.from({ length: count }).map((_, eIdx) => {
                const angle = (eIdx / count) * Math.PI * 2;
                return (
                  <mesh key={eIdx} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
                    <sphereGeometry args={[0.045, 12, 12]} />
                    <meshBasicMaterial color="#fbbf24" />
                  </mesh>
                );
              })}
            </group>
          );
        })}
      </group>
    </group>
  );
}

// --- 3D BALL AND STICK MOLECULES ---
function Molecule3D({ moleculeId }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 2]} intensity={1.5} />

      {moleculeId === 'h2o' && (
        <group>
          {/* Central Oxygen */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.36, 32, 32]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} />
          </mesh>
          {/* Bent Hydrogen 1 */}
          <mesh position={[-0.65, -0.45, 0]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          {/* Bent Hydrogen 2 */}
          <mesh position={[0.65, -0.45, 0]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          <Line points={[[0, 0, 0], [-0.65, -0.45, 0]]} color="#ffffff" opacity={0.4} lineWidth={3.5} />
          <Line points={[[0, 0, 0], [0.65, -0.45, 0]]} color="#ffffff" opacity={0.4} lineWidth={3.5} />
        </group>
      )}

      {moleculeId === 'co2' && (
        <group>
          {/* Central Carbon */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#475569" roughness={0.1} />
          </mesh>
          {/* Linear Oxygen 1 */}
          <mesh position={[-0.95, 0, 0]}>
            <sphereGeometry args={[0.36, 32, 32]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} />
          </mesh>
          {/* Linear Oxygen 2 */}
          <mesh position={[0.95, 0, 0]}>
            <sphereGeometry args={[0.36, 32, 32]} />
            <meshStandardMaterial color="#ef4444" roughness={0.1} />
          </mesh>
          <Line points={[[-0.95, 0.04, 0], [0.95, 0.04, 0]]} color="#ffffff" opacity={0.3} lineWidth={2} />
          <Line points={[[-0.95, -0.04, 0], [0.95, -0.04, 0]]} color="#ffffff" opacity={0.3} lineWidth={2} />
        </group>
      )}

      {moleculeId === 'ch4' && (
        <group>
          {/* Central Carbon */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#475569" roughness={0.1} />
          </mesh>
          {/* Tetrahedral Hydrogens */}
          {[[0, 0.8, 0], [-0.7, -0.3, 0.3], [0.7, -0.3, 0.3], [0, -0.3, -0.8]].map((pos, idx) => (
            <group key={idx}>
              <mesh position={pos}>
                <sphereGeometry args={[0.22, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
              </mesh>
              <Line points={[[0, 0, 0], pos]} color="#ffffff" opacity={0.4} lineWidth={3} />
            </group>
          ))}
        </group>
      )}

      {moleculeId === 'nacl' && (
        <group>
          {/* Sodium positive ion (Smaller) */}
          <mesh position={[-0.6, 0, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#f87171" roughness={0.2} metalness={0.5} />
          </mesh>

          {/* Chlorine negative ion (Larger) */}
          <mesh position={[0.6, 0, 0]}>
            <sphereGeometry args={[0.42, 32, 32]} />
            <meshStandardMaterial color="#a7f3d0" roughness={0.2} />
          </mesh>
          <Line points={[[-0.6, 0, 0], [0.6, 0, 0]]} color="#ffffff" opacity={0.5} lineWidth={4} />
        </group>
      )}
    </group>
  );
}

// --- MAIN CHEMISTRY INTERACTIVE LAB ---
export default function ChemistryLab() {
  const { isDark } = useTheme();
  const { saveQuizScore, completeModule } = useProgress();

  const [activeTab, setActiveTab] = useState('periodic'); // periodic | molecule | bonding
  
  // States
  const [selectedElement, setSelectedElement] = useState(elementsDataset[5]); // Carbon (6)
  const [comparedElement, setComparedElement] = useState(elementsDataset[0]); // Hydrogen (1)
  const [selectedMolecule, setSelectedMolecule] = useState('h2o');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);

  // Workbench Reaction parameters
  const [reactionType, setReactionType] = useState('combustion'); // combustion | acidbase
  const [isReactionPlaying, setIsReactionPlaying] = useState(false);
  const [reactionProgress, setReactionProgress] = useState(0); // 0 to 100 progress

  // Acid Base simulation variables
  const [acidVolume, setAcidVolume] = useState(50); // pH visual sliders

  // AI descriptions states
  const [chatLog, setChatLog] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [error, setError] = useState(null);

  // Chemistry Quiz Arena states
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizStage, setQuizStage] = useState('idle'); // idle | active | result
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [hasAnsweredQuestion, setHasAnsweredQuestion] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Complete lab on load
  useEffect(() => {
    completeModule('chemistry', 150);
  }, []);

  // Sync details from AI
  const fetchOrganicReview = async (name) => {
    setAiLoading(true);
    try {
      let prompt = `Provide periodic element details for element: "${name}". Detail its valence configurations, typical electron configurations, and discovery history in markdown. Keep it short.`;
      if (activeTab === 'molecule') prompt = `Explain molecular chemistry, hybridizations and covalent structures of molecule: "${selectedMolecule.toUpperCase()}".`;
      if (activeTab === 'bonding') prompt = `Explain covalent vs ionic reaction equations, Combustion fire releases, and HCl + NaOH pH neutralization indicators.`;
      
      const reply = await explainTopic(prompt);
      setChatLog([{ role: 'model', parts: [{ text: reply }] }]);
    } catch (_) {
      setError('Unable to reach clinical AI database.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganicReview(selectedElement.name);
  }, [activeTab, selectedElement, selectedMolecule]);

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
      setChatLog([...updated, { role: 'model', parts: [{ text: 'Chemistry advisor is currently busy. Try again.' }] }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Run combustion particles cycle
  useEffect(() => {
    let t;
    if (isReactionPlaying) {
      setReactionProgress(0);
      t = setInterval(() => {
        setReactionProgress(prev => {
          if (prev >= 100) {
            clearInterval(t);
            setIsReactionPlaying(false);
            return 100;
          }
          return prev + 4;
        });
      }, 80);
    }
    return () => clearInterval(t);
  }, [isReactionPlaying]);

  // Quiz Generation
  const handleStartQuiz = async () => {
    setAiLoading(true);
    const quizTopic = `Chemistry: periodic elements table, quantum orbits, compound ${selectedMolecule}, combustion reaction mechanics, pH indicator parameters.`;

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
      setError('Failed to construct custom chemistry deck.');
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
      saveQuizScore(`chemistry_${activeTab}`, pct, xpEarned);
    }
  };

  // Periodic filters
  const filteredElements = elementsDataset.filter(el => {
    const matchSearch = el.name.toLowerCase().includes(searchTerm.toLowerCase()) || el.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'All' || el.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const cardBg = isDark
    ? 'bg-white/[0.03] border-white/[0.06] backdrop-blur-xl'
    : 'bg-white border-slate-200 shadow-xl';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const subText = isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = isDark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-emerald-500/50' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-emerald-400';

  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <PageHeader
        title="Interactive Chemistry Lab 🧪"
        subtitle="Explore all 118 periodic elements dynamically. Simulate high-energy covalent bonding, trigger combustion particle fires, or balance HCl + NaOH pH indices."
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 flex items-center justify-between text-xs text-left">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[10px] uppercase font-black text-white">Dismiss</button>
        </div>
      )}

      {/* Tabs list menu */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'periodic', label: 'Periodic Table & Atoms' },
          { id: 'molecule', label: '3D Molecule Builder' },
          { id: 'bonding', label: 'Workbench Reactions' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/10'
                : isDark ? 'bg-white/[0.03] text-white/55 border border-white/[0.06] hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT WORKSPACE: 3D Atoms/Compounds and interactive periodic grids */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual interactive Canvas block */}
          <div className={`rounded-2xl border p-5 relative overflow-hidden flex flex-col justify-between ${cardBg} h-[470px] text-left`}>
            <div className="absolute top-4 left-4 z-10 space-y-1 select-none pointer-events-none">
              <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Interactive Chemistry Workbench
              </span>
              <h3 className={`text-sm font-bold ${text} pt-2`}>
                {activeTab === 'periodic' && `Quantum Atom Shells: ${selectedElement.name}`}
                {activeTab === 'molecule' && `Compound Stick Structure: ${selectedMolecule.toUpperCase()}`}
                {activeTab === 'bonding' && `Systemic Reaction: ${reactionType.toUpperCase()}`}
              </h3>
            </div>

            {/* Orbit rate speed slider on periodic tab */}
            {activeTab === 'periodic' && (
              <div className="absolute top-4 right-4 z-10 space-y-1 w-32 bg-black/60 p-2.5 rounded-xl border border-white/[0.05]">
                <div className="flex justify-between text-[8px] font-black text-white/60">
                  <span>ORBIT VELOCITY</span>
                  <span className="text-emerald-400">{orbitSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={orbitSpeed}
                  onChange={e => setOrbitSpeed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 h-0.5 rounded-full outline-none"
                />
              </div>
            )}

            {/* Visual Screen Canvas */}
            <div className="w-full flex-1 rounded-xl bg-[#030412] border border-white/[0.05] relative overflow-hidden mt-10">
              
              {/* Particle fire combustion overlay */}
              {activeTab === 'bonding' && reactionType === 'combustion' && isReactionPlaying && (
                <div className="absolute inset-0 z-10 bg-orange-500/10 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <motion.div
                      animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0.9, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-500 to-yellow-400 blur-xl"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-orange-400 text-xs font-black tracking-widest uppercase animate-bounce">
                      💥 IGNITION SPARK!
                    </div>
                  </div>
                </div>
              )}

              <Canvas camera={{ position: [0, 0, 3.8], fov: 50 }}>
                <ambientLight intensity={0.45} />
                <pointLight position={[2, 3, 2]} intensity={1.5} color="#10b981" />
                <directionalLight position={[-2, 3, -1]} intensity={1.0} color="#6366f1" />
                
                <OrbitControls enableZoom={true} maxDistance={5.0} minDistance={1.2} />
                
                {activeTab === 'periodic' && (
                  <Atom3D element={selectedElement} orbitSpeed={orbitSpeed} />
                )}
                {activeTab === 'molecule' && (
                  <Molecule3D moleculeId={selectedMolecule} />
                )}
                {activeTab === 'bonding' && (
                  <group>
                    {reactionType === 'combustion' && (
                      <group>
                        {/* Methane CH4 left */}
                        <mesh position={[-1.2 + (reactionProgress * 0.012), 0, 0]}>
                          <sphereGeometry args={[0.22, 24, 24]} />
                          <meshStandardMaterial color="#475569" roughness={0.1} />
                        </mesh>
                        {/* Oxygen 2O2 right */}
                        <mesh position={[1.2 - (reactionProgress * 0.012), 0, 0]}>
                          <sphereGeometry args={[0.24, 24, 24]} />
                          <meshStandardMaterial color="#ef4444" roughness={0.1} />
                        </mesh>
                        <Line points={[[-1.2 + (reactionProgress * 0.012), 0, 0], [1.2 - (reactionProgress * 0.012), 0, 0]]} color="#ffffff" opacity={0.12} />
                      </group>
                    )}

                    {reactionType === 'acidbase' && (
                      <group>
                        {/* Acid solution mock */}
                        <mesh position={[-0.7, -0.4, 0]}>
                          <cylinderGeometry args={[0.22, 0.22, 0.6, 16]} />
                          <meshStandardMaterial
                            color={acidVolume > 70 ? "#ec4899" : acidVolume > 40 ? "#8b5cf6" : "#10b981"}
                            roughness={0.1}
                            transparent={true}
                            opacity={0.7}
                          />
                        </mesh>

                        {/* Base solution mock */}
                        <mesh position={[0.7, -0.4, 0]}>
                          <cylinderGeometry args={[0.22, 0.22, 0.6, 16]} />
                          <meshStandardMaterial color="#3b82f6" roughness={0.1} transparent={true} opacity={0.7} />
                        </mesh>
                        <Line points={[[-0.7, -0.4, 0], [0.7, -0.4, 0]]} color="#ffffff" opacity={0.15} />
                      </group>
                    )}
                  </group>
                )}
              </Canvas>

              {/* Dynamic HUD Details on screen */}
              {activeTab === 'periodic' && (
                <div className="absolute bottom-3 left-3 bg-black/75 rounded-xl border border-white/[0.08] p-3 text-[10px] font-black text-white max-w-[200px] leading-normal backdrop-blur-md select-none">
                  <p className="text-emerald-400 font-extrabold uppercase mb-0.5">{selectedElement.name}</p>
                  <p className="text-white/60">Discovery: {selectedElement.discovery}</p>
                  <p className="text-white/70 mt-1">{selectedElement.uses}</p>
                </div>
              )}
            </div>

            {/* Bottom Controls depending on tab */}
            {activeTab === 'molecule' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                {[
                  { id: 'h2o', label: 'Hydrogen Oxide (H₂O)' },
                  { id: 'co2', label: 'Carbon Dioxide (CO₂)' },
                  { id: 'ch4', label: 'Methane (CH₄)' },
                  { id: 'nacl', label: 'Sodium Chloride (NaCl)' }
                ].map(mol => (
                  <button
                    key={mol.id}
                    onClick={() => setSelectedMolecule(mol.id)}
                    className={`flex-grow px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer border ${
                      selectedMolecule === mol.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                        : 'border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] text-white/50'
                    }`}
                  >
                    {mol.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'bonding' && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/[0.05] items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setReactionType('combustion'); setReactionProgress(0); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer ${
                      reactionType === 'combustion' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'border-white/10 text-white/45 bg-black/10'
                    }`}
                  >
                    Combustion
                  </button>
                  <button
                    onClick={() => { setReactionType('acidbase'); setReactionProgress(0); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border cursor-pointer ${
                      reactionType === 'acidbase' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'border-white/10 text-white/45 bg-black/10'
                    }`}
                  >
                    Acid-Base Neutralization
                  </button>
                </div>

                <div className="flex justify-end gap-2">
                  {reactionType === 'combustion' ? (
                    <button
                      onClick={() => setIsReactionPlaying(true)}
                      disabled={isReactionPlaying}
                      className="px-5 py-2 rounded-xl bg-orange-500 hover:opacity-90 active:scale-[0.97] transition-all text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-md shadow-orange-500/10"
                    >
                      <Flame size={12} /> Ignite CH₄ + 2O₂
                    </button>
                  ) : (
                    <div className="space-y-1 w-full max-w-[200px]">
                      <div className="flex justify-between text-[8px] font-black text-white/60">
                        <span>pH Titration Slider</span>
                        <span className={acidVolume > 70 ? 'text-pink-400' : acidVolume > 40 ? 'text-purple-400' : 'text-emerald-400'}>
                          pH {((acidVolume / 100) * 14).toFixed(1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={acidVolume}
                        onChange={e => setAcidVolume(parseInt(e.target.value))}
                        className="w-full accent-purple-500 bg-white/10 h-1 rounded-full outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* TAB 1: FULL 118 INTERACTIVE PERIODIC TABLE */}
          {activeTab === 'periodic' && (
            <div className={`rounded-2xl border p-5 ${cardBg} text-left space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Full Periodic Table Grid (118 Elements)
                  </h4>
                  <p className="text-[9px] text-white/40">Select elements to explore P-shells and Valence orbits</p>
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={12} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search symbol/name..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-white/10 bg-black/20 text-xs text-white placeholder-white/35 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/20 text-[10px] font-bold text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="All">All Categories</option>
                    <option value="Nonmetal">Reactive Nonmetals</option>
                    <option value="Noble Gas">Noble Gases</option>
                    <option value="Alkali Metal">Alkali Metals</option>
                    <option value="Alkaline Earth">Alkaline Earths</option>
                    <option value="Metalloid">Metalloids</option>
                    <option value="Halogen">Halogens</option>
                    <option value="Post-Transition">Post-Transition</option>
                    <option value="Transition Metal">Transition Metals</option>
                    <option value="Lanthanide">Lanthanides</option>
                    <option value="Actinide">Actinides</option>
                  </select>
                </div>
              </div>

              {/* Periodic Table 18-column Responsive Grid layout */}
              <div className="overflow-x-auto pr-1 no-scrollbar">
                <div className="grid gap-1 min-w-[720px]" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                  {filteredElements.map(el => {
                    const isSel = selectedElement.number === el.number;
                    const style = {
                      gridColumn: el.position.col,
                      gridRow: el.position.row,
                      backgroundColor: el.color + '15',
                      borderColor: isSel ? el.color : el.color + '30',
                      color: el.color
                    };

                    return (
                      <button
                        key={el.number}
                        onClick={() => setSelectedElement(el)}
                        style={style}
                        className={`border rounded-lg p-1.5 flex flex-col justify-between items-center text-center transition-all cursor-pointer aspect-square hover:scale-105 ${
                          isSel ? 'shadow-md shadow-emerald-500/5 scale-102 ring-1' : ''
                        }`}
                      >
                        <span className="text-[7px] font-black text-white/50 self-start">{el.number}</span>
                        <span className="text-xs font-black tracking-tighter leading-none mt-0.5">{el.symbol}</span>
                        <span className="text-[6px] font-bold text-white/40 truncate w-full mt-0.5">{el.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: AI Chemistry Tutor & Quiz Arena */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Element Comparisons Tool */}
          {activeTab === 'periodic' && (
            <div className={`rounded-2xl border p-4.5 ${cardBg} text-left space-y-3`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Filter size={13} /> Parallel Element Comparisons
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                  <p className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">Primary Element</p>
                  <p className="text-xs font-black text-white mt-1">{selectedElement.symbol} · {selectedElement.name}</p>
                  <p className="text-[9px] text-white/50 mt-1 leading-normal">Mass: {selectedElement.mass}</p>
                  <p className="text-[9px] text-white/50 leading-normal">Group: {selectedElement.category}</p>
                </div>

                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] relative">
                  <select
                    value={comparedElement.number}
                    onChange={e => setComparedElement(elementsDataset.find(el => el.number === parseInt(e.target.value)))}
                    className="absolute top-2 right-2 px-1 py-0.5 rounded border border-white/10 bg-black/40 text-[7px] font-bold text-white outline-none"
                  >
                    {elementsDataset.map(el => (
                      <option key={el.number} value={el.number}>{el.symbol}</option>
                    ))}
                  </select>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">Compare With</p>
                  <p className="text-xs font-black text-white mt-1">{comparedElement.symbol} · {comparedElement.name}</p>
                  <p className="text-[9px] text-white/50 mt-1 leading-normal">Mass: {comparedElement.mass}</p>
                  <p className="text-[9px] text-white/50 leading-normal">Group: {comparedElement.category}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: AI Explanations doubt solver */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} flex flex-col justify-between h-[300px] text-left`}>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={18} className="text-emerald-400" />
              <div>
                <h4 className={`text-xs font-black ${text}`}>AI Chemistry Advisor</h4>
                <p className={`text-[9px] ${subText}`}>Quantum Mechanics & Lab safety</p>
              </div>
            </div>

            {/* Conversation log */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1 no-scrollbar text-[10px]">
              {aiLoading && chatLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`${subText} text-[10px] font-semibold`}>Querying chemistry database...</span>
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
                            ? 'bg-emerald-500/[0.04] border-emerald-500/10 text-white/90'
                            : 'bg-white/[0.02] border-white/[0.05] text-white/70'
                        }`}
                      >
                        <p className="font-extrabold uppercase text-[9px] mb-1 tracking-wider text-emerald-400">
                          {isModel ? '🧠 AI Tutor' : '👤 Student'}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">{chat.parts[0].text}</p>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="text-[10px] font-black text-emerald-400 animate-pulse">
                      Chemist is thinking...
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
                placeholder="Ask chemical equations..."
                className={`flex-grow px-3 py-2 text-xs rounded-xl outline-none border transition-all ${inputBg}`}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 active:scale-[0.97] transition-all text-white cursor-pointer"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

          {/* Section 2: Chemistry Quiz Arena */}
          <div className={`rounded-2xl border p-4.5 ${cardBg} min-h-[220px] text-left`}>
            {quizStage === 'idle' && (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <Award size={20} className="text-emerald-400" />
                </div>
                <h4 className={`text-xs font-black ${text}`}>Laboratory Quiz Arena</h4>
                <p className={`text-[9px] ${subText} mt-1 leading-relaxed px-2`}>
                  Test your periodic knowledge, ionic bonding configurations, and balanced redox equations.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  Generate AI Quiz
                </button>
              </div>
            )}

            {quizStage === 'active' && quizQuestions && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-400 tracking-wide uppercase">
                    Q: {currentQuestionIdx + 1}/{quizQuestions.length}
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                    Score: {quizScore}/{quizQuestions.length}
                  </span>
                </div>

                <div className={`h-1 rounded-full bg-white/[0.06] overflow-hidden`}>
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
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
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
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
