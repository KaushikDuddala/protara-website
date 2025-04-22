"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Custom cursor rendered as a dot with a trailing ring. Over interactive
 * elements the ring shows a small "VIEW" label. Hidden on coarse pointers and
 * on reduced-motion; never intercepts pointer events.
 */
export default function CursorView() {
  const [view, setView] = useState(false)
  const [hidden, setHidden] = useState(true)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      setHidden(false)
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }
    }

    const raf = () => {
      if (ring.current) {
        const x = pos.current.x
        const y = pos.current.y
        ring.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      }
      requestAnimationFrame(raf)
    }

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const interactive = !!t.closest(
        "a, button, [role='button'], [data-cursor='view'], .product-card"
      )
      setView(interactive)
    }

    window.addEventListener("mousemove", move, { passive: true })
    window.addEventListener("mouseover", over, { passive: true })
    const rafId = requestAnimationFrame(raf)

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseover", over)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (reduced) return null

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[100]" aria-hidden>
      {!hidden && (
        <>
          <div className="fixed left-0 top-0 w-[24px] h-[24px] border border-white/40 mix-blend-difference" ref={ring}>
            {view && (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-widest text-white">
                View
              </span>
            )}
          </div>
          <div className="fixed left-0 top-0 w-[6px] h-[6px] bg-molten" ref={dot} />
        </>
      )}
    </div>
  )
}
