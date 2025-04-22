"use client"

import { useEffect, useState } from "react"

/**
 * Follows the user's `prefers-reduced-motion` setting.
 * Returns true when reduced motion is requested.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mql.matches)

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  return reduced
}
