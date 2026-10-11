import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { AICoreState, ZoneId } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Cpu, Zap, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';

interface IntelligenceLayerProps {
  state: AICoreState;
}

const ZONE_POSITIONS: Record<ZoneId, [number, number, number]> = {
  PICKING: [-14, 0.1, 8],
  SORTING: [-6, 0.1, -6],
  PACKING: [6, 0.1, -6],
  BUFFER: [14, 0.1, 6],
  SHIPPING: [0, 0.1, 14],
};

// Minimal intelligence layer - subtle data lines, no giant AI orb
export const IntelligenceLayer: React.FC<IntelligenceLayerProps> = ({ state }) => {
  const overallRiskScore = useSimulationStore((st) => st.overallRiskScore);
  const isAutonomous = useSimulationStore((st) => st.isAutonomous);
  const zones = useSimulationStore((st) => st.zones);

  const isRisk = state === 'RISK_DETECTED' || overallRiskScore > 40;
  const isExecuting = state === 'EXECUTING' || state === 'PLANNING' || state === 'VERIFYING';
  const isResolved = state === 'RESOLVED';

  const accentColor = isResolved
    ? '#10B981'
    : isExecuting
    ? '#8B5CF6'
    : isRisk
    ? '#EF4444'
    : '#00ccaa';

  // Generate very subtle data lines from center hub (floor level) to zones
  const dataLines = useMemo(() => {
    const center = new THREE.Vector3(0, 0.08, 0);
    return Object.entries(ZONE_POSITIONS).map(([zId, pos]) => {
      const target = new THREE.Vector3(...pos);
      const zoneData = zones[zId as ZoneId];
      const isCritical = zoneData?.status === 'CRITICAL';
      
      const geometry = new THREE.BufferGeometry().setFromPoints([
        center,
        new THREE.Vector3(pos[0] * 0.4, 0.1, pos[2] * 0.4),
        target,
      ]);
      const material = new THREE.LineDashedMaterial({
        color: isCritical ? '#EF4444' : '#334466',
        dashSize: 0.8,
        gapSize: 0.6,
        linewidth: 1,
        transparent: true,
        opacity: isCritical ? 0.7 : 0.2,
      });
      const lineObj = new THREE.Line(geometry, material);
      lineObj.computeLineDistances();
      return { id: zId, lineObj };
    });
  }, [isRisk, zones]);

  useFrame((state, delta) => {
    // Animate data line dash offset
    dataLines.forEach(({ lineObj }) => {
      const mat = lineObj.material as any;
      if (mat?.dashOffset !== undefined) {
        mat.dashOffset -= delta * (isExecuting ? 3.0 : 0.6);
      }
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Very subtle floor hub marker (small circle, not giant orb) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.55, 32]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle neural data lines */}
      {dataLines.map(({ id, lineObj }) => (
        <primitive key={id} object={lineObj} />
      ))}

      {/* Small status badge (not blocking the warehouse view) */}
      <Html position={[0, 0.5, 0]} center distanceFactor={35}>
        <div className="bg-slate-950/85 border border-slate-700/60 text-slate-200 px-2.5 py-1.5 rounded-lg shadow-lg font-mono text-[10px] flex items-center gap-2 select-none pointer-events-none backdrop-blur-md">
          <div className="w-4 h-4 rounded bg-slate-900 border border-cyan-500/30 flex items-center justify-center">
            {isExecuting ? (
              <Zap className="w-2.5 h-2.5 text-violet-400" />
            ) : isRisk ? (
              <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
            ) : isResolved ? (
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            ) : (
              <Cpu className="w-2.5 h-2.5 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="text-[8px] text-slate-500 uppercase tracking-wider">FLOWGUARD AI</div>
            <div className="font-bold text-white flex items-center gap-1">
              {state}
              {isAutonomous && (
                <span className="text-[7px] px-1 rounded bg-violet-950 text-violet-400 border border-violet-800">AUTO</span>
              )}
            </div>
          </div>
        </div>
      </Html>

      {/* Risk zone pulsing indicators (subtle ground glow near critical zone) */}
      {Object.entries(zones).map(([zId, zone]) => {
        if (zone.status !== 'CRITICAL') return null;
        const pos = ZONE_POSITIONS[zId as ZoneId];
        return (
          <mesh key={zId} position={[pos[0], 0.02, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4.0, 4.4, 32]} />
            <meshBasicMaterial
              color="#EF4444"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};
