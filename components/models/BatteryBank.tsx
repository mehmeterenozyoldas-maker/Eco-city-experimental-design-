import React from 'react';
import * as THREE from 'three';

export const BatteryBank = ({ level, position, onSelect }: { level: number, position: [number, number, number], onSelect: () => void }) => {
  const fillHeight = Math.max(0.01, (level / 100) * 4);
  
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {[0, 1, 2, 3].map(i => (
        <group key={i} position={[(i % 2) * 5 - 2.5, 0, Math.floor(i / 2) * 5 - 2.5]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[2, 2, 4, 32]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, fillHeight / 2, 0]}>
            <cylinderGeometry args={[1.9, 1.9, fillHeight, 32]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </mesh>
          {/* Base and Top Caps */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[2.1, 2.1, 0.2, 32]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[2.1, 2.1, 0.2, 32]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
