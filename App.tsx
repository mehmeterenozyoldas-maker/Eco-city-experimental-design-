import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { SceneContent } from './components/SceneContent';
import { UIOverlay } from './components/UIOverlay';
import { SimulationState } from './types';

// Main App Component
const App: React.FC = () => {
  // Core State
  const [simState, setSimState] = useState<SimulationState>({
    windSpeed: 45,     // Initial wind speed
    sunIntensity: 70,  // Initial sun intensity (mid-day)
    totalDemand: 80,   // City demand baseline
  });

  const [isAutoMode, setIsAutoMode] = useState(true);

  // Simulation Loop for Auto Mode
  useEffect(() => {
    if (!isAutoMode) return;

    const interval = setInterval(() => {
      setSimState(prev => {
        // Simulating organic fluctuation
        const time = Date.now() * 0.0005;
        return {
          ...prev,
          windSpeed: 30 + Math.sin(time) * 20 + Math.sin(time * 3) * 10,
          sunIntensity: 50 + Math.sin(time * 0.5) * 40,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoMode]);

  const handleStateChange = (key: keyof SimulationState, value: number) => {
    setIsAutoMode(false);
    setSimState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full h-screen bg-gray-950 text-white overflow-hidden select-none">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, stencil: false, depth: true }}>
          <PerspectiveCamera makeDefault position={[-40, 30, 40]} fov={45} />
          <color attach="background" args={['#050608']} />
          
          <SceneContent simState={simState} />

          {/* Cinematic Post Processing */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.8} 
              mipmapBlur 
              intensity={1.2} 
              radius={0.4}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <Environment preset="night" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={30} 
            maxDistance={120}
            autoRotate={isAutoMode}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <UIOverlay 
        simState={simState} 
        onStateChange={handleStateChange}
        isAuto={isAutoMode}
        toggleAuto={() => setIsAutoMode(!isAutoMode)}
      />

    </div>
  );
};

export default App;
