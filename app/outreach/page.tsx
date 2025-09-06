"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/app/components/navigation"
import { useProducts } from "@/hooks/use-products"
import { Package, Rocket, GraduationCap, ExternalLink, DollarSign } from "lucide-react"

const fundraiserProductIds = [4, 5]

function OutreachFundraiserCard({ product }: { product: import("@/hooks/use-products").Product }) {
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
    <div className="bg-obsidian border border-white/[0.08] p-4 flex-shrink-0 w-72 transition-colors hover:border-green-500/30">
      <div className="relative overflow-hidden w-full flex items-center justify-center mb-3" style={{ height: "220px" }}>
        <div className="absolute inset-0 bg-white/[0.02] z-0" />
        <button
          aria-label="Previous image"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-obsidian/90 border border-white/10 hover:border-green-500/40 p-1"
          style={{ display: images.length > 1 ? "block" : "none" }}
        >
          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <img
          src={images[galleryIndex] || "/placeholder.svg"}
          alt={product.name}
          className="w-48 h-48 object-cover flex-shrink-0 transition-transform duration-300 z-10"
          style={{ maxWidth: "100%" }}
        />
        <button
          aria-label="Next image"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-obsidian/90 border border-white/10 hover:border-green-500/40 p-1"
          style={{ display: images.length > 1 ? "block" : "none" }}
        >
          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_: string, idx: number) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-none ${idx === galleryIndex ? "bg-molten" : "bg-green-500/30"}`}
              />
            ))}
          </div>
        )}
      </div>
      <h4 className="text-lg font-heading font-bold text-white mb-1 text-center truncate">{product.name}</h4>
      <div className="text-lg font-heading font-bold text-molten mb-2 text-center">${product.price}</div>
      <Link href={`/product/${product.id}`} className="block text-center">
        <Button className="bg-molten hover:bg-molten-ember text-white font-semibold px-4 py-1 text-sm rounded-none uppercase tracking-widest w-full">View & Support</Button>
      </Link>
    </div>
  )
}

/** Outreach page - projects covering the fundraiser, STEM Boxes, and creator program. */
export default function OutreachPage() {
  const { products: productsData, loading } = useProducts()
  const fundraiserProducts = useMemo(
    () => productsData.filter(p => fundraiserProductIds.includes(p.id)),
    [productsData]
  )

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
          <div className="text-center mb-16">
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">Community</p>
            <h1 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-4xl md:text-6xl mb-4">
              Our Outreach Projects
            </h1>
            <p className="text-lg text-steel max-w-3xl mx-auto leading-relaxed">
              At Protara, we believe in using our skills and resources to make a difference. 
              From fundraising for food insecurity to inspiring the next generation of engineers 
              through hands-on STEM education, here are the projects we&apos;re proud to support.
            </p>
            <div className="w-14 h-[2px] bg-molten mx-auto mt-8" />
          </div>

          <div className="bg-obsidian border border-green-500/15 p-8 md:p-12 mb-12 hover:border-green-500/30 transition-colors">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 border border-green-500/30" >
                    <Package className="h-6 w-6 text-green-400" />
                  </div>
                  <h2 className="font-heading font-bold uppercase tracking-[-0.02em] text-2xl md:text-3xl text-white">Food Lounge Fundraiser</h2>
                </div>
                <p className="text-lg text-chrome leading-relaxed mb-4">
                  We&apos;re partnering with the Food Lounge, a non-profit dedicated to fighting food insecurity. 
                  Every purchase from this fundraiser directly supports their programs, providing meals and 
                  resources to those in need. <span className="font-bold text-green-400">100% of proceeds</span> go to the cause.
                </p>
                <Link href="https://thefoodlounge.org" target="_blank" className="text-molten hover:text-molten-ember font-semibold underline underline-offset-4 inline-flex items-center gap-1 mb-4">
                  Learn about the Food Lounge <ExternalLink className="h-4 w-4" />
                </Link>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/fundraiser">
                    <Button className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold">
                      View Full Fundraiser
                    </Button>
                  </Link>
                  <Link href="https://thefoodlounge.org" target="_blank">
                    <Button variant="outline" className="border-green-500/40 text-green-400 hover:bg-green-500/10 rounded-none uppercase tracking-widest">
                      Donate Directly
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0 w-full lg:w-auto">
                {loading ? (
                  <div className="flex gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse bg-obsidian border border-white/[0.08] p-4 flex-shrink-0 w-72">
                        <div className="bg-white/[0.04] h-48 mb-3"></div>
                        <div className="h-5 bg-white/[0.04] rounded-none w-3/4 mb-2 mx-auto"></div>
                        <div className="h-5 bg-white/[0.04] rounded-none w-1/3 mb-3 mx-auto"></div>
                        <div className="h-8 bg-white/[0.04] rounded-none w-2/3 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {fundraiserProducts.map(product => (
                      <OutreachFundraiserCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-obsidian border border-white/[0.06] p-8 md:p-12 mb-12">
            <div className="flex items-start gap-6">
              <div className="p-4 border border-white/10 hidden md:block">
                <GraduationCap className="h-8 w-8 text-molten" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 border border-white/10 md:hidden">
                    <Rocket className="h-6 w-6 text-molten" />
                  </div>
                  <h2 className="font-heading font-bold uppercase tracking-[-0.02em] text-2xl md:text-3xl text-white">
                    STEM Boxes for Kids
                  </h2>
                </div>
                <p className="text-lg text-chrome leading-relaxed mb-4">
                  We&apos;re launching an initiative to provide hands-on STEM learning kits to kids in our community. 
                  Each box contains all the parts, tools, and step-by-step instructions needed to build something 
                  amazing - from simple circuits to motorized machines. It&apos;s our way of inspiring the next 
                  generation of engineers, designers, and creators.
                </p>
                <p className="text-steel leading-relaxed mb-6">
                  Every box is designed to teach real engineering concepts through fun, engaging projects. 
                  No prior experience needed - just curiosity and a desire to build!
                </p>
                <Link href="/outreach/stem-boxes">
                  <Button className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold">
                    <Rocket className="h-4 w-4 ml-2" />
                    Learn More About STEM Boxes
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-obsidian border border-white/[0.06] p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="p-4 border border-green-500/20 hidden md:block">
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 border border-green-500/20 md:hidden">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <h2 className="font-heading font-bold uppercase tracking-[-0.02em] text-2xl md:text-3xl text-white">
                    Earn Money With Your Designs
                  </h2>
                </div>
                <p className="text-lg text-chrome leading-relaxed mb-4">
                  Have a 3D model you think others would love? We&apos;re launching a program where
                  community members can submit their own product designs to be sold on Protara.
                  If your design is selected, you&apos;ll earn a commission on every sale.
                </p>
                <p className="text-steel leading-relaxed mb-4">
                  Currently, we&apos;re accepting submissions via email. Simply send us your STL or STEP
                  files along with a description, suggested price, and any customization options
                  you&apos;d like to offer. Our team will review your design and get back to you.
                </p>
                <div className="bg-white/[0.02] border border-white/[0.08] p-4 mb-6">
                  <p className="text-chrome font-medium mb-1">How to submit:</p>
                  <ol className="text-steel text-sm space-y-1 list-decimal list-inside">
                    <li>Prepare your 3D model files (STL or STEP format)</li>
                    <li>Write a short description and suggested price</li>
                    <li>Email everything to <a href="mailto:creators@protaraprinting.com" className="text-molten hover:text-molten-ember font-medium">creators@protaraprinting.com</a></li>
                    <li>Our team reviews and responds within 1-2 weeks</li>
                  </ol>
                </div>
                <p className="text-steel/70 text-sm leading-relaxed">
                  All submitted designs must be original work. By submitting, you agree to our
                  creator terms. Selected designs will be featured with a &quot;Community Design&quot; badge
                  on our catalogue.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}