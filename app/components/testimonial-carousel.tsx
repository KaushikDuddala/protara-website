"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  initials: string
  rating: number
  text: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

const AUTO_ADVANCE_MS = 4000

/** Single auto-advancing testimonial card, pauses while hovered. */
export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % testimonials.length)
    }, AUTO_ADVANCE_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, testimonials.length])

  if (testimonials.length === 0) {
    return <p className="text-steel text-center py-10">No testimonials yet.</p>
  }

  const current = testimonials[currentIndex]

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="mx-auto max-w-2xl bg-obsidian border border-white/[0.06] rounded-2xl p-10 text-center"
    >
      <div className="flex justify-center gap-1 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={i < current.rating ? "fill-molten text-molten" : "text-chrome/20"}
            size={16}
          />
        ))}
      </div>

      <blockquote className="text-chrome italic leading-relaxed text-lg mb-8">"{current.text}"</blockquote>

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-molten text-void font-heading flex items-center justify-center">
          {current.initials}
        </div>
        <div>
          <p className="font-heading tracking-[-0.01em]">{current.name}</p>
          <p className="text-xs text-lime-300 mt-1">Verified Purchase</p>
        </div>
      </div>
    </div>
  )
}