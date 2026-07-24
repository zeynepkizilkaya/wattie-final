import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const ROOM_ZONES = {
  "Oturma Odası": { cx: -1.05, cz: 1.05 },
  Mutfak: { cx: 1.05, cz: 1.05 },
  "Yatak Odası": { cx: -1.05, cz: -1.05 },
  Banyo: { cx: 1.05, cz: -1.05 },
};

const STATUS_COLOR = {
  anomalous: "#ff4757",
  warn: "#ffc93c",
  ok: "#3ddc97",
};

function statusOf(a) {
  if (a.isAnomalous) return "anomalous";
  if (a.currentWatt > a.safeWatt) return "warn";
  return "ok";
}

function layoutAppliances(appliances) {
  const grouped = {};
  appliances.forEach((a) => {
    const key = a.room;
    grouped[key] = grouped[key] || [];
    grouped[key].push(a);
  });
  const positioned = [];
  Object.entries(grouped).forEach(([room, list]) => {
    const zone = ROOM_ZONES[room] || { cx: 0, cz: 0 };
    list.forEach((a, i) => {
      const offset = (i - (list.length - 1) / 2) * 0.42;
      positioned.push({
        ...a,
        pos: [zone.cx + offset * 0.6, 0, zone.cz + offset * 0.35],
      });
    });
  });
  return positioned;
}

/* ─── Appliance 3D model ─── */
function ApplianceModel({ appliance, onSelect }) {
  const status = statusOf(appliance);
  const color = STATUS_COLOR[status];
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    if (status === "anomalous") {
      ref.current.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    }
  });

  const geometry = useMemo(() => {
    switch (appliance.icon) {
      case "tv": return <boxGeometry args={[0.04, 0.28, 0.42]} />;
      case "fridge": return <boxGeometry args={[0.3, 0.55, 0.28]} />;
      case "ac": return <boxGeometry args={[0.5, 0.12, 0.18]} />;
      case "washer": return <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />;
      case "oven": return <boxGeometry args={[0.32, 0.3, 0.3]} />;
      case "light": return <sphereGeometry args={[0.08, 16, 16]} />;
      default: return <boxGeometry args={[0.2, 0.2, 0.2]} />;
    }
  }, [appliance.icon]);

  const yOffset =
    appliance.icon === "ac" ? 1.2 :
    appliance.icon === "light" ? 1.4 :
    appliance.icon === "fridge" ? 0.28 :
    appliance.icon === "tv" ? 0.5 : 0.15;

  return (
    <group position={[appliance.pos[0], yOffset, appliance.pos[2]]}>
      <mesh
        ref={ref}
        onClick={(e) => { e.stopPropagation(); onSelect(appliance); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {geometry}
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={hovered ? 0.85 : 0.55}
          roughness={0.15} metalness={0.1}
          transmission={0.3} thickness={0.2}
          emissive={color}
          emissiveIntensity={status === "anomalous" ? 0.8 : hovered ? 0.5 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html distanceFactor={7} center occlude={false}>
        <button
          className={`hotspot-label ${status}`}
          onClick={() => onSelect(appliance)}
          title={appliance.name}
        >
          {appliance.name}
          <span className="hotspot-watt">{appliance.currentWatt}W</span>
        </button>
      </Html>
    </group>
  );
}

/* ─── Holographic floor with grid ─── */
function HolographicFloor() {
  return (
    <group>
      {/* Large circular ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#0a1210" transparent opacity={0.5} roughness={0.95} />
      </mesh>
      {/* House floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[4.5, 4.5]} />
        <meshStandardMaterial color="#0d1520" transparent opacity={0.8} roughness={0.95} />
      </mesh>
      {/* Grid lines X */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`gx-${i}`} position={[-2.25 + i * 0.45, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.008, 4.5]} />
          <meshBasicMaterial color="#7c9eff" transparent opacity={0.1} />
        </mesh>
      ))}
      {/* Grid lines Z */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`gz-${i}`} position={[0, 0.002, -2.25 + i * 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.5, 0.008]} />
          <meshBasicMaterial color="#7c9eff" transparent opacity={0.1} />
        </mesh>
      ))}
      {/* Room dividers (brighter) */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 4.3]} />
        <meshBasicMaterial color="#7c9eff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.3, 0.02]} />
        <meshBasicMaterial color="#7c9eff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Glass walls + roof ─── */
