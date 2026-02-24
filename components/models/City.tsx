import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { getRiverPosition } from './River';

// --- Procedural Textures ---

const useBuildingTexture = () => {
  return useMemo(() => {
    const width = 64;
    const height = 128;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark Glass Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Illuminated Windows
    for (let y = 2; y < height; y += 4) {
        if (Math.random() > 0.8) continue; // Skip floors
        for (let x = 2; x < width; x += 4) {
             if (Math.random() > 0.2) {
                 // Enhanced Color Palette: Mix of Cool Cyan, White, and Warm Amber
                 const rand = Math.random();
                 if (rand > 0.8) ctx.fillStyle = '#fbbf24'; // Warm/Residential
                 else if (rand > 0.5) ctx.fillStyle = '#7dd3fc'; // Cool/Office
                 else ctx.fillStyle = '#e0f2fe'; // Bright White
                 
                 ctx.fillRect(x, y, 2, 3);
             }
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }, []);
};

// --- Custom Geometries ---

const useCityGeometries = () => {
    return useMemo(() => {
        // 1. Standard Box
        const box = new THREE.BoxGeometry(1, 1, 1);
        box.translate(0, 0.5, 0);

        // 2. Cylinder Tower
        const cyl = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
        cyl.translate(0, 0.5, 0);

        // 3. L-Shape
        const lShape = new THREE.Shape();
        lShape.moveTo(0,0); lShape.lineTo(0.9,0); lShape.lineTo(0.9,0.35);
        lShape.lineTo(0.35,0.35); lShape.lineTo(0.35,0.9); lShape.lineTo(0,0.9);
        const lGeo = new THREE.ExtrudeGeometry(lShape, { depth: 1, bevelEnabled: false, curveSegments: 1 });
        lGeo.rotateX(Math.PI / 2); // Flip up
        lGeo.center();
        lGeo.translate(0, 0.5, 0);

        // 4. T-Shape
        const tShape = new THREE.Shape();
        tShape.moveTo(0, 0.6); tShape.lineTo(1, 0.6); tShape.lineTo(1, 1);
        tShape.lineTo(0.65, 1); tShape.lineTo(0.65, 0); tShape.lineTo(0.35, 0);
        tShape.lineTo(0.35, 1); tShape.lineTo(0, 1);
        const tGeo = new THREE.ExtrudeGeometry(tShape, { depth: 1, bevelEnabled: false, curveSegments: 1 });
        tGeo.rotateX(Math.PI / 2);
        tGeo.center();
        tGeo.translate(0, 0.5, 0);

        return { box, cyl, lGeo, tGeo };
    }, []);
};

// --- Layout Logic ---

interface CityItem {
    position: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
    type: 'building' | 'tree' | 'bridge' | 'light';
    shapeType?: 'box' | 'cyl' | 'l' | 't';
    color?: string;
}

export const City: React.FC<{ onSelect?: (u: any) => void }> = ({ onSelect }) => {
  const texture = useBuildingTexture();
  const { box, cyl, lGeo, tGeo } = useCityGeometries();
  
  // Create material once, ensuring it is ready for initial render
  const buildingMaterial = useMemo(() => {
      const mat = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.2,
        metalness: 0.8,
        emissive: "#ffffff",
        emissiveIntensity: 0.6
      });
      if (texture) {
          mat.map = texture;
          mat.emissiveMap = texture;
      }
      return mat;
  }, [texture]);
  
  // Animate Building Pulse
  useFrame((state) => {
    if (buildingMaterial) {
        // Slow, organic breathing effect for the city lights
        const t = state.clock.elapsedTime;
        buildingMaterial.emissiveIntensity = 0.6 + Math.sin(t * 0.5) * 0.2;
    }
  });
  
  // Generate City Layout
  const { buildings, trees, bridges, streetLights, pointLights } = useMemo(() => {
    const _buildings: CityItem[] = [];
    const _trees: CityItem[] = [];
    const _bridges: CityItem[] = [];
    const _streetLights: CityItem[] = [];
    const _pointLights: CityItem[] = [];

    const gridSize = 4;
    const cityRadius = 45;
    const riverSafetyWidth = 8;
    const greenBeltWidth = 14;

    // 1. Grid Iteration
    for (let x = -cityRadius; x <= cityRadius; x += gridSize) {
        for (let z = -cityRadius; z <= cityRadius; z += gridSize) {
            
            const distFromCenter = Math.sqrt(x*x + z*z);
            if (distFromCenter > cityRadius) continue;

            const riverX = getRiverPosition(z);
            const distToRiver = Math.abs(x - riverX);
            const isParkBlock = Math.sin(x * 0.1) * Math.cos(z * 0.1) > 0.6;

            if (distToRiver < riverSafetyWidth) {
                continue;
            } else if (distToRiver < greenBeltWidth || isParkBlock) {
                // Trees
                const count = Math.floor(Math.random() * 3) + 1;
                for(let k=0; k<count; k++) {
                    _trees.push({
                        type: 'tree',
                        position: [
                            x + (Math.random() - 0.5) * 3, 
                            0, 
                            z + (Math.random() - 0.5) * 3
                        ],
                        scale: [
                            0.5 + Math.random() * 0.5, 
                            0.8 + Math.random() * 0.8, 
                            0.5 + Math.random() * 0.5
                        ],
                        color: Math.random() > 0.5 ? '#10b981' : '#059669' 
                    });
                }
            } else {
                // Buildings
                const height = Math.max(3, 35 - distFromCenter * 0.7 + Math.random() * 10);
                
                // Determine Shape
                let shapeType: 'box' | 'cyl' | 'l' | 't' = 'box';
                const rand = Math.random();
                if (height > 15 && rand > 0.7) shapeType = 'cyl';
                else if (rand > 0.85) shapeType = 'l';
                else if (rand > 0.95) shapeType = 't';

                _buildings.push({
                    type: 'building',
                    shapeType,
                    position: [x, 0, z], // Pivot is at bottom now
                    scale: [2.5, height, 2.5],
                    rotation: [0, Math.floor(Math.random()*4) * (Math.PI/2), 0],
                    color: Math.random() > 0.8 ? '#475569' : '#334155'
                });
            }

            // Street Lights
            const cornerX = x + gridSize / 2;
            const cornerZ = z + gridSize / 2;
            const cornerRiverX = getRiverPosition(cornerZ);
            const cornerDistToRiver = Math.abs(cornerX - cornerRiverX);
            const cornerDistFromCenter = Math.sqrt(cornerX * cornerX + cornerZ * cornerZ);

            if (cornerDistFromCenter < cityRadius && cornerDistToRiver > riverSafetyWidth) {
                 if (Math.random() > 0.5) {
                     const pos: [number, number, number] = [cornerX, 0.5, cornerZ];
                     _streetLights.push({ type: 'light', position: pos });
                     if (Math.random() > 0.75) {
                         _pointLights.push({ type: 'light', position: pos });
                     }
                 }
            }
        }
    }

    // 2. Bridges - Align with grid roads roughly (multiples of 4 offset by 2)
    // Grid centers: 0, 4, 8... Roads: 2, 6, 10...
    // Bridges should be on roads.
    for (let z = -30; z <= 30; z += 12) { 
        // Force Z to be on a road line: e.g. 2, 6, 10, 14
        const alignedZ = Math.round((z - 2) / 4) * 4 + 2;
        
        const riverX = getRiverPosition(alignedZ);
        const nextX = getRiverPosition(alignedZ + 1);
        const angle = Math.atan2(nextX - riverX, 1);

        _bridges.push({
            type: 'bridge',
            position: [riverX, 1.5, alignedZ],
            rotation: [0, angle, 0],
            scale: [16, 1, 3] 
        });
    }

    return { buildings: _buildings, trees: _trees, bridges: _bridges, streetLights: _streetLights, pointLights: _pointLights };
  }, []);

  // Filter buildings by shape
  const boxBuildings = buildings.filter(b => b.shapeType === 'box');
  const cylBuildings = buildings.filter(b => b.shapeType === 'cyl');
  const lBuildings = buildings.filter(b => b.shapeType === 'l');
  const tBuildings = buildings.filter(b => b.shapeType === 't');

  return (
    <group onClick={(e) => { 
      e.stopPropagation(); 
      if (onSelect) onSelect({ type: 'City Center', stats: { Population: '1.2M', Demand: '80 MW', Status: 'Active' } }); 
    }}>
        {/* --- Building Groups --- */}
        <Instances range={boxBuildings.length} geometry={box} material={buildingMaterial} castShadow receiveShadow>
            {boxBuildings.map((data, i) => (
                <Instance key={i} position={data.position} scale={data.scale} rotation={data.rotation as any} color={data.color} />
            ))}
        </Instances>

        <Instances range={cylBuildings.length} geometry={cyl} material={buildingMaterial} castShadow receiveShadow>
            {cylBuildings.map((data, i) => (
                <Instance key={i} position={data.position} scale={data.scale} rotation={data.rotation as any} color={data.color} />
            ))}
        </Instances>

        <Instances range={lBuildings.length} geometry={lGeo} material={buildingMaterial} castShadow receiveShadow>
            {lBuildings.map((data, i) => (
                <Instance key={i} position={data.position} scale={data.scale} rotation={data.rotation as any} color={data.color} />
            ))}
        </Instances>

         <Instances range={tBuildings.length} geometry={tGeo} material={buildingMaterial} castShadow receiveShadow>
            {tBuildings.map((data, i) => (
                <Instance key={i} position={data.position} scale={data.scale} rotation={data.rotation as any} color={data.color} />
            ))}
        </Instances>

        {/* --- Trees --- */}
        <Instances range={trees.length} castShadow>
            <coneGeometry args={[1, 3, 8]} />
            <meshStandardMaterial roughness={0.8} metalness={0.1} emissive="#064e3b" emissiveIntensity={0.2} />
            {trees.map((data, i) => (
                <Instance key={`t-${i}`} position={[data.position[0], (data.scale?.[1] || 1) * 1.5 - 0.5, data.position[2]]} scale={data.scale} color={data.color} />
            ))}
        </Instances>
        <Instances range={trees.length}>
             <cylinderGeometry args={[0.3, 0.4, 1]} />
             <meshStandardMaterial color="#3f2e23" />
             {trees.map((data, i) => (
                <Instance key={`trunk-${i}`} position={[data.position[0], 0.5, data.position[2]]} />
             ))}
        </Instances>

        {/* --- Bridges --- */}
        <Instances range={bridges.length} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.4} />
            {bridges.map((data, i) => (
                <Instance key={`br-${i}`} position={data.position} rotation={data.rotation as any} scale={data.scale} />
            ))}
        </Instances>

        {/* --- Street Lights --- */}
        <Instances range={streetLights.length}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" toneMapped={false} />
            {streetLights.map((data, i) => (
                 <Instance key={`sl-${i}`} position={data.position} />
            ))}
        </Instances>
        
        {/* Street Light Poles */}
        <Instances range={streetLights.length}>
             <cylinderGeometry args={[0.05, 0.05, 3]} />
             <meshStandardMaterial color="#1e293b" />
             {streetLights.map((data, i) => (
                 <Instance key={`slp-${i}`} position={[data.position[0], 1.5, data.position[2]]} />
             ))}
        </Instances>

        {pointLights.map((data, i) => (
            <pointLight key={`pl-${i}`} position={[data.position[0], 2.5, data.position[2]]} intensity={1.2} distance={12} decay={2} color="#fbbf24" />
        ))}

        <CityTraffic bridges={bridges} />
    </group>
  );
};

