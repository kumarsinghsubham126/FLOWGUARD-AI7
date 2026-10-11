import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

const ZONE_CENTERS: Record<string, THREE.Vector3> = {
  PICKING: new THREE.Vector3(-14, 0, 8),
  SORTING: new THREE.Vector3(-6, 0, -6),
  PACKING: new THREE.Vector3(6, 0, -6),
  BUFFER: new THREE.Vector3(14, 0, 6),
  SHIPPING: new THREE.Vector3(0, 0, 14),
};

// Worker activity states
type WorkerActivity = 
  | 'IDLE'
  | 'WALKING'
  | 'PICKING'
  | 'CARRYING'
  | 'PACKING'
  | 'SORTING'
  | 'HANDOFF_GIVE'
  | 'HANDOFF_RECEIVE';

interface WorkerState {
  id: number;
  zone: string;
  pos: THREE.Vector3;
  target: THREE.Vector3;
  heading: number; // Y rotation
  activity: WorkerActivity;
  activityTimer: number;
  activityDuration: number;
  speed: number;
  hasParcel: boolean;
  parcelTarget?: THREE.Vector3;
  handoffPartnerId?: number;
  vestColor: string;  // Worker vest color by zone
  bodyHeight: number; // Slight variation
}

const ZONE_VEST_COLORS: Record<string, string> = {
  PICKING: '#f97316',   // Orange vest
  SORTING: '#3b82f6',   // Blue vest
  PACKING: '#22c55e',   // Green vest
  BUFFER: '#a855f7',    // Purple vest
  SHIPPING: '#f59e0b',  // Yellow vest
};

const NUM_WORKERS = 32;

