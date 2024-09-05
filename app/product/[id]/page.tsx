"use client"

import { useState, useMemo } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import ImageCarousel from "@/app/components/ui/image-carousel"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/hooks/use-products"
import { ChevronLeft, ShoppingCart, Minus, Plus } from "lucide-react"

/** Product detail page - gallery, customization options, and a sticky buy box. */
export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const { products: productsData, loading } = useProducts()
  const { dispatch } = useCart()

  const [customizationState, setCustomizationState] = useState<{ [key: string]: string }>({})
  const [quantity, setQuantity] = useState(1)

  const product = useMemo(
    () => productsData.find((p) => String(p.id) === params.id),
    [productsData, params.id]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-[#12121a] border border-white/10 animate-pulse">
            <div className="aspect-square bg-white/5" />
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

  const addToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: getCustomizationId(),
        name: product.name,
        price: getCustomizedPrice(),
        material: product.material,
        category: product.category,
        image: images[0] || "/placeholder.svg",
        description: product.description,
        color: customizationState["color"] || "",
        quantity,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-orange-500 transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Catalogue
        </Link>

        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
          <div>
            <div className="bg-[#12121a] border border-white/10">
              <ImageCarousel
                images={images}
                alt={product.name}
                className="w-full aspect-square"
                imageClassName="w-full h-full object-cover"
                showArrows={true}
              />
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs uppercase tracking-wider text-white/50">{product.category}</span>
                <span className="text-xs uppercase tracking-wider text-white/50">{product.material}</span>
              </div>
              <h1 className="text-white text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-orange-500 font-bold text-2xl mb-4">${getCustomizedPrice().toFixed(2)}</p>
              <p className="text-white/70 leading-relaxed mb-6">{product.description}</p>

              {product.detailedDescription && (
                <div className="mb-6">
                  <h2 className="text-white font-semibold mb-2">Details</h2>
                  <p className="text-white/70 leading-relaxed">{product.detailedDescription}</p>
                </div>
              )}

              {product.specifications && (
                <div className="mb-6">
                  <h2 className="text-white font-semibold mb-3">Specifications</h2>
                  <div className="border border-white/10 divide-y divide-white/10">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between px-4 py-3 text-sm">
                        <span className="capitalize text-white/50">{key}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.customizations && product.customizations.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-white font-semibold mb-3">Customize Your Product</h2>
                  {product.customizations.map((cust) => (
                    <div key={cust.type} className="mb-4">
                      <label className="block text-white/70 text-sm font-medium mb-2">{cust.label}:</label>
                      {cust.options && cust.options.length > 0 ? (
                        <select
                          value={customizationState[cust.type] || cust.options[0]}
                          onChange={(e) => setCustomizationState((s) => ({ ...s, [cust.type]: e.target.value }))}
                          className="w-full bg-[#0a0a0f] text-white px-3 py-2.5 border border-white/10 focus:outline-none focus:border-orange-500"
                        >
                          {cust.options.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#12121a]">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 bg-[#12121a] border border-white/10 p-6">
            <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Protara Printworks</p>
            <h2 className="text-white font-bold text-xl mb-6">{product.name}</h2>

            <div className="mb-6">
              <label className="block text-white/70 text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 border border-white/10 text-white hover:border-orange-500 flex items-center justify-center transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 border border-white/10 text-white hover:border-orange-500 flex items-center justify-center transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mb-6">
              <span className="text-white/70 text-sm">Total</span>
              <span className="text-orange-500 font-bold text-2xl">
                ${(getCustomizedPrice() * quantity).toFixed(2)}
              </span>
            </div>

            <button
              onClick={addToCart}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <p className="text-white/50 text-xs text-center mt-4">Ships within 1-5 business days</p>
          </div>
        </div>
      </div>
    </div>
  )
}