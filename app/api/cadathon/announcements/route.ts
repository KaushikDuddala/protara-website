import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminPassword } from "@/lib/verify-password";

/** Returns all Cadathon announcements ordered by creation date. */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("cadathon_announcements")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Creates a new Cadathon announcement. Requires admin password. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, title, content } = body

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 401 })
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from("cadathon_announcements")
      .insert({ title: title?.trim() || "", content: content.trim() })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: `Failed to create announcement: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Updates an existing Cadathon announcement. Requires admin password. */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, id, title, content } = body

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 401 })
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    if (!id || !content?.trim()) {
      return NextResponse.json({ error: "ID and content are required" }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from("cadathon_announcements")
      .update({ title: title?.trim() || "", content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Deletes a Cadathon announcement by ID. Requires admin password. */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const password = searchParams.get("password")

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 401 })
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from("cadathon_announcements")
      .delete()
      .eq("id", parseInt(id))

    if (error) {
      return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
