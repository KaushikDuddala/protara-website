"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import Navigation from "../components/navigation"

/** Cart page - line items, quantity controls, and order summary. */
export default function CartPage() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const removeItem = (id: string | number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-void text-white relative">
        <Navigation />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,69,0,0.05) 0%, transparent 50%)" }} />
        <div className="relative container mx-auto px-4 pt-40 pb-28 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-24 h-24 bg-obsidian border border-white/10 flex items-center justify-center mb-8 mx-auto">
              <ShoppingBag className="h-10 w-10 text-molten" />
            </div>
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Manifest Empty</p>
            <h1 className="text-5xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] text-white mb-6">
              Your Cart Is Empty
            </h1>
            <p className="text-steel text-lg mb-10 max-w-md">Your print queue is clear. Load it up with something extraordinary.</p>
            <Link href="/catalogue">
              <Button className="bg-molten hover:bg-molten-ember text-white px-8 py-4 rounded-none uppercase tracking-widest font-semibold text-base">
                Browse Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const shipping = 9.99
  const total = state.total + shipping

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,82,255,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-3">Your Selection</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-[-0.04em] text-white">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-4 mt-5">
            <div className="w-16 h-[2px] bg-molten" />
            <p className="text-steel text-sm uppercase tracking-widest">{state.itemCount} item{state.itemCount !== 1 ? "s" : ""} loaded into print queue</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-4">
            <AnimatePresence>
              {state.items.map((item, index) => (
                <motion.div
                  key={`${item.id}`}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                  className="bg-obsidian border border-white/[0.06] card-ignite"
                >
                  <div className="flex gap-5 p-5">
                    <div className="hidden md:flex flex-col items-center gap-2 pt-1">
                      <span className="text-2xl font-heading font-bold text-white/10">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="w-[2px] flex-1 bg-white/5" />
                    </div>

                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-28 h-28 object-cover border border-white/10 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-heading font-bold text-white text-lg leading-tight">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-steel hover:text-molten transition-colors duration-150 shrink-0"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="border border-white/10 px-2 py-0.5 text-xs text-steel uppercase tracking-wider">
                          {item.material}
                        </span>
                        {item.color && item.color !== "" && item.color !== "#FF4500" && (
                          <span className="border border-white/10 px-2 py-0.5 text-xs text-steel uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5" style={{ backgroundColor: item.color }} />
                            Color
                          </span>
                        )}
                        {typeof item.id === "string" && item.id.includes("-") && (
                          <span className="border border-molten/30 px-2 py-0.5 text-xs text-molten uppercase tracking-wider">
                            Customized
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-white/10 flex items-center justify-center text-steel hover:text-white hover:border-molten/50 transition-colors duration-150"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-heading font-bold text-white w-8 text-center text-sm">
                            {String(item.quantity).padStart(2, "0")}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-white/10 flex items-center justify-center text-steel hover:text-white hover:border-molten/50 transition-colors duration-150"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-heading font-bold text-molten text-xl">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-steel">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link href="/catalogue" className="inline-flex items-center gap-2 text-molten hover:text-molten-ember text-sm uppercase tracking-widest transition-colors duration-150 mt-2">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:sticky lg:top-28"
          >
            <div className="bg-obsidian border border-white/[0.06] p-6">
              <h2 className="font-heading font-bold uppercase tracking-widest text-white text-sm mb-1">Order Summary</h2>
              <div className="w-12 h-[2px] bg-molten mb-6" />

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-steel">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span className="text-chrome">${state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Shipping</span>
                  <span className="text-chrome">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-steel">
                  <span>Tax</span>
                  <span className="text-chrome">Calculated at payment</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <span className="font-heading font-bold uppercase tracking-widest text-white">Total</span>
                  <span className="font-heading font-bold text-3xl text-molten">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-molten hover:bg-molten-ember text-white py-4 rounded-none uppercase tracking-widest font-semibold text-base group">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-150 group-hover:translate-x-1" />
                </Button>
              </Link>

              <p className="text-center text-xs text-steel mt-4 uppercase tracking-widest">
                Secure Stripe payments
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}