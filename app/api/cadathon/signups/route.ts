import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

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
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "This email is already registered for the Cadathon" }, { status: 409 })
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
        location_state: location_state || null,
        country: country || "United States",
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