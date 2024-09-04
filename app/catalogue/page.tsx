"use client"

import { useState } from "react"
import productsData from "@/data/products.json"
import ProductCard, { type Product } from "@/app/components/product-card"

export default function CataloguePage() {
  const products = productsData as Product[]
  const [query, setQuery] = useState("")

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-white text-3xl font-bold mb-2">Catalogue</h1>
        <p className="text-white/60 mb-6">{filtered.length} products</p>
        <input
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-96 mb-8 bg-[#12121a] border border-white/10 text-white px-4 py-2 outline-none focus:border-orange-500"
        />
        {filtered.length === 0 ? (
          <p className="text-white/60">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}