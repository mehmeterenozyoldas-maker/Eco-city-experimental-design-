import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import { EnergyStream } from './EnergyStream';

interface SolarFarmProps {
  count: number;
  sunIntensity: number;
}

export const SolarFarm: React.FC<SolarFarmProps> = ({ count, sunIntensity }) => {
  const panels = useMemo(() => {
    const temp = [];
    const size = Math.ceil(Math.sqrt(count));
    const spacing = 2.5;
    
    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / size);
        const col = i % size;
        temp.push({ 
            position: [(col - size/2) * spacing, 0.5, (row - size/2) * spacing], 
            rotation: [-Math.PI / 6, 0, 0] 
        });
    }
    return temp;
  }, [count]);

  const isActive = sunIntensity > 20;

  return (
    <group>
        {/* Panel Stands */}
        <Instances range={count}>
            <cylinderGeometry args={[0.1, 0.1, 1]} />
            <meshStandardMaterial color="#64748b" />
            {panels.map((p, i) => (
                <Instance
                    key={`stand-${i}`}
                    position={[p.position[0], 0.5, p.position[2]]}
                />
            ))}
        </Instances>

        {/* Panel Surfaces */}
        <Instances range={count}>
            <boxGeometry args={[2, 0.05, 1.2]} />
            <meshPhysicalMaterial 
                color="#1e293b" 
                roughness={0.1}
                metalness={0.6}
                emissive="#0044aa"
                emissiveIntensity={isActive ? (sunIntensity / 100) * 0.5 : 0}
            />
            {panels.map((p, i) => (
                <Instance
                    key={`panel-${i}`}
                    position={[p.position[0], 1.1, p.position[2]]}
                    rotation={p.rotation as [number, number, number]}
                />
            ))}
        </Instances>

        {/* Energy Streams (fewer streams to reduce noise) */}
        {isActive && panels.filter((_, i) => i % 5 === 0).map((p, i) => (
             <EnergyStream 
                key={`stream-${i}`}
                start={[p.position[0], 1, p.position[2]]}
                end={[-35 - p.position[0], 5, -35 - p.position[2]]}
                color="#fbbf24"
                speed={sunIntensity / 30}
             />
        ))}

    </group>
  );
};