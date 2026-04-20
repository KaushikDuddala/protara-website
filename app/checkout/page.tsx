"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, LogIn, UserPlus, ShoppingBag, ShieldCheck, Truck, RotateCcw, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { loadStripe } from "@stripe/stripe-js"
import Navigation from "../components/navigation"

/** Checkout page - order summary and Stripe checkout redirect with guest option. */
export default function CheckoutPage() {
  const { state } = useCart()
  const { user, isLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState<"choice" | "guest" | null>(
    user ? "guest" : "choice"
  )

  const handleStripeCheckout = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/create-checkout-session", {
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
      const data = await response.json()
      if (!data.sessionId) throw new Error("No sessionId returned from API")
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_KEY || "pk_live_51QHayyLBsPFhX4pk8RXft6IYaobphnKTuvUo7Cwa28a0JWUjykiFZU3YRMLXrBPQ6dp0derqxq7boG7TKlbUoV7V00vvn0Onic"
      )
      if (!stripe) throw new Error("Stripe failed to load")
      await stripe.redirectToCheckout({ sessionId: data.sessionId })
    } catch (err) {
      alert("Failed to redirect to Stripe Checkout. Please try again.")
      console.log(err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="h-7 w-7 text-molten" />
            </div>
            <p className="text-steel uppercase tracking-widest text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-void text-white relative">
        <Navigation />
        <div className="relative container mx-auto px-4 pt-44 pb-24 text-center">
          <div className="w-20 h-20 bg-obsidian border border-white/10 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-8 w-8 text-molten" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-[-0.03em] text-white mb-4">
            No Items to Checkout
          </h1>
          <p className="text-steel mb-8">Add some products to your cart first!</p>
          <Link href="/catalogue">
            <Button className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold px-8 py-4">
              Browse Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = state.total
  const total = subtotal + 9.99

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-3">Final Step</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] text-white">Checkout</h1>
          <div className="flex items-center gap-4 mt-5">
            <div className="w-16 h-[2px] bg-molten" />
            <p className="text-steel text-sm uppercase tracking-widest">Secure transmission to Stripe</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {!user && checkoutMode === "choice" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="bg-obsidian border border-white/10 p-6">
                  <h3 className="font-heading font-bold uppercase tracking-widest text-white text-sm mb-1">Choose how to continue</h3>
                  <div className="w-12 h-[2px] bg-molten mb-6" />
                  <div className="grid gap-3">
                    <Link href="/signin?redirect=/checkout" className="w-full">
                      <Button className="w-full bg-molten hover:bg-molten-ember text-white py-3 rounded-none uppercase tracking-widest font-semibold">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" className="w-full">
                      <Button variant="outline" className="w-full border-white/10 text-chrome hover:text-white hover:bg-white/5 rounded-none py-3 uppercase tracking-widest font-semibold">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </Button>
                    </Link>
                    <button onClick={() => setCheckoutMode("guest")} className="w-full">
                      <Button variant="ghost" className="w-full text-steel hover:text-white hover:bg-white/5 rounded-none py-3 uppercase tracking-widest font-semibold">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Continue as Guest
                      </Button>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="grid grid-cols-1 gap-3"
            >
              {[
                { icon: ShieldCheck, title: "Secure Payments", desc: "Encrypted checkout powered by Stripe." },
                { icon: Truck, title: "Fast Shipping", desc: "Orders dispatched within 48 hours." },
                { icon: RotateCcw, title: "Satisfaction Guaranteed", desc: "Quality checked on every print." },
              ].map((pillar) => (
                <div key={pillar.title} className="bg-obsidian border border-white/[0.06] p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 bg-molten/10 border border-molten/30 flex items-center justify-center shrink-0">
                    <pillar.icon className="h-5 w-5 text-molten" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-white text-sm mb-1">{pillar.title}</h4>
                    <p className="text-steel text-sm">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          >
            <div className="bg-obsidian border border-white/10 p-7 lg:sticky lg:top-28">
              <h2 className="font-heading font-bold uppercase tracking-widest text-white text-sm mb-1">Order Manifest</h2>
              <div className="w-12 h-[2px] bg-molten mb-6" />

              <div data-lenis-prevent className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
                {state.items.map((item, i) => (
                  <div key={`${item.id}`} className="flex gap-3 items-center">
                    <span className="text-xs font-heading font-bold text-white/20 w-5">{String(i + 1).padStart(2, "0")}</span>
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-14 h-14 object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-steel text-xs">Qty {item.quantity} · {item.material}</p>
                    </div>
                    <div className="text-molten text-sm font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-sm mb-6">
                <div className="flex justify-between text-steel">
                  <span>Subtotal</span>
                  <span className="text-chrome">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Shipping</span>
                  <span className="text-chrome">$9.99</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Tax</span>
                  <span className="text-chrome">To be calculated</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
                  <span className="font-heading font-bold uppercase tracking-widest text-white">Total</span>
                  <span className="font-heading font-bold text-3xl text-molten">${total.toFixed(2)}</span>
                </div>
              </div>

              {(!user && checkoutMode === "choice") ? (
                <div className="text-center text-steel text-sm py-4 border border-white/10">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Select an option to continue
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                    className="w-full bg-molten hover:bg-molten-ember text-white py-4 rounded-none uppercase tracking-widest font-semibold text-base group"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-pulse">Redirecting...</span>
                      </>
                    ) : (
                      <>
                        Checkout Now
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-150 group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                  <div className="text-center text-xs text-steel mt-4 flex items-center justify-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    {user && <span className="text-molten text-xs font-medium mr-1">{user.email}</span>}
                    {!user && <span className="mr-1">Guest checkout ·</span>}
                    Secured by Stripe
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}