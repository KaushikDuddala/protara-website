"use client"

import Link from "next/link"
import { useCart } from "@/contexts/cart-context"

const SHIPPING = 9.99

export default function CartPage() {
  const { state, dispatch } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/catalogue" className="text-orange-500 hover:text-orange-400">
            Browse the catalogue
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = state.total
  const total = subtotal + SHIPPING

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-white text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="space-y-4">
          {state.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-[#12121a] border border-white/10 p-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{item.name}</h3>
                {item.color && <p className="text-sm text-white/50">Color: {item.color}</p>}
                <p className="text-orange-500 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity - 1 } })
                  }
                  className="w-8 h-8 border border-white/10 text-white hover:border-orange-500"
                >
                  -
                </button>
                <span className="w-6 text-center text-white">{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.id, quantity: item.quantity + 1 } })
                  }
                  className="w-8 h-8 border border-white/10 text-white hover:border-orange-500"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                className="text-sm text-white/50 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 ml-auto max-w-xs space-y-2">
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
          <Link
            href="/checkout"
            className="block text-center bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 transition-colors"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}