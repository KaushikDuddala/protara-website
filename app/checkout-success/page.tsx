"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const SHIPPING = 9.99

function Confirmation() {
  const searchParams = useSearchParams()
  // order_total from the checkout session already includes shipping...
  const orderTotal = searchParams.get("order_total") ?? "0"
  const amount = parseFloat(orderTotal) + SHIPPING

  return (
    <div className="text-center">
      <h1 className="text-white text-3xl font-bold mb-4">Thank You!</h1>
      <p className="text-white/60 mb-2">Your order has been placed successfully.</p>
      <p className="text-white text-2xl font-bold mb-8">${amount.toFixed(2)}</p>
      <Link
        href="/catalogue"
        className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <Suspense fallback={null}>
        <Confirmation />
      </Suspense>
    </div>
  )
}