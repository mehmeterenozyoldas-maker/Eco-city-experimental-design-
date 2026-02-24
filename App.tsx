import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { SceneContent } from './components/SceneContent';
import { UIOverlay } from './components/UIOverlay';
import { SimulationState, SelectedUnit } from './types';
import { CameraController, CameraView } from './components/CameraController';

// Main App Component
const App: React.FC = () => {
  // Core State
  const [simState, setSimState] = useState<SimulationState>({
    windSpeed: 45,     // Initial wind speed
    sunIntensity: 70,  // Initial sun intensity (mid-day)
    totalDemand: 80,   // City demand baseline
    batteryLevel: 50,  // Initial battery level
  });

  const [isAutoMode, setIsAutoMode] = useState(true);
  const [cameraView, setCameraView] = useState<CameraView>('free');
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);

  // Simulation Loop for Auto Mode & Battery
  useEffect(() => {
    const interval = setInterval(() => {
      setSimState(prev => {
        const solarOutput = (prev.sunIntensity / 100) * 60;
        const windOutput = (prev.windSpeed / 100) * 80;
        const netEnergy = solarOutput + windOutput - prev.totalDemand;
        
        // Update battery level based on net energy
        const newBattery = Math.min(100, Math.max(0, prev.batteryLevel + netEnergy * 0.02));

        if (!isAutoMode) {
          return { ...prev, batteryLevel: newBattery };
        }

        // Simulating organic fluctuation
        const time = Date.now() * 0.0005;
        return {
          ...prev,
          windSpeed: 30 + Math.sin(time) * 20 + Math.sin(time * 3) * 10,
          sunIntensity: 50 + Math.sin(time * 0.5) * 40,
          batteryLevel: newBattery
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
          
          <CameraController view={cameraView} />
          
          <SceneContent simState={simState} onSelect={setSelectedUnit} />

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
          <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={10} 
            maxDistance={150}
            autoRotate={isAutoMode && cameraView === 'free'}
            autoRotateSpeed={0.5}
            enabled={cameraView === 'free'}
          />
        </Canvas>
      </div>

      {/* UI Overlay Layer */}
      <UIOverlay 
        simState={simState} 
        onStateChange={handleStateChange}
        isAuto={isAutoMode}
        toggleAuto={() => setIsAutoMode(!isAutoMode)}
        cameraView={cameraView}
        onCameraChange={setCameraView}
        selectedUnit={selectedUnit}
        onCloseUnit={() => setSelectedUnit(null)}
      />

    </div>
  );
};

export default App;