function GlassWalls() {
  return (
    <group>
      {/* Outer glass shell */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[4.3, 1.8, 4.3]} />
        <meshPhysicalMaterial
          color="#a0c4ff" transparent opacity={0.06}
          roughness={0.05} metalness={0.05}
          transmission={0.92} thickness={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Room divider X */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.02, 1.6, 4.2]} />
        <meshPhysicalMaterial color="#8fb0ff" transparent opacity={0.05} roughness={0.1} transmission={0.9} thickness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Room divider Z */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[4.2, 1.6, 0.02]} />
        <meshPhysicalMaterial color="#8fb0ff" transparent opacity={0.05} roughness={0.1} transmission={0.9} thickness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Glass Roof */}
      <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.3, 1.1, 4]} />
        <meshPhysicalMaterial color="#b0c8ff" transparent opacity={0.08} roughness={0.1} transmission={0.85} thickness={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Edge glow at base */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.9, 3.05, 4]} />
        <meshBasicMaterial color="#7c9eff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─── Room labels ─── */
function RoomLabels() {
  const rooms = [
    { name: "Oturma Odası", pos: [-1.05, 0.05, 1.05] },
    { name: "Mutfak", pos: [1.05, 0.05, 1.05] },
    { name: "Yatak Odası", pos: [-1.05, 0.05, -1.05] },
    { name: "Banyo", pos: [1.05, 0.05, -1.05] },
  ];
  return rooms.map((room) => (
    <Html key={room.name} position={room.pos} distanceFactor={10} center>
      <span className="room-label mono">{room.name}</span>
    </Html>
  ));
}

