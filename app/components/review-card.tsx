"use client"

import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface ReviewCardProps {
  title: string
  description: string
  rating: number
  name: string
  itemBought: string
  createdAt: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

/** Single review card showing star rating, reviewer name, description, and purchased item. */
export default function ReviewCard({ title, description, rating, name, itemBought, createdAt }: ReviewCardProps) {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-sm rounded-none hover:border-molten/40 hover:bg-white/[0.05] transition-all duration-150">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={15}
                className={star <= rating ? "fill-molten text-molten" : "text-white/10"}
              />
            ))}
          </div>
          <span className="text-xs text-steel">{formatDate(createdAt)}</span>
        </div>

        <div className="mb-3">
          <h4 className="text-white font-heading font-bold leading-tight">{title}</h4>
          <p className="text-xs text-steel mt-1">by {name}</p>
        </div>

        <p className="text-chrome text-sm mb-4 leading-relaxed">{description}</p>

        <p className="text-xs text-steel border-t border-white/[0.06] pt-3">
          Product: <span className="text-chrome">{itemBought}</span>
        </p>
      </CardContent>
    </Card>
  )
}