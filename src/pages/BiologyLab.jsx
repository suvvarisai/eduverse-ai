import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import PageHeader from '../components/PageHeader';
import {
  Sparkles, ZoomIn, ZoomOut, RotateCw, RefreshCw,
  Info, ChevronLeft, Award, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ORGANELLES = {
  membrane: {
    title: 'Cell Membrane',
    role: 'Protective Barrier & Gatekeeper',
    description: 'A semi-permeable lipid bilayer that surrounds the cell, protecting its internal components from the environment and regulating the entry and exit of molecules and nutrients.',
    funFact: 'It is so thin that it would take about 10,000 cell membranes stacked on top of each other to equal the thickness of a single sheet of paper!',
    color: '#38bdf8',
    icon: '🌐'
  },
  nucleus: {
    title: 'Nucleus',
    role: 'Control Center & DNA Vault',
    description: 'The brain of the cell, housing the genetic instructions (DNA) needed to guide all cellular activities, growth, reproduction, and protein synthesis.',
    funFact: 'If you uncoiled the DNA inside a single human nucleus, it would stretch about 2 meters long, packed into a space smaller than a grain of dust!',
    color: '#a78bfa',
    icon: '🟣'
  },
  mitochondria: {
    title: 'Mitochondria',
    role: 'Powerhouse of the Cell',
    description: 'Sausage-shaped organelles responsible for cellular respiration. They convert chemical energy from food (glucose) into adenosine triphosphate (ATP), the cell\'s primary fuel.',
    funFact: 'Active cells like heart muscle cells can have thousands of mitochondria to meet their massive, round-the-clock energy demands!',
    color: '#fb923c',
    icon: '🍊'
  },
  ribosomes: {
    title: 'Ribosomes',
    role: 'Protein Factories',
    description: 'Tiny, spherical structures that translate messenger RNA (mRNA) instructions into polypeptide chains of amino acids, producing the proteins essential for all life functions.',
    funFact: 'A single active human cell can contain up to 10 million ribosomes working around the clock to produce proteins!',
    color: '#22d3ee',
    icon: '🔵'
  }
};

// --- 3D Scene Components ---

function CellMembrane({ onSelect, isSelected }) {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });
  return (
    <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect('membrane'); }}>
      <sphereGeometry args={[2.8, 32, 32]} />
      <meshPhongMaterial
        color="#38bdf8"
        transparent
        opacity={isSelected ? 0.22 : 0.1}
        wireframe={true}
        shininess={100}
      />
    </mesh>
  );
}

function Nucleus({ onSelect, isSelected }) {
  const groupRef = useRef();
  const innerRef = useRef();
  
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    innerRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05);
  });

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onSelect('nucleus'); }}>
      {/* Inner Nucleolus */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#4c1d95"
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      {/* Outer Envelope */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshPhongMaterial
          color="#a78bfa"
          transparent
          opacity={0.3}
          wireframe={isSelected}
          shininess={80}
        />
      </mesh>
    </group>
  );
}

