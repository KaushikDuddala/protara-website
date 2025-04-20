"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronDown } from "lucide-react"

import { useProducts, type Product } from "@/hooks/use-products"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { usePinProgress } from "@/hooks/use-pin-progress"

import ImageCarousel from "./ui/image-carousel"

const TILE_W = 300
const TILE_H = 210
const GAP = 36
const STEP = TILE_W + GAP

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Pinned product showcase where items streak horizontally; featured item is highlighted in molten. */
export default function ProductShowcase() {
  const reduced = useReducedMotion()
  const { ref, progress } = usePinProgress()
  const router = useRouter()
  const { products, loading } = useProducts()
  const [vw, setVw] = useState(0)

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (reduced) return <StaticGrid products={products} loading={loading} />

  const pool = products.filter((p) => (Array.isArray(p.images) ? p.images.length > 0 : !!p.images))
  const stations: Product[] = (() => {
    if (pool.length === 0) return []
    const list = [...pool]
    while (list.length < 6) list.push(...pool)
    return list.slice(0, 10)
  })()

  const p = Math.min(1, Math.max(0, progress))
  const span = Math.max(1, stations.length - 1)
  const centerIdx = Math.min(stations.length - 1, Math.round(p * span))
  const translateX = p * span * STEP
  const half = Math.max(vw * 0.5, 200)

  return (
    <section data-major-section id="products" ref={ref} className="relative h-[300vh] bg-void">
      <div className="sticky top-0 h-screen overflow-hidden bg-void">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(255,69,0,0.06) 0%, transparent 55%)" }}
        />
        <div className="absolute inset-0 slicer-grid opacity-20 pointer-events-none" />

        <div className="absolute top-24 inset-x-0 container mx-auto px-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-molten text-sm uppercase tracking-[0.25em] mb-3">The Collection</p>
            <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-3xl md:text-5xl">
              Station, not shelf
            </h2>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="hud-label text-steel/70 flex items-center gap-2">
              SCROLL
              <ChevronDown className="h-3 w-3 animate-bounce" />
            </div>
          </div>
        </div>

        {vw > 0 && stations.length > 0 ? (
          <div>
            {stations.map((product, i) => {
              const x = i * STEP - translateX
              const dist = Math.abs(x)
              const scale = clamp(1.14 - (dist / half) * 0.35, 0.86, 1.14)
              const opacity = clamp(1.3 - (dist / (half * 1.4)), 0, 1)
              const blur = clamp(dist / half - 0.35, 0, 2.5)
              const rot = clamp(-x / 60, -9, 9)
              const bob = Math.sin(i * 0.9 + p * Math.PI * 2) * 20
              const featured = i === centerIdx
              const image = Array.isArray(product.images) ? product.images[0] : product.images || "/placeholder.svg"
              const carouselImages = Array.isArray(product.images) ? product.images : [product.images || "/placeholder.svg"]

              return (
                <div
                  key={`${product.id}-${i}`}
                  onClick={() => router.push(`/product/${product.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      router.push(`/product/${product.id}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  data-cursor="view"
                  aria-label={`View ${product.name}`}
                  className="absolute left-1/2 top-[46%] outline-none cursor-pointer"
                  style={{
                    transform: `translate(-50%, -50%) translate(${x}px, ${bob}px) rotate(${rot}deg) scale(${scale})`,
                    opacity,
                    filter: blur > 0 ? `blur(${blur}px)` : "none",
                    zIndex: Math.round(100 - dist),
                    transformOrigin: "50% 50%",
                    willChange: "transform, opacity",
                  }}
                >
                  <div
                    className="relative overflow-hidden bg-obsidian"
                    style={{
                      width: TILE_W,
                      height: TILE_H,
                      border: featured ? "1.5px solid #FF4500" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: featured
                        ? "0 0 60px -10px rgba(255,69,0,0.55), 0 0 0 1px rgba(255,69,0,0.3)"
                        : "0 30px 60px -30px rgba(0,0,0,0.8)",
                    }}
                  >
                    <ImageCarousel
                      images={carouselImages}
                      alt={product.name}
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-void/90 text-chrome text-[10px] px-2 py-1 uppercase tracking-widest rounded-none border border-white/10">
                      {product.category || "OBJECT"}
                    </span>
                    {featured && (
                      <span className="absolute bottom-3 left-3 bg-molten text-white text-[10px] px-2 py-1 uppercase tracking-widest rounded-none">
                        NOW PRINTING
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="absolute left-1/2 -translate-x-1/2 bottom-24 container mx-auto px-4 pointer-events-none">
              <div className="flex flex-col items-center text-center">
                <h3 className="font-heading font-bold uppercase tracking-[-0.01em] text-white text-xl md:text-3xl line-clamp-1">
                  {stations[centerIdx].name}
                </h3>
                <div className="flex items-center gap-6 mt-3">
                  <span className="text-steel text-base md:text-xl font-semibold uppercase tracking-widest">
                    {stations[centerIdx].category}
                  </span>
                  <span className="text-molten text-base md:text-xl font-bold uppercase tracking-widest">
                    $ {stations[centerIdx].price}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0">
              <div className="container mx-auto px-4 pb-8">
                <div className="relative">
                  <div className="h-[2px] w-full bg-white/[0.06]" />
                  <div className="absolute -top-[2px] left-0 h-[2px] bg-molten" style={{ width: `${Math.round(p * 100)}%` }} />
                  {stations.map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 h-3 w-px"
                      style={{
                        left: `${(i / span) * 100}%`,
                        background: i <= centerIdx ? "#FF4500" : "rgba(200,200,212,0.25)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : loading || vw === 0 || stations.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-[300px] h-[210px] bg-white/[0.03] border border-white/[0.06] animate-pulse" />
              ))}
            </div>
            <p className="absolute bottom-24 hud-label text-steel/70">LOADING COLLECTION…</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Static grid fallback for reduced-motion users. */
function StaticGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  const router = useRouter()

  return (
    <section data-major-section id="products" className="py-28 bg-void relative">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">The Collection</p>
          <h2 className="font-heading font-bold uppercase tracking-[-0.03em] text-white text-4xl md:text-5xl">
            Product Showcase
          </h2>
          <div className="w-14 h-[2px] bg-molten mx-auto mt-6" />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/[0.04] rounded-none h-64 mb-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const image = Array.isArray(product.images) ? product.images[0] : product.images || "/placeholder.svg"
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      router.push(`/product/${product.id}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  data-cursor="view"
                  className="group text-left bg-obsidian border border-white/[0.06] rounded-none overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-molten/40 hover:shadow-[0_0_40px_-12px_rgba(255,69,0,0.35)]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageCarousel
                      images={Array.isArray(product.images) ? product.images : [product.images || "/placeholder.svg"]}
                      alt={product.name}
                      className="w-full h-64"
                      imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-4 left-4 bg-molten text-white text-xs px-2.5 py-1 uppercase tracking-widest rounded-none">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-6 flex justify-between items-center">
                    <h3 className="text-lg font-heading font-bold text-white leading-snug line-clamp-1">{product.name}</h3>
                    <span className="text-xl font-heading font-bold text-molten shrink-0 ml-4">${product.price}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-14">
          <Link href="/catalogue">
            <span className="inline-flex items-center gap-2 border border-white/15 text-chrome hover:text-white hover:bg-white/5 px-8 py-4 rounded-none uppercase tracking-widest text-sm transition-colors">
              View Full Catalogue
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}