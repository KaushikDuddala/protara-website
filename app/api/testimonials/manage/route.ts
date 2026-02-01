import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logEdit } from "@/lib/editLogger";
import { verifyAdminPassword } from "@/lib/verify-password";

/** Returns all testimonials with product info for admin management. Requires admin password. */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const adminName = await verifyAdminPassword(password)
    if (!adminName) return NextResponse.json({ error: "Invalid password" }, { status: 401 })

    const supabase = createAdminClient()
    const { data: testimonialsData, error: testimonialsError } = await supabase
      .from("testimonials")
      .select("*")
      .order("timestamp", { ascending: false })

    if (testimonialsError) {
      console.error("Failed to fetch testimonials:", testimonialsError)
      return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
    }

    const productIds = Array.from(new Set((testimonialsData || []).map((t: any) => t.product_id).filter(Boolean)))

    let productsMap: { [k: number]: any } = {}
    if (productIds.length > 0) {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, slug")
        .in("id", productIds)

      if (!productsError && productsData) {
        const { data: imagesData } = await supabase
          .from("product_images")
          .select("product_id, url")
          .in("product_id", productIds)

        const imagesByProduct: { [k: number]: string[] } = {}
        const imagesArray = Array.isArray(imagesData) ? imagesData : []
        imagesArray.forEach((img: any) => {
          const pid = img?.product_id
          if (!pid) return
          imagesByProduct[pid] = imagesByProduct[pid] || []
          if (img.url) imagesByProduct[pid].push(img.url)
        })

        productsData.forEach((p: any) => {
          productsMap[p.id] = {
            id: p.id,
            name: p.name,
            slug: p.slug,
            images: imagesByProduct[p.id] || [],
          }
        })
      }
    }

    const enriched = (testimonialsData || []).map((t: any) => ({
      ...t,
      product: t.product_id ? productsMap[t.product_id] || null : null,
    }))

    return NextResponse.json({ testimonials: enriched })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Updates a testimonial's status (approve/reject). Requires admin password. */
export async function PUT(req: NextRequest) {
  try {
    const { password, testimonialId, status } = await req.json()
    const adminName = await verifyAdminPassword(password)
    if (!adminName) return NextResponse.json({ error: "Invalid password" }, { status: 401 })

    if (!testimonialId || !status) {
      return NextResponse.json({ error: "testimonialId and status required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: existing } = await supabase.from("testimonials").select("*").eq("id", testimonialId).single();

    const { error } = await supabase
      .from("testimonials")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", testimonialId)

    if (error) {
      console.error("Failed to update testimonial:", error)
      return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
    }

    try {
      await logEdit({
        adminName,
        action: "UPDATE",
        tableName: "testimonials",
        recordId: testimonialId,
        recordName: existing?.customer_name || null,
        changes: { status: { before: existing?.status, after: status } },
      })
    } catch (e) {
      console.error("Failed to log testimonial update:", e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Deletes a testimonial. Requires admin password. */
export async function DELETE(req: NextRequest) {
  try {
    const { password, testimonialId } = await req.json()
    const adminName = await verifyAdminPassword(password)
    if (!adminName) return NextResponse.json({ error: "Invalid password" }, { status: 401 })

    if (!testimonialId) return NextResponse.json({ error: "testimonialId required" }, { status: 400 })

    const supabase = createAdminClient()
    const { data: existing } = await supabase.from("testimonials").select("*").eq("id", testimonialId).single();

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", testimonialId)

    if (error) {
      console.error("Failed to delete testimonial:", error)
      return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
    }

    try {
      await logEdit({
        adminName,
        action: "DELETE",
        tableName: "testimonials",
        recordId: testimonialId,
        recordName: existing?.customer_name || null,
        changes: { before: existing || null },
      })
    } catch (e) {
      console.error("Failed to log testimonial deletion:", e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
