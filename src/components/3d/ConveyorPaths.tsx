import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// Realistic industrial conveyor system
// Physical conveyor beds + rollers (no neon glow)

interface ConveyorSegment {
  from: [number, number, number];
  to: [number, number, number];
  width: number;
  color: string;
}

const CONVEYOR_SEGMENTS: ConveyorSegment[] = [
  // PICKING → SORTING
  { from: [-14, 0.52, 8], to: [-6, 0.52, -6], width: 0.7, color: '#444' },
  // SORTING → PACKING
  { from: [-6, 0.52, -6], to: [6, 0.52, -6], width: 0.7, color: '#444' },
  // PACKING → SHIPPING
  { from: [6, 0.52, -6], to: [0, 0.52, 14], width: 0.7, color: '#444' },
  // BUFFER → PACKING
  { from: [14, 0.52, 6], to: [6, 0.52, -6], width: 0.6, color: '#444' },
];

// Build a realistic conveyor belt between two points
const ConveyorBelt: React.FC<{ segment: ConveyorSegment }> = ({ segment }) => {
  const { from, to, width } = segment;
  
  const curve = useMemo(() => {
    const f = new THREE.Vector3(...from);
    const t = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().lerpVectors(f, t, 0.5);
    mid.y += 0.05; // slight arch
    return new THREE.CatmullRomCurve3([f, mid, t]);
  }, [from, to]);
  
  const length = useMemo(() => {
    const f = new THREE.Vector3(...from);
    const t = new THREE.Vector3(...to);
    return f.distanceTo(t);
  }, [from, to]);
  
  // Direction for rotating conveyor to point from→to
  const dir = useMemo(() => {
    const f = new THREE.Vector3(...from);
    const t = new THREE.Vector3(...to);
    return new THREE.Vector3().subVectors(t, f).normalize();
  }, [from, to]);
  
  const angle = useMemo(() => Math.atan2(dir.x, dir.z), [dir]);
  
  const midX = (from[0] + to[0]) / 2;
  const midY = from[1];
  const midZ = (from[2] + to[2]) / 2;
  
  // Number of rollers
  const numRollers = Math.max(3, Math.floor(length / 1.5));

  return (
    <group position={[midX, midY, midZ]} rotation={[0, angle, 0]}>
      {/* Conveyor frame - left rail */}
      <mesh position={[-width / 2 - 0.04, 0, 0]}>
        <boxGeometry args={[0.06, 0.12, length]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Conveyor frame - right rail */}
      <mesh position={[width / 2 + 0.04, 0, 0]}>
        <boxGeometry args={[0.06, 0.12, length]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Belt surface */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[width, 0.025, length]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Belt texture stripes */}
      {Array.from({ length: Math.floor(length / 0.8) }, (_, i) => (
        <mesh key={i} position={[0, 0.075, (i - Math.floor(length / 1.6)) * 0.8]}>
          <boxGeometry args={[width, 0.01, 0.04]} />
          <meshStandardMaterial color="#333" roughness={0.9} />
        </mesh>
      ))}
      {/* Rollers at each support */}
      {Array.from({ length: numRollers + 1 }, (_, i) => {
        const rz = (i / numRollers - 0.5) * length;
        return (
          <group key={i} position={[0, -0.04, rz]}>
            {/* Roller axle */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, width + 0.1, 10]} />
              <meshStandardMaterial color="#666" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Support legs */}
            <mesh position={[-(width/2 + 0.04), -0.18, 0]}>
              <boxGeometry args={[0.05, 0.36, 0.05]} />
              <meshStandardMaterial color="#444" roughness={0.5} metalness={0.7} />
            </mesh>
            <mesh position={[(width/2 + 0.04), -0.18, 0]}>
              <boxGeometry args={[0.05, 0.36, 0.05]} />
              <meshStandardMaterial color="#444" roughness={0.5} metalness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const ConveyorPaths: React.FC = () => {
  return (
    <group>
      {CONVEYOR_SEGMENTS.map((seg, i) => (
        <ConveyorBelt key={i} segment={seg} />
      ))}
    </group>
  );
};
