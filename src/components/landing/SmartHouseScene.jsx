import { Suspense, useRef, useState, useMemo, useEffect, Component } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Sky } from "@react-three/drei";
import * as THREE from "three";

// Preload GLB assets
useGLTF.preload("/models/city.glb");

/* ─── Error Boundary ─── */
class GLTFErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("GLTF Load fallback triggered:", error?.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ─── Persistent Dark Moody Atmosphere Controller (Renkler Asla Değişmez) ─── */
function AtmosphericController({ lightningFlash }) {
  const { scene } = useThree();

  const ambientRef = useRef();
  const dirLightRef = useRef();
  const fillLightRef = useRef();
  const hemiLightRef = useRef();

  useFrame((_, delta) => {
    // Persistent Rainy Dark Atmosphere Intensity & Color (Renkler HİÇBİR ZAMAN Değişmez)
    const targetAmbientInt = lightningFlash ? 3.4 : 0.65;
    const targetDirInt = lightningFlash ? 2.5 : 0.8;
    const targetHemiInt = lightningFlash ? 2.0 : 0.7;

    const targetAmbientCol = new THREE.Color(lightningFlash ? "#ffe066" : "#52627a");
    const persistentFogCol = new THREE.Color("#080c14");

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.damp(ambientRef.current.intensity, targetAmbientInt, 0.4, delta);
      ambientRef.current.color.lerp(targetAmbientCol, delta * 0.4);
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = THREE.MathUtils.damp(dirLightRef.current.intensity, targetDirInt, 0.4, delta);
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = THREE.MathUtils.damp(hemiLightRef.current.intensity, targetHemiInt, 0.4, delta);
    }
    if (scene.fog) {
      scene.fog.color.lerp(persistentFogCol, delta * 0.4);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.65} color="#52627a" />
      <hemisphereLight ref={hemiLightRef} skyColor="#7c9eff" groundColor="#1e293b" intensity={0.7} />
      <directionalLight ref={dirLightRef} position={[30, 45, 30]} intensity={0.8} color="#94a3b8" castShadow />
      <directionalLight ref={fillLightRef} position={[-30, 40, -60]} intensity={0.5} color="#475569" />
    </>
  );
}

/* ─── Smart Home Energy Pulse & Grid Nodes ─── */
function SmartHomeEnergyPulses({ count = 18 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const nodes = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 55,
      y: 1.5 + Math.random() * 8.0,
      z: (Math.random() - 0.5) * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 1.5 + Math.random() * 2.5,
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    nodes.forEach((node, i) => {
      const pulse = Math.sin(t * node.speed + node.phase);
      const scale = Math.max(0.2, 0.5 + pulse * 0.4);

      dummy.position.set(node.x, node.y, node.z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.3, 12, 12]} />
      <meshBasicMaterial color="#ffc93c" transparent opacity={0.85} />
    </instancedMesh>
  );
}

/* ─── Heavy Intense Downpour Rain Particle System (Şiddetli Yağmur - 900 Damla) ─── */
function HeavyRainParticles({ count = 900, isRaining }) {
  const mesh = useRef();
  const materialRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const raindrops = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: Math.random() * 70,
      z: (Math.random() - 0.5) * 260,
      speed: 0.85 + Math.random() * 0.6,
      length: 0.6 + Math.random() * 0.7,
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current || !materialRef.current) return;

    const targetOpacity = isRaining ? 0.92 : 0;
    materialRef.current.opacity = THREE.MathUtils.damp(
      materialRef.current.opacity,
      targetOpacity,
      0.6,
      delta
    );

    if (materialRef.current.opacity < 0.01) return;

    raindrops.forEach((drop, i) => {
      drop.y -= drop.speed * (delta * 60);
      if (drop.y < -0.5) {
        drop.y = 65 + Math.random() * 2;
        drop.x = (Math.random() - 0.5) * 200;
        drop.z = (Math.random() - 0.5) * 260;
      }
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.scale.set(0.04, drop.length, 0.04);
      dummy.rotation.x = 0.15;
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <cylinderGeometry args={[0.5, 0.5, 1, 4]} />
      <meshBasicMaterial ref={materialRef} color="#b4d4ff" transparent opacity={0} />
    </instancedMesh>
  );
}

/* ─── Single City Column Component ─── */
function CityColumn({ clones, sizeZ, xPos, speed = 1.4 }) {
  const ref0 = useRef();
  const ref1 = useRef();
  const ref2 = useRef();

  const refs = [ref0, ref1, ref2];
  const totalLength = sizeZ * 3;

  useFrame((_, delta) => {
    refs.forEach((r) => {
      if (r.current) {
        r.current.position.z += speed * delta;
        if (r.current.position.z > sizeZ) {
          r.current.position.z -= totalLength;
        }
      }
    });
  });

  return (
    <group position={[xPos, 0, 0]}>
      {clones.map((cloneObj, idx) => (
        <group key={idx} ref={refs[idx]} position={[0, 0, -idx * sizeZ]}>
          <primitive object={cloneObj} />
        </group>
      ))}
    </group>
  );
}

/* ─── Fast Loading Optimized City Matrix ─── */
function OptimizedCityGridGLB({ speed = 1.4 }) {
  const { scene } = useGLTF("/models/city.glb");

  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const szZ = box.max.z - box.min.z;
    const szX = box.max.x - box.min.x;
    return {
      sizeZ: szZ > 10 ? szZ : 45,
      sizeX: szX > 10 ? szX : 36,
    };
  }, [scene]);

  const columns = useMemo(() => {
    const processMaterial = (clonedScene) => {
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.metalness = 0.1;
            child.material.roughness = 0.45;
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }
            child.material.needsUpdate = true;
          }
        }
      });
      return clonedScene;
    };

    const cols = [];
    for (let c = -1; c <= 1; c++) {
      const colClones = [];
      for (let r = 0; r < 3; r++) {
        colClones.push(processMaterial(scene.clone()));
      }
      cols.push({ colIndex: c, clones: colClones });
    }
    return cols;
  }, [scene]);

  return (
    <group position={[0, -1.8, -5]} scale={1.2}>
      {columns.map((cObj, i) => (
        <CityColumn
          key={i}
          clones={cObj.clones}
          sizeZ={bounds.sizeZ}
          xPos={cObj.colIndex * bounds.sizeX * 0.94}
          speed={speed}
        />
      ))}
    </group>
  );
}

