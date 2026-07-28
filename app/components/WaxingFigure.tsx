"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface WaxingFigureProps {
  highlightedZones: string[];
  /** Path to your sourced .glb, e.g. "/models/mannequin.glb" (put it in /public/models) */
  modelUrl?: string;
}

type ZoneKey = "face" | "neck" | "torso" | "back" | "underarms" | "arms" | "bikini" | "legs";

/**
 * Normalized height bands (0 = soles of the feet, 1 = crown of the head),
 * MEASURED DIRECTLY from mannequin.glb's vertex geometry.
 */
const ZONE_BANDS: Record<
  ZoneKey,
  { min: number; max: number; lateral?: number; zDir?: number }
> = {
  legs: { min: 0.0, max: 0.46 },
  bikini: { min: 0.46, max: 0.52, zDir: 1 },
  torso: { min: 0.52, max: 0.835, lateral: 0.132, zDir: 1 },
  back: { min: 0.52, max: 0.835, lateral: 0.132, zDir: -1 },
  underarms: { min: 0.68, max: 0.76, lateral: 0.132 },
  arms: { min: 0.5, max: 0.76, lateral: 0.132 },
  neck: { min: 0.835, max: 0.865 },
  face: { min: 0.865, max: 1.0 },
};

const ZONE_ORDER: ZoneKey[] = ["legs", "bikini", "torso", "back", "underarms", "arms", "neck", "face"];
const MAX_ZONES = ZONE_ORDER.length;

/**
 * Computes the TRUE bounding box of a SkinnedMesh by applying bone transforms.
 * Box3.setFromObject ignores skinning, which causes massive boundary errors.
 */
function computeSkinnedBounds(scene: THREE.Object3D) {
  const box = new THREE.Box3();
  const vec = new THREE.Vector3();

  // Ensure world matrices are up to date
  scene.updateMatrixWorld(true);

  scene.traverse((obj) => {
    if (obj instanceof THREE.SkinnedMesh && obj.skeleton) {
      obj.skeleton.update();
      const position = obj.geometry.attributes.position;
      const skinIndex = obj.geometry.attributes.skinIndex;
      const skinWeight = obj.geometry.attributes.skinWeight;
      
      if (!skinIndex || !skinWeight || obj.skeleton.bones.length === 0) {
        // Fallback for non-skinned or broken skin
        for (let i = 0; i < position.count; i++) {
          vec.fromBufferAttribute(position, i);
          vec.applyMatrix4(obj.matrixWorld);
          box.expandByPoint(vec);
        }
        return;
      }

      const boneMatrix = new THREE.Matrix4();
      
      for (let i = 0; i < position.count; i++) {
        vec.fromBufferAttribute(position, i);
        vec.applyMatrix4(obj.bindMatrix);
        
        let x = 0, y = 0, z = 0;
        for (let j = 0; j < 4; j++) {
          const weight = skinWeight.getComponent(i, j);
          if (weight === 0) continue;
          const boneIdx = skinIndex.getComponent(i, j);
          const bone = obj.skeleton.bones[boneIdx];
          const boneInv = obj.skeleton.boneInverses[boneIdx];
          
          if (bone && boneInv) {
            boneMatrix.multiplyMatrices(bone.matrixWorld, boneInv);
            const vertex = vec.clone().applyMatrix4(boneMatrix);
            x += vertex.x * weight;
            y += vertex.y * weight;
            z += vertex.z * weight;
          }
        }
        
        vec.set(x, y, z);
        box.expandByPoint(vec);
      }
    } else if (obj instanceof THREE.Mesh) {
      const position = obj.geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        vec.fromBufferAttribute(position, i);
        vec.applyMatrix4(obj.matrixWorld);
        box.expandByPoint(vec);
      }
    }
  });

  if (box.isEmpty()) {
    box.setFromObject(scene);
  }
  return box;
}

/* ------------------------------------------------------------------ */
/*  Zone-aware material                                                */
/* ------------------------------------------------------------------ */

