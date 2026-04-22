"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, LogOut, Package, AlertCircle, CheckCircle, Mail, Phone, MapPin, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import Navigation from "@/app/components/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Order {
  id: number
  stripe_session_id: string
  status: string
  subtotal: number
  shipping: number
  total: number
  customer_email: string
  created_at: string
}

/** Authenticated user account page with profile editing and order history. */
export default function AccountPage() {
  const { user, profile, isLoading, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile")
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [form, setForm] = useState({ name: "", phone: "", age: "", city: "", location_state: "", country: "United States" })
  const [saving, setSaving] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin?redirect=/account")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        age: profile.age?.toString() || "",
        city: profile.city || "",
        location_state: profile.location_state || "",
        country: profile.country || "United States",
      })
    }
  }, [profile])

  useEffect(() => {
    if (user && activeTab === "orders") {
      setOrdersLoading(true)
      fetch("/api/orders")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) setOrders(data.orders || [])
        })
        .catch(() => null)
        .finally(() => setOrdersLoading(false))
    }
  }, [user, activeTab])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setSaveSuccess("Profile updated successfully!")
      await refreshProfile()
      setTimeout(() => setSaveSuccess(""), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setSaveError("Geolocation is not supported by your browser")
      return
    }

    setDetectingLocation(true)
    setSaveError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { headers: { "Accept-Language": "en-US" } }
      )
      const data = await res.json()
      const addr = data.address || {}
      const state = addr["ISO3166-2-lvl4"]?.split("-")[1] || addr.state || ""

      setForm(prev => ({
        ...prev,
        city: addr.city || addr.town || addr.village || addr.hamlet || "",
        location_state: state,
        country: addr.country || "United States",
      }))
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setSaveError("Location access denied. Please enable location services or enter your location manually.")
      } else {
        setSaveError("Failed to get current location")
      }
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void text-white relative">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-white/5 border border-white/10 mx-auto mb-6" />
            <p className="text-steel uppercase tracking-widest text-sm">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "orders" as const, label: "Order History", icon: Package },
  ]

  return (
    <div className="min-h-screen bg-void text-white relative">
      <Navigation />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, transparent 50%)", height: "300px", width: "100%" }} />

      <div className="relative container mx-auto px-4 pt-36 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-molten text-sm uppercase tracking-[0.25em] mb-2">Member Portal</p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-[-0.04em]">My Account</h1>
              <p className="text-steel mt-2">{user.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-white/10 text-chrome hover:text-molten hover:bg-white/5 hover:border-molten/40 rounded-none"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="flex gap-1 bg-obsidian border border-white/10 p-1 w-fit mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-heading font-semibold uppercase tracking-widest transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-molten text-white"
                    : "text-steel hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="bg-obsidian border-white/[0.06] rounded-none">
                  <CardHeader>
                    <CardTitle className="text-white font-heading font-bold flex items-center gap-2">
                      <User className="h-5 w-5 text-molten" />
                      Profile Information
                    </CardTitle>
                    <div className="w-12 h-[2px] bg-molten" />
                  </CardHeader>
                  <CardContent>
                    {saveSuccess && (
                      <Alert className="mb-6 bg-green-900/30 border-green-700/50 rounded-none">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-200">{saveSuccess}</AlertDescription>
                      </Alert>
                    )}
                    {saveError && (
                      <Alert className="mb-6 bg-red-900/30 border-red-700/50 rounded-none">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-200">{saveError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="mb-6 p-4 bg-white/[0.03] border border-white/[0.06] space-y-2">
                      <div className="flex items-center gap-2 text-chrome">
                        <Mail className="h-4 w-4 text-molten" />
                        <span>{user.email}</span>
                      </div>
                      {profile?.created_at && (
                        <div className="flex items-center gap-2 text-steel text-sm">
                          <Calendar className="h-4 w-4 text-molten" />
                          <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {profile?.phone && (
                        <div className="flex items-center gap-2 text-steel text-sm">
                          <Phone className="h-4 w-4 text-molten" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-chrome">Full Name</Label>
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-chrome">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age" className="text-chrome">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min="1"
                            max="120"
                            value={form.age}
                            onChange={(e) => setForm(prev => ({ ...prev, age: e.target.value }))}
                            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city" className="text-chrome">City</Label>
                          <Input
                            id="city"
                            value={form.city}
                            onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                            placeholder="e.g. Los Angeles"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location_state" className="text-chrome">State</Label>
                          <Input
                            id="location_state"
                            value={form.location_state}
                            onChange={(e) => setForm(prev => ({ ...prev, location_state: e.target.value }))}
                            className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                            placeholder="e.g. California"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label htmlFor="country" className="text-chrome">Country</Label>
                            <Input
                              id="country"
                              value={form.country}
                              onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
                              className="bg-white/[0.04] border-white/10 text-white rounded-none mt-1.5 focus:border-molten"
                              placeholder="United States"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={detectingLocation}
                            variant="outline"
                            className="border-white/10 text-chrome hover:text-molten hover:bg-white/5 hover:border-molten/40 rounded-none shrink-0"
                            title="Use current location"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold py-3"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="bg-obsidian border-white/[0.06] rounded-none">
                  <CardHeader>
                    <CardTitle className="text-white font-heading font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-molten" />
                      Order History
                    </CardTitle>
                    <div className="w-12 h-[2px] bg-molten" />
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <p className="text-steel text-center py-8 uppercase tracking-widest text-sm">Loading orders...</p>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-10">
                        <Package className="h-12 w-12 text-white/10 mx-auto mb-3" />
                        <p className="text-chrome text-lg font-heading font-bold mb-2">No orders yet</p>
                        <p className="text-steel text-sm mb-6">Your order history will appear here</p>
                        <Link href="/catalogue">
                          <Button className="bg-molten hover:bg-molten-ember text-white rounded-none uppercase tracking-widest font-semibold">
                            Browse Products
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white/[0.03] border border-white/[0.06] card-ignite p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-chrome font-heading font-bold">
                                Order #{order.id}
                              </span>
                              <span className={`text-xs px-2 py-0.5 uppercase tracking-widest ${
                                order.status === "completed"
                                  ? "bg-green-900/30 text-green-300"
                                  : "bg-yellow-900/30 text-yellow-300"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-sm text-steel space-y-1">
                              <p>
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p>Total: <span className="text-molten font-heading font-bold">${order.total?.toFixed(2)}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}