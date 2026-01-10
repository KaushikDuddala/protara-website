import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeLocation } from "@/lib/geocode";
import { verifyAdminPassword } from "@/lib/verify-password";

/** Registers an authenticated user for the Cadathon. */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session: authSession } } = await supabase.auth.getSession()

    if (!authSession) {
      return NextResponse.json({ error: "You must be signed in to join the Cadathon" }, { status: 401 })
    }

    const body = await request.json()
    const { phone, age, city, location_state, country } = body

    let lat: number | null = null
    let lng: number | null = null
    let resolvedState: string | undefined
    if (city || location_state) {
      const coords = await geocodeLocation({ city, state: location_state, country })
      if (coords) {
        lat = coords.lat
        lng = coords.lng
        resolvedState = coords.resolvedState
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authSession.user.id)
      .single()

    const name = profile?.name || authSession.user.user_metadata?.name || ""
    const email = authSession.user.email || ""

    if (!name) {
      return NextResponse.json({ error: "Profile name not found. Please update your account." }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("cadathon_signups")
      .select("id")
      .eq("user_id", authSession.user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "You're already registered for this Cadathon!" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("cadathon_signups")
      .insert({
        user_id: authSession.user.id,
        name,
        email,
        phone: phone || null,
        age: age ? parseInt(age) : null,
        city: city || null,
        location_state: resolvedState || location_state || null,
        country: country || "United States",
        lat,
        lng,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to register" }, { status: 500 })
    }

    return NextResponse.json({ success: true, signup: data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Returns signup stats (state distribution, total, coordinates), user registration status, or admin signups list. */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const groupByState = searchParams.get("groupBy") === "state"
    const adminPassword = searchParams.get("password")
    const userId = searchParams.get("userId")

    if (userId) {
      const { data } = await supabase
        .from("cadathon_signups")
        .select("id")
        .eq("user_id", userId)
        .single()
      return NextResponse.json({ registered: !!data })
    }

    if (groupByState) {
      const { data, error } = await supabase
        .from("cadathon_signups")
        .select("city, location_state, country, lat, lng")

      if (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
      }

      const stateMap: Record<string, number> = {}
      let total = 0
      const locations: string[] = []
      const coordinates: { label: string; lat: number; lng: number }[] = []
      for (const row of data) {
        const loc = row.location_state || "Unknown"
        stateMap[loc] = (stateMap[loc] || 0) + 1
        total++
        if (row.location_state) locations.push(row.location_state)
        if (row.lat && row.lng) {
          const label = [row.city, row.location_state, row.country].filter(Boolean).join(", ")
          coordinates.push({ label, lat: row.lat, lng: row.lng })
        }
      }

      const stateDistribution = Object.entries(stateMap)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)

      return NextResponse.json({ stateDistribution, total, locations, coordinates })
    }

    if (adminPassword) {
      if (!(await verifyAdminPassword(adminPassword))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const adminSupabase = createAdminClient()
      const { data, error } = await adminSupabase
        .from("cadathon_signups")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: "Failed to fetch signups" }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from("cadathon_signups")
      .select("location_state")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    const stateMap: Record<string, number> = {}
    for (const row of data) {
      const state = row.location_state || "Unknown"
      stateMap[state] = (stateMap[state] || 0) + 1
    }

    const stateDistribution = Object.entries(stateMap)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total: data.length,
      stateDistribution,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
