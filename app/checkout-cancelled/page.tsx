"use client"

import { motion } from "framer-motion"
import Navigation from "@/app/components/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Phone, ArrowLeft } from "lucide-react"

/** Checkout cancelled - confirmation of an abandoned or failed payment. */
export default function CheckoutCancelled() {
  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "350px", width: "100%" }} />

      <div className="relative container mx-auto px-4 flex items-center justify-center pt-40 pb-28 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-obsidian border border-white/10 p-10 rounded-none text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-900/30 border border-red-500/40 flex items-center justify-center mx-auto mb-6">
            <span className="font-heading font-bold text-4xl text-red-400">!</span>
          </div>
          <p className="text-red-400 text-sm uppercase tracking-[0.25em] mb-4">Interrupted</p>
          <h1 className="text-3xl font-heading font-bold uppercase tracking-[-0.02em] mb-4">
            Payment Unsuccessful
          </h1>
          <p className="text-chrome mb-6">Your payment was not completed or was cancelled.</p>
          <div className="text-steel text-sm mb-6">
            If you believe this is a mistake or need help, please contact us:
          </div>
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-molten" />
              <span className="text-chrome font-semibold">Email: </span>
              <a href="mailto:protaraprinting@gmail.com" className="text-molten hover:text-molten-ember underline underline-offset-4 transition-colors duration-150">
                support@protaraprinting.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-molten" />
              <span className="text-chrome font-semibold">Phone: </span>
              <a href="tel:+14698277605" className="text-molten hover:text-molten-ember underline underline-offset-4 transition-colors duration-150">
                +1 (469) 827-7605
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/cart">
              <Button className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold">
                Return to Cart
              </Button>
            </Link>
            <Link href="/catalogue" className="inline-flex items-center justify-center gap-1 text-steel hover:text-molten text-sm uppercase tracking-widest transition-colors duration-150">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}