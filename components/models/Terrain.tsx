import React from 'react';
import { Plane } from '@react-three/drei';

export const Terrain: React.FC = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        {/* Main Dark Ground */}
        <Plane args={[500, 500]} receiveShadow>
            <meshStandardMaterial 
                color="#020617" 
                roughness={0.7}
                metalness={0.5}
            />
        </Plane>
        
        {/* Large Scale Tech Grid */}
        <gridHelper 
            args={[500, 50, 0x1e293b, 0x0f172a]} 
            rotation={[-Math.PI/2, 0, 0]} 
            position={[0, 0, 0.1]}
        />
        
        {/* City Center Highlight Grid - Subtle guide for urban density */}
        <gridHelper 
            args={[120, 30, 0x0ea5e9, 0x0f172a]} 
            rotation={[-Math.PI/2, 0, 0]} 
            position={[0, 0, 0.15]}
        />

        {/* Decorative Concentric Rings around City */}
        <mesh position={[0, 0, 0.05]}>
            <ringGeometry args={[55, 55.5, 128]} />
            <meshBasicMaterial color="#334155" opacity={0.2} transparent />
        </mesh>
    </group>
  );
};