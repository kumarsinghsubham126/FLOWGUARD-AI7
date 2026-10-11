import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

// Cardboard box colors (realistic range)
const BOX_COLORS = ['#c8a96e', '#b8944e', '#d4b87a', '#a08040', '#bfa060'];

const PATH_CURVES = [
  // PICKING → SORTING
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-14, 0.62, 8),
    new THREE.Vector3(-11, 0.65, 3),
    new THREE.Vector3(-8, 0.62, -2),
    new THREE.Vector3(-6, 0.62, -6),
  ]),
  // SORTING → PACKING
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, 0.62, -6),
    new THREE.Vector3(0, 0.65, -6),
    new THREE.Vector3(6, 0.62, -6),
  ]),
  // PACKING → SHIPPING
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(6, 0.62, -6),
    new THREE.Vector3(4, 0.65, 2),
    new THREE.Vector3(2, 0.62, 7),
    new THREE.Vector3(0, 0.62, 14),
  ]),
  // BUFFER → PACKING
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(14, 0.62, 6),
    new THREE.Vector3(11, 0.65, 2),
    new THREE.Vector3(8, 0.62, -2),
    new THREE.Vector3(6, 0.62, -6),
  ]),
];

const NUM_PACKAGES = 48;

interface PackageData {
  pathIndex: number;
  progress: number;
  speed: number;
  scale: THREE.Vector3;
  colorIndex: number;
  rotY: number;
}

export const PackageParticles: React.FC = () => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const orderLoad = useSimulationStore((state) => state.scenarioMultiplier.orderLoad);
  const aiCoreState = useSimulationStore((state) => state.aiCoreState);
  
  const isBottleneck = aiCoreState === 'RISK_DETECTED' || aiCoreState === 'EXECUTING';

  // Initialize package data
  const packageData = useMemo<PackageData[]>(() => {
    return Array.from({ length: NUM_PACKAGES }, (_, i) => ({
      pathIndex: i % PATH_CURVES.length,
      progress: Math.random(),
      speed: 0.04 + Math.random() * 0.04,
      // Realistic box dimensions (not cubes - boxes are rect prisms)
      scale: new THREE.Vector3(
        0.28 + Math.random() * 0.18,
        0.22 + Math.random() * 0.14,
        0.25 + Math.random() * 0.18
      ),
      colorIndex: Math.floor(Math.random() * BOX_COLORS.length),
      rotY: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Color instances (each box has a random cardboard shade)
  const colorArray = useMemo(() => {
    const colors = new Float32Array(NUM_PACKAGES * 3);
    packageData.forEach((p, i) => {
      const color = new THREE.Color(BOX_COLORS[p.colorIndex]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    return colors;
  }, [packageData]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!instancedMeshRef.current) return;

    // Speed: slows down at packing when bottleneck
    const globalSpeed = orderLoad * delta;

    packageData.forEach((p, i) => {
      // Packages on packing path slow down when congested
      const pathSpeedFactor = (isBottleneck && p.pathIndex === 1) ? 0.3 : 1.0;
      
      p.progress = (p.progress + p.speed * globalSpeed * pathSpeedFactor) % 1.0;
      const curve = PATH_CURVES[p.pathIndex];
      const pos = curve.getPoint(p.progress);
      const tangent = curve.getTangent(p.progress);

      dummy.position.copy(pos);
      // Orient box along path
      dummy.rotation.y = Math.atan2(tangent.x, tangent.z) + p.rotY * 0.1;
      dummy.scale.copy(p.scale);
      dummy.updateMatrix();

      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[undefined, undefined, NUM_PACKAGES]}
    >
      {/* Slightly non-uniform box geometry - more rectangular than cube */}
      <boxGeometry args={[1, 0.8, 0.9]} />
      <meshStandardMaterial
        color="#c8a96e"
        roughness={0.95}
        metalness={0.0}
        vertexColors={false}
      />
    </instancedMesh>
  );
};
