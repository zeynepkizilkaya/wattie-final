import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Tesla Sphere: wireframe icosahedron + orbital rings ─── */
function TeslaSphere({ near }) {
  const ico = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((_, delta) => {
    if (ico.current) {
      ico.current.rotation.y += delta * 0.06;
      ico.current.rotation.x += delta * 0.022;
      const s = THREE.MathUtils.damp(ico.current.scale.x, near ? 1.06 : 1, 3, delta);
      ico.current.scale.setScalar(s);
      ico.current.material.opacity = THREE.MathUtils.damp(
        ico.current.material.opacity, near ? 0.1 : 0.28, 3, delta
      );
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.13;
    if (ring2.current) ring2.current.rotation.x += delta * 0.09;
    if (ring3.current) ring3.current.rotation.y += delta * 0.07;
  });

  return (
    <group>
      <mesh ref={ico}>
        <icosahedronGeometry args={[2.55, 1]} />
        <meshBasicMaterial color="#7c9eff" wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.72, 0.005, 8, 128]} />
        <meshBasicMaterial color="#ffc93c" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[2.88, 0.004, 8, 128]} />
        <meshBasicMaterial color="#3ddc97" transparent opacity={0.28} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.6, 0.003, 8, 128]} />
        <meshBasicMaterial color="#7c9eff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

