import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { createAdminClient } from "@/lib/supabase/admin";

/** Uploads an image, compresses it to WebP, and returns the public URL. */
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    const bucket = (formData.get("bucket") as string) || "product-images"
    const prefix = (formData.get("prefix") as string) || bucket

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const compressed = await sharp(buffer)
      .resize(1200, undefined, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 80 })
      .toBuffer()

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "") + ".webp"
    const filename = `${prefix}/${timestamp}-${randomStr}-${safeName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, compressed, {
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    )
  }
}
