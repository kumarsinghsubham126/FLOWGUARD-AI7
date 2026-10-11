import React from 'react';
import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';
import { AlertTriangle } from 'lucide-react';

// Minimal, clean spatial risk markers — no spinning octahedrons
export const SpatialRiskMarkers: React.FC = () => {
  const riskScore = useSimulationStore((state) => state.overallRiskScore);
  const zones = useSimulationStore((state) => state.zones);
  const aiCoreState = useSimulationStore((state) => state.aiCoreState);

  const isResolved = aiCoreState === 'RESOLVED';
  if (isResolved) return null;

  // Find zones that are critical or congested
  const riskZones = Object.values(zones).filter(
    z => z.status === 'CRITICAL' || z.status === 'CONGESTED'
  );

  if (riskZones.length === 0) return null;

  return (
    <group>
      {riskZones.map((zone) => {
        const { x, z: zCoord } = zone.coordinates;
        const isCritical = zone.status === 'CRITICAL';
        const yPos = 5.5;
        
        return (
          <group key={zone.id} position={[x, yPos, zCoord]}>
            {/* Clean warning badge in 3D space */}
            <Html center distanceFactor={22} style={{ pointerEvents: 'none' }}>
              <div className={`
                px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider
                flex items-center gap-1.5 select-none whitespace-nowrap
                ${isCritical
                  ? 'bg-red-950/95 border border-red-500/80 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'bg-amber-950/90 border border-amber-500/70 text-amber-300'
                }
              `}>
                <AlertTriangle className={`w-3 h-3 ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                <span>
                  {isCritical ? '⚠ BOTTLENECK' : '⚡ CONGESTED'}: {zone.utilization}% LOAD
                </span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
