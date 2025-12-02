"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X, Plus, Trash2, Save, Lock, GripVertical } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Product, Customization } from "@/lib/types/product"
import Navigation from "@/app/components/navigation"

/** Admin product management - create, edit, and delete products from the catalog. */
export default function ProductEditPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [mode, setMode] = useState<"view" | "edit" | "new">("view")
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    material: "",
    category: "",
    description: "",
    detailedDescription: "",
    images: [],
    specifications: {},
    customizations: [],
    community_designed: false,
  })

  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.material.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError("Failed to load products")
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setLoading(true)

    try {
      const response = await fetch("/api/products/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Invalid password")
      }

      setIsAuthenticated(true)
      fetchProducts()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedProductId && mode === "edit") {
      const product = products.find((p) => String(p.id) === selectedProductId)
      if (product) {
        setFormData(product)
      }
    } else if (mode === "new") {
      setFormData({
        name: "",
        price: 0,
        material: "PLA",
        category: "",
        description: "",
        detailedDescription: "",
        images: [],
        specifications: {},
        customizations: [],
        community_designed: false,
      })
    }
  }, [selectedProductId, mode, products])

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingImages(true)
    setError("")

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formDataObj = new FormData()
        formDataObj.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataObj,
        })

        if (!response.ok) throw new Error("Upload failed")

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }))

      setSuccess(`Uploaded ${uploadedUrls.length} image(s)`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to upload images")
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = draggedImageIndex
    if (dragIndex === null || dragIndex === dropIndex) return

    const draggedImages = [...(formData.images || [])]
    const draggedImage = draggedImages[dragIndex]
    
    draggedImages.splice(dragIndex, 1)
    draggedImages.splice(dropIndex, 0, draggedImage)
    
    setFormData((prev) => ({
      ...prev,
      images: draggedImages,
    }))
    
    setDraggedImageIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedImageIndex(null)
  }

  const addSpecification = () => {
    const key = prompt("Enter specification key (e.g., 'dimensions'):")
    const value = prompt("Enter specification value:")
    if (key && value) {
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [key]: value },
      }))
    }
  }

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return { ...prev, specifications: newSpecs }
    })
  }

  const addCustomization = () => {
    const newCust: Customization = {
      type: "New Option",
      label: "New Option",
      options: ["Option 1", "Option 2"],
      priceDelta: {},
    }
    setFormData((prev) => ({
      ...prev,
      customizations: [...(prev.customizations || []), newCust],
    }))
  }

  const removeCustomization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations?.filter((_, i) => i !== index),
    }))
  }

  const updateCustomization = (index: number, updates: Partial<Customization>) => {
    setFormData((prev) => {
      const newCustomizations = [...(prev.customizations || [])]
      newCustomizations[index] = { ...newCustomizations[index], ...updates }
      return { ...prev, customizations: newCustomizations }
    })
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const endpoint = "/api/products/manage"
      const method = mode === "new" ? "POST" : "PUT"

      const body =
        mode === "new" ? { password, product: formData } : { password, productId: selectedProductId, product: formData }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save product")
      }

      setSuccess(mode === "new" ? "Product created successfully!" : "Product updated successfully!")
      await fetchProducts()
      setMode("view")
      setSelectedProductId("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/products/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, productId: selectedProductId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete product")
      }

      setSuccess("Product deleted successfully!")
      await fetchProducts()
      setMode("view")
      setSelectedProductId("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-obsidian border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-molten">
              <Lock className="h-6 w-6" />
              Product Management Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-chrome">
                  Admin Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-obsidian border-white/[0.08] text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {authError && (
                <Alert className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-molten hover:bg-molten-ember"
              >
                {loading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white pt-48">
      <Navigation />
      <div className="p-4 md:p-8 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-molten mb-2">
              Product Management
            </h1>
            <p className="text-steel">Manage your product catalog</p>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-900/20 border-green-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-steel">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-obsidian border border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-molten">Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => {
                    setMode("new")
                    setSelectedProductId("")
                  }}
                  className="w-full bg-molten hover:bg-molten-ember"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>

                <div className="mt-4">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-obsidian border-white/[0.08] text-white placeholder:text-steel"
                  />
                </div>

                <div data-lenis-prevent className="space-y-2 mt-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Button
                      key={product.id}
                      onClick={() => {
                        setSelectedProductId(String(product.id))
                        setMode("edit")
                      }}
                       variant={selectedProductId === String(product.id) ? "default" : "outline"}
                       className={`w-full justify-start text-left font-medium ${
                         selectedProductId === String(product.id)
                           ? "bg-molten hover:bg-molten text-white"
                           : "bg-white/[0.03] border-white/[0.15] hover:bg-white/[0.06] text-white"
                       }`}
                    >
                      {product.name}
                    </Button>
                  ))}
                  {filteredProducts.length === 0 && searchQuery && (
                    <div className="text-center py-4 text-steel">
                      <p className="text-sm">No products found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-obsidian border border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-molten">
                  {mode === "new" ? "Add New Product" : mode === "edit" ? "Edit Product" : "Select a Product"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mode !== "view" ? (
                  <div data-lenis-prevent className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-chrome">
                          Product Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-obsidian border-white/[0.08] text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-chrome">
                          Price ($)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price || 0}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                          className="bg-obsidian border-white/[0.08] text-white"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="material" className="text-chrome">
                          Material
                        </Label>
                        <Input
                          id="material"
                          value={formData.material || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
                          className="bg-obsidian border-white/[0.08] text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-chrome">
                          Category
                        </Label>
                        <Input
                          id="category"
                          value={formData.category || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                          className="bg-obsidian border-white/[0.08] text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="community_designed"
                        checked={formData.community_designed || false}
                        onChange={(e) => setFormData((prev) => ({ ...prev, community_designed: e.target.checked }))}
                        className="w-4 h-4 text-molten border-white/[0.15] rounded focus:ring-molten focus:ring-2 bg-obsidian"
                      />
                      <Label htmlFor="community_designed" className="text-chrome cursor-pointer">
                        Community Designed
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-chrome">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="bg-obsidian border-white/[0.08] text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="detailedDescription" className="text-chrome">
                        Detailed Description
                      </Label>
                      <Textarea
                        id="detailedDescription"
                        value={formData.detailedDescription || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, detailedDescription: e.target.value }))}
                        className="bg-obsidian border-white/[0.08] text-white"
                        rows={5}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-chrome">Product Images</Label>
                        <span className="text-xs text-steel/70">Drag to reorder</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images?.map((url, index) => (
                          <div
                            key={index}
                            className={`relative group cursor-move transition-all ${
                              draggedImageIndex === index ? 'opacity-50 scale-95' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="absolute top-2 left-2 z-10 bg-obsidian/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="h-4 w-4 text-steel" />
                            </div>
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded border-2 border-white/[0.08] hover:border-molten transition-colors"
                              draggable={false}
                            />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-obsidian/80 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </span>
                              <button
                                onClick={() => removeImage(index)}
                                className="bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        disabled={uploadingImages}
                        className="bg-obsidian border-white/[0.08] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-molten file:text-white hover:file:bg-molten"
                      />
                      {uploadingImages && <p className="text-sm text-chrome mt-2">Uploading images...</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-chrome">Specifications</Label>
                        <Button
                          onClick={addSpecification}
                          size="sm"
                          variant="outline"
                          className="border-white/[0.15] bg-transparent text-white hover:bg-white/[0.06]"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                         {Object.entries(formData.specifications || {}).map(([key, value]) => (
                           <div key={key} className="flex items-center gap-2 bg-obsidian p-2 rounded">
                             <span className="text-chrome font-medium">{key}:</span>
                             <span className="text-white flex-1">{value}</span>
                             <button onClick={() => removeSpecification(key)} className="text-red-400 hover:text-red-300">
                               <X className="h-4 w-4" />
                             </button>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-chrome">Customizations</Label>
                        <Button
                          onClick={addCustomization}
                          size="sm"
                          variant="outline"
                          className="border-white/[0.15] bg-transparent text-white hover:bg-white/[0.06]"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.customizations?.map((cust, index) => (
                          <div key={index} className="bg-obsidian p-3 rounded space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label className="text-sm text-steel">Type</Label>
                                  <Input
                                    value={cust.type}
                                    onChange={(e) =>
                                      updateCustomization(index, { type: e.target.value })
                                    }
                                    className="bg-obsidian border-white/[0.15] text-white text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm text-steel">Label</Label>
                                  <Input
                                    value={cust.label}
                                    onChange={(e) =>
                                      updateCustomization(index, { label: e.target.value })
                                    }
                                    className="bg-obsidian border-white/[0.15] text-white text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm text-steel">Options (comma separated)</Label>
                                  <Input
                                    value={cust.options?.join(", ") || ""}
                                    onChange={(e) =>
                                      updateCustomization(index, { options: e.target.value.split(",").map((o) => o.trim()) })
                                    }
                                    className="bg-obsidian border-white/[0.15] text-white text-sm"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => removeCustomization(index)}
                                className="text-red-400 hover:text-red-300 self-start mt-6"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/[0.08] sticky bottom-0 bg-obsidian">
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-molten hover:bg-molten-ember"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : mode === "new" ? "Create Product" : "Update Product"}
                      </Button>
                      {mode === "edit" && (
                        <Button
                          onClick={handleDelete}
                          disabled={loading}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-steel text-center py-12">Select a product to edit or create a new one</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
