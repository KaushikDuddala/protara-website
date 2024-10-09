import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { SHIPPING_COST, SHIPPING_LABEL } from "@/lib/shipping";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

/** Creates a Stripe Checkout session for the given cart items. */
export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()

    const supabase = await createClient()
    const { data: { session: authSession } } = await supabase.auth.getSession()

    const line_items = [
      ...items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            metadata: {
              material: item.material || "",
              id: String(item.id),
              ...((item.customizations && typeof item.customizations === "object") ? item.customizations : {}),
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: SHIPPING_LABEL,
          },
          unit_amount: Math.round(SHIPPING_COST * 100),
        },
        quantity: 1,
      }
    ]

    const baseUrl = "https://protaraprinting.com"
    const sessionOpts: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items,
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      mode: "payment",
      success_url: `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout-cancelled`,
      allow_promotion_codes: true,
    }

    if (authSession) {
      sessionOpts.customer_email = authSession.user.email
      sessionOpts.metadata = { user_id: authSession.user.id }
    }

    const session = await stripe.checkout.sessions.create(sessionOpts)

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
