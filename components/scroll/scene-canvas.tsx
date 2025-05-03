"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Canvas } from "@react-three/fiber"

// TODO: this file was meant to be loaded via next/dynamic({ ssr: false }) with
// a loading fallback - that wrapper never got written, the chapters import
// this directly. fine for hmr, but three ships on the first scroll. revisit.

const WORLD = "#050507"

type SceneCanvasProps = {
  children: ReactNode
}

/**
 * Shared R3F canvas for pinned scenes: clamped dpr + fov 40 + one dark fog
 * pass so every chapter reads as the same "world". The WebGL context mounts on
 * IntersectionObserver (200px lead-in) and unmounts when the section scrolls
 * away, releasing the context so only one live canvas exists at a time.
 */
export default function SceneCanvas({ children }: SceneCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const seen = useRef(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const next = entry.isIntersecting
          if (next === seen.current) continue // skip the duplicate initial report
          seen.current = next
          setInView(next)
        }
      },
      { rootMargin: "200px 0px" }
    )
    io.observe(el)

    return () => io.disconnect()
  }, [])

  // flipping inView to false unmounts the Canvas, which drops the webgl
  // context and lets R3F dispose the scene graph. contexts that surface stays
  // pooled get forceContextLoss'd by the browser anyway.

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {inView ? (
        <Canvas
          dpr={[1, 2]}
          camera={{ fov: 40, position: [0, 1.6, 7], near: 0.1, far: 40 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={[WORLD]} />
          <fog attach="fog" args={[WORLD, 9, 24]} />
          {children}
        </Canvas>
      ) : null}
    </div>
  )
}