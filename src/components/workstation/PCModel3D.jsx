import React, { useRef, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Box, Plane, Cylinder, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// A spinning fan component
function SpinningFan({ position, rotation, isPoweredOn }) {
  const meshRef = useRef();
  
  // Load the texture we generated
  const fanTexture = useLoader(THREE.TextureLoader, '/textures/fan.jpg');

  useFrame((state, delta) => {
    if (isPoweredOn && meshRef.current) {
      meshRef.current.rotation.y += delta * 15; // Spin fast when on
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Outer frame */}
      <Box args={[1.2, 0.2, 1.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#222" />
      </Box>
      {/* Spinning blades (cylinder with texture) */}
      <Cylinder ref={meshRef} args={[0.55, 0.55, 0.22, 32]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial map={fanTexture} />
      </Cylinder>
      {/* RGB Ring glow when powered */}
      {isPoweredOn && (
        <mesh position={[0, 0.12, 0]}>
          <ringGeometry args={[0.45, 0.58, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Animated RGB strip component for case edges
function RGBStrip({ position, size = [0.05, 5, 0.05], color = '#00e5ff', isPoweredOn }) {
  const stripRef = useRef();

  useFrame(() => {
    if (stripRef.current && isPoweredOn) {
      const t = performance.now() / 1000;
      stripRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;
    }
  });

  if (!isPoweredOn) return null;

  return (
    <mesh ref={stripRef} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export function PCModel3D({ build, powerState }) {
  const isPoweredOn = powerState === 'post' || powerState === 'booting_os' || powerState === 'desktop';
  const isError = powerState === 'failed';

  // Textures
  const moboTexture = useLoader(THREE.TextureLoader, '/textures/motherboard.jpg');
  const gpuTexture = useLoader(THREE.TextureLoader, '/textures/gpu.jpg');

  return (
    <group position={[0, -1.5, 0]}>
      
      {/* ═══ SIGNIFICANTLY BRIGHTER LIGHTING ═══ */}
      {/* Strong ambient fill light so nothing is pitch black */}
      <ambientLight intensity={isPoweredOn ? 1.2 : 0.6} color="#e8ecf4" />
      
      {/* Main key light — bright and warm */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={isPoweredOn ? 2.5 : 1.2} 
        castShadow 
        color="#ffffff"
      />

      {/* Fill light from below-left to eliminate harsh shadows */}
      <directionalLight
        position={[-3, -2, 4]}
        intensity={isPoweredOn ? 0.8 : 0.4}
        color="#b4c6e8"
      />

      {/* Rim/back light for depth */}
      <directionalLight
        position={[0, 5, -5]}
        intensity={0.6}
        color="#8eaadc"
      />

      {/* Hemisphere light for natural sky/ground fill */}
      <hemisphereLight 
        args={['#b4d4ff', '#2a2a35', isPoweredOn ? 0.7 : 0.35]} 
      />

      {/* Power state lights */}
      {isError && <pointLight position={[0, 2, 0]} color="#ff3030" intensity={8} distance={12} />}
      {isPoweredOn && !isError && (
        <>
          <pointLight position={[0, 2.5, 0]} color="#00ffcc" intensity={4} distance={12} />
          <pointLight position={[1.5, 1, 1.5]} color="#3b82f6" intensity={2} distance={8} />
          <pointLight position={[-1.5, 3, 0]} color="#8b5cf6" intensity={1.5} distance={8} />
        </>
      )}

      {/* PC Case (Transparent glass box) */}
      {build.case && (
        <group>
          {/* Back panel */}
          <Box args={[4, 5, 0.2]} position={[0, 2.5, -2]}>
            <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
          </Box>
          {/* Bottom panel */}
          <Box args={[4, 0.2, 4]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
          </Box>
          {/* Glass side panel — brighter and more visible */}
          <Box args={[4, 5, 0.1]} position={[0, 2.5, 2]}>
            <meshPhysicalMaterial 
              color="#aaccff" 
              transmission={0.92} 
              opacity={1} 
              metalness={0.05} 
              roughness={0.05} 
              ior={1.5} 
              thickness={0.1}
              transparent
            />
          </Box>
          {/* Top panel */}
          <Box args={[4, 0.2, 4]} position={[0, 4.9, 0]}>
            <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
          </Box>

          {/* RGB Strips on edges when powered */}
          <RGBStrip position={[1.95, 2.5, 2]} size={[0.03, 4.8, 0.03]} color="#00e5ff" isPoweredOn={isPoweredOn} />
          <RGBStrip position={[-1.95, 2.5, 2]} size={[0.03, 4.8, 0.03]} color="#a855f7" isPoweredOn={isPoweredOn} />
          <RGBStrip position={[0, 4.85, 2]} size={[3.9, 0.03, 0.03]} color="#3b82f6" isPoweredOn={isPoweredOn} />
        </group>
      )}

      {/* Motherboard */}
      {build.motherboard && (
        <Plane args={[3.2, 3.8]} position={[0, 2.5, -1.8]} rotation={[0, 0, 0]}>
          <meshStandardMaterial map={moboTexture} />
        </Plane>
      )}

      {/* GPU */}
      {build.gpu && (
        <Box args={[2.5, 1.2, 0.3]} position={[0, 2.0, -1.2]} rotation={[0, 0, 0]}>
          <meshStandardMaterial map={gpuTexture} />
        </Box>
      )}

      {/* CPU Cooler */}
      {build.cooler && (
        <Box args={[1, 1.5, 1]} position={[0, 3.5, -1.2]}>
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </Box>
      )}
      
      {/* RAM Sticks */}
      {build.ram && (
        <group position={[1.2, 3.5, -1.6]}>
          <Box args={[0.1, 0.8, 0.2]} position={[0, 0, 0]}>
            <meshStandardMaterial 
              color="#00ffcc" 
              emissive={isPoweredOn ? "#00ffcc" : "#000"} 
              emissiveIntensity={isPoweredOn ? 0.8 : 0} 
            />
          </Box>
          <Box args={[0.1, 0.8, 0.2]} position={[0.2, 0, 0]}>
            <meshStandardMaterial 
              color="#00ffcc" 
              emissive={isPoweredOn ? "#00ffcc" : "#000"} 
              emissiveIntensity={isPoweredOn ? 0.8 : 0} 
            />
          </Box>
        </group>
      )}

      {/* PSU */}
      {build.psu && (
        <Box args={[1.5, 1, 1.5]} position={[-1, 0.6, -1]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </Box>
      )}

      {/* Storage drive */}
      {build.storage && (
        <Box args={[0.6, 0.08, 0.3]} position={[1.2, 0.6, -1.5]}>
          <meshStandardMaterial
            color="#1a3050"
            emissive={isPoweredOn ? "#10b981" : "#000"}
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.3}
          />
        </Box>
      )}

      {/* Case Fans */}
      {build.case && (
        <>
          {/* Front Intake Fans */}
          <SpinningFan position={[0, 1.5, 1.8]} rotation={[Math.PI / 2, 0, 0]} isPoweredOn={isPoweredOn} />
          <SpinningFan position={[0, 3.0, 1.8]} rotation={[Math.PI / 2, 0, 0]} isPoweredOn={isPoweredOn} />
          {/* Rear Exhaust Fan */}
          <SpinningFan position={[-1.5, 3.5, -1.8]} rotation={[0, 0, 0]} isPoweredOn={isPoweredOn} />
        </>
      )}

    </group>
  );
}

export function PCViewer({ build, powerState, autoRotate = true }) {
  return (
    <Suspense fallback={null}>
      <PCModel3D build={build} powerState={powerState} />
      <OrbitControls enableZoom={true} enablePan={true} autoRotate={autoRotate} autoRotateSpeed={1.0} />
    </Suspense>
  );
}
