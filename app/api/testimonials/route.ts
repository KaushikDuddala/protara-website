import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface Testimonial {
  customerName: string
  rating: number
  testimonial: string
  verifiedPurchase: boolean
  timestamp: string
  status: "pending" | "approved" | "rejected"
  productId?: number | null
  contact: string
}

/** Submits a new testimonial for review. */
export async function POST(req: NextRequest) {
  try {
    const testimonial: Testimonial = await req.json()

    if (!testimonial.customerName || !testimonial.testimonial || !testimonial.rating || !testimonial.contact) {
      return NextResponse.json(
        { error: "Name, testimonial, rating, and contact information are required" },
        { status: 400 }
      )
    }

    if (testimonial.rating < 1 || testimonial.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    if (testimonial.testimonial.length > 500) {
      return NextResponse.json(
        { error: "Testimonial must be less than 500 characters" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const insertPayload: any = {
      customer_name: testimonial.customerName,
      rating: testimonial.rating,
      testimonial: testimonial.testimonial,
      verified_purchase: testimonial.verifiedPurchase || false,
      timestamp: testimonial.timestamp,
      status: "pending",
      contact: testimonial.contact,
    }

    if (testimonial.productId) insertPayload.product_id = testimonial.productId

    const { data, error } = await supabase
      .from("testimonials")
      .insert([insertPayload])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to save testimonial" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      testimonialId: data[0].id,
      message: "Thank you! Your testimonial has been submitted for review." 
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/** Returns approved testimonials with the reviewer's name joined from profiles. */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("testimonials")
      .select("*, profiles (name)")
      .eq("status", "approved")
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to fetch testimonials" },
        { status: 500 }
      )
    }

    const enriched = (data || []).map((t: any) => ({
      ...t,
      user: { name: t.profiles?.name || "" },
    }))

    return NextResponse.json({ testimonials: enriched })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}