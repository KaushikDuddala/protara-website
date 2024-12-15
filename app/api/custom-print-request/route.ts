import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface CustomPrintRequest {
  type: "request" | "upload"
  productName: string
  budget: string
  description: string
  email: string
  phone?: string
  timestamp: string
  status: "pending" | "reviewing" | "responded" | "completed"
}

async function sendNotification(request: CustomPrintRequest, requestId: string) {
  try {
    const message = `New Custom Print Request:\nProduct: ${request.productName}\nBudget: ${request.budget}\nEmail: ${request.email}\nPhone: ${request.phone || "Not provided"}\nRequest ID: ${requestId}`

    await fetch("https://ntfy.sh/protara_custom_requests", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: message,
    })
  } catch (error) {
    console.error("Failed to send notification:", error)
  }
}

/** Submits a custom print request and sends a notification. */
export async function POST(req: NextRequest) {
  try {
    const request: CustomPrintRequest = await req.json()

    if (!request.productName || !request.budget || !request.email) {
      return NextResponse.json(
        { error: "Product name, budget, and email are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("custom_print_requests")
      .insert([
        {
          type: request.type,
          product_name: request.productName,
          budget: request.budget,
          description: request.description || "",
          email: request.email,
          phone_number: request.phone || null,
          timestamp: request.timestamp,
          status: request.status,
        },
      ])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to save request" },
        { status: 500 }
      )
    }

    sendNotification(request, data[0].id)

    return NextResponse.json({
      success: true,
      requestId: data[0].id,
      message: "Request submitted successfully"
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}