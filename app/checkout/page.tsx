"use client"

import { useState } from "react"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { useCart } from "@/contexts/cart-context"
import { Lock, ShieldCheck, Truck, RotateCcw, ChevronLeft } from "lucide-react"

const SHIPPING = 9.99

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY || "pk_live_51QHayyLBsPFhX4pk8RXft6IYaobphnKTuvUo7Cwa28a0JWUjykiFZU3YRMLXrBPQ6dp0derqxq7boG7TKlbUoV7V00vvn0Onic"
)

/** Checkout page - order summary sidebar and Stripe redirect with trust pillars. */
export default function CheckoutPage() {
  const { state } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const subtotal = state.total
  const total = subtotal + SHIPPING

  const handleCheckout = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            material: item.material,
            image: item.image,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      if (!data.sessionId) throw new Error("No sessionId returned from API")

      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
      if (stripeError) throw new Error(stripeError.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-white text-2xl font-bold mb-3">No items to check out</h1>
          <Link href="/catalogue" className="text-orange-500 hover:text-orange-400">
            Back to the catalogue
          </Link>
        </div>
      </div>
    )
  }

  const pillars = [
    { icon: ShieldCheck, title: "Secure Payments", desc: "Checkout is encrypted end-to-end by Stripe." },
    { icon: Truck, title: "Fast Shipping", desc: "Orders are dispatched within 1-5 business days." },
    { icon: RotateCcw, title: "Quality Checked", desc: "Every print is inspected before it ships." },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-orange-500 transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to cart
        </Link>
        <h1 className="text-white text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-[#12121a] border border-white/10 p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <pillar.icon className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{pillar.title}</h4>
                  <p className="text-white/60 text-sm">{pillar.desc}</p>
                </div>
              </div>
            ))}

            <div className="bg-[#12121a] border border-white/10 p-5">
              <p className="text-white font-semibold mb-1">Have an account?</p>
              <p className="text-white/60 text-sm mb-3">Sign in to speed up checkout and track your order.</p>
              <Link href="/signin" className="text-orange-500 hover:text-orange-400 text-sm">
                Sign in
              </Link>
            </div>
          </div>

          <div className="bg-[#12121a] border border-white/10 p-6 lg:sticky lg:top-6">
            <h2 className="text-white font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-white/70 truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-6 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>${SHIPPING.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Tax</span>
                <span>Calculated at payment</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
            >
              {loading ? "Redirecting..." : "Pay Now"}
            </button>
            <p className="text-xs text-white/50 text-center mt-4 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" />
              Secured by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}