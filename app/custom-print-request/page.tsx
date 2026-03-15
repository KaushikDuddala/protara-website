"use client"

import { useState } from "react"
import { Upload, Send, AlertCircle } from "lucide-react"

interface RequestForm {
  productName: string
  budget: string
  description: string
  email: string
  phone: string
}

const EMPTY_FORM: RequestForm = { productName: "", budget: "", description: "", email: "", phone: "" }

/** Custom print requests - request a design or upload your own file. */
export default function CustomPrintRequestPage() {
  const [mode, setMode] = useState<"request" | "upload">("request")
  const [form, setForm] = useState<RequestForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        type: "request",
        product_name: form.productName,
        budget: form.budget,
        description: form.description,
        email: form.email,
        phone: form.phone,
        timestamp: new Date().toISOString(),
        status: "pending",
      }
      const response = await fetch("/api/custom-print-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Something went wrong")
      setMessage({ type: "success", text: "Request submitted! We'll get back to you within 2 business days." })
      setForm(EMPTY_FORM)
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-white text-3xl font-bold mb-2">Custom Print Request</h1>
        <p className="text-white/60 mb-8">Tell us what you need printed, or send us the file you have in mind.</p>

        <div className="grid grid-cols-2 gap-2 max-w-md mb-10">
          {(["request", "upload"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 border capitalize transition-colors ${
                mode === m
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              }`}
            >
              {m === "request" ? "Request a design" : "Upload a file"}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start">
          {mode === "request" ? (
            <form onSubmit={handleSubmit} className="bg-[#12121a] border border-white/10 p-6 space-y-5">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">What do you want printed?</label>
                <input
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Budget</label>
                <input
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="$50 - $200"
                  className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Describe your idea</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500 resize-y"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {message && (
                <p className={`flex items-center gap-2 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {message.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          ) : (
            <div className="bg-[#12121a] border border-white/10 p-6 text-center">
              <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">File upload coming soon</h3>
              <p className="text-white/60 text-sm mb-4">
                Drop your STL, OBJ or image and we'll handle the rest. This is being built right now - check back soon.
              </p>
              <p className="text-white/50 text-xs">Need it sooner? Use the request form instead.</p>
            </div>
          )}

          <div className="bg-[#12121a] border border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4">What happens next?</h3>
            <ol className="space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">1</span>
                We review your idea and confirm the details by email.
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">2</span>
                You approve the design and pricing before we start.
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 font-bold">3</span>
                We print, quality check, and ship it to your door.
              </li>
            </ol>
            <div className="border-t border-white/10 mt-5 pt-4">
              <p className="text-white/50 text-xs mb-1">Questions?</p>
              <a href="mailto:hello@protara.com" className="text-orange-500 hover:text-orange-400 text-sm">
                hello@protara.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}