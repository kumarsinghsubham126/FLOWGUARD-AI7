import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';
import { FacilityEnvironment } from './FacilityEnvironment';
import { IntelligenceLayer } from './IntelligenceLayer';
import { WarehouseZone } from './WarehouseZone';
import { ConveyorPaths } from './ConveyorPaths';
import { PackageParticles } from './PackageParticles';
import { WorkerEntities } from './WorkerEntities';
import { SpatialRiskMarkers } from './SpatialRiskMarkers';
import { CameraController } from './CameraController';

export const FacilityCanvas: React.FC = () => {
  const zones = useSimulationStore((state) => state.zones);
  const selectedZone = useSimulationStore((state) => state.selectedZone);
  const aiCoreState = useSimulationStore((state) => state.aiCoreState);
  const setMousePosition = useSimulationStore((state) => state.setMousePosition);
  const setSelectedZone = useSimulationStore((state) => state.setSelectedZone);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={() => setSelectedZone(null)}
    >
      <Canvas
        camera={{ position: [0, 28, 42], fov: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
      >
        <color attach="background" args={['#1a1a1a']} />

        <FacilityEnvironment />
        <IntelligenceLayer state={aiCoreState} />

        {/* Render 5 Facility Zones */}
        {Object.values(zones).map((zone) => (
          <WarehouseZone
            key={zone.id}
            zone={zone}
            isSelected={selectedZone === zone.id}
          />
        ))}

        <ConveyorPaths />
        <PackageParticles />
        <WorkerEntities />
        <SpatialRiskMarkers />
        <CameraController />

        {/* Allow user to orbit/pan the 3D scene */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={80}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0, 0]}
          makeDefault
        />
      </Canvas>
    </div>
  );
};
