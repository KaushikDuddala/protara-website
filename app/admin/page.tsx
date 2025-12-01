"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MessageSquare, Star, Trophy, FileEdit, AlertCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

const adminSections = [
  { href: "/admin/custom-requests", label: "Custom Print Requests", description: "Manage custom print requests and contact information", icon: Package, color: "text-molten" },
  { href: "/admin/cadathon", label: "Cadathon", description: "Manage Cadathon settings and participant data", icon: Trophy, color: "text-molten" },
  { href: "/admin/products", label: "Products", description: "Add, edit, and manage product listings", icon: Package, color: "text-molten" },
  { href: "/admin/reviews", label: "Reviews", description: "Moderate and manage product reviews", icon: MessageSquare, color: "text-molten" },
  { href: "/admin/testimonials", label: "Testimonials", description: "Approve, reject, and manage testimonials", icon: Star, color: "text-molten" },
  { href: "/admin/stem-boxes", label: "STEM Boxes", description: "Manage STEM Box products and kits", icon: Trophy, color: "text-molten" },
  { href: "/admin/blogs", label: "Blogs", description: "Create and edit blog posts", icon: FileText, color: "text-molten" },
  { href: "/admin/editLog", label: "Edit Log", description: "View history of product changes", icon: FileEdit, color: "text-molten" },
]

/** Admin dashboard - password gate and navigation cards for all admin sections. */
export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)

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
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 pt-48">
        <div className="max-w-md mx-auto">
          <Card className="bg-obsidian border border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-molten">Admin Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert className="mb-6 bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-chrome text-sm font-medium mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-obsidian border border-white/[0.08] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-molten"
                    placeholder="Enter admin password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-molten hover:bg-molten-ember text-white"
                >
                  {loading ? "Authenticating..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-48 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-steel">Manage all aspects of the store</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href}>
              <Card className="bg-obsidian border border-white/[0.06] hover:border-molten/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-molten/10">
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{section.label}</h3>
                      <p className="text-steel text-sm">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
