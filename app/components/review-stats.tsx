"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

interface ReviewStatsProps {
  productId: number
}

interface ReviewStatsData {
  product_id: number
  total_reviews: number
  average_rating: number
}

/** Inline star-rating summary fetched from /api/reviews/product/:id. */
export default function ReviewStats({ productId }: ReviewStatsProps) {
  const [stats, setStats] = useState<ReviewStatsData | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/reviews/product/${productId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch review stats")
        }

        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        console.error("Error fetching review stats:", err)
      }
    }

    fetchStats()
  }, [productId])

  // Nothing to render until the request lands, so the stars and count only
  // ever appear with real numbers.
  if (!stats) return null

  const rating = stats.average_rating || 0
  const reviewCount = stats.total_reviews || 0
  const displayRating = reviewCount > 0 ? Math.round(rating) : 5

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={13}
            className={star <= displayRating ? "fill-molten text-molten" : "text-white/10"}
          />
        ))}
      </div>
      <span className="text-sm text-steel">
        ({reviewCount})
      </span>
    </div>
  )
}