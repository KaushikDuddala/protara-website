import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { verifyAdminPassword } from "@/lib/verify-password";

interface Customization {
  type: string
  label: string
  options?: string[]
  priceDelta?: Record<string, number>
}

interface ProductRequest {
  password: string
  product: {
    name: string
    price: number
    material: string
    category: string
    description: string
    detailedDescription: string
    specifications?: Record<string, any>
    images?: string[]
    customizations?: Customization[]
    community_designed?: boolean
  }
}

/** Creates a new product with images and customizations. Requires admin password. */
export async function POST(req: NextRequest) {
  try {
    const { password, product } = await req.json()

    const adminName = await verifyAdminPassword(password)
    if (!adminName) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name: product.name,
          price: product.price,
          material: product.material,
          category: product.category,
          description: product.description,
          detailed_description: product.detailedDescription,
          specifications: product.specifications || {},
          community_designed: product.community_designed || false,
        },
      ])
      .select()

    if (productError) throw productError

    const productId = productData[0].id

    if (product.images && product.images.length > 0) {
      const imagesToInsert = product.images.map((url: string, index: number) => ({
        product_id: productId,
        url,
        position: index,
      }))

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imagesToInsert)

      if (imagesError) throw imagesError
    }

    if (product.customizations && product.customizations.length > 0) {
      for (const cust of product.customizations) {
        const { data: custData, error: custError } = await supabase
          .from("product_customizations")
          .insert([
            {
              product_id: productId,
              type: cust.type,
              label: cust.label,
            },
          ])
          .select()

        if (custError) throw custError

        const custId = custData[0].id

        if (cust.options && cust.options.length > 0) {
          const optionsToInsert = cust.options.map((opt: string) => ({
            customization_id: custId,
            option_value: opt,
            price_delta: cust.priceDelta?.[opt] || 0,
          }))

          const { error: optionsError } = await supabase
            .from("customization_options")
            .insert(optionsToInsert)

          if (optionsError) throw optionsError
        }
      }
    }

    return NextResponse.json({ success: true, productId })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    )
  }
}