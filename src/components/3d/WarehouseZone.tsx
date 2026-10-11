import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZoneData } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Html } from '@react-three/drei';

interface WarehouseZoneProps {
  zone: ZoneData;
  isSelected: boolean;
}

// Realistic industrial warehouse zone - proper floor markings, shelving, equipment
export const WarehouseZone: React.FC<WarehouseZoneProps> = ({ zone, isSelected }) => {
  const setSelectedZone = useSimulationStore((state) => state.setSelectedZone);

  const { x, y, z } = zone.coordinates;
  const isCritical = zone.status === 'CRITICAL';
  const isCongested = zone.status === 'CONGESTED';
  
  const statusColor = isCritical ? '#ef4444' : isCongested ? '#f59e0b' : '#22c55e';
  const zoneLabel = zone.id;

  // Zone-specific 3D content based on type
  const ZoneContent = useMemo(() => {
    switch (zone.id) {
      case 'PICKING':
        return <PickingZoneContent utilization={zone.utilization} />;
      case 'SORTING':
        return <SortingZoneContent utilization={zone.utilization} />;
      case 'PACKING':
        return <PackingZoneContent utilization={zone.utilization} isCritical={isCritical} />;
      case 'BUFFER':
        return <BufferZoneContent utilization={zone.utilization} />;
      case 'SHIPPING':
        return <ShippingZoneContent utilization={zone.utilization} />;
      default:
        return null;
    }
  }, [zone.id, zone.utilization, isCritical]);

  return (
    <group
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedZone(zone.id);
      }}
    >
      {/* Zone floor marking (painted line border) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[8.5, 8.5]} />
        <meshStandardMaterial
          color={isSelected ? '#1a3a4a' : '#1c1c1c'}
          roughness={0.85}
          metalness={0.0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Zone border - painted floor line (yellow safety marking) */}
      {[
        { pos: [0, 0.015, 4.25] as [number,number,number], sz: [8.5, 0.015, 0.12] as [number,number,number] },
        { pos: [0, 0.015, -4.25] as [number,number,number], sz: [8.5, 0.015, 0.12] as [number,number,number] },
        { pos: [4.25, 0.015, 0] as [number,number,number], sz: [0.12, 0.015, 8.5] as [number,number,number] },
        { pos: [-4.25, 0.015, 0] as [number,number,number], sz: [0.12, 0.015, 8.5] as [number,number,number] },
      ].map((line, i) => (
        <mesh key={i} position={line.pos}>
          <boxGeometry args={line.sz} />
          <meshStandardMaterial
            color={isSelected ? '#00aaff' : statusColor}
            roughness={0.6}
            emissive={isSelected ? '#004488' : isCritical ? '#330000' : '#001100'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Corner bollards (small yellow safety posts) */}
      {[[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8]].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.9, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color={statusColor}
              emissive={statusColor}
              emissiveIntensity={isCritical ? 1.5 : 0.4}
            />
          </mesh>
        </group>
      ))}

      {/* Zone content (shelves, equipment, etc.) */}
      {ZoneContent}

      {/* Critical zone pulsing warning light on floor */}
      {isCritical && (
        <PulsingWarningLight />
      )}

      {/* Spatial zone label */}
      <Html
        position={[0, 4.0, 0]}
        center
        distanceFactor={20}
        style={{ transition: 'all 0.3s ease', pointerEvents: 'none' }}
      >
        <div
          className={`px-3 py-2 rounded-lg font-mono text-xs select-none whitespace-nowrap transition-all duration-300 ${
            isSelected
              ? 'bg-slate-900/95 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,170,255,0.5)]'
              : isCritical
              ? 'bg-red-950/95 border border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              : isCongested
              ? 'bg-amber-950/90 border border-amber-500/70 text-amber-200'
              : 'bg-slate-950/85 border border-slate-600/60 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold tracking-widest text-[11px]">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: statusColor,
                boxShadow: `0 0 6px ${statusColor}`,
                animation: isCritical ? 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' : undefined,
              }}
            />
            {zone.name.toUpperCase()}
          </div>
          <div className="mt-1 flex items-center gap-3 text-[10px] opacity-80">
            <span>LOAD: <strong className="text-white">{zone.utilization}%</strong></span>
            <span>WRK: <strong className="text-white">{zone.activeWorkers}</strong></span>
          </div>
          {isCritical && (
            <div className="mt-1 text-[9px] text-red-400 font-bold tracking-wider animate-pulse">
              ⚠ CRITICAL — ACTION REQUIRED
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// PICKING ZONE: Storage shelves + picking carts
const PickingZoneContent: React.FC<{ utilization: number }> = ({ utilization }) => (
  <group>
    {/* Picking shelves rows */}
    {[-2.5, -0.5, 1.5].map((sx, i) => (
      <group key={i} position={[sx, 0, -1]}>
        {/* Shelf uprights */}
        {[-1.5, 1.5].map((side, j) => (
          <mesh key={j} position={[side * 0.7, 2, 0]} castShadow>
            <boxGeometry args={[0.06, 4, 0.06]} />
            <meshStandardMaterial color="#5a6a7a" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
        {/* Shelf levels */}
        {[0.5, 1.2, 1.9, 2.6].map((sy, li) => (
          <group key={li} position={[0, sy, 0]}>
            <mesh>
              <boxGeometry args={[1.5, 0.05, 0.5]} />
              <meshStandardMaterial color="#e87421" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Items on shelf */}
            {[-0.45, 0, 0.45].map((bx, bi) => (
              <mesh key={bi} position={[bx, 0.15, 0]}>
                <boxGeometry args={[0.28, 0.26, 0.4]} />
                <meshStandardMaterial color={`hsl(${30 + bi * 15}, 60%, ${40 + li * 5}%)`} roughness={0.95} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    ))}
    {/* Picking cart */}
    <group position={[2.5, 0, 1.5]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.8, 0.7, 0.5]} />
        <meshStandardMaterial color="#444" roughness={0.6} metalness={0.5} wireframe />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.75, 0.05, 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      {[[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.12, wz]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
      ))}
    </group>
  </group>
);

// SORTING ZONE: Sorting conveyor + bins
const SortingZoneContent: React.FC<{ utilization: number }> = ({ utilization }) => (
  <group>
    {/* Central sorting conveyor */}
    <group position={[0, 0, 0]}>
      {/* Conveyor frame */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[5, 0.1, 0.8]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Conveyor belt surface */}
      <mesh position={[0, 0.61, 0]}>
        <boxGeometry args={[4.9, 0.02, 0.75]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* Conveyor legs */}
      {[-2, 0, 2].map((lx, i) => (
        <mesh key={i} position={[lx, 0.27, 0]}>
          <boxGeometry args={[0.1, 0.55, 0.8]} />
          <meshStandardMaterial color="#444" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
    </group>
    {/* Sorting bins/chutes */}
    {[-2, -0.5, 1, 2.5].map((bx, i) => (
      <group key={i} position={[bx, 0, 2.5]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.8, 0.7, 0.8]} />
          <meshStandardMaterial
            color={['#1e3a8a', '#7c2d12', '#14532d', '#3b1f6b'][i]}
            roughness={0.7}
            metalness={0.2}
            wireframe
          />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.78, 0.08, 0.78]} />
          <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
        {/* Label */}
        <mesh position={[0, 0.5, 0.41]}>
          <boxGeometry args={[0.5, 0.2, 0.02]} />
          <meshStandardMaterial color="#fff" roughness={0.8} />
        </mesh>
      </group>
    ))}
  </group>
);

// PACKING ZONE: Packing tables + tape dispensers + stacked boxes
const PackingZoneContent: React.FC<{ utilization: number; isCritical: boolean }> = ({ utilization, isCritical }) => (
  <group>
    {/* Multiple packing workstations */}
    {[[-2, -1.5], [0, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5]].map(([tx, tz], i) => (
      <group key={i} position={[tx, 0, tz]}>
        {/* Table top */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[1.3, 0.08, 0.75]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.75} metalness={0.05} />
        </mesh>
        {/* Legs */}
        {[[-0.55, -0.32], [-0.55, 0.32], [0.55, -0.32], [0.55, 0.32]].map(([lx, lz], li) => (
          <mesh key={li} position={[lx, 0.45, lz]}>
            <boxGeometry args={[0.05, 0.9, 0.05]} />
            <meshStandardMaterial color="#555" roughness={0.5} metalness={0.8} />
          </mesh>
        ))}
        {/* Box being packed */}
        <mesh position={[0.1, 1.02, 0]}>
          <boxGeometry args={[0.32, 0.24, 0.3]} />
          <meshStandardMaterial color="#c8a96e" roughness={0.95} />
        </mesh>
        {/* Tape dispenser */}
        <mesh position={[-0.38, 1.02, 0.08]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 12]} />
          <meshStandardMaterial color="#777" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Stack of finished boxes under table */}
        {isCritical && (
          <group position={[0, 0, 0]}>
            {[0, 0.26, 0.52].map((by, bi) => (
              <mesh key={bi} position={[0, by + 0.13, -0.6]}>
                <boxGeometry args={[0.9, 0.25, 0.55]} />
                <meshStandardMaterial color="#b8944e" roughness={0.95} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    ))}
    
    {/* Overflow box stack (shows congestion) */}
    {isCritical && (
      <group position={[3, 0, 0]}>
        {[0, 1, 2, 3].map((row) => (
          [0, 1, 2].map((col) => (
            <mesh key={`${row}-${col}`} position={[col * 0.42 - 0.42, row * 0.32 + 0.16, 0]}>
              <boxGeometry args={[0.38, 0.30, 0.4]} />
              <meshStandardMaterial
                color={`hsl(35, ${50 + col * 10}%, ${38 + row * 3}%)`}
                roughness={0.95}
              />
            </mesh>
          ))
        )).flat()}
      </group>
    )}
  </group>
);

// BUFFER ZONE: Pallet storage + staging area
const BufferZoneContent: React.FC<{ utilization: number }> = ({ utilization }) => (
  <group>
    {/* Pallet rows */}
    {[-2.5, -1, 0.5, 2].map((px, i) => (
      <group key={i} position={[px, 0, -1]}>
        {/* Pallet */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[1.2, 0.12, 0.9]} />
          <meshStandardMaterial color="#8B6914" roughness={0.9} />
        </mesh>
        {/* Pallet stringer */}
        {[-0.45, 0, 0.45].map((sx, si) => (
          <mesh key={si} position={[sx, 0.0, 0]}>
            <boxGeometry args={[0.12, 0.09, 0.85]} />
            <meshStandardMaterial color="#6B4914" roughness={0.9} />
          </mesh>
        ))}
        {/* Boxes on pallet - more = higher utilization */}
        {Array.from({ length: Math.min(Math.floor(utilization / 25), 4) }, (_, bi) => (
          <mesh key={bi} position={[
            (bi % 2 - 0.5) * 0.45,
            0.24 + Math.floor(bi / 2) * 0.32,
            0
          ]}>
            <boxGeometry args={[0.48, 0.3, 0.72]} />
            <meshStandardMaterial color={`hsl(35, 60%, ${35 + bi * 4}%)`} roughness={0.95} />
          </mesh>
        ))}
      </group>
    ))}
    {/* Staging area scanners */}
    <group position={[3, 0, 2]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.15, 2.2, 0.15]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, 2.0, 0.12]}>
        <boxGeometry args={[0.3, 0.2, 0.15]} />
        <meshStandardMaterial color="#222" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  </group>
);

// SHIPPING ZONE: Dock plates + roller conveyors + shipping boxes
const ShippingZoneContent: React.FC<{ utilization: number }> = ({ utilization }) => (
  <group>
    {/* Roller conveyor to dock */}
    <group position={[0, 0, 2]}>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[3.5, 0.08, 0.9]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Rollers */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.48, 0.54, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.85, 10]} />
          <meshStandardMaterial color="#777" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
    {/* Shipping boxes ready for dispatch */}
    {[
      [-2.5, 0, -1.5], [-2, 0, -1.5], [-1.5, 0, -1.5],
      [-2.5, 0.38, -1.5], [-2, 0.38, -1.5],
    ].map(([bx, by, bz], i) => (
      <mesh key={i} position={[bx, by + 0.2, bz]}>
        <boxGeometry args={[0.45, 0.38, 0.42]} />
        <meshStandardMaterial color="#b8944e" roughness={0.95} />
      </mesh>
    ))}
    {/* Shipping label station */}
    <group position={[2.5, 0, -1]}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.8, 1.9, 0.15]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.2, 0.1]}>
        <boxGeometry args={[0.55, 0.4, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0.13]} emissive="#002200">
        <boxGeometry args={[0.5, 0.35, 0.01]} />
        <meshStandardMaterial color="#001a00" emissive="#003300" emissiveIntensity={2} roughness={0.1} />
      </mesh>
    </group>
  </group>
);

// Pulsing warning light for critical zones
const PulsingWarningLight: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (Math.sin(state.clock.elapsedTime * 4) + 1) * 1.5 + 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.03, 0]}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial
        color="#ef4444"
        emissive="#ef4444"
        emissiveIntensity={1.0}
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </mesh>
  );
};
