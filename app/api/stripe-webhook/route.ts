import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { SHIPPING_COST, SHIPPING_LABEL } from "@/lib/shipping";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-08-27.basil" as any });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/** Handles Stripe webhook events for completed checkout sessions. */
export async function POST(req: NextRequest) {
  try {
    if (!endpointSecret) {
      return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session & {
        shipping_details?: { name?: string; address?: Record<string, unknown> }
      }

      const supabase = await createClient()

      const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id)
      const lineItems = lineItemsResponse?.data || []

      const subtotal = (session.amount_subtotal || 0) / 100
      const total = (session.amount_total || 0) / 100

      const orderPayload: Record<string, unknown> = {
        stripe_session_id: session.id,
        status: "completed",
        subtotal,
        shipping: SHIPPING_COST,
        total,
        shipping_name: session.shipping_details?.name || null,
        shipping_address: session.shipping_details?.address || null,
        customer_email: session.customer_details?.email || null,
      }

      const userId = session.metadata?.user_id
      if (userId) {
        orderPayload.user_id = userId
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single()

      if (orderError) {
        console.error("Failed to create order:", orderError)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
      }

      if (lineItems.length > 0 && order) {
        const orderItems = lineItems
          .filter((item: Stripe.LineItem) => item.description !== SHIPPING_LABEL)
          .map((item: Stripe.LineItem) => ({
            order_id: order.id,
            product_id: item.price?.product ? parseInt(String(item.price.product)) : null,
            product_name: item.description || "Unknown",
            quantity: item.quantity || 1,
            unit_price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
            image_url: null,
          }))

        if (orderItems.length > 0) {
          await supabase.from("order_items").insert(orderItems)
        }
      }

      fetch("http://ntfy.sh/protara-orders-c", {
        method: "POST",
        body: "New order received from " + JSON.stringify(session.customer_details),
        headers: {
          "Title": "New order received.",
          "Priority": "urgent",
        },
      })
    }

    return NextResponse.json({ status: 200 })
  } catch (err) {
    console.error(err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }
}
