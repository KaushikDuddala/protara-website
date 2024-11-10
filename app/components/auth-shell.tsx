"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import Navigation from "@/app/components/navigation"

interface AuthShellProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
}

/** Two-column layout for auth pages: decorative branding panel on the left, form card on the right. */
export default function AuthShell({ title, subtitle, icon, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/4 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.06) 0%, transparent 50%)", height: "400px", width: "600px" }} />
      <div className="absolute bottom-0 right-1/4 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,82,255,0.06) 0%, transparent 50%)", height: "400px", width: "600px" }} />

      <div className="relative container mx-auto px-4 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto items-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hidden lg:flex flex-col justify-start"
          >
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Protara Printworks</p>
            <div className="font-heading font-bold uppercase tracking-[-0.04em] leading-[0.95] text-6xl xl:text-7xl">
              <span className="text-white">Built Layer</span>
              <br />
              <span className="text-white/10">by</span>
              <br />
              <span className="text-white">PROTARA</span>
            </div>
            <div className="w-24 h-[2px] bg-molten mt-6" />
            <p className="text-steel mt-6 max-w-sm leading-relaxed">
              Engineered with precision. Printed with obsession. The future of custom manufacturing is one layer at a time.
            </p>

            <div className="relative mt-12 h-40">
              <div className="absolute left-0 w-24 h-24 border border-molten/40 rotate-12" />
              <div className="absolute left-16 top-8 w-24 h-24 border border-resonance/40 -rotate-12" />
              <div className="absolute left-32 top-2 w-10 h-10 bg-molten/20 border border-molten/50" />
              <div className="absolute left-2 top-16 w-3 h-3 bg-molten" />
              <div className="absolute left-44 top-16 w-2 h-2 bg-resonance" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="max-w-md mx-auto w-full"
          >
            <div className="bg-obsidian border border-white/10 p-8">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-molten/10 border border-molten/30 flex items-center justify-center">
                  {icon}
                </div>
              </div>
              <h1 className="text-2xl font-heading font-bold uppercase tracking-[-0.02em] text-white text-center">
                {title}
              </h1>
              <p className="text-steel text-sm mt-1 text-center mb-8">{subtitle}</p>
              <div className="w-12 h-[2px] bg-molten mx-auto mb-8" />

              {children}

              <div className="mt-6 text-center">
                <Link href="/" className="text-steel hover:text-molten text-sm flex items-center justify-center gap-1 transition-colors duration-150">
                  <ArrowLeft className="h-3 w-3" /> Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}