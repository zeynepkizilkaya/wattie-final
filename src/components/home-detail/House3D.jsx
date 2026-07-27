import { Suspense, useMemo, useRef, useState, Component, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Preload GLTF modern_house.glb
useGLTF.preload("/models/modern_house.glb");

/* ─── Error Boundary ─── */
class GLTFErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("ModernVilla GLTF load fallback triggered:", error?.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ─── Modern Villa Model Instance (Clean, no orange ground dirt) ─── */
function ModernVillaInstance({ position, home, isSelected, onSelect }) {
  const { scene } = useGLTF("/models/modern_house.glb");
  const [hovered, setHovered] = useState(false);

  // Clone GLTF scene while hiding/recoloring any orange ground slab
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace;
          }
          const colorHex = mat.color ? mat.color.getHexString() : "";
          if (colorHex.startsWith("c2") || colorHex.startsWith("b4") || colorHex.startsWith("d9") || colorHex.startsWith("78")) {
            mat.color = new THREE.Color("#1e293b");
          }
          mat.roughness = 0.35;
          mat.metalness = 0.1;
          mat.needsUpdate = true;
        });
      }
    });
    return clone;
  }, [scene]);

  const { center, min } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const c = new THREE.Vector3();
    box.getCenter(c);
    return { center: c, min: box.min };
  }, [clonedScene]);

  const quotaPct = home ? Math.min(100, Math.round((home.usedKwh / home.quotaKwh) * 100)) : 0;
  const isPenalty = home?.tariffState === "PENALTY" || quotaPct >= 100;
  const isWarning = home?.tariffState === "WARNING" || (quotaPct >= 80 && !isPenalty);

  return (
    <group
      position={position}
      rotation={[0, -0.34, 0]}
      scale={0.9}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(home);
      }}
    >
      {/* Villa Model */}
      <primitive object={clonedScene} position={[-center.x, -min.y, -center.z]} />

      {/* Floating Tag Overhead */}
      {home && (
        <Html
          position={[0, 7.4, 0]}
          center
          distanceFactor={22}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`neighborhood-house-pill ${isSelected ? "selected" : ""} ${
              isPenalty ? "penalty" : isWarning ? "warning" : "normal"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(home);
            }}
            style={{ pointerEvents: "auto" }}
          >
            <div className="pill-name">{home.name}</div>
            <div className="pill-sub mono">{home.usedKwh} kWh (%{quotaPct})</div>
          </div>
        </Html>
      )}

      {/* Selection Glow Marker */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.4, 4.8, 32]} />
          <meshBasicMaterial color={isSelected ? "#2563eb" : "#16a34a"} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function ProceduralHouseInstance({ position, home, isSelected, onSelect }) {
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onSelect?.(home); }}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.8, 2.4, 3.8]} />
        <meshStandardMaterial color={isSelected ? "#2563eb" : "#e2e8f0"} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.0, 1.2, 4]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} />
      </mesh>
      {home && (
        <Html position={[0, 5.5, 0]} center distanceFactor={22} style={{ pointerEvents: "none" }}>
          <div
            className={`neighborhood-house-pill ${isSelected ? "selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(home);
            }}
            style={{ pointerEvents: "auto" }}
          >
            <div className="pill-name">{home.name}</div>
            <div className="pill-sub mono">{home.usedKwh} kWh</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function FloatingDioramaIsland({ count }) {
  const islandWidth = Math.max(160, count * 30);

  return (
    <group position={[0, -0.4, 0]}>
      {/* Main Floating Platform Block */}
      <mesh position={[0, -0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[islandWidth, 0.8, 22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Lawn Top Layer */}
      <mesh position={[0, 0.01, -2]} receiveShadow>
        <boxGeometry args={[islandWidth - 2, 0.05, 12]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>

      {/* Main Asphalt Road Strip */}
      <mesh position={[0, 0.02, 5]}>
        <boxGeometry args={[islandWidth - 2, 0.06, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* Sidewalk Border Curb */}
      <mesh position={[0, 0.03, 1.8]}>
        <boxGeometry args={[islandWidth - 2, 0.08, 0.5]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} />
      </mesh>

      {/* Yellow Center Road Stripes */}
      {Array.from({ length: Math.ceil(islandWidth / 6) }).map((_, i) => (
        <mesh
          key={`stripe-${i}`}
          position={[-islandWidth / 2 + i * 6 + 3, 0.06, 5]}
        >
          <boxGeometry args={[3, 0.02, 0.2]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Glowing Neon Blue Platform Edge Trim */}
      <mesh position={[0, -0.4, 11.05]}>
        <boxGeometry args={[islandWidth, 0.1, 0.1]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, -0.4, -11.05]}>
        <boxGeometry args={[islandWidth, 0.1, 0.1]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>

      {/* Decorative Trees along Lawn */}
      {Array.from({ length: Math.ceil(islandWidth / 18) }).map((_, i) => {
        const x = -islandWidth / 2 + i * 18 + 6;
        return (
          <group key={`tree-${i}`} position={[x, 0.05, -5]}>
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 2.0, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 2.8, 0]}>
              <sphereGeometry args={[1.4, 8, 8]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function FreeSpaceOrbitController({ targetX }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useFrame((_, delta) => {
    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetX, 3.5, delta);
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, 2.0, 3.5, delta);
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, 0.0, 3.5, delta);

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={true}
      enablePan={true}
      enableZoom={false}
      rotateSpeed={1.0}
      panSpeed={1.2}
      minDistance={10}
      maxDistance={80}
    />
  );
}

export default function House3D({ homes = [], activeHomeId, appliances = [], onSelectHome }) {
  const containerRef = useRef(null);

  // Enable smooth mouse wheel page scrolling over 3D canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const mainContent = document.querySelector(".app-main-content");
      if (mainContent) {
        mainContent.scrollBy({ top: e.deltaY * 1.5, behavior: "auto" });
      }
      window.scrollBy({ top: e.deltaY * 1.5, behavior: "auto" });
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const targetHomes = Array.isArray(homes) && homes.length > 0
    ? homes
    : [{ id: "single-home", name: "Akıllı Konut", address: "İstanbul", usedKwh: 240, quotaKwh: 300, tariffState: "NORMAL", appliances }];

  const homesCount = targetHomes.length;
  const SPACING = 16;

  const selectedIndex = useMemo(() => {
    if (!activeHomeId) return 0;
    const idx = targetHomes.findIndex((h) => h.id === activeHomeId);
    return idx !== -1 ? idx : 0;
  }, [activeHomeId, targetHomes]);

  const targetX = (selectedIndex - (homesCount - 1) / 2) * SPACING;

  return (
    <div className="house3d-canvas" ref={containerRef}>
      <Canvas
        shadows
        camera={{ position: [targetX, 16.0, 32.0], fov: 38 }}
        gl={{ antialias: true, alpha: true, outputColorSpace: THREE.SRGBColorSpace }}
      >
        <Suspense fallback={null}>
          <ambientLight color="#ffffff" intensity={1.9} />
          <hemisphereLight skyColor="#38bdf8" groundColor="#0f172a" intensity={1.3} />
          <directionalLight position={[25, 40, 20]} color="#fffbeb" intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-20, 25, -15]} color="#93c5fd" intensity={1.4} />

          <FloatingDioramaIsland count={homesCount} />

          {targetHomes.map((home, index) => {
            const xPos = (index - (homesCount - 1) / 2) * SPACING;
            const isSelected = activeHomeId === home.id || (activeHomeId === null && selectedIndex === index);

            return (
              <GLTFErrorBoundary
                key={home.id || index}
                fallback={
                  <ProceduralHouseInstance
                    position={[xPos, 0, -0.2]}
                    home={home}
                    isSelected={isSelected}
                    onSelect={onSelectHome}
                  />
                }
              >
                <ModernVillaInstance
                  position={[xPos, 0, -0.2]}
                  home={home}
                  isSelected={isSelected}
                  onSelect={onSelectHome}
                />
              </GLTFErrorBoundary>
            );
          })}

          <ContactShadows position={[0, -0.41, 0]} opacity={0.4} scale={SPACING * homesCount} blur={2.5} far={8} />
          <FreeSpaceOrbitController targetX={targetX} />
        </Suspense>
      </Canvas>
    </div>
  );
}
