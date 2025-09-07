"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/app/components/navigation"
import { useProducts } from "@/hooks/use-products"
import { HandHeart, ArrowRight } from "lucide-react"

const fundraiserProductIds = [4, 5]

function FundraiserProductCard({ product }: { product: import("@/hooks/use-products").Product }) {
  const images = Array.isArray(product.images) ? product.images : [product.images || "/placeholder.svg"]
  const [galleryIndex, setGalleryIndex] = useState(0)

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGalleryIndex(galleryIndex === 0 ? images.length - 1 : galleryIndex - 1)
  }
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGalleryIndex(galleryIndex === images.length - 1 ? 0 : galleryIndex + 1)
  }

  return (
    <div className="bg-obsidian border border-white/[0.06] hover:border-green-500/30 transition-colors p-6 flex flex-col items-center">
      <div className="relative overflow-hidden w-full flex items-center justify-center mb-4" style={{ height: "300px" }}>
        <div className="absolute inset-0 bg-white/[0.02] z-0" />
        <button
          aria-label="Previous image"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-obsidian/90 border border-white/10 hover:border-green-500/40 p-1"
          style={{ display: images.length > 1 ? "block" : "none" }}
        >
          <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img
          src={images[galleryIndex] || "/placeholder.svg"}
          alt={product.name}
          className="w-72 h-72 object-cover flex-shrink-0 transition-transform duration-300 z-10"
          style={{ maxWidth: "100%" }}
        />
        <button
          aria-label="Next image"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-obsidian/90 border border-white/10 hover:border-green-500/40 p-1"
          style={{ display: images.length > 1 ? "block" : "none" }}
        >
          <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {images.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_: string, idx: number) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-none ${idx === galleryIndex ? "bg-molten" : "bg-green-500/30"}`}
              />
            ))}
          </div>
        )}
      </div>
      <h3 className="text-xl font-heading font-bold uppercase tracking-[-0.02em] text-white mb-2 text-center">{product.name}</h3>
      <p className="text-steel mb-2 text-center leading-relaxed">{product.description}</p>
      <div className="text-lg font-heading font-bold text-molten mb-4">${product.price}</div>
      <Link href={`/product/${product.id}`}>
        <Button className="bg-molten hover:bg-molten-ember text-white font-semibold px-6 py-2 rounded-none uppercase tracking-widest">View & Support</Button>
      </Link>
    </div>
  )
}

/** Fundraiser page - featured products supporting the Food Lounge. */
export default function FundraiserPage() {
  const { products: productsData, loading } = useProducts()
  const fundraiserProducts = useMemo(
    () => productsData.filter(p => fundraiserProductIds.includes(p.id)),
    [productsData]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-void text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-40 text-center">
          <p className="text-steel uppercase tracking-widest text-sm">Loading fundraiser products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,255,0,0.04) 0%, transparent 55%)", height: "420px", width: "100%" }} />
      <div className="w-full pt-16" />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 border border-green-500/25">
              <HandHeart className="h-10 w-10 text-green-400" />
            </div>
          </div>
          <p className="text-green-400 text-sm uppercase tracking-[0.25em] mb-4">Good Cause · 100% of Proceeds</p>
          <h1 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-4xl md:text-6xl mb-3">Food Lounge Fundraiser</h1>
          <h2 className="text-xl font-semibold text-molten mb-4">Support our mission to fight food insecurity!</h2>
          <p className="max-w-2xl mx-auto text-lg text-chrome leading-relaxed mb-6">
            The Food Lounge is a non-profit dedicated to helping people facing food insecurity. Every purchase from this page directly supports our programs, providing meals and resources to those in need. <span className="font-bold text-green-400">100% of proceeds</span> go to the Food Lounge.
          </p>
          <div className="mb-6">
            <Link href="https://thefoodlounge.org" target="_blank" className="underline underline-offset-4 text-molten hover:text-molten-ember font-semibold">Learn more about the Food Lounge</Link>
          </div>
          <div className="w-14 h-[2px] bg-molten mx-auto" />
        </div>
        <div className="pt-10 mb-12">
          <h2 className="text-2xl font-heading font-bold uppercase tracking-[-0.02em] text-white text-center mb-6">Featured Fundraiser Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {fundraiserProducts.map(product => (
              <FundraiserProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <div className="max-w-2xl mx-auto text-center mt-16 p-8 bg-obsidian border border-green-500/15 hover:border-green-500/30 transition-colors">
          <h2 className="text-xl font-heading font-bold uppercase tracking-[-0.02em] text-white mb-2">Where Your Support Goes</h2>
          <p className="text-chrome leading-relaxed mb-4">Every dollar raised helps us provide nutritious meals, groceries, and support services to families and individuals in need. Your contribution makes a real difference in our community!</p>
          <div className="text-molten font-semibold flex items-center justify-center gap-2">Thank you for supporting the Food Lounge! <ArrowRight className="h-4 w-4" /></div>
        </div>
      </div>
    </div>
  )
}