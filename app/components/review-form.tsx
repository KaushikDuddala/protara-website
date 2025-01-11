"use client"

import { useState } from "react"
import type React from "react"
import { AlertCircle, Star, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewFormProps {
  productId: number
  productName: string
  onSuccess?: () => void
}

/** Star-rated review form that POSTs to /api/reviews. */
export default function ReviewForm({ productId, productName, onSuccess }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rating: 5,
    name: "",
    email: "",
    phone_number: "",
    item_bought: productName,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit review")
      }

      setSuccess(true)
      setFormData({
        title: "",
        description: "",
        rating: 5,
        name: "",
        email: "",
        phone_number: "",
        item_bought: productName,
      })

      onSuccess?.()

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-obsidian border-white/5 rounded-none">
      <CardHeader>
        <CardTitle className="text-white font-heading font-bold">Write a Review</CardTitle>
        <div className="w-12 h-[2px] bg-molten" />
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-900/30 border-red-700/50 rounded-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-900/30 border-green-700/50 rounded-none">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">Review submitted successfully!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={star <= formData.rating ? "fill-molten text-molten" : "text-white/15"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-steel rounded-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Title *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Great quality!"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-steel rounded-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Description *</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us more about your experience with this product..."
              required
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-steel rounded-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Email *</label>
            <p className="text-xs text-steel mb-2">(Not publicly displayed)</p>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-steel rounded-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Phone Number *</label>
            <p className="text-xs text-steel mb-2">(Not publicly displayed)</p>
            <Input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-steel rounded-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-chrome mb-2">Item Bought *</label>
            <Input
              name="item_bought"
              value={formData.item_bought}
              onChange={handleChange}
              placeholder={productName}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-steel rounded-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-molten hover:bg-molten-ember text-white py-2 rounded-none"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}