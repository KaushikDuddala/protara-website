"use client"

import React, { useMemo, useState, useRef, useEffect } from "react"

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

import { useProducts } from "@/hooks/use-products"

type Props = {
  value?: number | null
  onChange: (id: number | null) => void
  placeholder?: string
}

/** Searchable popover that lets users pick a product from the catalogue. */
export default function ProductSelect({ value, onChange, placeholder }: Props) {
  const { products, loading } = useProducts()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined)

  const selected = useMemo(() => products.find((p) => p.id === value) || null, [products, value])

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  useEffect(() => {
    function updateWidth() {
      if (triggerRef.current) setContentWidth(triggerRef.current.offsetWidth)
    }

    if (open) updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          ref={triggerRef}
          className="flex w-full items-center gap-3 rounded-md border border-gray-700 bg-gray-900/50 px-3 py-2 text-left text-white"
        >
          {selected ? (
            <>
              <img src={selected.images?.[0] || "/placeholder.png"} alt={selected.name} className="h-8 w-8 rounded-sm object-cover" />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder || "Select product (optional)"}</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="rounded-md border border-gray-700 bg-gray-900/60 text-white shadow-lg"
        style={{ width: contentWidth ? `${contentWidth}px` : undefined }}
      >
        <div className="mb-2">
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-gray-800/60 text-white"
          />
        </div>

        <div data-lenis-prevent className="max-h-56 overflow-y-auto">
          {loading && <div className="py-4 text-center text-sm text-gray-400">Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="py-4 text-center text-sm text-gray-400">No products found</div>
          )}

          {!loading && filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange(p.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-gray-800/40"
            >
              <img src={p.images?.[0] || "/placeholder.png"} alt={p.name} className="h-10 w-10 rounded-sm object-cover" />
              <div className="flex-1 truncate">
                <div className="text-sm font-medium text-white truncate">{p.name}</div>
                <div className="text-xs text-gray-400 truncate">{p.category || ""}</div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