/* ─── Garden: trees, pathway, fence ─── */
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.7, 8]} />
        <meshStandardMaterial color="#3a5435" transparent opacity={0.6} />
      </mesh>
      {/* Canopy - wireframe sphere for holographic feel */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial
          color="#3ddc97" transparent opacity={0.12}
          emissive="#3ddc97" emissiveIntensity={0.15}
          wireframe
        />
      </mesh>
      {/* Canopy solid glow */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial
          color="#3ddc97" transparent opacity={0.06}
          emissive="#3ddc97" emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function Garden() {
  return (
    <group>
      {/* Trees around the house */}
      <Tree position={[-3.8, 0, -3.2]} scale={1.1} />
      <Tree position={[3.5, 0, -2.8]} scale={0.9} />
      <Tree position={[-3.2, 0, 3.5]} scale={1.0} />
      <Tree position={[3.8, 0, 3.3]} scale={1.2} />
      <Tree position={[0, 0, -4.2]} scale={0.85} />
      <Tree position={[-4.5, 0, 0]} scale={0.95} />
      <Tree position={[4.3, 0, 0.5]} scale={1.05} />

      {/* Pathway to house entrance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 3.8]}>
        <planeGeometry args={[0.7, 3.2]} />
        <meshStandardMaterial color="#1a2a1a" transparent opacity={0.4} roughness={0.9} />
      </mesh>
      {/* Pathway glow lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.35, 0.004, 3.8]}>
        <planeGeometry args={[0.01, 3.2]} />
        <meshBasicMaterial color="#3ddc97" transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.004, 3.8]}>
        <planeGeometry args={[0.01, 3.2]} />
        <meshBasicMaterial color="#3ddc97" transparent opacity={0.18} />
      </mesh>

      {/* Fence posts around garden perimeter */}
      {[
        [-5, 0, -5], [-5, 0, -2.5], [-5, 0, 0], [-5, 0, 2.5], [-5, 0, 5],
        [5, 0, -5], [5, 0, -2.5], [5, 0, 0], [5, 0, 2.5], [5, 0, 5],
        [-2.5, 0, -5], [0, 0, -5], [2.5, 0, -5],
        [-2.5, 0, 5], [2.5, 0, 5],
      ].map((pos, i) => (
        <mesh key={`fp-${i}`} position={[pos[0], 0.2, pos[2]]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial color="#7c9eff" transparent opacity={0.2} emissive="#7c9eff" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Fence rails */}
      {[
        { pos: [-5, 0.25, 0], args: [0.01, 0.01, 10] },
        { pos: [5, 0.25, 0], args: [0.01, 0.01, 10] },
        { pos: [0, 0.25, -5], args: [10, 0.01, 0.01] },
        { pos: [0, 0.25, 5], args: [4.3, 0.01, 0.01] },
      ].map((rail, i) => (
        <mesh key={`fr-${i}`} position={rail.pos}>
          <boxGeometry args={rail.args} />
          <meshBasicMaterial color="#7c9eff" transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Room furniture for additional detail ─── */
function RoomFurniture() {
  return (
    <group>
      {/* Oturma Odası — rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.05, 0.003, 1.05]}>
        <planeGeometry args={[1.6, 1.4]} />
        <meshStandardMaterial color="#2a2040" transparent opacity={0.25} roughness={0.95} />
      </mesh>
      {/* Mutfak — counter L-shape */}
      <mesh position={[1.8, 0.3, 1.05]}>
        <boxGeometry args={[0.5, 0.04, 1.4]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.15} emissive="#38bdf8" emissiveIntensity={0.1} />
      </mesh>
      {/* Yatak Odası — wardrobe */}
      <mesh position={[-1.85, 0.45, -1.05]}>
        <boxGeometry args={[0.25, 0.9, 0.5]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.12} emissive="#a78bfa" emissiveIntensity={0.1} />
      </mesh>
      {/* Yatak Odası — nightstand */}
      <mesh position={[-0.55, 0.12, -1.4]}>
        <boxGeometry args={[0.15, 0.24, 0.15]} />
        <meshStandardMaterial color="#ff8a5c" transparent opacity={0.15} emissive="#ff8a5c" emissiveIntensity={0.1} />
      </mesh>
      {/* Banyo — sink */}
      <mesh position={[1.6, 0.35, -1.05]}>
        <boxGeometry args={[0.25, 0.04, 0.35]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.18} emissive="#38bdf8" emissiveIntensity={0.15} />
      </mesh>
      {/* Banyo — toilet */}
      <mesh position={[1.05, 0.12, -1.6]}>
        <boxGeometry args={[0.2, 0.24, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.1} emissive="#e2e8f0" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

export default function House3D({ appliances, onSelectAppliance }) {
  const positioned = useMemo(() => layoutAppliances(appliances.filter((a) => a.in3D !== false)), [appliances]);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <div className="house3d-canvas">
      <Canvas shadows camera={{ position: [5.5, 4, 5.5], fov: 38 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 3]} intensity={0.9} castShadow />
          <pointLight position={[-3, 2, -3]} intensity={20} color="#7c9eff" />
          <pointLight position={[3, 1, 3]} intensity={10} color="#3ddc97" />
          <pointLight position={[0, 3, 0]} intensity={8} color="#ffc93c" />
          <HolographicFloor />
          <GlassWalls />
          <RoomLabels />
          <RoomFurniture />
          <Garden />
          {positioned.map((a) => (
            <ApplianceModel key={a.id} appliance={a} onSelect={onSelectAppliance} />
          ))}
          <ContactShadows position={[0, 0, 0]} opacity={0.2} scale={14} blur={3} far={3} />
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            onStart={() => setAutoRotate(false)}
          />
        </Suspense>
      </Canvas>
      <div className="house3d-hint mono">sürükle · 360° döndür · scroll · yakınlaş</div>
    </div>
  );
}
