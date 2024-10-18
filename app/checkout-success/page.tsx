"use client"

import { useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import Navigation from "@/app/components/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Printer } from "lucide-react"
import { motion } from "framer-motion"

/** Checkout success - confirmation screen that clears the cart. */
export default function CheckoutSuccess() {
  const { dispatch } = useCart()

  useEffect(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [dispatch])

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(34,197,94,0.06) 0%, transparent 50%)", height: "400px", width: "100%" }} />

      <div className="relative container mx-auto px-4 flex items-center justify-center pt-40 pb-28 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-obsidian border border-green-500/20 p-10 rounded-none text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          >
            <div className="w-20 h-20 bg-green-900/30 border border-green-500/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </motion.div>
          <p className="text-green-400 text-sm uppercase tracking-[0.25em] mb-4">Confirmed</p>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-[-0.02em] mb-4">
            Your order has been confirmed!
          </h1>
          <p className="text-lg mb-3 text-chrome">A receipt has been sent to your email.</p>
          <p className="text-steel mb-8">Thank you for shopping with Protara. Your print is already queued for the machines.</p>
          <div className="flex items-center justify-center gap-2 text-steel text-xs uppercase tracking-widest mb-8">
            <Printer className="h-4 w-4 text-molten" />
            Estimated production begins within 24 hours
          </div>
          <Link href="/account">
            <Button className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold py-4 group">
              View Order History
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-150 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}