// --- New Traffic System ---

const CityTraffic: React.FC<{ bridges: CityItem[] }> = ({ bridges }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 300;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Identify valid bridge Z-coords to allow river crossing
    const bridgeZCoords = useMemo(() => bridges.map(b => Math.round(b.position[2])), [bridges]);

    const traffic = useMemo(() => {
        // Grid properties
        const roads = [];
        for(let i = -46; i <= 46; i+= 4) roads.push(i + 2); // Midpoints

        return new Array(count).fill(0).map(() => {
            // Determine axis
            const axis = Math.random() > 0.5 ? 'x' : 'z';
            let lane = roads[Math.floor(Math.random() * roads.length)];
            
            // If moving along X (crossing river), ensure we are on a bridge lane
            if (axis === 'x') {
                // Find closest bridge lane or snap to one
                const bridgeLane = bridgeZCoords[Math.floor(Math.random() * bridgeZCoords.length)];
                // If we found a valid bridge lane, use it, otherwise fallback to Z-axis traffic
                if (bridgeLane !== undefined) lane = bridgeLane;
            }

            return {
                axis,
                lane, // Fixed coordinate
                pos: (Math.random() - 0.5) * 90, // Moving coordinate
                speed: (0.1 + Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1),
                color: Math.random() > 0.3 ? '#ef4444' : '#f0f9ff', // Red tail lights or white headlights
                type: Math.random() > 0.9 ? 'truck' : 'car'
            };
        });
    }, [bridges, bridgeZCoords]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        
        traffic.forEach((t, i) => {
            // Update position
            t.pos += t.speed;
            if (t.pos > 45) t.pos = -45;
            if (t.pos < -45) t.pos = 45;

            // Update Instance
            if (t.axis === 'x') {
                dummy.position.set(t.pos, 0.3, t.lane);
                dummy.rotation.set(0, t.speed > 0 ? 0 : Math.PI, 0); // Face direction
            } else {
                dummy.position.set(t.lane, 0.3, t.pos);
                dummy.rotation.set(0, t.speed > 0 ? -Math.PI/2 : Math.PI/2, 0);
            }

            // Bobbing animation
            dummy.position.y = 0.3 + Math.sin(time * 20 + i) * 0.02;

            if (t.type === 'truck') dummy.scale.set(1.2, 0.8, 0.5);
            else dummy.scale.set(0.8, 0.4, 0.4);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            
            // Color based on direction (Tail lights vs Head lights relative to camera look?)
            // Simple logic: just use assigned color
            meshRef.current!.setColorAt(i, new THREE.Color(t.color));
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial toneMapped={false} roughness={0.2} metalness={0.8} />
        </instancedMesh>
    );
}