"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Upload, MessageSquare, ArrowLeft, Send, CheckCircle, ArrowUpRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/app/components/navigation"

/** Custom print request - submit a request or (coming soon) upload a model. */
export default function CustomPrintRequestPage() {
  const [mode, setMode] = useState<"request" | "upload" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [requestForm, setRequestForm] = useState({
    productName: "",
    budget: "",
    description: "",
    email: "",
    phone: "",
  })

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const requestData = {
        type: "request",
        productName: requestForm.productName,
        budget: requestForm.budget,
        description: requestForm.description,
        email: requestForm.email,
        phone: requestForm.phone,
        timestamp: new Date().toISOString(),
        status: "pending"
      }

      const response = await fetch("/api/custom-print-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) throw new Error("Failed to submit request")

      setSuccess("Your custom print request has been submitted successfully! We'll contact you soon.")
      setRequestForm({ productName: "", budget: "", description: "", email: "", phone: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === null) {
    return (
      <div className="min-h-screen bg-void text-white relative">
        <Navigation />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

        <div className="relative container mx-auto px-4 pt-40 pb-24">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-14"
            >
              <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Bespoke Manufacturing</p>
              <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] mb-4">Custom Print Request</h1>
              <p className="text-steel text-lg">Choose how you'd like to create your custom print</p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="w-14 h-[2px] bg-molten" />
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              >
                <Card
                  className="bg-obsidian border border-white/[0.06] hover:border-molten/40 cursor-pointer group h-full transition-colors"
                  onClick={() => setMode("request")}
                >
                  <CardContent className="p-10 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-molten/10 border border-molten/30 flex items-center justify-center mb-6 group-hover:bg-molten group-hover:border-molten transition-all duration-150">
                      <MessageSquare className="h-8 w-8 text-molten group-hover:text-white transition-colors duration-150" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mb-2">Request Creation</h3>
                    <p className="text-steel">
                      Describe what you want us to create and we'll get back to you with options
                    </p>
                    <span className="flex items-center gap-1 text-molten text-sm uppercase tracking-widest mt-6">
                      Start
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                <Card className="bg-obsidian border-white/[0.06] opacity-50 h-full">
                  <CardContent className="p-10 text-center relative flex flex-col items-center justify-center h-full">
                    <div className="mb-6">
                      <Upload className="h-8 w-8 text-steel mx-auto" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-steel mb-2">Upload Creation</h3>
                    <p className="text-steel text-sm">
                      Upload your own 3D model file for printing
                    </p>
                    <span className="mt-6 bg-molten text-white px-3 py-1 text-xs uppercase tracking-widest">
                      Coming Soon
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "request") {
    const inputClass = "bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
    return (
      <div className="min-h-screen bg-void text-white relative">
        <Navigation />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "300px", width: "100%" }} />

        <div className="relative container mx-auto px-4 pt-40 pb-24">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setMode(null)}
              className="flex items-center gap-2 text-steel hover:text-molten transition-colors duration-150 text-sm mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to options
            </button>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Card className="bg-obsidian border-white/[0.06] rounded-none">
                <CardHeader>
                  <CardTitle className="text-white font-heading font-bold">Request Custom Creation</CardTitle>
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

                  <form onSubmit={handleRequestSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="productName" className="text-chrome">
                        What product do you want?
                      </Label>
                      <Textarea
                        id="productName"
                        value={requestForm.productName}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, productName: e.target.value }))}
                        className={`${inputClass} resize-none`}
                        rows={3}
                        placeholder="Describe the product you'd like us to create (e.g., custom phone stand, unique decorative item, functional tool, etc.)"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget" className="text-chrome">
                        What is your budget?
                      </Label>
                      <Input
                        id="budget"
                        type="text"
                        value={requestForm.budget}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, budget: e.target.value }))}
                        className={inputClass}
                        placeholder="e.g., $50, $100, $200+"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-chrome">
                        Additional Details
                      </Label>
                      <Textarea
                        id="description"
                        value={requestForm.description}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                        className={`${inputClass} resize-none`}
                        rows={4}
                        placeholder="Any additional details, requirements, or specifications..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-chrome">
                        Email Address <span className="text-molten">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={requestForm.email}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, email: e.target.value }))}
                        className={inputClass}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-chrome">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={requestForm.phone}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, phone: e.target.value }))}
                        className={inputClass}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="bg-white/[0.03] p-4 border border-white/[0.06]">
                      <p className="text-chrome text-sm mb-2">
                        <strong>For any questions or to send additional files:</strong>
                      </p>
                      <p className="text-white">
                        Email us at: <a href="mailto:custom@protaraprinting.com" className="text-molten hover:text-molten-ember underline underline-offset-4 transition-colors duration-150">custom@protaraprinting.com</a>
                      </p>
                      <p className="text-steel text-sm mt-2">
                        We'll review your request and get back to you within 24-48 hours.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold py-3"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting Request..." : "Submit Request"}
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

  return null
}