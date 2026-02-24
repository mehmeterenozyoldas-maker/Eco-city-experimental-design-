import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { EnergyStream } from './EnergyStream';

interface WindFarmProps {
  count: number;
  windSpeed: number;
  onSelect?: (u: any) => void;
}

export const WindFarm: React.FC<WindFarmProps> = ({ count, windSpeed, onSelect }) => {
  // Generate random positions
  const turbines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 50,
        z: (Math.random() - 0.5) * 50,
        rotationOffset: Math.random() * Math.PI
      });
    }
    return temp;
  }, [count]);

  return (
    <group onClick={(e) => {
      e.stopPropagation();
      if (onSelect) onSelect({ type: 'Wind Farm', stats: { Turbines: count, WindSpeed: `${Math.round(windSpeed)} km/h`, Output: `${Math.round((windSpeed / 100) * 80)} MW` } });
    }}>
      {turbines.map((t, i) => (
        <Turbine key={i} position={[t.x, 0, t.z]} windSpeed={windSpeed} offset={t.rotationOffset} />
      ))}
    </group>
  );
};

const Turbine: React.FC<{ position: [number, number, number], windSpeed: number, offset: number }> = ({ position, windSpeed, offset }) => {
    const rotorRef = useRef<THREE.Group>(null);
    const output = windSpeed > 5;

    useFrame((state, delta) => {
        if (rotorRef.current) {
            // Rotation speed depends on windSpeed
            // Smoother animation factor
            rotorRef.current.rotation.z -= delta * (windSpeed / 100) * 4;
        }
    });

    return (
        <group position={position} rotation={[0, offset, 0]}>
            {/* --- Tower Structure --- */}
            {/* Base */}
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.9, 1.4, 2, 32]} />
                <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
            {/* Main Shaft - Tapered */}
            <mesh position={[0, 7.5, 0]}>
                <cylinderGeometry args={[0.4, 0.9, 13, 32]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
            </mesh>
            {/* Top Junction */}
            <mesh position={[0, 14.2, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
                <meshStandardMaterial color="#334155" />
            </mesh>

            {/* --- Nacelle (Housing) --- */}
            <group position={[0, 15, 0]}>
                {/* Main Body */}
                <mesh position={[0, 0, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.6, 0.7, 3.5, 16]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.4} />
                </mesh>
                {/* Rear Aerodynamic Cone */}
                <mesh position={[0, 0, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.6, 1.2, 16]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.4} />
                </mesh>
                {/* Top Vents/Details */}
                <mesh position={[0, 0.65, 0.5]}>
                    <boxGeometry args={[0.8, 0.1, 1.5]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
                {/* Warning Light */}
                <mesh position={[0, 0.7, -1.5]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshBasicMaterial color="#ef4444" toneMapped={false} />
                </mesh>
            </group>

            {/* --- Rotor (Blades + Hub) --- */}
            <group ref={rotorRef} position={[0, 15, 2.6]}>
                {/* Spinner/Hub */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.5, 1.2, 32]} />
                    <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
                </mesh>

                {/* Blades */}
                {[0, 1, 2].map((i) => (
                    <group key={i} rotation={[0, 0, i * (Math.PI * 2) / 3]}>
                        {/* Blade Root */}
                        <mesh position={[0, 0.5, 0]}>
                             <cylinderGeometry args={[0.15, 0.2, 1, 16]} />
                             <meshStandardMaterial color="#cbd5e1" />
                        </mesh>
                        {/* Airfoil Blade */}
                        <mesh position={[0, 4.5, 0]} rotation={[0, 0.2, 0]} scale={[1, 1, 0.15]}>
                            {/* Tapered Cylinder: radiusTop, radiusBottom, height */}
                            <cylinderGeometry args={[0.05, 0.5, 8, 12]} />
                            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
                        </mesh>
                    </group>
                ))}
            </group>
            
             {/* Energy Stream */}
             {output && (
                 <EnergyStream 
                    start={[0, 15, 0]} 
                    end={[35 - position[0], 0, 35 - position[2]]} 
                    color="#22d3ee" 
                    speed={windSpeed / 20} 
                 />
             )}
        </group>
    )
}