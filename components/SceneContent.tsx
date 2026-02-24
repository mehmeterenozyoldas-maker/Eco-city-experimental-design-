import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationState, SelectedUnit } from '../types';
import { City } from './models/City';
import { WindFarm } from './models/WindFarm';
import { SolarFarm } from './models/SolarFarm';
import { Terrain } from './models/Terrain';
import { River } from './models/River';
import { BatteryBank } from './models/BatteryBank';

interface SceneContentProps {
  simState: SimulationState;
  onSelect: (unit: SelectedUnit) => void;
}

export const SceneContent: React.FC<SceneContentProps> = ({ simState, onSelect }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const starsRef = useRef<THREE.Group>(null);
  const { scene } = useThree();

  // Animate sun position and day/night cycle
  useFrame((state) => {
    const intensityNorm = simState.sunIntensity / 100;
    
    if (lightRef.current) {
      const angle = intensityNorm * (Math.PI / 2); 
      lightRef.current.position.set(50, 20 + Math.sin(angle) * 60, 50 * Math.cos(angle));
      lightRef.current.intensity = 0.5 + intensityNorm * 1.5;
    }

    // Day/Night background transition
    const dayColor = new THREE.Color('#38bdf8'); // Light sky blue
    const nightColor = new THREE.Color('#020409'); // Dark night
    const currentColor = nightColor.clone().lerp(dayColor, intensityNorm);
    
    scene.background = currentColor;
    scene.fog = new THREE.FogExp2(currentColor, 0.012);

    // Fade stars based on daylight
    if (starsRef.current) {
      starsRef.current.traverse((child) => {
        if (child.type === 'Points' && (child as any).material) {
          (child as any).material.transparent = true;
          (child as any).material.opacity = 1 - intensityNorm;
        }
      });
    }
  });

  return (
    <>
      <group ref={starsRef}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </group>
      
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
        <City onSelect={onSelect} />
        
        {/* Energy Sources */}
        <group position={[-50, 0, -35]}>
          <WindFarm count={12} windSpeed={simState.windSpeed} onSelect={onSelect} />
        </group>
        
        <group position={[50, 0, 35]}>
          <SolarFarm count={64} sunIntensity={simState.sunIntensity} onSelect={onSelect} />
        </group>

        {/* Battery Storage */}
        <BatteryBank 
          level={simState.batteryLevel} 
          position={[30, 0, -25]} 
          onSelect={() => onSelect({ 
            type: 'Battery Bank', 
            stats: { 
              Level: `${Math.round(simState.batteryLevel)}%`, 
              Capacity: '1000 MWh', 
              Status: simState.batteryLevel > 50 ? 'Optimal' : 'Low' 
            } 
          })} 
        />
      </group>
    </>
  );
};