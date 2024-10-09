"use client"

import { useState } from "react"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { useCart } from "@/contexts/cart-context"

const SHIPPING = 9.99

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { state } = useCart()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const subtotal = state.total
  const total = subtotal + SHIPPING

  const handleCheckout = async () => {
    if (!name || !email) {
      setError("Please enter your name and email.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")

      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
      if (stripeError) throw new Error(stripeError.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-white text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
            >
              {loading ? "Redirecting..." : "Pay Now"}
            </button>
            <Link href="/cart" className="block text-center text-sm text-white/50 hover:text-white">
              Back to cart
            </Link>
          </div>

          <div className="bg-[#12121a] border border-white/10 p-6 h-fit">
            <h2 className="text-white font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-white/70 truncate">
                    {item.name} {item.color && <span className="text-white/40">({item.color})</span>} × {item.quantity}
                  </span>
                  <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-white/70 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/70 text-sm">
              <span>Shipping</span>
              <span>${SHIPPING.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}