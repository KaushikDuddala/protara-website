"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"

export interface CartItem {
  id: string | number
  name: string
  price: number
  material: string
  category: string
  image: string
  description: string
  quantity: number
  color: string
}

export interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string | number }
  | { type: "UPDATE_QUANTITY"; payload: { id: string | number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

export interface CartContextType {
  state: CartState
  dispatch: React.Dispatch<CartAction>
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

function computeTotals(items: CartItem[]): Omit<CartState, "items"> {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const incoming = action.payload
      const existingItem = state.items.find(
        (item) => item.id === incoming.id && item.color === incoming.color
      )

      if (existingItem) {
        const items = state.items.map((item) =>
          item.id === existingItem.id && item.color === existingItem.color
            ? { ...item, quantity: item.quantity + (incoming.quantity ?? 1) }
            : item
        )
        return { items, ...computeTotals(items) }
      }

      const items = [
        ...state.items,
        { ...incoming, quantity: incoming.quantity ?? 1 },
      ]
      return { items, ...computeTotals(items) }
    }

    case "REMOVE_ITEM": {
      const items = state.items.filter((item) => item.id !== action.payload)
      return { items, ...computeTotals(items) }
    }

    case "UPDATE_QUANTITY": {
      const items = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return { items, ...computeTotals(items) }
    }

    case "CLEAR_CART": {
      return { items: [], itemCount: 0, total: 0 }
    }

    case "LOAD_CART": {
      return { items: action.payload, ...computeTotals(action.payload) }
    }

    default:
      return state
  }
}

const initialState: CartState = { items: [], itemCount: 0, total: 0 }

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cart")
      if (cached) {
        const items = JSON.parse(cached) as CartItem[]
        dispatch({ type: "LOAD_CART", payload: items })
      }
    } catch {
      // bad cache, start fresh
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}