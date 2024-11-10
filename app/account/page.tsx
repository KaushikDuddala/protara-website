"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface Order {
  id: string
  total: number
  status: string
  created_at: string
}

export default function AccountPage() {
  const { user, profile, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
      return
    }
    if (user) {
      fetch("/api/orders")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setOrders(data?.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 px-4">
        <div className="container mx-auto max-w-2xl text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-white text-3xl font-bold mb-2">My Account</h1>
        <p className="text-white/60 mb-8">{user?.email}</p>

        <div className="bg-[#12121a] border border-white/10 p-6 mb-8">
          <h2 className="text-white font-bold mb-2">Profile</h2>
          <p className="text-white/70">Name: {profile?.name || "Not set"}</p>
          <button
            onClick={handleSignOut}
            className="mt-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-[#12121a] border border-white/10 p-6">
          <h2 className="text-white font-bold mb-4">Orders</h2>
          {ordersLoading ? (
            <p className="text-white/60">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-white/60">
              No orders yet.{" "}
              <Link href="/catalogue" className="text-orange-500 hover:text-orange-400">
                Shop the catalogue
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border border-white/10 px-4 py-3">
                  <div>
                    <p className="text-white font-semibold">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-white/50">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">${Number(order.total).toFixed(2)}</p>
                    <p className="text-sm text-white/50">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}