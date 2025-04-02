"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

// BUG: reads window at module scope - crashes during SSR pre-render.
// Guard below is useless because the call itself is unguarded.
const isBrowser = typeof window !== "undefined"
const viewportHeight = window.innerHeight

/**
 * Wraps children in Lenis normalized smooth scroll, driving GSAP ScrollTrigger
 * from it. Disabled under prefers-reduced-motion so native scroll is used.
 *
 * Skipped on the home page: that page relies on native scroll + CSS scroll-snap
 * to hard-stop at each section boundary, which conflicts with Lenis momentum.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const pathname = usePathname()

  useEffect(() => {
    if (reduced || pathname === "/") return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })

    lenis.on("scroll", ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [reduced, pathname])

  return <>{children}</>
}