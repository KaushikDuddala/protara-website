"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface Order {
  id: number
  status: string
  subtotal: number
  shipping: number
  total: number
  created_at: string
}

/** Account page - profile editing and order history. */
export default function AccountPage() {
  const router = useRouter()
  const { user, profile, isLoading, refreshProfile, signOut } = useAuth()

  const [tab, setTab] = useState<"profile" | "orders">("profile")
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    city: "",
    location_state: "",
    country: "",
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        age: profile.age ? String(profile.age) : "",
        city: profile.city || "",
        location_state: profile.location_state || "",
        country: profile.country || "",
      })
    }
  }, [profile])

  useEffect(() => {
    if (tab !== "orders" || !user) return

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders")
        if (!response.ok) throw new Error("Failed to load orders")
        const data = await response.json()
        setOrders(data.orders || [])
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load orders" })
      }
    }

    loadOrders()
  }, [tab, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          age: form.age ? parseInt(form.age) : null,
          city: form.city,
          location_state: form.location_state,
          country: form.country,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to save")
      setMessage({ type: "success", text: "Profile updated." })
      await refreshProfile()
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-[#12121a] border border-white/10 animate-pulse">
            <div className="h-32 bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-white text-2xl font-bold mb-3">Sign in to view your account</h1>
          <Link href="/signin" className="text-orange-500 hover:text-orange-400">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">My Account</h1>
            <p className="text-white/60">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="text-sm text-white/60 hover:text-red-400 transition-colors">
            Sign out
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          {(["profile", "orders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 border capitalize transition-colors ${
                tab === t
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {message && (
          <p className={`mb-6 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </p>
        )}

        {tab === "profile" ? (
          <form onSubmit={handleSave} className="bg-[#12121a] border border-white/10 p-6 space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Age</label>
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">State</label>
              <input
                name="location_state"
                value={form.location_state}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Country</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full bg-[#0a0a0f] border border-white/10 text-white px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-white/60">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-[#12121a] border border-white/10 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold mb-1">Order #{order.id}</p>
                    <p className="text-white/50 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs uppercase tracking-wider mb-1 ${
                        order.status === "completed"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-orange-500 font-semibold">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}