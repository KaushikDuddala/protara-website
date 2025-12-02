import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { logEdit } from "@/lib/editLogger";
import { verifyAdminPassword } from "@/lib/verify-password";
import type { Product } from "@/lib/types/product";

interface CustomizationOption {
  option_value: string
  customization_id: string
  price_delta: number
}

interface Customization {
  type: string
  label: string
  options?: string[]
  priceDelta?: Record<string, number>
}

interface ProductImage {
  product_id: string
  url: string
  position: number
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

interface UpdateProductRequest extends ProductRequest {
  productId: string
}

interface DeleteProductRequest {
  password: string
  productId: string
}

interface ChangesRecord {
  before: any
  after: any
}

interface ProductData {
  id: string
  name: string
  price: number
  material: string
  category: string
  description: string
  detailed_description: string
  specifications: Record<string, any>
  customizations?: any
  updated_at?: string
}

interface ImageData {
  url: string
}

interface LogEditParams {
  adminName: string
  action: "CREATE" | "UPDATE" | "DELETE"
  tableName: string
  recordId: string
  recordName: string
  changes?: Record<string, { before: any; after: any }>
}

interface ProductInsertData {
  name: string
  price: number
  material: string
  category: string
  description: string
  detailed_description: string
  specifications: Record<string, any>
  community_designed?: boolean
}

interface CustomizationInsertData {
  product_id: string
  type: string
  label: string
}

interface OptionInsertData {
  customization_id: string
  option_value: string
  price_delta: number
}

interface ImageInsertData {
  product_id: string
  url: string
  position: number
}

interface CustomizationJsonData {
  product_id: string
  customizations: Customization[]
  updated_at?: string
}

interface ApiResponse<T = any> {
  success?: boolean
  productId?: string
  error?: string
  data?: T
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

    await logEdit({
      adminName,
      action: "CREATE",
      tableName: "products",
      recordId: productId,
      recordName: product.name,
      changes: {
        name: product.name,
        price: product.price,
        material: product.material,
        category: product.category,
      },
    })

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

      const { error: flatError } = await supabase
        .from("product_customizations_json")
        .insert([
          {
            product_id: productId,
            customizations: product.customizations,
          },
        ])

      if (flatError) throw flatError
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

/** Updates an existing product, its images, and customizations. Requires admin password. */
export async function PUT(req: NextRequest) {
  try {
    const { password, productId, product } = await req.json()

    const adminName = await verifyAdminPassword(password)
    if (!adminName) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { data: oldProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: product.name,
        price: product.price,
        material: product.material,
        category: product.category,
        description: product.description,
        detailed_description: product.detailedDescription,
        specifications: product.specifications || {},
        community_designed: product.community_designed || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (updateError) throw updateError

    const changes: Record<string, { before: any; after: any }> = {}
    
    const fieldMappings: Record<string, string> = {
      name: "name",
      price: "price",
      material: "material",
      category: "category",
      description: "description",
      detailed_description: "detailedDescription",
      specifications: "specifications",
      community_designed: "community_designed",
    }

    for (const [dbField, productField] of Object.entries(fieldMappings)) {
      const oldValue = oldProduct?.[dbField as keyof typeof oldProduct]
      const newValue = productField === "detailed_description" ? product.detailedDescription : product[productField as keyof typeof product]
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[dbField] = {
          before: oldValue,
          after: newValue,
        }
      }
    }

    const oldImages = oldProduct?.id ? (await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", oldProduct.id)).data?.map((img: ImageData) => img.url) || [] : []
    
    if (JSON.stringify(oldImages) !== JSON.stringify(product.images || [])) {
      changes.images = {
        before: oldImages,
        after: product.images || [],
      }
    }

    if (JSON.stringify(oldProduct?.customizations) !== JSON.stringify(product.customizations || [])) {
      changes.customizations = {
        before: oldProduct?.customizations || [],
        after: product.customizations || [],
      }
    }

    if (Object.keys(changes).length > 0) {
      await logEdit({
        adminName,
        action: "UPDATE",
        tableName: "products",
        recordId: productId,
        recordName: product.name,
        changes,
      })
    }

    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId)

    if (deleteImagesError) throw deleteImagesError

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

    const { error: deleteCustomError } = await supabase
      .from("product_customizations")
      .delete()
      .eq("product_id", productId)

    if (deleteCustomError) throw deleteCustomError

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

    const { error: flatError } = await supabase
      .from("product_customizations_json")
      .upsert([
        {
          product_id: productId,
          customizations: product.customizations || [],
          updated_at: new Date().toISOString(),
        },
      ])

    if (flatError) throw flatError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    )
  }
}

/** Deletes a product and its associated images and customizations. Requires admin password. */
export async function DELETE(req: NextRequest) {
  try {
    const { password, productId } = await req.json()

    const adminName = await verifyAdminPassword(password)
    if (!adminName) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    const { data: productData } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single()

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (deleteError) throw deleteError

    await logEdit({
      adminName,
      action: "DELETE",
      tableName: "products",
      recordId: productId,
      recordName: productData?.name || "Unknown",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    )
  }
}
