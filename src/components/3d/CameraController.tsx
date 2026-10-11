import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

const ZONE_CAMERA_TARGETS: Record<string, { pos: [number, number, number]; lookAt: [number, number, number] }> = {
  PICKING:  { pos: [-22, 14, 20], lookAt: [-14, 2, 8] },
  SORTING:  { pos: [-14, 12, -4], lookAt: [-6, 2, -6] },
  PACKING:  { pos: [14, 12, -4],  lookAt: [6, 2, -6] },
  BUFFER:   { pos: [22, 14, 16],  lookAt: [14, 2, 6] },
  SHIPPING: { pos: [0, 14, 28],   lookAt: [0, 2, 14] },
};

const DEFAULT_POS: [number, number, number] = [0, 28, 42];
const DEFAULT_LOOK: [number, number, number] = [0, 2, 0];

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const selectedZone = useSimulationStore((state) => state.selectedZone);
  const currentLookAt = useRef(new THREE.Vector3(...DEFAULT_LOOK));
  const isMovingToZone = useRef(false);
  const prevZone = useRef<string | null>(null);

  useFrame((_, delta) => {
    // Only take camera control when a zone is selected (user override via OrbitControls allowed)
    if (!selectedZone) {
      if (prevZone.current) {
        // Zone was just deselected, return to overview
        prevZone.current = null;
        isMovingToZone.current = true;
      }
      if (isMovingToZone.current) {
        const targetPos = new THREE.Vector3(...DEFAULT_POS);
        const targetLook = new THREE.Vector3(...DEFAULT_LOOK);
        camera.position.lerp(targetPos, delta * 1.8);
        currentLookAt.current.lerp(targetLook, delta * 1.8);
        camera.lookAt(currentLookAt.current);
        if (camera.position.distanceTo(targetPos) < 0.5) {
          isMovingToZone.current = false;
        }
      }
      return;
    }

    const target = ZONE_CAMERA_TARGETS[selectedZone];
    if (!target) return;

    if (prevZone.current !== selectedZone) {
      prevZone.current = selectedZone;
      isMovingToZone.current = true;
    }

    const targetPos = new THREE.Vector3(...target.pos);
    const targetLook = new THREE.Vector3(...target.lookAt);

    camera.position.lerp(targetPos, delta * 2.0);
    currentLookAt.current.lerp(targetLook, delta * 2.0);
    camera.lookAt(currentLookAt.current);

    if (camera.position.distanceTo(targetPos) < 0.3) {
      isMovingToZone.current = false;
    }
  });

  return null;
};
