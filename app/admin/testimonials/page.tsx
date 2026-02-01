"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, X, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import Navigation from "@/app/components/navigation"

/** Admin testimonials - approve, reject, and delete customer testimonials. */
export default function AdminTestimonialsPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)

  const [testimonials, setTestimonials] = useState<any[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [collapsed, setCollapsed] = useState({ approved: true, pending: true, rejected: true })
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

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
      fetchTestimonials()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const fetchTestimonials = async () => {
    setError("")
    try {
      const res = await fetch("/api/testimonials/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) throw new Error("Failed to fetch testimonials")
      const data = await res.json()
      setTestimonials(data.testimonials || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch testimonials")
    }
  }

  const updateStatus = async (id: string, status: string) => {
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/testimonials/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, testimonialId: id, status }),
      })

      if (!res.ok) throw new Error("Failed to update testimonial")
      setSuccess("Updated successfully")
      await fetchTestimonials()
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update testimonial")
    }
  }

  const deleteTestimonial = async (id: string) => {
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/testimonials/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, testimonialId: id }),
      })

      if (!res.ok) throw new Error("Failed to delete testimonial")
      setSuccess("Deleted successfully")
      await fetchTestimonials()
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete testimonial")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-obsidian border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-molten">Admin Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={verifyPassword} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-chrome">Admin Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-obsidian border-white/[0.08] text-white" required />
              </div>
              {authError && (
                <Alert className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-molten hover:bg-molten-ember">{loading ? 'Authenticating...' : 'Unlock'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white pt-48">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-molten mb-4">Manage Testimonials</h1>

          {error && (
            <Alert className="mb-4 bg-red-900/20 border-red-500/50"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-900/20 border-green-500/50"><AlertCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>
          )}

          <div className="space-y-6">
            {(() => {
              const groups: Record<string, any[]> = { approved: [], pending: [], rejected: [] }
              testimonials.forEach((t) => groups[t.status || 'pending'].push(t))
              return (
                <>
                  {(['pending','approved','rejected'] as const).map((section) => (
                    <div key={section}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-white">{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                        <button
                          aria-label={collapsed[section] ? `Expand ${section}` : `Collapse ${section}`}
                          onClick={() => setCollapsed((s) => ({ ...s, [section]: !s[section] }))}
                          className="p-2 rounded-md bg-obsidian/40 border border-white/[0.08] hover:bg-obsidian"
                        >
                          {collapsed[section] ? (
                            <ChevronDown className="h-4 w-4 text-chrome" />
                          ) : (
                            <ChevronUp className="h-4 w-4 text-chrome" />
                          )}
                        </button>
                      </div>

                      {!collapsed[section] && (
                        <div className="space-y-3">
                          {groups[section].length === 0 && <div className="text-sm text-steel">No {section} testimonials</div>}
                          {groups[section].map((t) => (
                            <Card key={t.id} className="bg-obsidian border-white/[0.08]">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-molten rounded-full flex items-center justify-center text-white font-bold">{t.customer_name?.charAt(0) || '?'}</div>
                                      <div className="min-w-0">
                                        <div className="font-semibold text-white truncate">{t.customer_name}</div>
                                        <div className="text-sm text-steel truncate">Rating: {t.rating} · {t.product?.name || '-'}</div>
                                        <div className="text-sm text-steel truncate">Contact: {t.contact || '-'}</div>
                                      </div>
                                    </div>

                                    <div className="mt-3 text-chrome">
                                      <p className="italic">"{t.testimonial}"</p>
                                      <div className="text-sm text-steel mt-2">Submitted: {new Date(t.timestamp).toLocaleString()}</div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2">
                                      {section === 'pending' && (
                                        <>
                                          <Button onClick={() => updateStatus(t.id, 'approved')} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4" /> Approve</Button>
                                          <Button onClick={() => updateStatus(t.id, 'rejected')} variant="destructive" className="bg-red-600 hover:bg-red-700"><X className="h-4 w-4" /> Reject</Button>
                                        </>
                                      )}

                                      {section === 'approved' && (
                                        <Button onClick={() => updateStatus(t.id, 'pending')} className="bg-yellow-600 hover:bg-yellow-700">Move to pending</Button>
                                      )}

                                      {section === 'rejected' && (
                                        <Button onClick={() => updateStatus(t.id, 'pending')} className="bg-yellow-600 hover:bg-yellow-700">Move to pending</Button>
                                      )}
                                    </div>
                                    <div>
                                      {!confirmingDelete || confirmingDelete !== t.id ? (
                                        <button
                                          title="Delete testimonial"
                                          onClick={() => setConfirmingDelete(t.id)}
                                          className="p-2 rounded-md hover:bg-red-600/10 text-red-400"
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-chrome">Confirm?</span>
                                          <button onClick={() => { deleteTestimonial(t.id); setConfirmingDelete(null) }} className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm">Yes</button>
                                          <button onClick={() => setConfirmingDelete(null)} className="p-1 rounded-md bg-white/[0.06] hover:bg-white/[0.15] text-sm">No</button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
