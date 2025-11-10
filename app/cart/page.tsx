"use client"

import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { Minus, Plus, ShoppingBag } from "lucide-react"

const SHIPPING = 9.99
const FREE_SHIPPING_ITEM_THRESHOLD = 5

/** Cart page - line items with quantity controls, plus a sticky order summary. */
export default function CartPage() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const removeItem = (id: string | number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <ShoppingBag className="h-10 w-10 text-white/20 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-white/60 mb-8">Add a few prints and come back.</p>
          <Link
            href="/catalogue"
            className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors"
          >
            Browse the catalogue
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = state.total
  const total = subtotal + SHIPPING
  const itemsToFreeShipping = Math.max(0, FREE_SHIPPING_ITEM_THRESHOLD - state.itemCount)

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Shopping Cart</h1>
            <p className="text-white/60">
              {state.itemCount} item{state.itemCount !== 1 ? "s" : ""}
            </p>
          </div>
          {itemsToFreeShipping > 0 ? (
            <p className="text-sm text-orange-300 border border-orange-500/30 bg-orange-500/5 px-4 py-2">
              Free shipping on {FREE_SHIPPING_ITEM_THRESHOLD}+ items - add{" "}
              {itemsToFreeShipping} more{itemsToFreeShipping !== 1 ? "s" : ""}.
            </p>
          ) : (
            <p className="text-sm text-green-300 border border-green-500/30 bg-green-500/5 px-4 py-2">
              You've unlocked free shipping on this order.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-[#12121a] border border-white/10 p-4">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-20 h-20 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate mb-1">{item.name}</h3>
                  <p className="text-sm text-white/50 mb-3">{item.material}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-white/10 text-white hover:border-orange-500 flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-white/10 text-white hover:border-orange-500 flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange-500 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-white/50 mb-2">${item.price.toFixed(2)} each</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-white/50 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <Link href="/catalogue" className="inline-block text-sm text-orange-500 hover:text-orange-400 mt-2">
              Continue shopping
            </Link>
          </div>

          <div className="bg-[#12121a] border border-white/10 p-6 lg:sticky lg:top-6">
            <h2 className="text-white font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>${SHIPPING.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block text-center bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}