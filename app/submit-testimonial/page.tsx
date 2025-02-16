"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Star, Send, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/app/components/navigation"
import ProductSelect from "@/app/components/product-select"

interface FormData {
  customerName: string
  rating: number
  testimonial: string
  verifiedPurchase: boolean
  productId?: number | null
  contact: string
}

/** Submit testimonial - form for customers to share their experience. */
export default function SubmitTestimonialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    rating: 5,
    testimonial: "",
    verifiedPurchase: false,
    productId: null,
    contact: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const testimonialData = {
        ...formData,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonialData),
      })

      if (!response.ok) throw new Error("Failed to submit testimonial")

      setSuccess("Thank you! Your testimonial has been submitted for review.")
      setFormData({
        customerName: "",
        rating: 5,
        testimonial: "",
        verifiedPurchase: false,
        productId: null,
        contact: "",
      })
      setTimeout(() => router.push("/"), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit testimonial")
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = () => {
    return (
      <div className="flex gap-1 justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="transition-transform duration-150 hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= formData.rating
                  ? "text-molten fill-molten"
                  : "text-white/15 fill-white/15"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "300px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-24">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Your Voice</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-[-0.04em] text-white mb-4">
              Share Your Experience
            </h1>
            <p className="text-steel text-lg">
              Loved your Protara experience? Let others know!
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <div className="w-12 h-[2px] bg-molten" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <Card className="bg-obsidian border-white/[0.06] rounded-none">
              <CardHeader>
                <CardTitle className="text-white font-heading font-bold">Submit Your Testimonial</CardTitle>
                <div className="w-12 h-[2px] bg-molten" />
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 bg-green-900/30 border-green-700/50 rounded-none">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-200">{success}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mb-6 bg-red-900/30 border-red-700/50 rounded-none">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="customerName" className="text-chrome">
                      Your Name
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-chrome block mb-2">
                      Rating
                    </Label>
                    <StarRating />
                  </div>

                  <div>
                    <Label className="text-chrome block mb-2">Product (optional)</Label>
                    <div className="mb-4">
                      <ProductSelect
                        value={formData.productId ?? undefined}
                        onChange={(id) => setFormData(prev => ({ ...prev, productId: id }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact" className="text-chrome">
                        Contact Information (Email or Phone)
                      </Label>
                      <Input
                        id="contact"
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                        placeholder="email@example.com or +1-234-567-8900"
                        required
                      />
                    </div>

                    <Label htmlFor="testimonial" className="text-chrome mt-6 block">
                      Your Experience
                    </Label>
                    <Textarea
                      id="testimonial"
                      value={formData.testimonial}
                      onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                      className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten resize-none"
                      rows={4}
                      placeholder="Share your experience with Protara..."
                      required
                      maxLength={500}
                    />
                    <p className="text-sm text-steel mt-1">
                      {formData.testimonial.length}/500 characters
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="verifiedPurchase"
                      checked={formData.verifiedPurchase}
                      onChange={(e) => setFormData(prev => ({ ...prev, verifiedPurchase: e.target.checked }))}
                      className="w-4 h-4 text-molten border-white/20 rounded-none focus:ring-molten focus:ring-2 bg-white/[0.04]"
                    />
                    <Label htmlFor="verifiedPurchase" className="text-chrome">
                      I purchased from Protara
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.customerName.trim() || !formData.testimonial.trim() || !formData.contact.trim()}
                    className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Testimonial
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}