// Simple procedural humanoid worker using box geometries
const HumanoidWorker: React.FC<{
  position: THREE.Vector3;
  rotation: number;
  activity: WorkerActivity;
  hasParcel: boolean;
  vestColor: string;
  bodyHeight: number;
  time: number;
}> = ({ position, rotation, activity, hasParcel, vestColor, bodyHeight, time }) => {
  const isWalking = activity === 'WALKING' || activity === 'CARRYING' || activity === 'HANDOFF_GIVE';
  const isWorking = activity === 'PICKING' || activity === 'PACKING' || activity === 'SORTING';
  
  // Walking bob
  const walkBob = isWalking ? Math.sin(time * 6) * 0.04 : 0;
  const legSwing = isWalking ? Math.sin(time * 6) * 0.3 : 0;
  const armSwing = isWalking ? Math.sin(time * 6) * 0.25 : 0;
  const workBob = isWorking ? Math.sin(time * 3) * 0.03 : 0;
  
  const h = bodyHeight; // height scale
  const px = position.x;
  const py = position.y + walkBob + workBob;
  const pz = position.z;

  const mat = { roughness: 0.85, metalness: 0.0 };
  const skinColor = '#c8956e';
  const pantsColor = '#1a2a3a';
  const shoeColor = '#1a1a1a';
  const helmetColor = '#ffdd00';

  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {/* TORSO - work vest */}
      <mesh position={[0, h * 0.88, 0]}>
        <boxGeometry args={[0.32 * h, 0.36 * h, 0.18 * h]} />
        <meshStandardMaterial color={vestColor} roughness={0.9} metalness={0} />
      </mesh>
      {/* Vest reflective strips */}
      <mesh position={[0, h * 0.88, 0.095 * h]}>
        <boxGeometry args={[0.33 * h, 0.04 * h, 0.01 * h]} />
        <meshStandardMaterial color="#ffff99" roughness={0.3} metalness={0.1} emissive="#ffff44" emissiveIntensity={0.2} />
      </mesh>
      {/* Shirt underneath */}
      <mesh position={[0, h * 0.78, 0]}>
        <boxGeometry args={[0.28 * h, 0.14 * h, 0.16 * h]} />
        <meshStandardMaterial color="#ddd" roughness={0.9} />
      </mesh>
      
      {/* HEAD */}
      <mesh position={[0, h * 1.12, 0]}>
        <boxGeometry args={[0.22 * h, 0.22 * h, 0.22 * h]} />
        <meshStandardMaterial color={skinColor} {...mat} />
      </mesh>
      {/* Hard hat */}
      <mesh position={[0, h * 1.24, 0]}>
        <cylinderGeometry args={[0.14 * h, 0.12 * h, 0.1 * h, 10]} />
        <meshStandardMaterial color={helmetColor} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Helmet brim */}
      <mesh position={[0, h * 1.19, 0.01 * h]}>
        <cylinderGeometry args={[0.16 * h, 0.15 * h, 0.025 * h, 10]} />
        <meshStandardMaterial color={helmetColor} roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* PELVIS */}
      <mesh position={[0, h * 0.6, 0]}>
        <boxGeometry args={[0.3 * h, 0.12 * h, 0.17 * h]} />
        <meshStandardMaterial color={pantsColor} {...mat} />
      </mesh>
      
      {/* LEFT LEG */}
      <group position={[-0.09 * h, h * 0.38, 0]} rotation={[legSwing, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.12 * h, 0.35 * h, 0.14 * h]} />
          <meshStandardMaterial color={pantsColor} {...mat} />
        </mesh>
        {/* Left foot */}
        <mesh position={[0, -0.2 * h, 0.04 * h]}>
          <boxGeometry args={[0.11 * h, 0.08 * h, 0.2 * h]} />
          <meshStandardMaterial color={shoeColor} {...mat} />
        </mesh>
      </group>
      
      {/* RIGHT LEG */}
      <group position={[0.09 * h, h * 0.38, 0]} rotation={[-legSwing, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.12 * h, 0.35 * h, 0.14 * h]} />
          <meshStandardMaterial color={pantsColor} {...mat} />
        </mesh>
        {/* Right foot */}
        <mesh position={[0, -0.2 * h, 0.04 * h]}>
          <boxGeometry args={[0.11 * h, 0.08 * h, 0.2 * h]} />
          <meshStandardMaterial color={shoeColor} {...mat} />
        </mesh>
      </group>
      
      {/* LEFT ARM */}
      <group 
        position={[-0.22 * h, h * 0.88, 0]} 
        rotation={[armSwing + (hasParcel ? 0.7 : 0), 0, hasParcel ? -0.3 : -0.1]}
      >
        <mesh position={[0, -0.14 * h, 0]}>
          <boxGeometry args={[0.1 * h, 0.3 * h, 0.1 * h]} />
          <meshStandardMaterial color={vestColor} roughness={0.9} />
        </mesh>
        {/* Forearm (skin) */}
        <mesh position={[0, -0.32 * h, 0]}>
          <boxGeometry args={[0.09 * h, 0.14 * h, 0.09 * h]} />
          <meshStandardMaterial color={skinColor} {...mat} />
        </mesh>
      </group>
      
      {/* RIGHT ARM */}
      <group 
        position={[0.22 * h, h * 0.88, 0]} 
        rotation={[-armSwing + (hasParcel ? 0.7 : 0), 0, hasParcel ? 0.3 : 0.1]}
      >
        <mesh position={[0, -0.14 * h, 0]}>
          <boxGeometry args={[0.1 * h, 0.3 * h, 0.1 * h]} />
          <meshStandardMaterial color={vestColor} roughness={0.9} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.32 * h, 0]}>
          <boxGeometry args={[0.09 * h, 0.14 * h, 0.09 * h]} />
          <meshStandardMaterial color={skinColor} {...mat} />
        </mesh>
      </group>
      
      {/* PARCEL (cardboard box held in front) */}
      {hasParcel && (
        <mesh position={[0, h * 0.75, 0.2 * h]}>
          <boxGeometry args={[0.28 * h, 0.22 * h, 0.24 * h]} />
          <meshStandardMaterial color="#c8a96e" roughness={0.95} metalness={0} />
        </mesh>
      )}
    </group>
  );
};

