"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Progress (0 → 1) of a pinned section. Attach `ref` to a tall wrapper (e.g.
 * `h-[280vh]`) containing a `sticky top-0 h-screen` stage; the returned value
 * ramps 0→1 as the wrapper scrolls through the viewport.
 */
export function usePinProgress() {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0

    const update = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      if (span <= 0) return
      const p = Math.min(1, Math.max(0, -rect.top / span))
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setProgress(p))
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return { ref, progress }
}