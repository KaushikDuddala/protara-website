"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/app/components/navigation"
import { Rocket, ArrowLeft, Lightbulb, Wrench, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/hooks/use-products"

interface StemBoxEntry {
  id: number
  product_id: number
  products: Product
}

const difficultyLabels = ["Beginner", "Intermediate", "Advanced"]
const ageLabels = ["8+", "10+", "12+"]

/** STEM Boxes page - available STEM learning kits with add-to-cart. */
export default function StemBoxesPage() {
  const [entries, setEntries] = useState<StemBoxEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { dispatch } = useCart()

  useEffect(() => {
    fetch("/api/stem-boxes")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setEntries(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 55%)", height: "420px", width: "100%" }} />
      <div className="container mx-auto px-4 pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link href="/outreach" className="inline-flex items-center gap-1 text-steel hover:text-molten mb-8 transition-colors uppercase tracking-widest text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Outreach
          </Link>

          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 border border-molten/25">
                <Rocket className="h-12 w-12 text-molten" />
              </div>
            </div>
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Education Initiative</p>
            <h1 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-4xl md:text-6xl mb-4">
              STEM Boxes for Kids
            </h1>
            <p className="text-xl text-steel max-w-3xl mx-auto leading-relaxed">
              Hands-on learning kits that teach real engineering through building, experimenting, and play.
            </p>
            <div className="w-14 h-[2px] bg-molten mx-auto mt-8" />
          </div>

          <div className="bg-obsidian border border-white/[0.06] p-8 md:p-12 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading font-bold uppercase tracking-[-0.02em] text-2xl md:text-3xl text-molten mb-6">Our Mission</h2>
              <p className="text-lg text-chrome leading-relaxed mb-6">
                We believe every kid should have the opportunity to discover the joy of building and creating. 
                Our STEM Boxes are designed to make engineering accessible, fun, and educational. Each box 
                contains everything needed to complete a project - no extra tools or trips to the store required.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/[0.02] p-6 border border-white/[0.08] text-center">
                  <Lightbulb className="h-8 w-8 text-molten mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Learn by Doing</h3>
                  <p className="text-steel text-sm leading-relaxed">Real projects that teach real concepts in physics, electronics, and programming.</p>
                </div>
                <div className="bg-white/[0.02] p-6 border border-white/[0.08] text-center">
                  <Wrench className="h-8 w-8 text-molten mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Everything Included</h3>
                  <p className="text-steel text-sm leading-relaxed">Parts, tools, and step-by-step instructions in every box. Just open and build.</p>
                </div>
                <div className="bg-white/[0.02] p-6 border border-white/[0.08] text-center">
                  <Rocket className="h-8 w-8 text-molten mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Build Confidence</h3>
                  <p className="text-steel text-sm leading-relaxed">Each completed project builds skills and confidence to take on bigger challenges.</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="font-heading font-bold uppercase tracking-[-0.02em] text-2xl md:text-3xl text-molten mb-8 text-center">Available Kits</h2>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-obsidian p-6 border border-white/[0.08]">
                  <div className="bg-white/[0.04] h-10 w-10 mb-4"></div>
                  <div className="h-6 bg-white/[0.04] rounded-none w-3/4 mb-3"></div>
                  <div className="h-4 bg-white/[0.04] rounded-none w-1/3 mb-3"></div>
                  <div className="h-4 bg-white/[0.04] rounded-none mb-2"></div>
                  <div className="h-4 bg-white/[0.04] rounded-none w-2/3"></div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 mb-12">
              <p className="text-steel text-lg">No STEM Box kits available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {entries.map((entry, index) => {
                const product = entry.products
                const kitIndex = index % 3
                const images = Array.isArray(product.images) ? product.images : [product.images || "/placeholder.svg"]

                return (
                  <div key={entry.id} className="bg-obsidian border border-white/[0.06] p-6 hover:border-molten/40 hover:-translate-y-1 transition-colors duration-200 flex flex-col hover:shadow-[0_0_40px_-12px_rgba(255,69,0,0.35)]">
                    <div className="relative w-full h-48 mb-4 overflow-hidden bg-white/[0.02]">
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-heading font-bold uppercase tracking-[-0.02em] text-white mb-2">{product.name}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 border border-molten/30 text-molten uppercase tracking-widest">{difficultyLabels[kitIndex]}</span>
                      <span className="text-xs px-2 py-0.5 border border-white/10 text-steel uppercase tracking-widest">Ages {ageLabels[kitIndex]}</span>
                    </div>
                    <p className="text-steel text-sm flex-1 mb-4 leading-relaxed">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-heading font-bold text-molten">${product.price}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          dispatch({
                            type: "ADD_ITEM",
                            payload: {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              material: product.material,
                              category: product.category,
                              image: images[0],
                              description: product.description,
                              color: "#FF4500",
                            },
                          })
                        }}
                        className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold"
                      >
                        <ShoppingCart className="h-4 w-4 ml-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="bg-obsidian border border-molten/20 p-8 md:p-12 text-center">
            <h2 className="font-heading font-bold uppercase tracking-[-0.02em] text-2xl md:text-3xl text-white mb-4">Get Involved</h2>
            <p className="text-lg text-steel max-w-2xl mx-auto mb-6 leading-relaxed">
              We&apos;re seeking partners and sponsors to help us bring STEM Boxes to schools and community centers. 
              If you&apos;d like to support this initiative, reach out - together we can inspire the next generation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact">
                <Button className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold">
                  Contact Us
                </Button>
              </Link>
              <Link href="/outreach">
                <Button variant="outline" className="border-white/10 text-chrome hover:text-white hover:bg-white/5 hover:border-white/25 rounded-none uppercase tracking-widest">
                  Back to Outreach
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}