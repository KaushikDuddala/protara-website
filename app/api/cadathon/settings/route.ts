import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminPassword } from "@/lib/verify-password";

const DEFAULT_SETTINGS = {
  banner_enabled: false,
  start_date: null,
  end_date: null,
  prize_pool: "$250 Prize Pool",
  discord_link: "",
  registration_open: false,
  minimum_signups: 0,
  model_link_1: "",
  model_link_2: "",
  model_link_3: "",
  game_description: "",
}

/** Returns current Cadathon settings, or defaults if none exist. */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("cadathon_settings")
      .select("*")
      .limit(1)
      .maybeSingle()

    return NextResponse.json(data || DEFAULT_SETTINGS)
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

/** Creates or updates Cadathon settings. Requires admin password. */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, ...settings } = body

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 401 })
    }

    const auth = await verifyAdminPassword(password)
    if (!auth) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    const updateData: Record<string, unknown> = {
      ...settings,
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await adminSupabase
      .from("cadathon_settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    let result
    if (existing) {
      const { data, error } = await adminSupabase
        .from("cadathon_settings")
        .update(updateData)
        .eq("id", existing.id)
        .select()
      result = { data: data?.[0] ?? null, error }
    } else {
      const { data, error } = await adminSupabase
        .from("cadathon_settings")
        .insert(updateData)
        .select()
      result = { data: data?.[0] ?? null, error }
    }

    if (result.error) {
      return NextResponse.json({ error: `Failed to save settings: ${result.error.message}` }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
