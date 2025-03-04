import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminPassword } from "@/lib/verify-password";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

/** Returns all blogs, or a single blog by slug query param. */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get("slug")

    const supabase = await createClient()
    if (slug) {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single()
      if (error) return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Creates a new blog post. Requires admin password. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, title, content, image_url, video_url } = body

    if (!password) return NextResponse.json({ error: "Password required" }, { status: 401 })
    if (!(await verifyAdminPassword(password))) return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Title and content are required" }, { status: 400 })

    let slug = slugify(title)
    if (!slug) slug = "post"

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from("blogs")
      .insert({ title: title.trim(), slug, content: content.trim(), image_url: image_url || "", video_url: video_url || "" })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        slug = `${slug}-${Date.now()}`
        const { data: retry } = await adminSupabase
          .from("blogs")
          .insert({ title: title.trim(), slug, content: content.trim(), image_url: image_url || "", video_url: video_url || "" })
          .select()
          .single()
        if (retry) return NextResponse.json(retry)
      }
      return NextResponse.json({ error: `Failed to create blog: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Updates an existing blog post by ID. Requires admin password. */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, id, title, content, image_url, video_url } = body

    if (!password) return NextResponse.json({ error: "Password required" }, { status: 401 })
    if (!(await verifyAdminPassword(password))) return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title?.trim()) { update.title = title.trim(); update.slug = slugify(title) }
    if (content?.trim()) update.content = content.trim()
    if (image_url !== undefined) update.image_url = image_url
    if (video_url !== undefined) update.video_url = video_url

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from("blogs")
      .update(update)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: `Failed to update blog: ${error.message}` }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Deletes a blog post by ID. Requires admin password. */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const password = searchParams.get("password")

    if (!password) return NextResponse.json({ error: "Password required" }, { status: 401 })
    if (!(await verifyAdminPassword(password))) return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from("blogs")
      .delete()
      .eq("id", parseInt(id))

    if (error) return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
