import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState } from '../types';
import { City } from './models/City';
import { WindFarm } from './models/WindFarm';
import { SolarFarm } from './models/SolarFarm';
import { Terrain } from './models/Terrain';
import { River } from './models/River';

interface SceneContentProps {
  simState: SimulationState;
}

export const SceneContent: React.FC<SceneContentProps> = ({ simState }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  // Animate sun position based on sun intensity
  useFrame((state) => {
    if (lightRef.current) {
      const angle = (simState.sunIntensity / 100) * (Math.PI / 2); 
      lightRef.current.position.set(50, 20 + Math.sin(angle) * 60, 50 * Math.cos(angle));
      lightRef.current.intensity = 0.5 + (simState.sunIntensity / 100) * 1.5;
    }
  });

  return (
    <>
      {/* Atmosphere & Fog */}
      {/* 
         Volumetric-ish Fog 
         Using exponential fog with a dark blue tint creates a sense of depth and night-time atmosphere.
         Density adjusted to 0.012 to obscure the horizon line and blend the floor with the sky.
      */}
      <fogExp2 attach="fog" args={['#020409', 0.012]} />
      
      {/* Ambient Dust Motes */}
      <Sparkles 
        count={600} 
        scale={[120, 80, 120]} 
        size={3} 
        speed={0.3} 
        opacity={0.4} 
        color="#bae6fd" // Light Cyan dust
        position={[0, 20, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.15} color="#1e293b" />
      
      <directionalLight 
        ref={lightRef}
        castShadow 
        position={[50, 80, 50]} 
        intensity={2} 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#fffbeb"
      />
      
      {/* Blue rim light for cinematic contrast */}
      <spotLight position={[-50, 50, -50]} intensity={3} color="#0ea5e9" angle={0.5} penumbra={1} />
      
      {/* Ground Glow (Fake City Light Pollution) */}
      <pointLight position={[0, 10, 0]} intensity={1} distance={60} color="#0c4a6e" />

      {/* World Components */}
      <group position={[0, -2, 0]}>
        <Terrain />
        <River />
        
        {/* Central City */}
        <City />
        
        {/* Energy Sources */}
        <group position={[-50, 0, -35]}>
          <WindFarm count={12} windSpeed={simState.windSpeed} />
        </group>
        
        <group position={[50, 0, 35]}>
          <SolarFarm count={64} sunIntensity={simState.sunIntensity} />
        </group>
      </group>
    </>
  );
};