import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VIEWS = {
  free: { pos: new THREE.Vector3(-40, 30, 40), target: new THREE.Vector3(0, 0, 0) },
  drone: { pos: new THREE.Vector3(0, 40, 60), target: new THREE.Vector3(0, 0, 0) },
  street: { pos: new THREE.Vector3(0, 2, 20), target: new THREE.Vector3(0, 5, 0) },
  top: { pos: new THREE.Vector3(0, 100, 0), target: new THREE.Vector3(0, 0, 0) },
};

export type CameraView = 'free' | 'drone' | 'street' | 'top';

export const CameraController = ({ view }: { view: CameraView }) => {
  const { camera, controls } = useThree();
  
  useFrame((state, delta) => {
    if (view !== 'free') {
      const targetPos = VIEWS[view].pos;
      const targetLookAt = VIEWS[view].target;
      
      camera.position.lerp(targetPos, delta * 3);
      if (controls && (controls as any).target) {
        (controls as any).target.lerp(targetLookAt, delta * 3);
      }
    }
  });
  
  return null;
};
