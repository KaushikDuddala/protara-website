import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminPassword } from "@/lib/verify-password";

/** Returns all STEM Box product entries with joined product data. */
export async function GET() {
  try {
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from("stem_box_products")
      .select("id, product_id, created_at, products(*)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch stem box products" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Adds a product to STEM Boxes. Requires admin password. */
export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const body = await request.json()
    const { password, product_id } = body

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from("stem_box_products")
      .insert({ product_id })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Product is already in STEM Boxes" }, { status: 409 })
      }
      return NextResponse.json({ error: "Failed to add product" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Removes a product from STEM Boxes. Requires admin password. */
export async function DELETE(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    const body = await request.json()
    const { password, product_id } = body

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 })
    }

    const { error } = await adminSupabase
      .from("stem_box_products")
      .delete()
      .eq("product_id", product_id)

    if (error) {
      return NextResponse.json({ error: "Failed to remove product" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
