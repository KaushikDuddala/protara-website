"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react"

import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

/** Fixed top navbar with nav links, cart badge, user menu, and mobile drawer. */
export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const lastScrollY = useRef(0)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { state } = useCart()
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const keepVisible = pathname === "/" || pathname === "/catalogue"

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (keepVisible) {
        lastScrollY.current = currentScrollY
        return
      }

      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        setIsHidden(currentScrollY > lastScrollY.current && currentScrollY > 100)
        lastScrollY.current = currentScrollY
      }, 16)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [lastScrollY, keepVisible])

  useEffect(() => {
    if (keepVisible) setIsHidden(false)
  }, [keepVisible])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/catalogue" },
    { name: "Blog", href: "/blog" },
    { name: "Cadathon", href: "/cadathon" },
    { name: "Custom Print", href: "/custom-print-request" },
    { name: "Outreach", href: "/outreach" },
    { name: "Team", href: "/team" },
    { name: "Contact", href: "/contact" },
  ]

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
    router.push("/")
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[60] bg-void/80 backdrop-blur-xl border-b border-white/5 transition-transform duration-300 ease-out ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-heading font-bold uppercase tracking-[-0.02em] text-white text-xl"
          >
            PROTARA
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm text-steel hover:text-white transition-colors duration-150 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-molten after:transition-transform after:duration-200 hover:after:scale-x-100"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 text-steel hover:text-white transition-colors"
                    aria-label="Account menu"
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-obsidian border border-white/[0.06] rounded-none shadow-xl">
                      <div className="px-4 py-2.5 border-b border-white/[0.06]">
                        <p className="text-sm text-white font-medium truncate">{profile?.name || user.email}</p>
                        <p className="text-xs text-steel truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-chrome hover:bg-white/5 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/signin" className="p-2 text-steel hover:text-white transition-colors" aria-label="Sign in">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>

            <Link href="/cart" className="relative p-2 text-steel hover:text-white transition-colors" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {state.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-molten text-white text-[10px] px-1.5 py-0.5 rounded-none">
                  {state.itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-steel hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-void/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-steel hover:text-molten border-b border-white/[0.04] transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setIsOpen(false)} className="block py-2.5 text-molten">
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="block py-2.5 text-red-400 text-left w-full"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/signin" onClick={() => setIsOpen(false)} className="block py-2.5 text-molten">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
