"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Smoothed 0 → 1 progress for a scroll chapter. Creates a scrub ScrollTrigger
 * on the given ref (no pin - ScrollScene owns that) and lerps the returned
 * value toward its progress every gsap ticker frame, so consumers read a
 * stable eased number instead of raw scroll deltas.
 *
 * @param ref - ref to the chapter/section element
 * @returns smoothed progress in [0, 1]
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)
  const current = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // NOTE: pairing this with ScrollScene means two triggers land on one
    // section (pin + progress). it works but double-refreshes on resize -
    // merge into a single create when the chapters get refactored.
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      scrub: true,
    })

    current.current = st.progress
    const tick = () => {
      current.current += (st.progress - current.current) * 0.12
      setProgress(current.current)
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      st.kill()
    }
  }, [ref])

  return progress
}