function useZoneMaterial(baseColor: string, highlightColor: string) {
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.55,
      metalness: 0.06,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uZoneMin = { value: new Float32Array(MAX_ZONES) };
      shader.uniforms.uZoneMax = { value: new Float32Array(MAX_ZONES) };
      shader.uniforms.uZoneLateral = { value: new Float32Array(MAX_ZONES) };
      shader.uniforms.uZoneZDir = { value: new Float32Array(MAX_ZONES) };
      shader.uniforms.uZoneActive = { value: new Float32Array(MAX_ZONES) };
      
      shader.uniforms.uMinY = { value: 0 };
      shader.uniforms.uMaxY = { value: 1 };
      shader.uniforms.uCenterX = { value: 0 };
      shader.uniforms.uCenterZ = { value: 0 };
      
      shader.uniforms.uHighlight = { value: new THREE.Color(highlightColor) };
      shader.uniforms.uDim = { value: 0 }; // 1 when any zone is active, to gray out the rest

      // We need the ACTUAL world position after skinning is applied
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vWorldPos;`
      );
      
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>\nvWorldPos = worldPosition.xyz;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWorldPos;
        uniform float uZoneMin[${MAX_ZONES}];
        uniform float uZoneMax[${MAX_ZONES}];
        uniform float uZoneLateral[${MAX_ZONES}];
        uniform float uZoneZDir[${MAX_ZONES}];
        uniform float uZoneActive[${MAX_ZONES}];
        
        uniform float uMinY;
        uniform float uMaxY;
        uniform float uCenterX;
        uniform float uCenterZ;
        
        uniform vec3 uHighlight;
        uniform float uDim;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
        {
          float height = max(uMaxY - uMinY, 0.0001);
          float t = clamp((vWorldPos.y - uMinY) / height, 0.0, 1.0);
          float nx = abs(vWorldPos.x - uCenterX) / height;
          float nz = (vWorldPos.z - uCenterZ) / height;
          
          float mixAmt = 0.0;
          for (int i = 0; i < ${MAX_ZONES}; i++) {
            float inBand = step(uZoneMin[i], t) * step(t, uZoneMax[i]);
            
            // X-axis (lateral) separation for arms vs torso
            float lateralOk = 1.0;
            float lat = uZoneLateral[i];
            if (lat > 0.0) {
              // "outside cutoff" zones: arms, underarms
              lateralOk = step(lat, nx);
            } else if (lat < 0.0) {
              // "inside cutoff" zones: torso, back (stored as negative)
              lateralOk = step(nx, -lat);
            }
            
            // Z-axis separation for front (torso, bikini) vs back
            float zOk = 1.0;
            float zDir = uZoneZDir[i];
            if (zDir > 0.0) {
              zOk = step(0.0, nz); // Front (Z >= centerZ)
            } else if (zDir < 0.0) {
              zOk = step(nz, 0.0); // Back (Z <= centerZ)
            }
            
            mixAmt = max(mixAmt, inBand * lateralOk * zOk * uZoneActive[i]);
          }
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uHighlight, mixAmt * 0.88);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.85, uDim * (1.0 - mixAmt));
        }
        #include <dithering_fragment>
        `
      );

      mat.userData.shader = shader;
    };

    mat.customProgramCacheKey = () => "zone-material-v4-perfected";
    return mat;
  }, [baseColor, highlightColor]);

  return material;
}

/* ------------------------------------------------------------------ */
/*  Mannequin: loads the glb, applies the zone material, owns bounds   */
/* ------------------------------------------------------------------ */

