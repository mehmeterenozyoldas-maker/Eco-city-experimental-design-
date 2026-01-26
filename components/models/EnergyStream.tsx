import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CatmullRomLine } from '@react-three/drei';

interface EnergyStreamProps {
    start: [number, number, number];
    end: [number, number, number];
    color: string;
    speed: number;
}

export const EnergyStream: React.FC<EnergyStreamProps> = ({ start, end, color, speed }) => {
    const curve = useMemo(() => {
        const p1 = new THREE.Vector3(...start);
        const p2 = new THREE.Vector3(...end);
        // Create a slight arc upwards
        const mid = p1.clone().lerp(p2, 0.5);
        mid.y += 5 + Math.random() * 2; // Add slight variation to arc height
        
        return new THREE.CatmullRomCurve3([p1, mid, p2]);
    }, [start, end]);

    const points = useMemo(() => curve.getPoints(20), [curve]);

    return (
        <>
            {/* The Static Path Line (Faint) */}
            <CatmullRomLine 
                points={points} 
                color={color} 
                opacity={0.1} 
                transparent 
                lineWidth={1} 
            />
            
            {/* Main Pulse: Larger, slower, distinct orbs */}
            <EnergyPulse 
                curve={curve} 
                speed={speed} 
                color={color} 
                count={5} 
                size={0.4} 
                opacity={0.9} 
            />
            
            {/* Secondary Stream: Smaller, faster, scattered sparkles for "flow" */}
            <EnergyPulse 
                curve={curve} 
                speed={speed * 1.5} 
                color={color} 
                count={12} 
                size={0.15} 
                opacity={0.5} 
                spread={0.3} // Add turbulence
            />
        </>
    );
};

interface EnergyPulseProps {
    curve: THREE.CatmullRomCurve3;
    speed: number;
    color: string;
    count?: number;
    size?: number;
    opacity?: number;
    spread?: number;
}

const EnergyPulse: React.FC<EnergyPulseProps> = ({ 
    curve, 
    speed, 
    color, 
    count = 8, 
    size = 0.35, 
    opacity = 0.8,
    spread = 0 
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const progress = useRef(Math.random()); 

    // Create a high-intensity color for bloom
    const glowColor = useMemo(() => {
        return new THREE.Color(color).multiplyScalar(3);
    }, [color]);

    // Generate random offsets for turbulence if spread > 0
    const offsets = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * spread,
            y: (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread,
        }));
    }, [count, spread]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Update main progress
            progress.current = (progress.current + delta * (speed * 0.3)) % 1;

            // Update each particle in the trail
            groupRef.current.children.forEach((child, i) => {
                const mesh = child as THREE.Mesh;
                
                // Calculate position with lag
                // Head is at i=0, tail is at i=count-1
                const lag = i * (0.15 / count); // Distribute along a segment of the curve
                let t = progress.current - lag;
                
                // Handle wrap-around seamlessly
                if (t < 0) t += 1;
                
                const pos = curve.getPointAt(t);
                
                // Apply jitter/spread
                pos.x += offsets[i].x;
                pos.y += offsets[i].y;
                pos.z += offsets[i].z;

                mesh.position.copy(pos);

                // Scale fade out based on position in trail
                const trailFactor = 1 - (i / count);
                // Pulse effect
                const pulse = 1 + Math.sin(state.clock.elapsedTime * 8 + i) * 0.2;
                
                mesh.scale.setScalar(trailFactor * pulse);
            });
        }
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }).map((_, i) => (
                <mesh key={i}>
                    <sphereGeometry args={[size, 8, 8]} />
                    <meshBasicMaterial 
                        color={glowColor} 
                        toneMapped={false} // Critical for Bloom
                        transparent 
                        opacity={(1 - i / count) * opacity} 
                    />
                </mesh>
            ))}
        </group>
    );
}