/* ─── Glass house inside the sphere ─── */
function GlassHouse({ near }) {
  const group = useRef();
  const wallsRef = useRef();
  const edgesRef = useRef();
  const roofRef = useRef();
  const furnitureRefs = useRef([]);
  furnitureRefs.current = [];

  const addRef = (el) => {
    if (el && !furnitureRefs.current.includes(el)) furnitureRefs.current.push(el);
  };

  const wallEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.7, 1.05, 1.5)),
    []
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.2;

    const targetScale = near ? 1.5 : 0.85;
    const s = THREE.MathUtils.damp(group.current.scale.x, targetScale, 3, delta);
    group.current.scale.setScalar(s);

    if (wallsRef.current) {
      wallsRef.current.material.opacity = THREE.MathUtils.damp(
        wallsRef.current.material.opacity, near ? 0.04 : 0.18, 4, delta
      );
    }
    if (edgesRef.current) {
      edgesRef.current.material.opacity = THREE.MathUtils.damp(
        edgesRef.current.material.opacity, near ? 0.6 : 0.2, 4, delta
      );
    }
    if (roofRef.current) {
      roofRef.current.material.opacity = THREE.MathUtils.damp(
        roofRef.current.material.opacity, near ? 0.06 : 0.4, 4, delta
      );
    }
    furnitureRefs.current.forEach((mesh) => {
      mesh.material.opacity = THREE.MathUtils.damp(
        mesh.material.opacity, near ? 0.92 : 0.06, 3, delta
      );
      mesh.material.emissiveIntensity = THREE.MathUtils.damp(
        mesh.material.emissiveIntensity, near ? 1.0 : 0.08, 3, delta
      );
    });
  });

  return (
    <group ref={group} position={[0, -0.12, 0]} scale={0.85}>
      {/* Glass Walls */}
      <mesh ref={wallsRef} position={[0, 0.42, 0]}>
        <boxGeometry args={[1.7, 1.05, 1.5]} />
        <meshPhysicalMaterial
          color="#b0d0ff"
          transparent opacity={0.18}
          roughness={0.05} metalness={0.08}
          transmission={0.85} thickness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Architectural wireframe edges */}
      <lineSegments ref={edgesRef} geometry={wallEdges} position={[0, 0.42, 0]}>
        <lineBasicMaterial color="#7c9eff" transparent opacity={0.2} />
      </lineSegments>

      {/* Glass Roof */}
      <mesh ref={roofRef} position={[0, 1.12, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.35, 0.65, 4]} />
        <meshPhysicalMaterial
          color="#d0e4ff"
          transparent opacity={0.4}
          roughness={0.08} transmission={0.7}
          thickness={0.25} side={THREE.DoubleSide}
          emissive="#ffc93c" emissiveIntensity={0.06}
        />
      </mesh>

      {/* Floor with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[1.7, 1.5]} />
        <meshStandardMaterial color="#141e30" transparent opacity={0.65} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <planeGeometry args={[0.008, 1.5]} />
        <meshBasicMaterial color="#7c9eff" transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <planeGeometry args={[1.7, 0.008]} />
        <meshBasicMaterial color="#7c9eff" transparent opacity={0.25} />
      </mesh>

      {/* ── Room furniture ── */}
      {/* Oturma Odası: Koltuk */}
      <mesh ref={addRef} position={[-0.45, 0.08, 0.38]}>
        <boxGeometry args={[0.52, 0.2, 0.24]} />
        <meshStandardMaterial color="#7c9eff" transparent opacity={0.06} emissive="#7c9eff" emissiveIntensity={0.08} />
      </mesh>
      {/* Oturma Odası: TV */}
      <mesh ref={addRef} position={[-0.56, 0.28, -0.38]}>
        <boxGeometry args={[0.03, 0.2, 0.34]} />
        <meshStandardMaterial color="#ffc93c" transparent opacity={0.06} emissive="#ffc93c" emissiveIntensity={0.08} />
      </mesh>
      {/* Oturma Odası: Sehpa */}
      <mesh ref={addRef} position={[-0.2, 0.02, 0.2]}>
        <boxGeometry args={[0.22, 0.06, 0.14]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.06} emissive="#a78bfa" emissiveIntensity={0.08} />
      </mesh>
      {/* Mutfak: Masa */}
      <mesh ref={addRef} position={[0.42, 0.05, -0.3]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <meshStandardMaterial color="#3ddc97" transparent opacity={0.06} emissive="#3ddc97" emissiveIntensity={0.08} />
      </mesh>
      {/* Mutfak: Buzdolabı */}
      <mesh ref={addRef} position={[0.56, 0.2, 0.42]}>
        <boxGeometry args={[0.18, 0.42, 0.18]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.06} emissive="#a78bfa" emissiveIntensity={0.08} />
      </mesh>
      {/* Mutfak: Tezgah */}
      <mesh ref={addRef} position={[0.3, 0.04, 0.48]}>
        <boxGeometry args={[0.5, 0.08, 0.12]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.06} emissive="#38bdf8" emissiveIntensity={0.08} />
      </mesh>
      {/* Yatak Odası: Yatak */}
      <mesh ref={addRef} position={[0.38, 0.06, 0.38]}>
        <boxGeometry args={[0.42, 0.1, 0.26]} />
        <meshStandardMaterial color="#ff8a5c" transparent opacity={0.06} emissive="#ff8a5c" emissiveIntensity={0.08} />
      </mesh>
      {/* Yatak Odası: Komodin */}
      <mesh ref={addRef} position={[0.62, 0.05, 0.25]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff8a5c" transparent opacity={0.06} emissive="#ff8a5c" emissiveIntensity={0.08} />
      </mesh>
      {/* Banyo: Küvet */}
      <mesh ref={addRef} position={[-0.42, 0.04, -0.35]}>
        <boxGeometry args={[0.28, 0.08, 0.16]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.06} emissive="#38bdf8" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

/* ─── Floating particles ─── */
function Particles({ count = 28 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 2.0 + Math.random() * 1.4,
      speed: 0.04 + Math.random() * 0.07,
      y: -1 + Math.random() * 2.5,
      size: 0.005 + Math.random() * 0.01,
      phase: Math.random() * Math.PI * 2,
    })), [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    data.forEach((p, i) => {
      const a = p.angle + t * p.speed;
      dummy.position.set(
        Math.cos(a) * p.radius,
        p.y + Math.sin(t * 0.3 + p.phase) * 0.15,
        Math.sin(a) * p.radius
      );
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#7c9eff" transparent opacity={0.4} />
    </instancedMesh>
  );
}

/* ─── Scene assembly ─── */
function Scene({ near }) {
  return (
    <>
      <ambientLight intensity={0.32} />
      <pointLight position={[3, 3, 3]} intensity={35} color="#7c9eff" />
      <pointLight position={[-3, -1, -3]} intensity={18} color="#ffc93c" />
      <pointLight position={[0, 2, 0]} intensity={6} color="#3ddc97" />
      <TeslaSphere near={near} />
      <GlassHouse near={near} />
      <Particles />
    </>
  );
}

/* ─── Mouse proximity ─── */
function ProximityTracker({ onNearChange }) {
  const { pointer } = useThree();
  const wasNear = useRef(false);
  useFrame(() => {
    const dist = Math.hypot(pointer.x, pointer.y);
    const isNear = dist < 0.5;
    if (isNear !== wasNear.current) {
      wasNear.current = isNear;
      onNearChange(isNear);
    }
  });
  return null;
}

export default function VoltOrb() {
  const [near, setNear] = useState(false);

  return (
    <div className="volt-orb-canvas">
      <Canvas camera={{ position: [0, 0.4, 6.2], fov: 42 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <Scene near={near} />
          <ProximityTracker onNearChange={setNear} />
        </Suspense>
      </Canvas>
    </div>
  );
}
