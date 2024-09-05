"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../../lib/utils"

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  imageClassName?: string
  showArrows?: boolean
}

/** Simple sliding image carousel with a thumbnail rail underneath. */
export default function ImageCarousel({
  images,
  alt,
  className,
  imageClassName,
  showArrows = true,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = (index: number) => {
    setCurrentIndex((index + images.length) % images.length)
  }

  const goNext = () => goTo(currentIndex + 1)
  const goPrev = () => goTo(currentIndex - 1)

  if (images.length === 0) {
    return (
      <div className={cn("relative overflow-hidden bg-black", className)}>
        <img src="/placeholder.svg" alt={alt} className={cn("w-full object-cover", imageClassName)} />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-black", className)}>
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`${alt} - view ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            className={cn("w-full shrink-0 object-cover", imageClassName)}
          />
        ))}
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next image"
            className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to image ${index + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-orange-500" : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}