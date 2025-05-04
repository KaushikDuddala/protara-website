"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Edges } from "@react-three/drei"
import * as THREE from "three"
import { HEX_SEGMENTS, type HexPart } from "@/lib/hex-core"

type ObjectAssemblyProps = {
  parts: HexPart[]
  /** 0..1 scrubbed progress across the pinned chapter */
  progress: number
}

// timeline windows from PLAN.md §7 - parts hover unlit, then assemble into the
// stack one at a time, lock, and finally spin a quarter turn
const ASSEMBLE_START = 0.1
const ASSEMBLE_END = 0.62
const ROTATE_START = 0.68

/** ease-out cubic used for per-plate driveTo */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/** frame-rate independent damping toward a target */
function damp(delta: number, speed = 6) {
  return 1 - Math.exp(-speed * delta)
}

function Plate({
  part,
  index,
  total,
  progress,
}: {
  part: HexPart
  index: number
  total: number
  progress: number
}) {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const isSpine = part.kind === "spine"

  useFrame((_, delta) => {
    const g = group.current
    const m = material.current
    if (!g || !m) return

    // each part starts its drive when the one below it has landed
    const seg = THREE.MathUtils.clamp((progress - ASSEMBLE_START) / (ASSEMBLE_END - ASSEMBLE_START), 0, 1)
    const local = THREE.MathUtils.clamp(seg * total - index, 0, 1)
    const eased = easeOutCubic(local)

    if (isSpine) {
      // spine never slides - it fades in as the plates pile up
      m.opacity = THREE.MathUtils.lerp(m.opacity, 0.02 + eased * 0.98, damp(delta, 10))
      return
    }

    g.position.y = THREE.MathUtils.lerp(g.position.y, part.targetY * eased, damp(delta))
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, part.rotationY * local, damp(delta))

    // molten accent resolves only once the final plate locks in
    const accent = part.emissive ? eased : 0
    m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, accent * 1.6, damp(delta, 6))
  })

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={
            isSpine
              ? [part.radius, part.radius, part.height, 16]
              : [part.radius, part.radius * 0.9, part.height, HEX_SEGMENTS]
          }
        />
        <meshStandardMaterial
          ref={material}
          color={part.color}
          emissive={part.emissive ?? "#000000"}
          emissiveIntensity={0}
          roughness={isSpine ? 0.9 : 0.55}
          metalness={isSpine ? 0 : 0.15}
          transparent={isSpine}
        />
      </mesh>
      {part.emissive ? <Edges color="#ff6b2c" /> : null}
    </group>
  )
}

/**
 * THE signature scene - the parametric hex-fidget core assembling from raw
 * primitives as scroll progress advances. Plates drive-to their stack slot in
 * sequence, the final plate glows molten, and the whole group turns a slow 45°
 * once locked while the camera dollies in.
 */
export default function ObjectAssembly({ parts, progress }: ObjectAssemblyProps) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    const spin = THREE.MathUtils.clamp((progress - ROTATE_START) / (1 - ROTATE_START), 0, 1)
    const target = spin * THREE.MathUtils.degToRad(45)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, target, damp(0.016, 4))
  })

  return (
    <group ref={group}>
      {/* lights come up with the assembly so the silhouettes start unlit */}
      <ambientLight intensity={0.35 + progress * 0.5} />
      <directionalLight position={[5, 8, 4]} intensity={0.8 + progress * 1.4} color="#fff2e8" />
      <directionalLight position={[-5, -2, -6]} intensity={0.35 + progress * 0.4} color="#2a6bff" />
      {parts.map((part, i) => (
        <Plate key={part.id} part={part} index={i} total={parts.length} progress={progress} />
      ))}
    </group>
  )
}