export const WorkerEntities: React.FC = () => {
  const aiCoreState = useSimulationStore((state) => state.aiCoreState);
  const orderLoad = useSimulationStore((state) => state.scenarioMultiplier.orderLoad);
  const isAutonomous = useSimulationStore((state) => state.isAutonomous);
  
  const isReallocating = aiCoreState === 'EXECUTING' || aiCoreState === 'VERIFYING' || (isAutonomous && aiCoreState === 'PLANNING');
  
  // Worker state stored in a ref (not React state, to avoid re-renders)
  const workers = useRef<WorkerState[]>([]);
  const timeRef = useRef(0);
  
  // Initialize workers
  useEffect(() => {
    const zoneKeys = Object.keys(ZONE_CENTERS);
    const newWorkers: WorkerState[] = [];
    
    for (let i = 0; i < NUM_WORKERS; i++) {
      const zoneKey = zoneKeys[i % zoneKeys.length];
      const center = ZONE_CENTERS[zoneKey];
      const spread = 3.5;
      const px = center.x + (Math.random() - 0.5) * spread;
      const pz = center.z + (Math.random() - 0.5) * spread;
      const pos = new THREE.Vector3(px, 0, pz);
      
      newWorkers.push({
        id: i,
        zone: zoneKey,
        pos: pos.clone(),
        target: pos.clone(),
        heading: Math.random() * Math.PI * 2,
        activity: 'IDLE',
        activityTimer: Math.random() * 3,
        activityDuration: 2 + Math.random() * 4,
        speed: 1.2 + Math.random() * 0.8,
        hasParcel: false,
        vestColor: ZONE_VEST_COLORS[zoneKey] || '#f97316',
        bodyHeight: 0.9 + Math.random() * 0.15,
      });
    }
    workers.current = newWorkers;
  }, []);

  // Force re-render periodically for animation
  const [tick, setTick] = React.useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 50); // 20fps update
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    timeRef.current = state.clock.elapsedTime;
    const speedMultiplier = orderLoad;
    
    workers.current.forEach((w, i) => {
      w.activityTimer -= delta;
      
      // State machine
      if (w.activityTimer <= 0) {
        // Transition to next activity
        if (isReallocating && (w.zone === 'BUFFER' || (w.zone === 'PICKING' && i % 3 === 0))) {
          // During reallocation, walk toward packing
          w.zone = 'PACKING';
          w.vestColor = ZONE_VEST_COLORS.PACKING;
        }
        
        const rand = Math.random();
        const center = ZONE_CENTERS[w.zone];
        const spread = 3.2;
        
        if (rand < 0.35) {
          // Walk to new spot in zone
          w.activity = 'WALKING';
          w.target.set(
            center.x + (Math.random() - 0.5) * spread,
            0,
            center.z + (Math.random() - 0.5) * spread
          );
          w.activityDuration = 1.5 + Math.random() * 2.5;
          w.hasParcel = false;
        } else if (rand < 0.55) {
          // Carry parcel (walk with box)
          w.activity = 'CARRYING';
          w.target.set(
            center.x + (Math.random() - 0.5) * spread,
            0,
            center.z + (Math.random() - 0.5) * spread
          );
          w.activityDuration = 2 + Math.random() * 3;
          w.hasParcel = true;
        } else if (rand < 0.75) {
          // Work in place (picking/packing/sorting)
          w.activity = w.zone === 'PICKING' ? 'PICKING' :
                       w.zone === 'PACKING' ? 'PACKING' :
                       w.zone === 'SORTING' ? 'SORTING' : 'IDLE';
          w.activityDuration = 1 + Math.random() * 2 * (1 / speedMultiplier);
        } else {
          // Idle/waiting
          w.activity = 'IDLE';
          w.activityDuration = 0.5 + Math.random() * 1.5;
        }
        
        w.activityTimer = w.activityDuration;
      }
      
      // Movement
      if (w.activity === 'WALKING' || w.activity === 'CARRYING') {
        const dir = new THREE.Vector3().subVectors(w.target, w.pos);
        const dist = dir.length();
        
        if (dist > 0.1) {
          dir.normalize();
          const moveSpeed = w.speed * speedMultiplier * delta;
          w.pos.addScaledVector(dir, Math.min(moveSpeed, dist));
          
          // Face direction of movement
          w.heading = Math.atan2(dir.x, dir.z);
        }
      } else if (w.activity === 'PICKING' || w.activity === 'PACKING' || w.activity === 'SORTING') {
        // Subtle sway in place
        w.pos.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.001;
      }
    });
  });

  // Render all workers
  return (
    <group>
      {workers.current.map((w) => (
        <HumanoidWorker
          key={w.id}
          position={w.pos}
          rotation={w.heading}
          activity={w.activity}
          hasParcel={w.hasParcel}
          vestColor={w.vestColor}
          bodyHeight={w.bodyHeight}
          time={timeRef.current}
        />
      ))}
    </group>
  );
};
