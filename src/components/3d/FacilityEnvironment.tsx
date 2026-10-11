import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Realistic industrial fulfillment center environment
export const FacilityEnvironment: React.FC = () => {
  const lightRef1 = useRef<THREE.SpotLight>(null);
  const lightRef2 = useRef<THREE.SpotLight>(null);

  // Subtle ceiling light flicker for atmosphere
  useFrame((state) => {
    if (lightRef1.current) {
      lightRef1.current.intensity = 2.2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Concrete floor texture via canvas
  const concreteTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base concrete color
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Subtle concrete noise
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const s = Math.random() * 2 + 0.5;
      const brightness = Math.floor(Math.random() * 25 + 30);
      ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
      ctx.fillRect(x, y, s, s);
    }
    
    // Expansion joints (floor lines)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 64, 0);
      ctx.lineTo(i * 64, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * 64);
      ctx.lineTo(512, i * 64);
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);

  // Floor zone markings texture
  const markingsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 1024, 1024);
    
    // Yellow safety stripe borders
    ctx.strokeStyle = 'rgba(250, 200, 30, 0.7)';
    ctx.lineWidth = 4;
    
    // Zone boundary lines
    const zones = [
      { x: 50, y: 540, w: 220, h: 220 },   // PICKING
      { x: 320, y: 250, w: 200, h: 200 },  // SORTING
      { x: 560, y: 250, w: 200, h: 200 },  // PACKING
      { x: 780, y: 400, w: 200, h: 200 },  // BUFFER
      { x: 420, y: 700, w: 200, h: 220 },  // SHIPPING
    ];
    
    zones.forEach(z => {
      ctx.strokeRect(z.x, z.y, z.w, z.h);
      // Corner marks
      const cs = 20;
      [[z.x, z.y], [z.x+z.w, z.y], [z.x, z.y+z.h], [z.x+z.w, z.y+z.h]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 200, 30, 0.9)';
        ctx.fill();
      });
    });
    
    // Pedestrian walkway stripes (diagonal yellow-black)
    ctx.save();
    ctx.strokeStyle = 'rgba(250, 200, 30, 0.4)';
    ctx.lineWidth = 2;
    for (let i = -20; i < 30; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i * 40, 0);
      ctx.lineTo(i * 40 + 512, 1024);
      ctx.stroke();
    }
    ctx.restore();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }, []);

  return (
    <group>
      {/* ===== LIGHTING SYSTEM ===== */}
      
      {/* Ambient base - industrial fluorescent look */}
      <ambientLight intensity={0.55} color="#e8eef5" />
      
      {/* Main overhead industrial array lights */}
      <spotLight
        ref={lightRef1}
        position={[0, 22, 0]}
        angle={0.9}
        penumbra={0.4}
        intensity={2.2}
        color="#fff5e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Zone-specific overhead work lights */}
      <pointLight position={[-14, 14, 8]} intensity={1.4} color="#fff5e8" distance={18} />
      <pointLight position={[-6, 14, -6]} intensity={1.2} color="#ffeedd" distance={16} />
      <pointLight position={[6, 14, -6]} intensity={1.2} color="#ffeedd" distance={16} />
      <pointLight position={[14, 14, 6]} intensity={1.0} color="#fff5e8" distance={16} />
      <pointLight position={[0, 14, 14]} intensity={1.2} color="#fff5e8" distance={18} />
      
      {/* Subtle rim lights for depth */}
      <directionalLight position={[-20, 15, -10]} intensity={0.3} color="#b8d4f8" />
      <directionalLight position={[20, 10, 10]} intensity={0.2} color="#f8e8d0" />

      {/* ===== WAREHOUSE FLOOR ===== */}
      {/* Main concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          map={concreteTexture}
          color="#3a3a3a"
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>
      
      {/* Floor safety markings overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          map={markingsTexture}
          transparent
          opacity={0.6}
          roughness={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* ===== STRUCTURAL COLUMNS ===== */}
      {/* Main steel I-beam columns around perimeter */}
      {[
        [-22, -22], [-22, -8], [-22, 8], [-22, 22],
        [-8, -22], [8, -22], [22, -22],
        [22, -8], [22, 8], [22, 22],
        [8, 22], [-8, 22],
      ].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          {/* Column base plate */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.9} />
          </mesh>
          {/* Column shaft */}
          <mesh position={[0, 6, 0]} castShadow>
            <boxGeometry args={[0.3, 12, 0.3]} />
            <meshStandardMaterial color="#555" roughness={0.4} metalness={0.85} />
          </mesh>
          {/* Flange plates (I-beam look) */}
          <mesh position={[0, 6, 0]}>
            <boxGeometry args={[0.6, 12, 0.08]} />
            <meshStandardMaterial color="#444" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Safety stripe at base */}
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.35, 1.2, 0.35]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.6} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ===== CEILING STRUCTURE ===== */}
      {/* Cross beams */}
      {[-16, -8, 0, 8, 16].map((bz, i) => (
        <mesh key={i} position={[0, 12, bz]} castShadow>
          <boxGeometry args={[48, 0.4, 0.4]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      {[-16, -8, 0, 8, 16].map((bx, i) => (
        <mesh key={i + 100} position={[bx, 12.3, 0]}>
          <boxGeometry args={[0.35, 0.35, 48]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* ===== INDUSTRIAL LIGHTING FIXTURES ===== */}
      {[
        [-10, -10], [-10, 0], [-10, 10],
        [0, -10], [0, 0], [0, 10],
        [10, -10], [10, 0], [10, 10],
      ].map(([lx, lz], i) => (
        <group key={i} position={[lx, 11.8, lz]}>
          {/* Fixture housing */}
          <mesh>
            <boxGeometry args={[1.8, 0.15, 0.45]} />
            <meshStandardMaterial color="#888" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Fluorescent panel glow */}
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[1.7, 0.02, 0.38]} />
            <meshStandardMaterial
              color="#fff5e0"
              emissive="#fff5e0"
              emissiveIntensity={2.5}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* ===== STORAGE RACK SYSTEMS ===== */}
      {/* Left side mega racks (storage area) */}
      {[-30, -26].map((rx, ri) => (
        [6, 2, -2, -6, -10].map((rz, zi) => (
          <group key={`rack-l-${ri}-${zi}`} position={[rx, 0, rz]}>
            {/* Rack uprights */}
            {[-1, 1].map((side, si) => (
              <mesh key={si} position={[side * 0.9, 3, 0]} castShadow>
                <boxGeometry args={[0.08, 6, 0.08]} />
                <meshStandardMaterial color="#5a6a7a" roughness={0.5} metalness={0.7} />
              </mesh>
            ))}
            {/* Rack beams at each level */}
            {[0.8, 1.8, 2.8, 3.8, 4.8].map((ry, bi) => (
              <mesh key={bi} position={[0, ry, 0]}>
                <boxGeometry args={[1.9, 0.06, 0.08]} />
                <meshStandardMaterial color="#e87421" roughness={0.4} metalness={0.6} />
              </mesh>
            ))}
            {/* Pallets on racks */}
            {[0.9, 1.9, 2.9].map((ry, pi) => (
              <group key={pi} position={[0, ry + 0.15, 0]}>
                <mesh>
                  <boxGeometry args={[1.6, 0.12, 0.85]} />
                  <meshStandardMaterial color="#8B6914" roughness={0.9} metalness={0.0} />
                </mesh>
                {/* Boxes on pallet */}
                {Math.random() > 0.3 && (
                  <>
                    <mesh position={[-0.35, 0.25, 0]}>
                      <boxGeometry args={[0.55, 0.38, 0.65]} />
                      <meshStandardMaterial color="#c8a96e" roughness={0.95} metalness={0} />
                    </mesh>
                    <mesh position={[0.35, 0.25, 0]}>
                      <boxGeometry args={[0.6, 0.4, 0.65]} />
                      <meshStandardMaterial color="#b8944e" roughness={0.95} metalness={0} />
                    </mesh>
                  </>
                )}
              </group>
            ))}
          </group>
        ))
      )).flat()}

      {/* Right side racks */}
      {[26, 30].map((rx, ri) => (
        [6, 2, -2, -6, -10].map((rz, zi) => (
          <group key={`rack-r-${ri}-${zi}`} position={[rx, 0, rz]}>
            {[-1, 1].map((side, si) => (
              <mesh key={si} position={[side * 0.9, 3, 0]} castShadow>
                <boxGeometry args={[0.08, 6, 0.08]} />
                <meshStandardMaterial color="#5a6a7a" roughness={0.5} metalness={0.7} />
              </mesh>
            ))}
            {[0.8, 1.8, 2.8, 3.8, 4.8].map((ry, bi) => (
              <mesh key={bi} position={[0, ry, 0]}>
                <boxGeometry args={[1.9, 0.06, 0.08]} />
                <meshStandardMaterial color="#e87421" roughness={0.4} metalness={0.6} />
              </mesh>
            ))}
            {[0.9, 1.9, 2.9].map((ry, pi) => (
              <group key={pi} position={[0, ry + 0.15, 0]}>
                <mesh>
                  <boxGeometry args={[1.6, 0.12, 0.85]} />
                  <meshStandardMaterial color="#8B6914" roughness={0.9} />
                </mesh>
                <mesh position={[0, 0.28, 0]}>
                  <boxGeometry args={[1.4, 0.42, 0.75]} />
                  <meshStandardMaterial color="#c8a96e" roughness={0.95} />
                </mesh>
              </group>
            ))}
          </group>
        ))
      )).flat()}

      {/* ===== SAFETY BARRIERS ===== */}
      {/* Yellow safety barriers (jersey barriers / guard rails) */}
      {[
        // Around main workflow lanes
        { pos: [-20, 0, 0] as [number,number,number], rot: 0, len: 25 },
        { pos: [20, 0, 0] as [number,number,number], rot: 0, len: 25 },
        { pos: [0, 0, -20] as [number,number,number], rot: Math.PI/2, len: 20 },
        { pos: [0, 0, 20] as [number,number,number], rot: Math.PI/2, len: 20 },
      ].map((b, i) => (
        <group key={i} position={b.pos} rotation={[0, b.rot, 0]}>
          {Array.from({ length: Math.floor(b.len / 2) }, (_, j) => (
            <mesh key={j} position={[(j - b.len/4) * 2, 0.3, 0]}>
              <boxGeometry args={[1.8, 0.6, 0.35]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.6} metalness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ===== SHIPPING DOCK DOORS (back wall) ===== */}
      <group position={[0, 0, 22]}>
        {/* Back wall section */}
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[50, 12, 0.5]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Dock doors */}
        {[-12, -4, 4, 12].map((dx, i) => (
          <group key={i} position={[dx, 0, 0]}>
            {/* Door frame */}
            <mesh position={[0, 3.2, 0.25]}>
              <boxGeometry args={[4.5, 6.5, 0.2]} />
              <meshStandardMaterial color="#555" roughness={0.5} metalness={0.7} />
            </mesh>
            {/* Door panel */}
            <mesh position={[0, 3.2, 0.4]}>
              <boxGeometry args={[4.2, 6.2, 0.15]} />
              <meshStandardMaterial color="#3a6b3a" roughness={0.6} metalness={0.5} />
            </mesh>
            {/* Door stripes */}
            {[-1.2, -0.4, 0.4, 1.2].map((sx, j) => (
              <mesh key={j} position={[sx, 3.2, 0.5]}>
                <boxGeometry args={[0.08, 6.0, 0.05]} />
                <meshStandardMaterial color="#1a3a1a" roughness={0.6} metalness={0.3} />
              </mesh>
            ))}
            {/* Dock number */}
            <mesh position={[0, 6.2, 0.55]}>
              <boxGeometry args={[0.8, 0.4, 0.05]} />
              <meshStandardMaterial color="#fff" roughness={0.8} />
            </mesh>
          </group>
        ))}
        
        {/* Loading dock bumpers */}
        {[-12, -4, 4, 12].map((dx, i) => (
          <mesh key={i} position={[dx, 0.4, -0.2]}>
            <boxGeometry args={[4.2, 0.8, 0.6]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ===== PACKING STATION TABLES ===== */}
      {/* Around PACKING zone */}
      {[
        [4.5, 8], [6, 8], [7.5, 8],
        [4.5, -4], [7.5, -4],
      ].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          {/* Table surface */}
          <mesh position={[0, 0.92, 0]}>
            <boxGeometry args={[1.2, 0.06, 0.7]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Table legs */}
          {[[-0.55, -0.32], [-0.55, 0.32], [0.55, -0.32], [0.55, 0.32]].map(([lx, lz], li) => (
            <mesh key={li} position={[lx, 0.45, lz]}>
              <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
              <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
            </mesh>
          ))}
          {/* Boxes on table */}
          <mesh position={[0.1, 1.0, 0]}>
            <boxGeometry args={[0.3, 0.22, 0.28]} />
            <meshStandardMaterial color="#b8944e" roughness={0.95} />
          </mesh>
          {/* Tape dispenser */}
          <mesh position={[-0.35, 1.0, 0.1]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
            <meshStandardMaterial color="#888" roughness={0.4} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ===== FORKLIFT (parked near buffer) ===== */}
      <group position={[18, 0, 8]} rotation={[0, Math.PI * 0.7, 0]}>
        {/* Forklift body */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.4, 1.6, 2.2]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Cab */}
        <mesh position={[0, 1.8, -0.5]}>
          <boxGeometry args={[1.2, 0.8, 1.0]} />
          <meshStandardMaterial color="#e87421" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Wheels */}
        {[[-0.75, 0.35], [0.75, 0.35], [-0.75, -0.7], [0.75, -0.7]].map(([wx, wz], i) => (
          <mesh key={i} position={[wx, 0.35, wz]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))}
        {/* Forks */}
        {[-0.3, 0.3].map((fx, i) => (
          <mesh key={i} position={[fx, 0.35, 1.4]}>
            <boxGeometry args={[0.12, 0.08, 1.2]} />
            <meshStandardMaterial color="#888" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ===== PALLET STACKS (buffer zone area) ===== */}
      {[
        [12, 4], [14, 4], [16, 4],
        [12, 8], [14, 8],
      ].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          {/* Stack of pallets */}
          {[0, 0.16, 0.32].map((py, pi) => (
            <group key={pi} position={[0, py, 0]}>
              {/* Pallet board */}
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[1.2, 0.12, 0.9]} />
                <meshStandardMaterial color="#8B6914" roughness={0.95} />
              </mesh>
              {/* Pallet stringer blocks */}
              {[-0.45, 0, 0.45].map((sx, si) => (
                <mesh key={si} position={[sx, -0.01, 0]}>
                  <boxGeometry args={[0.14, 0.1, 0.85]} />
                  <meshStandardMaterial color="#6B4914" roughness={0.9} />
                </mesh>
              ))}
            </group>
          ))}
          {/* Boxes on pallet */}
          {Math.random() > 0.4 && (
            <group position={[0, 0.55, 0]}>
              <mesh position={[-0.2, 0.18, -0.15]}>
                <boxGeometry args={[0.38, 0.35, 0.38]} />
                <meshStandardMaterial color="#c8a96e" roughness={0.95} />
              </mesh>
              <mesh position={[0.22, 0.18, 0.1]}>
                <boxGeometry args={[0.35, 0.38, 0.42]} />
                <meshStandardMaterial color="#b8945e" roughness={0.95} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* ===== SUBTLE ATMOSPHERIC FOG (more realistic, less sci-fi) ===== */}
      <fog attach="fog" args={['#1a1a1a', 40, 90]} />
    </group>
  );
};
