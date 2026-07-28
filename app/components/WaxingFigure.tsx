"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface WaxingFigureProps {
  highlightedZones: string[];
  modelUrl?: string;
  xBias?: number;
  spotX?: string;
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
            if (uZoneActive[i] < 0.5) continue;

            // Zone center and radius in normalized height
            float zoneCenter = (uZoneMin[i] + uZoneMax[i]) * 0.5;
            float zoneRadius = (uZoneMax[i] - uZoneMin[i]) * 0.5;

            // Vertical distance from zone center
            float vertDist = abs(t - zoneCenter);

            // 2D circular distance (vertical + lateral)
            float dist = length(vec2(vertDist, nx * 0.3));

            // Smooth radial falloff: full at center, fading to 0
            float radial = 1.0 - smoothstep(zoneRadius * 0.2, zoneRadius * 3.0, dist);

            // Z-direction check (soft) for front vs back zones
            float zOk = 1.0;
            float zDir = uZoneZDir[i];
            if (zDir > 0.0) {
              zOk = smoothstep(-0.02, 0.04, nz);
            } else if (zDir < 0.0) {
              zOk = smoothstep(-0.02, 0.04, -nz);
            }

            // Lateral check (soft) for arms/underarms vs torso
            float lateralOk = 1.0;
            float lat = uZoneLateral[i];
            if (lat > 0.0) {
              lateralOk = smoothstep(lat * 0.5, lat * 1.5, nx);
            } else if (lat < 0.0) {
              lateralOk = smoothstep(-lat * 1.5, -lat * 0.5, -nx + (-lat));
            }

            mixAmt = max(mixAmt, radial * lateralOk * zOk);
          }
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uHighlight, mixAmt * 0.9);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.8, uDim * (1.0 - mixAmt));
        }
        #include <dithering_fragment>
        `
      );

      mat.userData.shader = shader;
    };

    mat.customProgramCacheKey = () => "zone-material-v5-radial";
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
  xBias = 0,
  config
}: {
  highlightedZones: string[];
  bounds: { minY: number; maxY: number; centerX: number; centerZ: number } | null;
  controlsRef: React.MutableRefObject<any>;
  xBias?: number;
  config: { distance: number; yOffset: number };
}) {
  const { camera } = useThree();

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !bounds) return;

    const height = bounds.maxY - bounds.minY;
    let targetY = bounds.minY + height * 0.5;
    let isBack = false;

    if (highlightedZones.length > 0) {
      const activeZones = highlightedZones.filter(z => ZONE_ORDER.includes(z as ZoneKey)) as ZoneKey[];
      const bands = activeZones.map((z) => ZONE_BANDS[z]).filter(Boolean);
      if (bands.length > 0) {
        const min = Math.min(...bands.map((b) => b.min));
        const max = Math.max(...bands.map((b) => b.max));
        targetY = bounds.minY + ((min + max) / 2) * height;
      }
      if (highlightedZones.includes("back")) {
        isBack = true;
      }
    }

    targetY += config.yOffset;

    // Calculate camera right vector to shift the target properly, keeping model framed right
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    const right = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    const targetX = bounds.centerX + right.x * xBias;
    const targetZ = bounds.centerZ + right.z * xBias;

    // Smooth lerp to target position
    controls.target.y += (targetY - controls.target.y) * 0.08;
    controls.target.x += (targetX - controls.target.x) * 0.08;
    controls.target.z += (targetZ - controls.target.z) * 0.08;

    const offset = camera.position.clone().sub(controls.target);
    
    // Smooth rotate to back or front
    const isIdle = highlightedZones.length === 0;
    let currentAzimuth = Math.atan2(offset.x, offset.z);
    
    if (!isIdle) {
      const targetAzimuth = isBack ? Math.PI : 0;
      let diff = targetAzimuth - currentAzimuth;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      currentAzimuth += diff * 0.08;
    }

    // Smooth lerp distance (zoom)
    const currentDistance = offset.length();
    const nextDistance = currentDistance + (config.distance - currentDistance) * 0.08;
    const polar = Math.acos(THREE.MathUtils.clamp(offset.y / currentDistance, -1, 1));
    
    offset.x = nextDistance * Math.sin(polar) * Math.sin(currentAzimuth);
    offset.y = nextDistance * Math.cos(polar);
    offset.z = nextDistance * Math.sin(polar) * Math.cos(currentAzimuth);

    camera.position.copy(controls.target.clone().add(offset));
    controls.update();
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export function WaxingFigure({
  highlightedZones,
  modelUrl = "/models/mannequin.glb",
  xBias = 0,
}: WaxingFigureProps) {
  const controlsRef = useRef<any>(null);
  const [bounds, setBounds] = useState<{
    minY: number; maxY: number; centerX: number; centerZ: number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Dev GUI configuration for real-time tweaking
  const [config, setConfig] = useState({
    distance: 2.5, // lower distance = grown/larger character
    yOffset: 0,
    spotX: 75,
    spotY: 50,
    spotInner: 16,
    spotOuter: 42,
    baseSpotInner: 38,
    baseSpotOuter: 76,
  });

  const activeZones = useMemo(
    () => highlightedZones.filter(z => ZONE_ORDER.includes(z as ZoneKey)) as ZoneKey[],
    [highlightedZones]
  );

  const isIdle = highlightedZones.length === 0;
  
  const currentSpotY = isIdle ? 50 : config.spotY;
  const innerStop = isIdle ? `${config.baseSpotInner}%` : `${config.spotInner}%`;
  const outerStop = isIdle ? `${config.baseSpotOuter}%` : `${config.spotOuter}%`;
  const maskValue = `radial-gradient(circle at ${config.spotX}% ${currentSpotY}%, black 0%, black ${innerStop}, transparent ${outerStop})`;

  return (
    <div
      className="w-full h-full relative cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Dev Tweak Panel (Top Right) ── */}
      <div className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-md p-4 rounded-xl text-white text-[10px] flex flex-col gap-3 w-[220px] pointer-events-auto border border-white/5 shadow-2xl transition-opacity duration-300 opacity-20 hover:opacity-100">
        <h3 className="font-bold text-[11px] uppercase tracking-widest text-[#d4c5a9]">Cinematic Tweaks</h3>
        <div className="flex flex-col gap-2">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1">
              <div className="flex justify-between opacity-70">
                <span>{key}</span>
                <span>{value.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min={key === 'distance' ? 1 : key === 'yOffset' ? -2 : 0} 
                max={key === 'distance' ? 10 : key === 'yOffset' ? 2 : 100} 
                step={key === 'yOffset' ? 0.05 : key === 'distance' ? 0.1 : 1}
                value={value} 
                onChange={(e) => setConfig(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                className="w-full accent-[#C1421A] h-1 bg-white/20 rounded-full appearance-none outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Canvas wrapped in radial spotlight mask ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          WebkitMaskImage: maskValue,
          maskImage: maskValue,
        } as React.CSSProperties}
      >
        <Canvas shadows camera={{ position: [0, 1.4, 6], fov: 38 }} gl={{ alpha: true }}>
          {/* Warm cinematic lighting */}
          <ambientLight intensity={0.45} color="#f5ede0" />
          <directionalLight position={[4, 8, 5]} intensity={2.2} castShadow shadow-mapSize={2048} color="#fff8f0" />
          <directionalLight position={[-4, 4, -3]} intensity={0.35} color="#c9d6e3" />
          <pointLight position={[0, 4, -4]} intensity={1.2} color="#fff5e8" />
          <pointLight position={[0, -1, 3]} intensity={0.2} color="#ffd9b0" />

          {/* Model is kept at [0,0,0] world origin. Camera framing handles the xBias. */}
          <group position={[0, -1.4, 0]}>
            <Mannequin
              highlightedZones={highlightedZones}
              modelUrl={modelUrl}
              onBoundsReady={setBounds}
            />
          </group>

          {bounds && (
            <ContactShadows
              position={[bounds.centerX, bounds.minY - 1.4, bounds.centerZ]}
              opacity={0.4} scale={8} blur={3} far={5} color="#050302"
            />
          )}

          <CameraRig
            highlightedZones={highlightedZones}
            bounds={bounds}
            controlsRef={controlsRef}
            xBias={xBias}
            config={config}
          />

          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            autoRotate={false}
          />
          <Environment preset="studio" environmentIntensity={0.3} />
        </Canvas>
      </div>

      {/* ── Film-grain overlay — static SVG noise tile ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          mixBlendMode: 'overlay',
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* ── Zone hint label ── */}
      <div
        className={`absolute bottom-5 right-6 z-20 pointer-events-none transition-all duration-500 ${
          isHovered || !isIdle ? 'opacity-50 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#d4c5a9]">
          {isIdle ? 'Drag to rotate' : 'Zone highlighted'}
        </span>
      </div>
    </div>
  );
}

useGLTF.preload("/models/mannequin.glb");