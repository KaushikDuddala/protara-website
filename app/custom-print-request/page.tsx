"use client"

import { useState } from "react"

export default function CustomPrintRequestPage() {
  const [mode, setMode] = useState<"text" | "upload">("text")
  const [form, setForm] = useState({
    productName: "",
    budget: "",
    description: "",
    email: "",
    phone: "",
  })
  const [status, setStatus] = useState<"" | "sending" | "sent" | "error">("")

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/custom-print-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "request",
          ...form,
          timestamp: new Date().toISOString(),
          status: "pending",
        }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-xl">
        <h1 className="text-white text-3xl font-bold mb-2">Custom Print Request</h1>
        <p className="text-white/60 mb-8">
          Tell us what you want printed and we will get back to you with a quote.
        </p>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode("text")}
            className={`px-5 py-2 border transition-colors ${
              mode === "text"
                ? "border-orange-500 text-orange-500"
                : "border-white/10 text-white/60 hover:text-white"
            }`}
          >
            Describe It
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`px-5 py-2 border transition-colors ${
              mode === "upload"
                ? "border-orange-500 text-orange-500"
                : "border-white/10 text-white/60 hover:text-white"
            }`}
          >
            Upload Files
          </button>
        </div>

        {mode === "upload" ? (
          <div className="bg-[#12121a] border border-white/10 p-8 text-center text-white/60">
            File uploads are coming soon.
          </div>
        ) : status === "sent" ? (
          <div className="bg-[#12121a] border border-white/10 p-8 text-center">
            <p className="text-white font-semibold mb-2">Request Submitted!</p>
            <p className="text-white/60">We will review it and reach out soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Product name"
              value={form.productName}
              onChange={(e) => updateField("productName", e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />
            <input
              type="text"
              placeholder="Budget"
              value={form.budget}
              onChange={(e) => updateField("budget", e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />
            <textarea
              placeholder="Describe what you want printed"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={5}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />
            {status === "error" && (
              <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
            >
              {status === "sending" ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}