"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Trash2, Mail, Phone, Package, DollarSign, FileText, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Navigation from "@/app/components/navigation"

interface CustomRequest {
  id: string
  type: string
  product_name: string
  budget: string
  description: string
  email: string
  phone_number?: string
  timestamp: string
  status: string
  created_at: string
  updated_at: string
}

/** Admin custom print requests - view, search, and delete incoming requests. */
export default function CustomRequestsPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRequests = requests.filter((request) =>
    request.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.budget.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      fetchRequests()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/custom-print-request?password=${encodeURIComponent(password)}`)
      if (!response.ok) throw new Error("Failed to fetch requests")
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests")
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/custom-print-request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      })

      if (!response.ok) throw new Error("Failed to delete request")

      setRequests(requests.filter((r) => r.id !== id))
      setSuccess("Request deleted successfully")
      setDeleteId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete request")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-void text-white pt-48">
        <Navigation />
        <div className="container mx-auto px-4">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-white pt-48">
      <Navigation />
      <div className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Custom Print Requests</h1>
          <p className="text-steel">Manage all custom print requests and contact information</p>
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

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian border border-white/[0.08] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-molten"
            placeholder="Search by product name, email, or budget..."
          />
        </div>

        <div className="grid gap-6">
          {filteredRequests.length === 0 ? (
            <Card className="bg-obsidian border border-white/[0.06]">
              <CardContent className="p-12 text-center">
                <p className="text-steel">No custom print requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="bg-obsidian border border-white/[0.06] hover:border-molten/50 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-molten">{request.product_name}</CardTitle>
                      <p className="text-steel text-sm mt-1">
                        Submitted: {new Date(request.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : request.status === "reviewing"
                        ? "bg-blue-500/20 text-blue-300"
                        : request.status === "responded"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-white/[0.06] text-chrome"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-molten mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-steel text-sm">Email</p>
                        <a href={`mailto:${request.email}`} className="text-white hover:text-molten break-all">
                          {request.email}
                        </a>
                      </div>
                    </div>

                    {request.phone_number && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-molten mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-steel text-sm">Phone</p>
                          <a href={`tel:${request.phone_number}`} className="text-white hover:text-molten">
                            {request.phone_number}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-molten mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-steel text-sm">Budget</p>
                        <p className="text-white">{request.budget}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-molten mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-steel text-sm">Type</p>
                        <p className="text-white capitalize">{request.type}</p>
                      </div>
                    </div>
                  </div>

                  {request.description && (
                    <div className="flex gap-3">
                      <FileText className="h-5 w-5 text-molten mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-steel text-sm">Description</p>
                        <p className="text-white">{request.description}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/[0.08] flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(request.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-obsidian border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-molten">Delete Request</AlertDialogTitle>
            <AlertDialogDescription className="text-chrome">
              Are you sure you want to delete this custom print request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => deleteId && handleDelete(deleteId)}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
          <AlertDialogCancel className="border-white/[0.08] text-chrome hover:bg-white/[0.06]">
            Cancel
          </AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
