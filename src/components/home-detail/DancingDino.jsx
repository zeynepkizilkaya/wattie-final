import { useEffect, useRef, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export function DancingDino() {
  const group = useRef(null);

  const { scene, animations } = useGLTF("/models/dancing-dino.glb");
  const { actions } = useAnimations(animations, group);

  // Clone with SkeletonUtils to preserve bone bindings for rigged meshes
  const centeredScene = useMemo(() => {
    if (!scene) return null;
    const cloned = clone(scene);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Shift root so geometry is centered horizontally and stands on Y=0
    cloned.position.set(-center.x, -box.min.y, -center.z);
    return cloned;
  }, [scene]);

  // Enable shadows and disable frustum culling for all child meshes
  useEffect(() => {
    if (!centeredScene) return;
    centeredScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
      }
    });
  }, [centeredScene]);

  // Auto-play the dance animation on loop
  useEffect(() => {
    if (!actions) return;
    const firstAction = Object.values(actions)[0];
    if (firstAction) {
      firstAction.reset().fadeIn(0.5).play();
    }
    return () => {
      if (firstAction) firstAction.fadeOut(0.5);
    };
  }, [actions]);

  if (!centeredScene) return null;

  return (
    <group
      ref={group}
      position={[25, 3.45, -34]}
      rotation={[0, 0, 0]}
      scale={[27.0, 27.0, 27.0]}
      dispose={null}
    >
      <primitive object={centeredScene} />
    </group>
  );
}

useGLTF.preload("/models/dancing-dino.glb");
