/** Palette tokens reused by every hex-core consumer. */
const OBSIDIAN = "#14141c"
const MOLTEN = "#ff6b2c"
const MOLTEN_EMBER = "#ff4500"
const VOID = "#0a0a0f"

/** Radial segments a plate cylinder uses (hex = 6 facets). */
export const HEX_SEGMENTS = 6

/**
 * Parametric hex-fidget core config. Plain R3F primitives, no GLB.
 */
export type HexCoreConfig = {
  /** number of stacked hex plates (default 6) */
  plates: number
  /** hex circumradius, scene units */
  r: number
  /** plate thickness */
  h: number
  /** vertical gap between stacked plates */
  gap: number
  /** spine radius; falls back to r * 0.32 */
  spineRadius?: number
}

/** One part of the assembly - a hex plate or the center spine. */
export type HexPart = {
  id: string
  kind: "plate" | "spine"
  /** circumradius (driveTo / explode maths); spine uses it for thickness */
  radius: number
  height: number
  /** rest y within the assembled stack, origin at the base */
  targetY: number
  /** plates step i * π/3 so the hex facets alternate */
  rotationY: number
  color: string
  /** molten accent, set only on the final plate */
  emissive?: string
}

export const DEFAULT_HEX_CORE_CONFIG: HexCoreConfig = {
  plates: 6,
  r: 1.15,
  h: 0.14,
  gap: 0.05,
}

/**
 * Builds the hex-fidget core part list: `plates` hex cylinders stacked with
 * rotation stepped by π/3, plus a center spine riding the whole stack. Plate y
 * follows `i * (gap + h)`; the final plate carries the molten accent. Shared
 * by the assembly scene, the exploded view, and the print-bed build (ch 07).
 *
 * @param config - plate count / radius / height / gap (defaults to DEFAULT_HEX_CORE_CONFIG)
 * @returns parts ordered bottom-up with the spine last
 */
export function buildHexCoreParts(config: HexCoreConfig = DEFAULT_HEX_CORE_CONFIG): HexPart[] {
  const { plates, r, h, gap } = config
  const parts: HexPart[] = []

  for (let i = 0; i < plates; i++) {
    const final = i === plates - 1
    parts.push({
      id: `plate-${i + 1}`,
      kind: "plate",
      radius: r,
      height: h,
      targetY: i * (gap + h),
      rotationY: i * (Math.PI / 3),
      color: final ? MOLTEN : OBSIDIAN,
      emissive: final ? MOLTEN_EMBER : undefined,
    })
  }

  const stackTop = parts[parts.length - 1].targetY + h
  const spineHeight = stackTop + h * 0.5
  parts.push({
    id: "spine",
    kind: "spine",
    radius: config.spineRadius ?? r * 0.32,
    height: spineHeight,
    targetY: spineHeight / 2,
    rotationY: 0,
    color: VOID,
  })

  return parts
}