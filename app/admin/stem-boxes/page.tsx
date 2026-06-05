"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock, Plus, Trash2, Package, Search } from "lucide-react"
import Navigation from "@/app/components/navigation"
import { useProducts } from "@/hooks/use-products"

interface StemBoxEntry {
  id: number
  product_id: number
  created_at: string
  products: {
    id: number
    name: string
    price: number
    category: string
    material: string
    images: string[]
  }
}

/** Admin STEM Boxes - manage which products are featured as STEM learning kits. */
export default function AdminStemBoxesPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)

  const [entries, setEntries] = useState<StemBoxEntry[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [adding, setAdding] = useState(false)

  const { products } = useProducts()

  const verifyPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAuthError("")
    setLoading(true)
    try {
      const res = await fetch("/api/products/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Invalid password")
      }
      setIsAuthenticated(true)
      fetchEntries()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/stem-boxes")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setEntries(data)
    } catch {
      setError("Failed to load STEM Box products")
    }
  }

  const addProduct = async (productId: number) => {
    setError("")
    setSuccess("")
    setAdding(true)
    try {
      const res = await fetch("/api/stem-boxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, product_id: productId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add")
      }
      setSuccess("Product added to STEM Boxes")
      await fetchEntries()
      setSearchQuery("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product")
    } finally {
      setAdding(false)
    }
  }

  const removeProduct = async (productId: number) => {
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/stem-boxes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, product_id: productId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove")
      }
      setSuccess("Product removed from STEM Boxes")
      await fetchEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove product")
    }
  }

  const entryProductIds = new Set(entries.map(e => e.product_id))
  const availableProducts = products.filter(p => !entryProductIds.has(p.id))
  const filteredAvailable = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void text-white pt-48">
        <Navigation />
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-obsidian border border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-molten flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  STEM Boxes Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                {authError && (
                  <Alert className="mb-6 bg-red-900/20 border-red-500/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={verifyPassword} className="space-y-4">
                  <div>
                    <label className="block text-chrome text-sm font-medium mb-2">Admin Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-obsidian border-white/[0.08] text-white"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-molten hover:bg-molten-ember text-white">
                    {loading ? "Authenticating..." : "Unlock"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white pt-48">
      <Navigation />
      <div className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">STEM Boxes</h1>
          <p className="text-steel">Manage which products are featured as STEM Box kits</p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current STEM Box Products */}
          <Card className="bg-obsidian border border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-molten flex items-center gap-2">
                <Package className="h-5 w-5" />
                Current STEM Box Products ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-steel text-center py-8">No products added yet. Use the panel on the right to add products.</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-obsidian rounded-lg p-3 border border-white/[0.08]">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={entry.products?.images?.[0] || "/placeholder.svg"}
                          alt={entry.products?.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{entry.products?.name}</p>
                          <p className="text-steel text-sm">${entry.products?.price} - {entry.products?.category}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(entry.product_id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card className="bg-obsidian border border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-molten flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-steel" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-obsidian border-white/[0.08] text-white pl-9"
                  placeholder="Search products by name or category..."
                />
              </div>
              <div data-lenis-prevent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailable.length === 0 ? (
                  <p className="text-steel text-center py-4">
                    {searchQuery ? "No matching products found" : "All products are already in STEM Boxes"}
                  </p>
                ) : (
                  filteredAvailable.map((product) => (
                    <div key={product.id} className="flex items-center justify-between bg-obsidian rounded-lg p-3 border border-white/[0.08] hover:border-molten/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={Array.isArray(product.images) ? product.images[0] : product.images || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{product.name}</p>
                          <p className="text-steel text-xs">${product.price} - {product.category}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addProduct(product.id)}
                        disabled={adding}
                        className="bg-molten hover:bg-molten-ember text-white shrink-0 ml-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
