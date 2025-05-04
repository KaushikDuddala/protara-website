"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

type PresetName = "matte-black" | "aluminum" | "chrome" | "molten"

type MaterialPreset = {
  name: PresetName
  color: THREE.Color
  roughness: number
  metalness: number
  emissive?: THREE.Color
}

const BLACK = new THREE.Color("#000000")

/** §8 material transform sequence, in film order. */
const MATERIAL_STAGES: MaterialPreset[] = [
  { name: "matte-black", color: new THREE.Color("#14141c"), roughness: 0.92, metalness: 0.02 },
  { name: "aluminum", color: new THREE.Color("#a8adb5"), roughness: 0.38, metalness: 0.85 },
  { name: "chrome", color: new THREE.Color("#eceef2"), roughness: 0.06, metalness: 1 },
  { name: "molten", color: new THREE.Color("#ff6b2c"), roughness: 0.45, metalness: 0.2, emissive: new THREE.Color("#ff4500") },
]

type MaterialSwitcherProps = {
  /** 0..1 scrubbed progress; each 25% band advances one preset */
  stage: number
}

/**
 * Cycles the material presets on a probe mesh as the scroll stage advances.
 * Roughness/metalness ease toward the current preset; every swap fires a short
 * emissive flash so the transition reads as a beat, not a fade.
 */
export default function MaterialSwitcher({ stage }: MaterialSwitcherProps) {
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const flash = useRef(0)
  const at = useRef(-1)

  useFrame((_, delta) => {
    const m = material.current
    if (!m) return

    const index = Math.min(MATERIAL_STAGES.length - 1, Math.floor(stage * MATERIAL_STAGES.length))
    const preset = MATERIAL_STAGES[index]

    const e = damp(0.12, delta)
    m.color.lerp(preset.color, e)
    m.roughness += (preset.roughness - m.roughness) * e
    m.metalness += (preset.metalness - m.metalness) * e

    if (at.current !== index) {
      at.current = index
      flash.current = 1
    }
    flash.current = Math.max(0, flash.current - delta * 1.6)

    m.emissive.copy(preset.emissive ?? BLACK)
    m.emissiveIntensity = flash.current * 2.2
  })

  return (
    <mesh>
      <cylinderGeometry args={[1.1, 1, 0.6, 6]} />
      <meshStandardMaterial ref={material} />
    </mesh>
  )
}

function damp(speed: number, delta: number) {
  return 1 - Math.exp(-speed * delta)
}