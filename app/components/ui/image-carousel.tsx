"use client"

import { useState, useEffect, useRef, memo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "../../../lib/utils"

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  imageClassName?: string
  showDots?: boolean
  showArrows?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  slideDuration?: number
}

/** Sliding image carousel with optional dots, arrows, and autoplay. */
export default memo(function ImageCarousel({
  images,
  alt,
  className,
  imageClassName,
  showDots = true,
  showArrows = true,
  autoplay = false,
  autoplayInterval = 3000,
  slideDuration = 300
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const preloadNextImages = () => {
      const nextIndex = (currentIndex + 1) % images.length
      const nextNextIndex = (currentIndex + 2) % images.length
      
      const imagesToPreload = [images[nextIndex], images[nextNextIndex]].filter(Boolean)
      
      imagesToPreload.forEach(src => {
        if (src && !document.querySelector(`img[src="${src}"]`)) {
          const img = new Image()
          img.src = src
        }
      })
    }

    if (images.length > 1) {
      preloadNextImages()
    }
  }, [currentIndex, images])

  useEffect(() => {
    if (autoplay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        handleNext()
      }, autoplayInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoplay, autoplayInterval, currentIndex, images.length])

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 50)
  }

  const handlePrev = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 50)
  }

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 50)
  }

  if (images.length === 0) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img
          src="/placeholder.svg"
          alt={alt}
          className={cn("w-full h-full object-cover", imageClassName)}
        />
      </div>
    )
  }

  const translateX = -currentIndex * 100

  return (
    <div className={cn("relative overflow-hidden", className)} onClick={(e) => e.stopPropagation()}>
      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
        <div 
          className="flex h-full transition-transform ease-in-out"
          style={{ 
            transform: `translateX(${translateX}%)`,
            transitionDuration: isTransitioning ? `${slideDuration}ms` : '0ms'
          }}
        >
          {images.map((image, index) => (
            <div 
              key={index} 
              className="w-full h-full flex-shrink-0"
              style={{ width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`${alt} - Image ${index + 1}`}
                className={cn("w-full h-full object-cover", imageClassName)}
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-900/60 hover:bg-gray-800/80 rounded-full p-2 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-900/60 hover:bg-gray-800/80 rounded-full p-2 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                handleDotClick(index)
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-orange-400 w-8" 
                  : "bg-gray-500 hover:bg-gray-400"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
})