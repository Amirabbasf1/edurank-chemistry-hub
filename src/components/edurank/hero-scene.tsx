import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type SceneProps = { quality: "low" | "high" };

function Molecule({ quality }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const nodes = useMemo(() => {
    const count = quality === "high" ? 14 : 7;
    const points: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).multiplyScalar(1.85));
    }
    return points;
  }, [quality]);

  const bonds = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i]!.distanceTo(nodes[j]!) < 2.1) pairs.push([nodes[i]!, nodes[j]!]);
      }
    }
    return pairs;
  }, [nodes]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.25,
      0.04,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * -0.15,
      0.04,
    );
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
  });

  const scale = Math.min(1, viewport.width / 7);

  return (
    <group ref={group} scale={scale}>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i % 3 === 0 ? 0.26 : 0.17, quality === "high" ? 32 : 16, quality === "high" ? 32 : 16]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#7dd3fc" : "#a5b4fc"}
            emissive={i % 3 === 0 ? "#0ea5e9" : "#4f46e5"}
            emissiveIntensity={0.45}
            roughness={0.25}
            metalness={0.35}
          />
        </mesh>
      ))}
      {bonds.map(([a, b], i) => {
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize(),
        );
        return (
          <mesh key={`b-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.022, 0.022, len, 8]} />
            <meshStandardMaterial color="#c7d2fe" transparent opacity={0.55} />
          </mesh>
        );
      })}
      <mesh>
        <icosahedronGeometry args={[2.55, 1]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ quality }: SceneProps) {
  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.8] : [1, 1.2]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
      frameloop="always"
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <pointLight position={[-5, -3, -4]} intensity={2} color="#22d3ee" />
      <Molecule quality={quality} />
    </Canvas>
  );
}