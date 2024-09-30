import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/product";

/** Returns all products with their images assembled. */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true })

    if (productsError) throw productsError

    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("product_id, url, position")
      .order("product_id, position")

    if (imagesError) throw imagesError

    const imagesByProduct: { [key: number]: string[] } = {}
    imagesData?.forEach((img: any) => {
      if (!imagesByProduct[img.product_id]) {
        imagesByProduct[img.product_id] = []
      }
      imagesByProduct[img.product_id][img.position || 0] = img.url
    })

    const formattedProducts: Product[] = productsData?.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      material: p.material,
      category: p.category,
      description: p.description,
      detailedDescription: p.detailed_description,
      specifications: p.specifications || {},
      images: imagesByProduct[p.id] || [],
      community_designed: p.community_designed || false,
      created_at: p.created_at,
      updated_at: p.updated_at,
    })) || []

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}