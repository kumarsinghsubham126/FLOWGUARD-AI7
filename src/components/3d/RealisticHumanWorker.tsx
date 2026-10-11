import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RealisticHumanWorkerProps {
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  vestColor?: string;
  animationState?: 'IDLE' | 'WALK' | 'PICK' | 'HANDOFF' | 'CARRY' | 'PLACE';
  heldParcel?: boolean;
}

export const RealisticHumanWorker: React.FC<RealisticHumanWorkerProps> = ({
  position,
  rotationY = 0,
  scale = 1.0,
  vestColor = '#F59E0B', // Safety Amber / High-Vis Orange
  animationState = 'IDLE',
  heldParcel = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const time = Date.now() * 0.006;

    if (animationState === 'WALK' || animationState === 'CARRY') {
      // Natural walking leg and arm swing animation
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * 2.5) * 0.45;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time * 2.5) * 0.45;

      if (heldParcel) {
        // Holding parcel with both hands forward
        if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 3;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 3;
      } else {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(time * 2.5) * 0.4;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time * 2.5) * 0.4;
      }
    } else if (animationState === 'HANDOFF' || animationState === 'PICK') {
      // Arms extended forward handing off or receiving parcel
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.1;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.1;
    } else {
      // IDLE posture
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time * 0.5) * 0.05;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* Head */}
      <mesh position={[0, 2.65, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#E0AC69" roughness={0.6} />
      </mesh>

      {/* Safety Helmet / Cap */}
      <mesh position={[0, 2.82, 0]}>
        <cylinderGeometry args={[0.24, 0.25, 0.12, 16]} />
        <meshStandardMaterial color="#00F0FF" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.15, 12]} />
        <meshStandardMaterial color="#E0AC69" />
      </mesh>

      {/* Torso & High-Vis Safety Vest */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.65, 1.0, 0.35]} />
        <meshStandardMaterial color={vestColor} roughness={0.4} />
      </mesh>

      {/* High-Vis Reflective Strips on Vest */}
      <mesh position={[0, 1.85, 0.18]}>
        <boxGeometry args={[0.55, 0.15, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 1.55, 0.18]}>
        <boxGeometry args={[0.55, 0.15, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} />
      </mesh>

      {/* Work Pants / Trousers */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.34]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* Left Leg & Boot */}
      <group ref={leftLegRef} position={[-0.18, 1.0, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.9, 12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.92, 0.08]}>
          <boxGeometry args={[0.18, 0.16, 0.32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Leg & Boot */}
      <group ref={rightLegRef} position={[0.18, 1.0, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.9, 12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>
        {/* Boot */}
        <mesh position={[0, -0.92, 0.08]}>
          <boxGeometry args={[0.18, 0.16, 0.32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>
      </group>

      {/* Left Arm & Hand */}
      <group ref={leftArmRef} position={[-0.38, 2.2, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.8, 12]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>
        {/* Hand / Glove */}
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[0.1, 0.12, 0.1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Right Arm & Hand */}
      <group ref={rightArmRef} position={[0.38, 2.2, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.8, 12]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>
        {/* Hand / Glove */}
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[0.1, 0.12, 0.1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Held Cardboard Parcel attached to Hands */}
      {heldParcel && (
        <mesh position={[0, 1.6, 0.45]}>
          <boxGeometry args={[0.6, 0.4, 0.4]} />
          <meshStandardMaterial color="#C29B38" roughness={0.7} />
        </mesh>
      )}
    </group>
  );
};
