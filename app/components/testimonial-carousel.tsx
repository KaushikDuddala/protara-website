"use client"

import { useState, useRef, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Testimonial {
  id: string
  customer_name: string
  rating: number
  testimonial: string
  verified_purchase: boolean
  timestamp: string
  product_id?: number | null
  product?: {
    id: number
    name?: string
    images?: string[]
  } | null
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

/** Auto-advancing 3-column carousel of customer testimonials with prev/next controls. */
export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const itemsPerView = 3

  useEffect(() => {
    if (!isPaused && testimonials.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + itemsPerView) % testimonials.length)
      }, 4000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, testimonials.length])

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerView) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - itemsPerView + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
  }

  const visibleTestimonials = Array.from({ length: itemsPerView }).map((_, i) =>
    testimonials[(currentIndex + i) % testimonials.length]
  )

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="animate-pulse">
          <div className="bg-obsidian border border-white/[0.06] rounded-none p-8 max-w-md mx-auto">
            <div className="h-4 bg-white/[0.04] rounded-none mb-4" />
            <div className="h-12 bg-white/[0.04] rounded-none mb-4" />
            <div className="h-4 bg-white/[0.04] rounded-none" />
          </div>
        </div>
      </div>
    )
  }

  const totalSets = Math.ceil(testimonials.length / itemsPerView)

  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevTestimonial}
          className="bg-transparent border border-white/10 text-chrome hover:text-white hover:bg-white/5 rounded-none p-2 transition-colors"
          disabled={testimonials.length <= itemsPerView}
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalSets }).map((_, index) => {
            const active = Math.floor(currentIndex / itemsPerView) === index
            return (
              <button
                key={index}
                onClick={() => goToTestimonial((index * itemsPerView) % testimonials.length)}
                className={`transition-all duration-300 rounded-none ${
                  active ? "bg-molten w-8 h-[3px]" : "bg-white/15 h-[3px] w-2 hover:bg-white/30"
                }`}
                aria-label={`Go to testimonial set ${index + 1}`}
              />
            )
          })}
        </div>

        <button
          onClick={nextTestimonial}
          className="bg-transparent border border-white/10 text-chrome hover:text-white hover:bg-white/5 rounded-none p-2 transition-colors"
          disabled={testimonials.length <= itemsPerView}
          aria-label="Next testimonials"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative overflow-hidden">
        <div className="grid grid-cols-3 gap-6">
          {visibleTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-obsidian border border-white/[0.06] rounded-none p-6 flex flex-col items-center text-center">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < testimonial.rating ? "text-molten fill-molten" : "text-white/15 fill-white/15"
                    }`}
                  />
                ))}
              </div>
              <div className="w-12 h-12 bg-molten rounded-none flex items-center justify-center text-white font-heading font-bold mb-3">
                {testimonial.customer_name.charAt(0)}
              </div>
              <p className="font-semibold text-white mb-1">{testimonial.customer_name}</p>
              {testimonial.verified_purchase && (
                <span className="text-xs text-green-400 bg-green-900/30 border border-green-500/30 px-2 py-0.5 rounded-none mb-3">
                  Verified Purchase
                </span>
              )}
              <blockquote className="text-chrome text-sm italic leading-relaxed">
                &ldquo;{testimonial.testimonial}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="bg-transparent border border-white/10 text-chrome hover:text-white hover:bg-white/5 rounded-none px-4 py-2 uppercase tracking-widest text-xs transition-colors"
        >
          {isPaused ? "Auto Play" : "Pause"}
        </button>
      </div>
    </div>
  )
}
