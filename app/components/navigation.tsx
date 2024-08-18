"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/catalogue" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

export default function Navigation() {
  const { state } = useCart()

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold uppercase text-white text-xl tracking-tight">
            PROTARA
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-4 md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/cart" className="relative text-white/70 hover:text-white transition-colors" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
                  {state.itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}