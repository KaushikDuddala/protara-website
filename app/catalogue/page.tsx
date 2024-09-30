"use client"

import { useState } from "react"
import Link from "next/link"
import { useProducts } from "@/hooks/use-products"

/** Catalogue page - reads live products from Supabase, filtered by search + category chips. */
export default function CataloguePage() {
  const { products, loading } = useProducts()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  const filtered = products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === "all" || product.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-white text-3xl font-bold mb-1">Catalogue</h1>
        <p className="text-white/60 mb-8">Fresh off the printer, ready to ship.</p>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-72 bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 text-sm border transition-colors ${
                  category === cat
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#12121a] border border-white/10 animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 w-2/3" />
                  <div className="h-4 bg-white/5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/60">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="product-card group block bg-[#12121a] border border-white/10 hover:border-orange-500/60 transition-colors"
              >
                <div className="relative aspect-square overflow-hidden bg-[#0a0a0f]">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-orange-500">${product.price.toFixed(2)}</p>
                    <span className="text-xs uppercase tracking-wider text-white/50">{product.material}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}