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
        <meshStandardMaterial color="#111" />
      </Box>
      {/* Spinning blades (cylinder with texture) */}
      <Cylinder ref={meshRef} args={[0.55, 0.55, 0.22, 32]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial map={fanTexture} />
      </Cylinder>
    </group>
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
      
      {/* Dynamic Lighting based on Power State */}
      <ambientLight intensity={isPoweredOn ? 0.8 : 0.2} />
      <directionalLight position={[5, 10, 5]} intensity={isPoweredOn ? 1.5 : 0.5} castShadow />
      
      {isError && <pointLight position={[0, 0, 0]} color="red" intensity={5} distance={10} />}
      {isPoweredOn && !isError && <pointLight position={[0, 0, 0]} color="#00ffcc" intensity={3} distance={10} />}

      {/* PC Case (Transparent glass box) */}
      {build.case && (
        <group>
          {/* Back panel */}
          <Box args={[4, 5, 0.2]} position={[0, 2.5, -2]}>
            <meshStandardMaterial color="#222" />
          </Box>
          {/* Bottom panel */}
          <Box args={[4, 0.2, 4]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#111" />
          </Box>
          {/* Glass side panel */}
          <Box args={[4, 5, 0.1]} position={[0, 2.5, 2]}>
            <meshPhysicalMaterial 
              color="#ffffff" 
              transmission={0.9} 
              opacity={1} 
              metalness={0.1} 
              roughness={0.1} 
              ior={1.5} 
              thickness={0.1}
              transparent
            />
          </Box>
          {/* Top panel */}
          <Box args={[4, 0.2, 4]} position={[0, 4.9, 0]}>
            <meshStandardMaterial color="#111" />
          </Box>
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
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.4} />
        </Box>
      )}
      
      {/* RAM Sticks */}
      {build.ram && (
        <group position={[1.2, 3.5, -1.6]}>
          <Box args={[0.1, 0.8, 0.2]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#00ffcc" emissive={isPoweredOn ? "#00ffcc" : "#000"} emissiveIntensity={0.5} />
          </Box>
          <Box args={[0.1, 0.8, 0.2]} position={[0.2, 0, 0]}>
            <meshStandardMaterial color="#00ffcc" emissive={isPoweredOn ? "#00ffcc" : "#000"} emissiveIntensity={0.5} />
          </Box>
        </group>
      )}

      {/* PSU */}
      {build.psu && (
        <Box args={[1.5, 1, 1.5]} position={[-1, 0.6, -1]}>
          <meshStandardMaterial color="#1a1a1a" />
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

export function PCViewer({ build, powerState }) {
  return (
    <Suspense fallback={<div className="loading-3d">Loading 3D Models...</div>}>
      <PCModel3D build={build} powerState={powerState} />
      <OrbitControls enableZoom={true} enablePan={true} autoRotate={!powerState || powerState === 'off'} autoRotateSpeed={1.0} />
    </Suspense>
  );
}
