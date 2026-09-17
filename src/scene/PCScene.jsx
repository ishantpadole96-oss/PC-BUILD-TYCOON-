// 3D PC Scene built with React Three Fiber & Three.js
// Interactive stylized 3D workstation with camera presets, animated fans, and slot interactions

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';

// Animated Case Fan
function AnimatedFan({ position, rotation = [0, 0, 0], size = 0.45, isPowered = false, rgbColor = '#00f0ff' }) {
  const fanRef = useRef();

  useFrame((_, delta) => {
    if (fanRef.current && isPowered) {
      fanRef.current.rotation.z += delta * 18;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Fan Frame */}
      <mesh>
        <boxGeometry args={[size, size, 0.08]} />
        <meshStandardMaterial color="#181a20" roughness={0.7} />
      </mesh>
      {/* RGB Ring */}
      <mesh position={[0, 0, 0.045]}>
        <ringGeometry args={[size * 0.35, size * 0.46, 24]} />
        <meshBasicMaterial color={isPowered ? rgbColor : '#333a44'} />
      </mesh>
      {/* Blades */}
      <group ref={fanRef} position={[0, 0, 0.02]}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <boxGeometry args={[0.07, size * 0.42, 0.015]} />
            <meshStandardMaterial color={isPowered ? '#a5f3fc' : '#2d3748'} transparent opacity={0.85} />
          </mesh>
        ))}
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
}