function Mannequin({
  highlightedZones,
  modelUrl,
  onBoundsReady,
}: {
  highlightedZones: string[];
  modelUrl: string;
  onBoundsReady: (b: { minY: number; maxY: number; centerX: number; centerZ: number }) => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const material = useZoneMaterial("#FAF8F3", "#C1421A");
  const boundsRef = useRef({ minY: 0, maxY: 1, centerX: 0, centerZ: 0 });

  useEffect(() => {
    // 1. Get the TRUE bounds after skinning is applied
    const box = computeSkinnedBounds(cloned);
    const b = { 
      minY: box.min.y, 
      maxY: box.max.y, 
      centerX: (box.min.x + box.max.x) / 2,
      centerZ: (box.min.z + box.max.z) / 2
    };
    boundsRef.current = b;
    onBoundsReady(b);

    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = material;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    
    // CRITICAL FIX: Do NOT shift cloned.position here!
    // Shifting it breaks the world bounds we just calculated.
    // The camera rig will automatically frame the mesh correctly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned, material]);

  // 3. Update uniforms with the true bounds
  useEffect(() => {
    const shader = material.userData.shader;
    if (!shader) return;
    const b = boundsRef.current;
    
    shader.uniforms.uMinY.value = b.minY; 
    shader.uniforms.uMaxY.value = b.maxY;
    shader.uniforms.uCenterX.value = b.centerX;
    shader.uniforms.uCenterZ.value = b.centerZ;
    
    shader.uniforms.uDim.value = highlightedZones.length > 0 ? 1 : 0;

    ZONE_ORDER.forEach((zone, i) => {
      const band = ZONE_BANDS[zone];
      const active = highlightedZones.includes(zone) ? 1 : 0;
      
      const isInsideCutoffZone = zone === "torso" || zone === "back";
      const lateralValue = band.lateral
        ? isInsideCutoffZone
          ? -band.lateral
          : band.lateral
        : 0;
        
      // CRITICAL FIX: band.min and band.max are ALREADY normalized (0..1)
      // Do NOT multiply them by height, or they will exceed 1.0!
      shader.uniforms.uZoneMin.value[i] = band.min;
      shader.uniforms.uZoneMax.value[i] = band.max;
      shader.uniforms.uZoneLateral.value[i] = lateralValue;
      shader.uniforms.uZoneZDir.value[i] = band.zDir || 0;
      shader.uniforms.uZoneActive.value[i] = active;
    });
  }, [highlightedZones, material]);

  return <primitive object={cloned} />;
}

/* ------------------------------------------------------------------ */
/*  Camera rig: dollies + pans toward the selected zone's height band  */
/* ------------------------------------------------------------------ */

function CameraRig({
  highlightedZones,
  bounds,
  controlsRef,
}: {
  highlightedZones: string[];
  bounds: { minY: number; maxY: number; centerX: number; centerZ: number } | null;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const baseDistance = 6;

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !bounds) return;

    const height = bounds.maxY - bounds.minY;

    // Default target is the center of the mesh
    let targetY = bounds.minY + height * 0.5;
    let distance = baseDistance;

    if (highlightedZones.length > 0) {
      const bands = highlightedZones.map((z) => ZONE_BANDS[z as ZoneKey]).filter(Boolean);
      if (bands.length > 0) {
        const min = Math.min(...bands.map((b) => b.min));
        const max = Math.max(...bands.map((b) => b.max));
        targetY = bounds.minY + ((min + max) / 2) * height;
        const span = Math.max(max - min, 0.08);
        distance = THREE.MathUtils.clamp(baseDistance * (span * 2.2), 1.6, baseDistance);
      }
    }

    controls.target.y += (targetY - controls.target.y) * 0.08;
    controls.target.x += (bounds.centerX - controls.target.x) * 0.08;
    controls.target.z += (bounds.centerZ - controls.target.z) * 0.08;

    const offset = camera.position.clone().sub(controls.target);
    const currentDistance = offset.length();
    const nextDistance = currentDistance + (distance - currentDistance) * 0.08;
    offset.setLength(nextDistance);
    camera.position.copy(controls.target.clone().add(offset));

    controls.update();
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export function WaxingFigure({ highlightedZones, modelUrl = "/models/mannequin.glb" }: WaxingFigureProps) {
  const controlsRef = useRef<any>(null);
  const [bounds, setBounds] = useState<{ minY: number; maxY: number; centerX: number; centerZ: number } | null>(null);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing rounded-[10px] overflow-hidden bg-gradient-to-b from-[#3A3729] to-[#232116] border border-[var(--color-stone)] shadow-inner">
      <Canvas shadows camera={{ position: [0, 1.4, 6], fov: 38 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 8, 5]} intensity={2} castShadow shadow-mapSize={2048} />
        <directionalLight position={[-4, 6, -3]} intensity={0.4} />
        <pointLight position={[0, 3, 4]} intensity={0.25} color="#FAF8F3" />

        <group position={[0, -1.4, 0]}>
          <Mannequin highlightedZones={highlightedZones} modelUrl={modelUrl} onBoundsReady={setBounds} />
        </group>

        {/* Soft shadow plane dynamically positioned at the bottom of the mesh */}
        {bounds && (
          <ContactShadows position={[bounds.centerX, bounds.minY - 1.4, bounds.centerZ]} opacity={0.45} scale={8} blur={2.6} far={5} color="#1a1812" />
        )}

        <CameraRig highlightedZones={highlightedZones} bounds={bounds} controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
          autoRotate={highlightedZones.length === 0}
          autoRotateSpeed={0.6}
        />
        <Environment preset="studio" />
      </Canvas>

      <div className="absolute bottom-[20px] left-0 right-0 text-center pointer-events-none">
        <span className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 text-[#FAF8F3] bg-black/20 backdrop-blur-md px-[15px] py-[6px] rounded-full">
          {highlightedZones.length > 0 ? "Selected area" : "Interactive 3D model"}
        </span>
      </div>
    </div>
  );
}

useGLTF.preload("/models/mannequin.glb");