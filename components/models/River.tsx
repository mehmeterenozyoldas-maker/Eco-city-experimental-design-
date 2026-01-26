import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Shared math for river path so other components can respect it
export const getRiverPosition = (z: number) => {
    // S-curve shape
    return Math.sin(z * 0.05) * 20; 
};

// Procedural Flow Texture Generation
const useRiverTexture = () => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if(!ctx) return null;

        // Dark background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 512, 512);

        // Draw Flow Streaks (Vertical lines for TubeGeometry V-coordinate flow)
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const h = 50 + Math.random() * 200; 
            const w = 2 + Math.random() * 8;   
            
            // Gradient for smooth fade in/out
            const grad = ctx.createLinearGradient(x, y, x, y + h);
            grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
            grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.6)'); // Cyan
            grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
            
            ctx.fillStyle = grad;
            
            // Draw slightly wavy lines instead of rects
            ctx.beginPath();
            ctx.moveTo(x, y);
            // Simple curve approximation
            ctx.quadraticCurveTo(x + (Math.random()-0.5)*20, y + h/2, x, y + h);
            ctx.lineWidth = w;
            ctx.strokeStyle = grad;
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 1); 
        
        return texture;
    }, []);
};

export const River: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const flowTexture = useRiverTexture();

  // Generate river path curve
  const curve = useMemo(() => {
    const points = [];
    // Extended range to ensure it covers the whole visible map
    for (let z = -70; z <= 70; z += 2) {
      const x = getRiverPosition(z);
      points.push(new THREE.Vector3(x, 0, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
        // Pulse glow slightly
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1.0 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
    if (flowTexture) {
        // Animate Texture Flow along the curve (V direction)
        flowTexture.offset.y -= delta * 0.2; 
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* 
        TubeGeometry is used here instead of ExtrudeGeometry 
        because it maps UVs along the length (V) and around the circumference (U) automatically.
        We scale Y down to flatten it into a river surface.
      */}
      <mesh ref={meshRef} scale={[1, 0.05, 1]} receiveShadow>
        <tubeGeometry args={[curve, 128, 7, 16, false]} /> 
        <meshPhysicalMaterial 
            color="#0891b2" 
            emissive="#06b6d4"
            emissiveMap={flowTexture || undefined}
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.8}
            transmission={0.1}
            alphaMap={flowTexture || undefined}
            transparent
            opacity={0.85}
        />
      </mesh>
      
      {/* River Banks / Glow Line */}
      <RiverBank curve={curve} offset={6.8} />
      <RiverBank curve={curve} offset={-6.8} />
    </group>
  );
};

// Decorative glowing lines along the river
const RiverBank: React.FC<{ curve: THREE.Curve<THREE.Vector3>, offset: number }> = ({ curve, offset }) => {
    const points = useMemo(() => {
        const pts = curve.getPoints(128);
        return pts.map(p => new THREE.Vector3(p.x + offset, 0.1, p.z));
    }, [curve, offset]);

    const lineGeometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    return (
        <line geometry={lineGeometry}>
            <lineBasicMaterial color="#67e8f9" opacity={0.4} transparent linewidth={1} />
        </line>
    )
}