// 3D Component Models inside Case
function ComputerChassis({ build, isPowered, onSlotClick, selectedCategory }) {
  const { cpu, motherboard, gpu, ram, storage, psu, cooler, case: _pcCase } = build;
  const _rgbColor = '#3b82f6';

  return (
    <group position={[0, 0, 0]}>
      {/* Main PC Cabinet Case */}
      {/* Back Wall */}
      <mesh position={[0, 0, -1.05]}>
        <boxGeometry args={[2.2, 2.6, 0.06]} />
        <meshStandardMaterial color="#11141a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Top Panel */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[2.2, 0.06, 2.1]} />
        <meshStandardMaterial color="#161922" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Bottom Base */}
      <mesh position={[0, -1.3, 0]}>
        <boxGeometry args={[2.2, 0.06, 2.1]} />
        <meshStandardMaterial color="#0d1117" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Front Panel with Mesh & RGB Fans */}
      <mesh position={[1.1, 0, 0]}>
        <boxGeometry args={[0.06, 2.6, 2.1]} />
        <meshStandardMaterial color="#141824" metalness={0.6} roughness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* Front Intake Fans */}
      <AnimatedFan position={[1.05, 0.6, 0.3]} rotation={[0, Math.PI / 2, 0]} isPowered={isPowered} rgbColor="#06b6d4" />
      <AnimatedFan position={[1.05, 0.0, 0.3]} rotation={[0, Math.PI / 2, 0]} isPowered={isPowered} rgbColor="#3b82f6" />
      <AnimatedFan position={[1.05, -0.6, 0.3]} rotation={[0, Math.PI / 2, 0]} isPowered={isPowered} rgbColor="#8b5cf6" />
      {/* Rear Exhaust Fan */}
      <AnimatedFan position={[-1.05, 0.5, -0.2]} rotation={[0, -Math.PI / 2, 0]} isPowered={isPowered} rgbColor="#ec4899" />

      {/* PSU Shroud (Bottom compartment) */}
      <mesh position={[0, -0.95, 0.05]} onClick={(e) => { e.stopPropagation(); onSlotClick('psu'); }}>
        <boxGeometry args={[2.15, 0.65, 1.95]} />
        <meshStandardMaterial
          color={selectedCategory === 'psu' ? '#1e3a8a' : '#090d16'}
          emissive={selectedCategory === 'psu' ? '#2563eb' : '#000000'}
          emissiveIntensity={0.3}
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* PSU inside Shroud */}
      {psu && (
        <group position={[-0.45, -0.95, 0.1]}>
          <mesh>
            <boxGeometry args={[0.9, 0.5, 0.7]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          <Text position={[0, 0, 0.36]} fontSize={0.08} color="#94a3b8" anchorX="center" anchorY="middle">
            {psu.model}
          </Text>
        </group>
      )}

      {/* Motherboard Backplate / PCB */}
      <group position={[-0.1, 0.25, -0.95]}>
        {motherboard ? (
          <mesh onClick={(e) => { e.stopPropagation(); onSlotClick('motherboard'); }}>
            <boxGeometry args={[1.5, 1.6, 0.05]} />
            <meshStandardMaterial
              color={selectedCategory === 'motherboard' ? '#1e40af' : '#0f172a'}
              emissive={selectedCategory === 'motherboard' ? '#3b82f6' : isPowered ? '#1e293b' : '#000000'}
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        ) : (
          <mesh onClick={(e) => { e.stopPropagation(); onSlotClick('motherboard'); }}>
            <boxGeometry args={[1.5, 1.6, 0.02]} />
            <meshStandardMaterial color="#1e293b" wireframe />
          </mesh>
        )}

        {/* CPU Socket & Installed CPU */}
        <group position={[0, 0.35, 0.04]} onClick={(e) => { e.stopPropagation(); onSlotClick('cpu'); }}>
          <mesh>
            <boxGeometry args={[0.38, 0.38, 0.04]} />
            <meshStandardMaterial
              color={selectedCategory === 'cpu' ? '#2563eb' : cpu ? '#94a3b8' : '#334155'}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {cpu && (
            <Text position={[0, 0, 0.03]} fontSize={0.06} color="#0f172a" anchorX="center" anchorY="middle">
              {cpu.brand}
            </Text>
          )}

          {/* CPU Cooler on top */}
          {cooler && (
            <group position={[0, 0, 0.32]} onClick={(e) => { e.stopPropagation(); onSlotClick('cooler'); }}>
              {/* Aluminum Fin Stack */}
              <mesh>
                <boxGeometry args={[0.62, 0.62, 0.45]} />
                <meshStandardMaterial
                  color={selectedCategory === 'cooler' ? '#3b82f6' : '#64748b'}
                  metalness={0.8}
                  roughness={0.3}
                />
              </mesh>
              {/* Cooler Fan with RGB */}
              <AnimatedFan position={[0, 0, 0.25]} isPowered={isPowered} rgbColor="#38bdf8" size={0.55} />
            </group>
          )}
        </group>

        {/* RAM DIMM Slots */}
        <group position={[0.42, 0.35, 0.04]} onClick={(e) => { e.stopPropagation(); onSlotClick('ram'); }}>
          {[-0.07, 0, 0.07].map((offset, i) => (
            <mesh key={i} position={[offset, 0, 0]}>
              <boxGeometry args={[0.03, 0.55, 0.08]} />
              <meshStandardMaterial
                color={selectedCategory === 'ram' ? '#3b82f6' : ram ? '#0284c7' : '#1e293b'}
                emissive={ram && isPowered ? '#38bdf8' : '#000000'}
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </group>

        {/* M.2 NVMe Storage Slot */}
        <group position={[0, -0.05, 0.04]} onClick={(e) => { e.stopPropagation(); onSlotClick('storage'); }}>
          <mesh>
            <boxGeometry args={[0.35, 0.12, 0.03]} />
            <meshStandardMaterial
              color={selectedCategory === 'storage' ? '#3b82f6' : storage ? '#059669' : '#1e293b'}
              emissive={storage && isPowered ? '#10b981' : '#000000'}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>

        {/* PCIe Slot & GPU */}
        <group position={[0, -0.38, 0.05]} onClick={(e) => { e.stopPropagation(); onSlotClick('gpu'); }}>
          {/* PCIe Slot Base */}
          <mesh>
            <boxGeometry args={[1.1, 0.06, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Graphics Card Body */}
          {gpu && (
            <group position={[0.1, 0, 0.45]}>
              {/* Shroud */}
              <mesh>
                <boxGeometry args={[1.35, 0.38, 0.65]} />
                <meshStandardMaterial
                  color={selectedCategory === 'gpu' ? '#1e3a8a' : '#111827'}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              {/* Backplate */}
              <mesh position={[0, 0.19, 0]}>
                <boxGeometry args={[1.35, 0.02, 0.65]} />
                <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Dual / Triple GPU Fans */}
              <AnimatedFan position={[-0.35, -0.19, 0]} rotation={[Math.PI / 2, 0, 0]} size={0.3} isPowered={isPowered} rgbColor="#a855f7" />
              <AnimatedFan position={[0.35, -0.19, 0]} rotation={[Math.PI / 2, 0, 0]} size={0.3} isPowered={isPowered} rgbColor="#a855f7" />
              {/* Illuminated Branding */}
              <mesh position={[0, 0, 0.33]}>
                <boxGeometry args={[0.6, 0.08, 0.01]} />
                <meshBasicMaterial color={isPowered ? '#38bdf8' : '#475569'} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* Internal RGB Ambient Glow when PC is Powered On */}
      {isPowered && (
        <pointLight position={[0, 0.3, 0]} color="#38bdf8" intensity={2.5} distance={3.5} />
      )}
    </group>
  );
}

export function PCScene({ selectedCategory, onSelectCategory }) {
  const currentBuild = useGameStore((s) => s.currentBuild);
  const pcPowerState = useGameStore((s) => s.pcPowerState);
  const controlsRef = useRef();

  const isPowered = pcPowerState === 'desktop' || pcPowerState === 'booting_os' || pcPowerState === 'post';

  // Camera preset buttons
  const setCameraPreset = (preset) => {
    if (!controlsRef.current) return;
    if (preset === 'overview') {
      controlsRef.current.object.position.set(2.8, 1.8, 3.2);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'motherboard') {
      controlsRef.current.object.position.set(0, 0.3, 2.0);
      controlsRef.current.target.set(-0.1, 0.25, -0.95);
    } else if (preset === 'gpu') {
      controlsRef.current.object.position.set(0.5, -0.4, 2.2);
      controlsRef.current.target.set(0, -0.3, 0);
    } else if (preset === 'front') {
      controlsRef.current.object.position.set(3.8, 0, 0.5);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(135deg, #141a2e 0%, #1a1f35 50%, #0f1424 100%)', overflow: 'hidden' }}>
      {/* 3D Viewport Controls Bar */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 16,
        zIndex: 10,
        display: 'flex',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}>
        <button
          onClick={() => setCameraPreset('overview')}
          style={{ background: '#1e293b', color: '#94a3b8', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          🎥 Overview
        </button>
        <button
          onClick={() => setCameraPreset('motherboard')}
          style={{ background: '#1e293b', color: '#94a3b8', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          🔌 Motherboard
        </button>
        <button
          onClick={() => setCameraPreset('gpu')}
          style={{ background: '#1e293b', color: '#94a3b8', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          🎮 GPU Slot
        </button>
        <button
          onClick={() => setCameraPreset('front')}
          style={{ background: '#1e293b', color: '#94a3b8', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          ✨ RGB Fans
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [2.8, 1.8, 3.2], fov: 45 }}>
        <ambientLight intensity={0.9} color="#e8ecf4" />
        <directionalLight position={[5, 8, 5]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-3, 4, 3]} intensity={0.8} color="#b4c6e8" />
        <hemisphereLight args={['#b4d4ff', '#2a2a35', 0.5]} />
        <pointLight position={[-4, 2, -2]} intensity={1.0} color="#3b82f6" />
        <pointLight position={[3, -2, 2]} intensity={0.8} color="#8b5cf6" />

        <ComputerChassis
          build={currentBuild}
          isPowered={isPowered}
          onSlotClick={onSelectCategory}
          selectedCategory={selectedCategory}
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.8}
          maxDistance={7.0}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>

      {/* Interaction Hint Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        color: '#64748b',
        fontSize: '11px',
        pointerEvents: 'none',
        background: 'rgba(15, 23, 42, 0.75)',
        padding: '4px 12px',
        borderRadius: '12px',
      }}>
        🖱️ Left Click + Drag to Rotate • Scroll to Zoom • Click internal slots to select
      </div>
    </div>
  );
}