/* ─── Procedural Neighborhood Fallback ─── */
function ProceduralNeighborhoodLoop({ speed = 2.0 }) {
  const group = useRef();
  const SEGMENT_SIZE = 16;

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.position.z += speed * delta;
    if (group.current.position.z >= SEGMENT_SIZE) {
      group.current.position.z -= SEGMENT_SIZE;
    }
  });

  return (
    <group ref={group}>
      {[-1, 0, 1, 2, 3].map((idx) => (
        <group key={idx} position={[0, -0.5, -idx * SEGMENT_SIZE]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[12.2, SEGMENT_SIZE]} />
            <meshStandardMaterial color="#1a202c" roughness={0.8} />
          </mesh>
          <group position={[-5.8, 0.8, -2]}>
            <mesh>
              <boxGeometry args={[3.2, 1.6, 3.8]} />
              <meshStandardMaterial color="#475569" roughness={0.5} />
            </mesh>
          </group>
          <group position={[5.8, 0.8, 2]}>
            <mesh>
              <boxGeometry args={[3.4, 1.8, 4.0]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ─── Camera Controller ─── */
function CameraController({ isHovered }) {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 0.8,
        y: -(e.clientY / window.innerHeight - 0.5) * 0.4,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const cruiseX = Math.sin(time * 0.08) * 1.6;
    const cruiseY = Math.cos(time * 0.06) * 0.5;

    const targetZ = isHovered ? 44.0 : 54.0;
    const targetY = 32.0 + cruiseY + mousePos.current.y * 1.8;
    const targetX = 8.0 + cruiseX + mousePos.current.x * 2.2;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.0, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.0, delta);

    camera.lookAt(0, 1.0, -22);
  });

  return null;
}

export default function SmartHouseScene({ isHovered, onHoverChange, onLightningStrike }) {
  const [isRaining, setIsRaining] = useState(false);
  const [lightningFlash, setLightningFlash] = useState(false);

  /*
   * Sıralama (İstediğiniz Gibi):
   * 1. Renkler HİÇBİR ZAMAN değişmez (Sabit Koyu Kasvetli Şık Gece Atmosferi).
   * 2. Yağmur başladığında (0.8sn), ŞİMDİ ŞİMŞEK YAĞMUR VARKEN ÇAKAR (3.2sn'de yağmurun tam ortasında)!
   * 3. Yağmur 7.5sn sürer, sonra 10sn durur (ara verir).
   */
  useEffect(() => {
    const startRainCycle = () => {
      // 1. Yağmur başlasın
      setIsRaining(true);

      // 2. Yağmur VARKEN Şimşek Çakar! (Yağmurun ortasında 3.2sn'de)
      const flashTimer = setTimeout(() => {
        setLightningFlash(true);
        onLightningStrike?.();
      }, 3200);

      const flashOff = setTimeout(() => {
        setLightningFlash(false);
      }, 3550);

      // 3. Yağmur diner (7.5sn sonra)
      const clearRainTimer = setTimeout(() => {
        setIsRaining(false);
      }, 7500);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(flashOff);
        clearTimeout(clearRainTimer);
      };
    };

    const initialTimer = setTimeout(() => {
      startRainCycle();
    }, 800);

    // Her 18 saniyede bir tekrarlar (7.5sn yağmur + 10.5sn yağmursuz duraklama)
    const repeatInterval = setInterval(() => {
      startRainCycle();
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(repeatInterval);
    };
  }, [onLightningStrike]);

  return (
    <div
      className="smart-house-canvas-container"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <Canvas
        camera={{ position: [8.0, 32.0, 54.0], fov: 42 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <color attach="background" args={["#080c14"]} />
        <fog attach="fog" args={["#080c14", 160, 500]} />

        {/* Persistent Stormy Sky */}
        <Sky
          distance={450000}
          sunPosition={[0, -25, -100]}
          turbidity={14}
          rayleigh={0.1}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />

        {/* Persistent Dark Atmospheric Lighting (Renkler Sabit) */}
        <AtmosphericController
          lightningFlash={lightningFlash}
        />

        {/* Dynamic Warm Golden Lightning Pulse */}
        {lightningFlash && (
          <pointLight
            position={[0, 22, -10]}
            intensity={18.0}
            color="#ffd32a"
            distance={140}
          />
        )}

        <Suspense fallback={<ProceduralNeighborhoodLoop />}>
          <GLTFErrorBoundary fallback={<ProceduralNeighborhoodLoop />}>
            <OptimizedCityGridGLB />
            <SmartHomeEnergyPulses count={18} />
          </GLTFErrorBoundary>

          <HeavyRainParticles count={900} isRaining={isRaining} />
          <CameraController isHovered={isHovered} />
        </Suspense>
      </Canvas>
    </div>
  );
}
