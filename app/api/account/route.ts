import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Updates the authenticated user's profile fields. */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, age, city, location_state, country } = body

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(age !== undefined && { age: age ? parseInt(age) : null }),
        ...(city !== undefined && { city }),
        ...(location_state !== undefined && { location_state }),
        ...(country !== undefined && { country }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
