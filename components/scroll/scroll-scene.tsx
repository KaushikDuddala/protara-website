"use client"

import { useLayoutEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

type ScrollSceneProps = {
  children: ReactNode
  /** scroll travel of the pin, e.g. "260vh". default 300vh */
  height?: string
  /** dom id so chapter anchors (e.g. "#material") resolve */
  id?: string
}

/**
 * Full-viewport pinned scroll chapter. The `.pinned-scene` inner div is pinned
 * by ScrollTrigger and scrubbed; chapters compose SceneCanvas / DOM children
 * inside. Reduced motion skips the pin and renders children at rest so the
 * section never becomes an empty pinned hole - callers pass a static fallback.
 */
export default function ScrollScene({ children, height = "300vh", id }: ScrollSceneProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const section = sectionRef.current
    const scene = sceneRef.current
    if (!section || !scene || reduced) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      pin: scene,
      scrub: true,
      anticipatePin: 1,
    })

    return () => {
      st.kill() // removes the pin-spacer and reverts inline pin styles
      ScrollTrigger.refresh()
    }
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id={id}
      data-scroll-scene
      className="relative bg-void"
      style={{ height: reduced ? undefined : height }}
    >
      <div ref={sceneRef} className="pinned-scene sticky top-0 h-screen overflow-hidden">
        {children}
      </div>
    </section>
  )
}