import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useCallback, useRef } from "react";
import * as THREE from "three";
import { MATERIAL_TO_DEVICE, PARENT_NODE_TO_DEVICE } from "./meshDeviceMap";
import { DancingDino } from "./DancingDino";

// Preload 3D floor model
useGLTF.preload("/models/low_poly.glb");

function findDeviceId(object) {
  let current = object;
  while (current) {
    if (current.userData?.deviceId) return current.userData.deviceId;
    current = current.parent;
  }
  return null;
}

function collectDeviceMeshes(root, deviceId) {
  const meshes = [];
  root.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.deviceId === deviceId) {
      meshes.push(child);
    }
  });
  return meshes;
}

const DEVICE_COLORS = {
  refrigerator: "#38bdf8",
  computer: "#818cf8",
  television: "#c084fc",
  oven: "#fb923c",
  lights: "#fbbf24",
};

export function InteriorModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.045,
  onMeshClick,
  activeDeviceId,
  hoveredDeviceId,
  onHoverChange,
  deviceStates = {},
}) {
  const { scene } = useGLTF("/models/low_poly.glb");
  const outlineMeshesRef = useRef([]);
  const groupRef = useRef(null);

  // Tag every mesh with its deviceId
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const matName = child.material?.name;
        if (matName && MATERIAL_TO_DEVICE[matName]) {
          child.userData.deviceId = MATERIAL_TO_DEVICE[matName];
          return;
        }

        let parent = child.parent;
        while (parent) {
          if (parent.name && PARENT_NODE_TO_DEVICE[parent.name]) {
            child.userData.deviceId = PARENT_NODE_TO_DEVICE[parent.name];
            return;
          }
          parent = parent.parent;
        }
      }
    });
  }, [scene]);

  const { center, min } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const c = new THREE.Vector3();
    box.getCenter(c);
    return { center: c, min: box.min };
  }, [scene]);

  const activeLightInfo = useMemo(() => {
    if (!activeDeviceId) return null;
    if (deviceStates[activeDeviceId] && deviceStates[activeDeviceId].status !== "online") return null;
    const color = DEVICE_COLORS[activeDeviceId] || "#ffffff";
    const meshes = collectDeviceMeshes(scene, activeDeviceId);
    if (meshes.length === 0) return null;

    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    const centerVec = new THREE.Vector3();
    box.getCenter(centerVec);

    return {
      position: [centerVec.x - center.x, centerVec.y - min.y + 0.8, centerVec.z - center.z],
      color,
    };
  }, [scene, activeDeviceId, center, min, deviceStates]);

  useEffect(() => {
    outlineMeshesRef.current.forEach((m) => {
      m.parent?.remove(m);
      m.geometry.dispose();
    });
    outlineMeshesRef.current = [];

    const devicesToHighlight = new Set();
    if (activeDeviceId) devicesToHighlight.add(activeDeviceId);
    if (hoveredDeviceId) devicesToHighlight.add(hoveredDeviceId);

    devicesToHighlight.forEach((deviceId) => {
      const isOnline = !deviceStates[deviceId] || deviceStates[deviceId].status === "online";
      if (!isOnline) return;

      const meshes = collectDeviceMeshes(scene, deviceId);
      const isActive = deviceId === activeDeviceId;
      const deviceColor = DEVICE_COLORS[deviceId] || "#38bdf8";

      const customOutlineMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(deviceColor),
        side: THREE.BackSide,
        transparent: true,
        opacity: isActive ? 0.75 : 0.45,
        depthWrite: false,
      });

      meshes.forEach((mesh) => {
        const outlineMesh = new THREE.Mesh(mesh.geometry.clone(), customOutlineMat);
        outlineMesh.position.copy(mesh.position);
        outlineMesh.rotation.copy(mesh.rotation);
        outlineMesh.quaternion.copy(mesh.quaternion);
        outlineMesh.scale.copy(mesh.scale).multiplyScalar(1.04);
        outlineMesh.renderOrder = -1;
        outlineMesh.userData._isOutline = true;

        if (mesh.material && "emissive" in mesh.material) {
          const meshMat = mesh.material;
          if (!mesh.userData._origEmissive) {
            mesh.userData._origEmissive = meshMat.emissive.clone();
            mesh.userData._origEmissiveIntensity = meshMat.emissiveIntensity;
          }
          meshMat.emissive.set(deviceColor);
          meshMat.emissiveIntensity = isActive ? 0.4 : 0.2;
        }

        mesh.parent?.add(outlineMesh);
        outlineMeshesRef.current.push(outlineMesh);
      });
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData.deviceId) {
        const id = child.userData.deviceId;
        const isHighlighted = devicesToHighlight.has(id);
        const isOnline = !deviceStates[id] || deviceStates[id].status === "online";

        if ((!isHighlighted || !isOnline) && child.userData._origEmissive) {
          const mat = child.material;
          mat.emissive.copy(child.userData._origEmissive);
          mat.emissiveIntensity = child.userData._origEmissiveIntensity;
          delete child.userData._origEmissive;
          delete child.userData._origEmissiveIntensity;
        }
      }
    });

    return () => {
      outlineMeshesRef.current.forEach((m) => {
        m.parent?.remove(m);
        m.geometry.dispose();
      });
      outlineMeshesRef.current = [];
    };
  }, [scene, activeDeviceId, hoveredDeviceId, deviceStates]);

  const handlePointerOver = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.object?.userData?._isOutline) return;
      const deviceId = findDeviceId(e.object);
      if (deviceId) {
        document.body.style.cursor = "pointer";
        onHoverChange?.(deviceId);
      }
    },
    [onHoverChange]
  );

  const handlePointerOut = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.object?.userData?._isOutline) return;
      document.body.style.cursor = "auto";
      onHoverChange?.(null);
    },
    [onHoverChange]
  );

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.object?.userData?._isOutline) return;
      const deviceId = findDeviceId(e.object);
      if (deviceId) {
        onMeshClick?.(deviceId);
      }
    },
    [onMeshClick]
  );

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive
        object={scene}
        position={[-center.x, -min.y, -center.z]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      {activeLightInfo && (
        <pointLight
          position={activeLightInfo.position}
          color={activeLightInfo.color}
          intensity={8}
          distance={4}
          decay={1.6}
        />
      )}
      <spotLight
        position={[25, 10, -34]}
        intensity={2.5}
        distance={8}
        angle={Math.PI / 6}
        penumbra={0.8}
        castShadow
      />
      {deviceStates["lights"]?.status === "online" && (
        <spotLight
          position={[-108.93, 36.5, -90.38]}
          intensity={4}
          distance={30}
          angle={Math.PI / 3.5}
          penumbra={0.8}
          color="#fbbf24"
          castShadow
        />
      )}
      <DancingDino />
    </group>
  );
}
