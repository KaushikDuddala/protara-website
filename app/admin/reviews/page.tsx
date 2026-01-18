'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/app/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Lock, AlertCircle, Trash2, CheckCircle, Star } from 'lucide-react'
import { useProducts } from '@/hooks/use-products'

interface Review {
  name: string
  id: number
  product_id: number
  title: string
  description: string
  rating: number
  email: string
  phone_number: string
  item_bought: string
  created_at: string
}

/** Admin review management - moderate and delete product reviews. */
export default function AdminReviewsPage() {
  const router = useRouter()
  const { products } = useProducts()
  
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  
  const [reviews, setReviews] = useState<{ [key: number]: Review[] }>({})
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState<number | null>(null)

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!password) {
      setAuthError('Please enter admin password')
      return
    }

    sessionStorage.setItem('admin_password', password)
    setIsAuthenticated(true)
    setPassword('')
    fetchReviews()
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError('')
      
      const storedPassword = sessionStorage.getItem('admin_password')
      const response = await fetch('/api/reviews/admin/all', {
        headers: {
          'x-admin-password': storedPassword || '',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false)
          sessionStorage.removeItem('admin_password')
          setAuthError('Invalid admin password')
          return
        }
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      setReviews(data.reviews || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    try {
      const storedPassword = sessionStorage.getItem('admin_password')
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': storedPassword || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      setDeleteSuccess(reviewId)
      setTimeout(() => setDeleteSuccess(null), 3000)
      
      fetchReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-obsidian border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-molten">
              <Lock className="h-5 w-5" />
              Admin Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-chrome mb-2">Admin Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-obsidian border-white/[0.08] text-white"
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
                {loading ? 'Authenticating...' : 'Unlock'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const selectedProductReviews = selectedProductId ? reviews[selectedProductId] || [] : []

  return (
    <div className="min-h-screen bg-void text-white pt-48">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex gap-2 flex-wrap">
            <Link href="/admin/products">
              <Button variant="outline" className="border-white/[0.08] text-chrome hover:bg-obsidian">
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button className="bg-molten hover:bg-molten-ember">
                Review Management
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-molten mb-8">Manage Reviews</h1>

          {error && (
            <Alert className="mb-4 bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-obsidian border-white/[0.08] sticky top-48">
              <CardHeader>
                <CardTitle className="text-white">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div data-lenis-prevent className="space-y-2 max-h-[600px] overflow-y-auto">
                  {products.map(product => {
                    const productReviewCount = (reviews[product.id] || []).length
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProductId(product.id)}
                        className={`w-full text-left p-3 rounded transition-all ${
                          selectedProductId === product.id
                            ? 'bg-molten/20 border-l-4 border-molten text-white'
                            : 'bg-obsidian/30 hover:bg-obsidian border-l-4 border-transparent text-chrome'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-steel/70">${product.price}</p>
                          </div>
                          {productReviewCount > 0 && (
                            <Badge className="bg-molten text-white ml-2 flex-shrink-0">
                              {productReviewCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {!selectedProductId ? (
              <Card className="bg-obsidian border-white/[0.08]">
                <CardContent className="pt-8 text-center">
                  <p className="text-steel mb-4">Select a product to view its reviews</p>
                </CardContent>
              </Card>
            ) : selectedProductReviews.length === 0 ? (
              <Card className="bg-obsidian border-white/[0.08]">
                <CardHeader>
                  <CardTitle className="text-white">{selectedProduct?.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-steel">No reviews for this product yet</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-obsidian border-white/[0.08]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{selectedProduct?.name}</CardTitle>
                      <p className="text-sm text-steel mt-2">
                        {selectedProductReviews.length} review{selectedProductReviews.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div data-lenis-prevent className="space-y-4 max-h-[800px] overflow-y-auto">
                    {selectedProductReviews.map(review => (
                      <Card key={review.id} className="bg-obsidian border-white/[0.08]">
                        <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{review.title}</h4>
                                <p className="text-xs text-steel">by {review.name}</p>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={star <= review.rating ? 'fill-molten text-molten' : 'text-steel/70'}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-chrome text-sm mb-3 ">"{ review.description}"</p>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div className="bg-obsidian p-2 rounded border border-white/[0.08]">
                                <p className="text-steel/70">Email</p>
                                <p className="text-chrome font-mono break-all text-xs">{review.email}</p>
                              </div>
                              <div className="bg-obsidian p-2 rounded border border-white/[0.08]">
                                <p className="text-steel/70">Phone</p>
                                <p className="text-chrome font-mono text-xs">{review.phone_number}</p>
                              </div>
                            </div>

                            <p className="text-xs text-steel">
                              <span className="font-medium">Item:</span> {review.item_bought} · <span className="font-medium">Date:</span> {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Button
                              onClick={() => handleDeleteReview(review.id)}
                              className="bg-red-600 hover:bg-red-700"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </Button>

                            {deleteSuccess === review.id && (
                              <div className="flex items-center gap-2 text-green-400 text-xs">
                                <CheckCircle size={14} />
                                <span>Deleted</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
