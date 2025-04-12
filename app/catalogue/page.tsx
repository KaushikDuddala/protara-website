"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Filter, ChevronLeft, ChevronRight, Users, Search } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/hooks/use-products"
import Navigation from "../components/navigation"
import ReviewStats from "../components/review-stats"

/** Catalogue page - filterable, searchable, paginated product grid. */
export default function CataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMaterial, setSelectedMaterial] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { dispatch } = useCart()
  const { products: productsData, loading } = useProducts()

  const PRODUCTS_PER_PAGE = 12

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPage])

  const filteredProducts = productsData.filter((product) => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory
    const materialMatch = selectedMaterial === "all" || product.material === selectedMaterial
    const searchMatch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && materialMatch && searchMatch
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  const categories = ["all", ...Array.from(new Set(productsData.map((p) => p.category)))]
  const materials = ["all", ...Array.from(new Set(productsData.map((p) => p.material)))]

  const addToCart = (product: (typeof productsData)[0]) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        material: product.material,
        category: product.category,
        image: Array.isArray(product.images) ? product.images[0] : product.images,
        description: product.description,
        color: "#FF4500",
      },
    })
  }

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,82,255,0.05) 0%, transparent 55%)", height: "400px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-28">
        <div className="text-center mb-14">
          <p className="text-molten text-sm uppercase tracking-[0.25em] mb-4">The Collection</p>
          <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase tracking-[-0.04em] text-white mb-6">
            Full Product Catalogue
          </h1>
          <p className="text-steel text-lg max-w-xl mx-auto">Browse our complete collection of 3D printed products.</p>
          <div className="w-14 h-[2px] bg-molten mx-auto mt-6" />
        </div>

        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-void/80 backdrop-blur-xl border-b border-white/[0.06] mb-10">
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-center">
            <div className="bg-obsidian border border-white/10 rounded-none px-4 py-2 flex items-center gap-2 w-full max-w-xs">
              <Search className="h-4 w-4 text-steel shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="Search products..."
                className="bg-transparent outline-none text-white placeholder:text-steel text-sm w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1) }}>
                <SelectTrigger className="w-44 bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-white/10 rounded-none">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-white/5 focus:bg-white/5">
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMaterial} onValueChange={(value) => { setSelectedMaterial(value); setCurrentPage(1) }}>
                <SelectTrigger className="w-44 bg-obsidian border-white/10 text-white rounded-none">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent className="bg-obsidian border-white/10 rounded-none">
                  {materials.map((material) => (
                    <SelectItem key={material} value={material} className="text-white hover:bg-white/5 focus:bg-white/5">
                      {material === "all" ? "All Materials" : material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/[0.04] h-64 mb-4 rounded-none"></div>
                <div className="h-5 bg-white/[0.04] w-3/4 mb-2"></div>
                <div className="h-3 bg-white/[0.04] w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const images = Array.isArray(product.images) ? product.images : [product.images || "/placeholder.svg"]
                return (
                  <div
                    key={product.id}
                    data-cursor="view"
                    className="product-card group cursor-pointer"
                    onClick={() => window.location.href = `/product/${product.id}`}
                  >
                    <div className={`bg-obsidian border rounded-none overflow-hidden h-full flex flex-col transition-all duration-200 hover:-translate-y-1 ${product.community_designed ? "border-green-500/40" : "border-white/[0.06] hover:border-molten/40 hover:shadow-[0_0_40px_-12px_rgba(255,69,0,0.35)]"}`}>
                      <div className="relative h-56 overflow-hidden shrink-0">
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-56 object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                        <span className="absolute top-3 left-3 bg-molten text-white text-xs px-2.5 py-1 uppercase tracking-widest rounded-none">{product.category}</span>
                        {product.community_designed && (
                          <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2.5 py-1 uppercase tracking-widest rounded-none flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Community
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-heading font-bold text-white mb-1.5 line-clamp-2 leading-tight min-h-[2.6rem]">{product.name}</h3>
                        <ReviewStats productId={product.id} />
                        <p className="text-steel text-sm mb-4 line-clamp-3 leading-snug mt-1">{product.description}</p>
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-xl font-heading font-bold text-molten">${product.price}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="border border-white/10 text-steel text-xs px-2.5 py-1 uppercase tracking-widest rounded-none">
                              {product.material}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); addToCart(product) }}
                              className="bg-molten hover:bg-molten-ember text-white px-4 py-2 rounded-none uppercase tracking-widest text-xs font-semibold transition-colors"
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <ShoppingCart className="h-3 w-3" />
                                Add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-obsidian border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Filter className="h-8 w-8 text-steel" />
                </div>
                <p className="text-chrome text-lg font-heading font-bold mb-2">No products found</p>
                <p className="text-steel">Try adjusting your filters or search.</p>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 bg-obsidian text-chrome hover:border-molten/50 hover:text-white transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none rounded-none"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-heading font-bold rounded-none transition-all duration-150 ${
                        currentPage === i + 1
                          ? "bg-molten text-white"
                          : "border border-white/10 bg-obsidian text-steel hover:text-white hover:border-molten/50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 bg-obsidian text-chrome hover:border-molten/50 hover:text-white transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none rounded-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}