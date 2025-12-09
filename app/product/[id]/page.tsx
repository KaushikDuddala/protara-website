"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { notFound, useParams, useRouter } from "next/navigation"
import Navigation from "@/app/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useProducts, type Product } from "@/hooks/use-products"
import ImageCarousel from "@/app/components/ui/image-carousel"
import ReviewsList from "@/app/components/reviews-list"
import ReviewForm from "@/app/components/review-form"
import ReviewStats from "@/app/components/review-stats"
import { ChevronLeft, ShoppingCart, Users } from "lucide-react"

/** Product detail page - gallery, specs, customization, and reviews for a product. */
export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { products: productsData, loading } = useProducts()
  const { dispatch } = useCart()
  const [customizationState, setCustomizationState] = useState<{ [key: string]: string }>({})
  const [refreshReviews, setRefreshReviews] = useState(0)

  const product = useMemo(() =>
    productsData.find((p) => String(p.id) === params.id),
    [productsData, params.id]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-void text-white">
        <Navigation />
        <div className="container mx-auto px-4 pt-36 animate-pulse">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/[0.04] h-96 rounded-none"></div>
            <div>
              <div className="h-10 bg-white/[0.04] w-2/3 mb-6"></div>
              <div className="h-4 bg-white/[0.04] w-1/2 mb-4"></div>
              <div className="h-4 bg-white/[0.04] w-full mb-2"></div>
              <div className="h-4 bg-white/[0.04] w-5/6 mb-8"></div>
              <div className="h-12 bg-white/[0.04] w-48"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return notFound()

  const images = Array.isArray(product.images) ? product.images : [product.images || "/placeholder.svg"]

  const getCustomizedPrice = () => {
    let price = product.price
    if (product.customizations) {
      for (const cust of product.customizations) {
        if (customizationState[cust.type] && cust.priceDelta) {
          price += cust.priceDelta[customizationState[cust.type]] || 0
        }
      }
    }
    return price
  }

  const getCustomizationId = () => {
    if (!product.customizations) return product.id
    return `${product.id}-${Object.entries(customizationState).map(([k, v]) => `${k}:${v}`).join("-")}`
  }

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,82,255,0.06) 0%, transparent 50%)", height: "400px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-24">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onClick={() => router.push("/catalogue")}
          className="flex items-center gap-2 text-steel hover:text-molten transition-colors duration-150 text-sm mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Catalogue
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full bg-obsidian border border-white/[0.06] overflow-hidden"
          >
            <ImageCarousel
              images={images}
              alt={product.name}
              className="w-full aspect-square"
              imageClassName="w-full h-full object-cover"
              slideDuration={300}
              showDots={true}
              showArrows={true}
            />
            <Badge className="absolute top-4 left-4 bg-molten text-white z-10 rounded-none">{product.category}</Badge>
            {product.community_designed && (
              <Badge className="absolute top-4 right-4 bg-green-600 text-white z-10 rounded-none flex items-center gap-1">
                <Users className="h-3 w-3" />
                Community Design
              </Badge>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <p className="text-molten text-sm uppercase tracking-[0.2em] mb-2">Protara Printworks</p>
            <h1 className="text-3xl md:text-5xl font-heading font-bold uppercase tracking-[-0.03em] text-white mb-4">
              {product.name}
            </h1>
            <ReviewStats productId={product.id} />

            <div className="flex flex-wrap gap-x-8 gap-y-2 py-4 my-4 border-y border-white/[0.06] text-sm">
              <div className="text-steel">Category: <span className="font-semibold text-white">{product.category}</span></div>
              <div className="text-steel">Material: <span className="font-semibold text-white">{product.material}</span></div>
            </div>

            <div className="text-3xl md:text-4xl font-heading font-bold text-molten mb-6">${getCustomizedPrice()}</div>
            <p className="mb-6 text-chrome leading-relaxed">{product.description}</p>

            {product.detailedDescription && (
              <div className="mb-6 text-chrome">
                <h2 className="text-lg font-heading font-bold mb-2 text-white uppercase tracking-wide">Details</h2>
                <p className="leading-relaxed">{product.detailedDescription}</p>
              </div>
            )}

            {product.specifications && (
              <div className="mb-6 text-chrome">
                <h2 className="text-lg font-heading font-bold mb-3 text-white uppercase tracking-wide">Specifications</h2>
                <div className="border border-white/[0.06] divide-y divide-white/[0.06]">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between px-4 py-3 text-sm">
                      <span className="capitalize text-steel">{key}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.customizations && product.customizations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-heading font-bold mb-3 text-white uppercase tracking-wide">Customize Your Product</h2>
                {product.customizations.map((cust) => (
                  <div key={cust.type} className="mb-4">
                    <label className="block text-chrome text-sm font-medium mb-2">{cust.label}:</label>
                    {cust.options && cust.options.length > 0 ? (
                      <select
                        value={customizationState[cust.type] || cust.options[0]}
                        onChange={e => setCustomizationState(s => ({ ...s, [cust.type]: e.target.value }))}
                        className="w-full bg-obsidian text-white rounded-none px-3 py-2.5 border border-white/10 focus:outline-none focus:border-molten transition-colors duration-150"
                      >
                        {cust.options.map(opt => (
                          <option key={opt} value={opt} className="bg-obsidian">{opt}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            <Button
              className="bg-molten hover:bg-molten-ember text-white py-3 px-8 text-base rounded-none uppercase tracking-widest font-semibold"
              onClick={() => dispatch({ type: "ADD_ITEM", payload: {
                id: getCustomizationId(),
                name: product.name,
                price: getCustomizedPrice(),
                material: product.material,
                category: product.category,
                image: images[0],
                description: product.description,
                color: customizationState["color"] || "",
              } })}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart - ${getCustomizedPrice()}
            </Button>
          </motion.div>
        </div>

        <div className="mt-24">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-[-0.03em] text-white">Customer Reviews</h2>
            <div className="flex-1 h-[2px] bg-white/[0.06]" />
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReviewsList productId={product.id} refreshTrigger={refreshReviews} />
            </div>
            <div>
              <ReviewForm
                productId={product.id}
                productName={product.name}
                onSuccess={() => setRefreshReviews(prev => prev + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}