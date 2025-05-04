"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { HEX_SEGMENTS, type HexPart } from "@/lib/hex-core"

type ExplodedViewProps = {
  parts: HexPart[]
  /** 0..1 separation factor, 0 = fully assembled stack */
  explode?: number
  /** when set, every part except this id dims to 0.35 */
  inspectId?: string | null
}

/** separation = index × plate height × this (docs §5 allows 1.5 - 2.5) */
const EXPLODE_SPREAD = 2.2
/** opacity of non-inspected parts while one is focused */
const DIMMED_OPACITY = 0.35

function damp(delta: number, speed = 6) {
  return 1 - Math.exp(-speed * delta)
}

function Part({
  part,
  index,
  explode,
  dimmed,
}: {
  part: HexPart
  index: number
  explode: number
  dimmed: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const isSpine = part.kind === "spine"

  useFrame((_, delta) => {
    const g = group.current
    const m = material.current
    if (!g || !m) return

    // spine stays anchored; plates climb +Y by index * height * spread
    const spread = isSpine ? 0 : index * part.height * EXPLODE_SPREAD * explode
    g.position.y = THREE.MathUtils.lerp(g.position.y, part.targetY + spread, damp(delta, 8))
    m.opacity = THREE.MathUtils.lerp(m.opacity, dimmed ? DIMMED_OPACITY : 1, damp(delta, 10))
  })

  return (
    <group ref={group}>
      <mesh>
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
          roughness={0.6}
          metalness={0.1}
          transparent
        />
      </mesh>
    </group>
  )
}

/**
 * Simpler sibling of ObjectAssembly - none of the assembly choreography, just
 * a straight +Y separation driven by `explode`. Used for the structure /
 * precision beats where the camera moves between parts.
 */
export default function ExplodedView({ parts, explode = 0, inspectId = null }: ExplodedViewProps) {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <spotLight position={[0, 6, 4]} intensity={1.1} angle={0.6} penumbra={1} />
      {parts.map((part, i) => {
        const dimmed = inspectId !== null && inspectId !== part.id
        return <Part key={part.id} part={part} index={i} explode={explode} dimmed={dimmed} />
      })}
    </group>
  )
}