function Mitochondria({ onSelect, isSelected, position, rotation }) {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.06;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={[0.8, 0.45, 0.45]}
      onClick={(e) => { e.stopPropagation(); onSelect('mitochondria'); }}
    >
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial
        color="#f97316"
        emissive={isSelected ? "#ea580c" : "#7c2d12"}
        emissiveIntensity={isSelected ? 1.5 : 0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

function Ribosomes({ onSelect, isSelected }) {
  const pointsRef = useRef();
  useFrame((state) => {
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;
  });

  // Pre-calculated scattered points in the cytoplasm
  const [positions] = useState(() => {
    const coords = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 1.3 + Math.random() * 1.0; // cytoplasm gap
      coords.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ]);
    }
    return coords;
  });

  return (
    <group ref={pointsRef} onClick={(e) => { e.stopPropagation(); onSelect('ribosomes'); }}>
      {positions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[isSelected ? 0.09 : 0.06, 8, 8]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive={isSelected ? "#22d3ee" : "#0891b2"}
            emissiveIntensity={isSelected ? 1.5 : 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// --- Main Laboratory Page ---

export default function BiologyLab() {
  const { isDark } = useTheme();
  const { completeModule } = useProgress();
  const [selectedOrganelle, setSelectedOrganelle] = useState('nucleus');
  const [autoRotate, setAutoRotate] = useState(true);
  const orbitRef = useRef();

  useEffect(() => {
    completeModule('biology', 150);
  }, []);

  const handleZoom = (direction) => {
    if (!orbitRef.current) return;
    const camera = orbitRef.current.object;
    if (direction === 'in') {
      camera.position.multiplyScalar(0.85);
    } else {
      camera.position.multiplyScalar(1.15);
    }
    orbitRef.current.update();
  };

  const handleReset = () => {
    if (!orbitRef.current) return;
    orbitRef.current.reset();
    setSelectedOrganelle('nucleus');
    setAutoRotate(true);
  };

  const data = ORGANELLES[selectedOrganelle];

  return (
    <div className="min-h-full pb-10">
      <div className="mb-4">
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
        title="3D Human Cell Explorer"
        subtitle="Step inside a microscopic cell model. Rotate the scene, zoom into organelles, and tap on structures to unlock their details."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch mt-6">
        
        {/* Canvas Explorer Panel */}
        <div className="xl:col-span-2 relative h-[500px] xl:h-[600px] rounded-3xl border border-white/[0.08] bg-[#020310] overflow-hidden group shadow-lg">
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <directionalLight position={[0, 5, 0]} intensity={1} />
              
              <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1} />
              
              {/* Procedural Organelles */}
              <CellMembrane onSelect={setSelectedOrganelle} isSelected={selectedOrganelle === 'membrane'} />
              <Nucleus onSelect={setSelectedOrganelle} isSelected={selectedOrganelle === 'nucleus'} />
              
              <Mitochondria
                position={[-1.4, 0.8, -1.0]}
                rotation={[0.3, 0.5, 0.4]}
                onSelect={setSelectedOrganelle}
                isSelected={selectedOrganelle === 'mitochondria'}
              />
              <Mitochondria
                position={[1.5, -0.6, 1.2]}
                rotation={[0.2, 0.8, -0.6]}
                onSelect={setSelectedOrganelle}
                isSelected={selectedOrganelle === 'mitochondria'}
              />
              <Mitochondria
                position={[0.2, -1.5, -0.8]}
                rotation={[0.8, 0.2, 0.3]}
                onSelect={setSelectedOrganelle}
                isSelected={selectedOrganelle === 'mitochondria'}
              />
              
              <Ribosomes onSelect={setSelectedOrganelle} isSelected={selectedOrganelle === 'ribosomes'} />

              <OrbitControls
                ref={orbitRef}
                enableDamping
                dampingFactor={0.05}
                minDistance={2.0}
                maxDistance={5.5}
                autoRotate={autoRotate}
                autoRotateSpeed={1.0}
                makeDefault
              />
            </Canvas>
          </div>

          {/* R3F Top Floating HUD Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {Object.keys(ORGANELLES).map((orgId) => {
              const org = ORGANELLES[orgId];
              const isSelected = selectedOrganelle === orgId;
              return (
                <button
                  key={orgId}
                  onClick={() => {
                    setSelectedOrganelle(orgId);
                    setAutoRotate(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-500 to-violet-600 border-transparent text-white shadow-md'
                      : 'bg-black/50 backdrop-blur-md border-white/10 text-white/60 hover:text-white hover:bg-black/70'
                  }`}
                >
                  <span>{org.icon}</span>
                  <span className="hidden sm:inline">{org.title}</span>
                </button>
              );
            })}
          </div>

          {/* R3F Bottom HUD Controls */}
          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => handleZoom('in')}
              className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => setAutoRotate(r => !r)}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer hover:scale-105 ${
                autoRotate
                  ? 'bg-primary-500 text-white border-transparent shadow-md shadow-primary-500/20'
                  : 'bg-black/60 hover:bg-black/80 text-white border-white/10'
              }`}
              title="Toggle Auto-Rotation"
            >
              <RotateCw size={16} className={autoRotate ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Reset View"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Micro Instructions Overlay */}
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5 pointer-events-none">
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
              🖱️ Drag to Rotate | 📜 Scroll to Zoom
            </p>
          </div>
        </div>

        {/* Informational Sidebar Panel */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOrganelle}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 glass rounded-3xl p-6 flex flex-col justify-between border border-white/[0.08] relative overflow-hidden"
            >
              {/* Background gradient orb */}
              <div
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 transition-all duration-300"
                style={{ backgroundColor: data.color }}
              />

              <div className="text-left space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{data.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {data.title}
                    </h2>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border"
                      style={{ color: data.color, borderColor: `${data.color}25`, backgroundColor: `${data.color}08` }}
                    >
                      {data.role}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white/45 uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={12} /> Structure & Function
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-sans font-medium">
                    {data.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5 mt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                    <Award size={12} /> Did You Know?
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-sans font-semibold">
                    {data.funFact}
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-violet-500/5 border border-primary-500/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary-400" />
                  <span className="text-xs font-bold text-white">Interact and Learn</span>
                </div>
                <p className="text-[11px] text-white/45 font-medium leading-relaxed">
                  Try clicking on different components of the 3D cell model on the left to learn about their unique, life-sustaining functions!
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
