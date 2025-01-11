"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Star } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import ReviewCard from "./review-card"

interface Review {
  id: number
  name: string
  title: string
  description: string
  rating: number
  item_bought: string
  created_at: string
}

interface ReviewStats {
  product_id: number
  total_reviews: number
  average_rating: number
}

interface ReviewsListProps {
  productId: number
  refreshTrigger?: number
}

/** Fetches and displays a list of reviews with summary stats for a product. */
export default function ReviewsList({ productId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError("")
        const response = await fetch(`/api/reviews/product/${productId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data = await response.json()
        setReviews(data.reviews || [])
        setStats(data.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId, refreshTrigger])

  if (loading) {
    return (
      <Card className="bg-obsidian border-white/5 rounded-none">
        <CardHeader>
          <CardTitle className="text-white font-heading font-bold">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-steel text-center py-8">Loading reviews...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="bg-red-900/30 border-red-700/50 rounded-none">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-200">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="bg-obsidian border-white/5 rounded-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white font-heading font-bold">Customer Reviews</CardTitle>
            <div className="w-12 h-[2px] bg-molten mt-2" />
          </div>
          {stats && stats.total_reviews > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="h-4 w-4 text-molten fill-molten" />
                <p className="text-2xl font-heading font-bold text-molten">
                  {stats.average_rating.toFixed(1)}
                </p>
              </div>
              <p className="text-xs text-steel">
                ({stats.total_reviews} review{stats.total_reviews !== 1 ? "s" : ""})
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-steel text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <ReviewCard
                key={review.id}
                title={review.title}
                description={review.description}
                rating={review.rating}
                name={review.name}
                itemBought={review.item_bought}
                createdAt={review.created_at}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}