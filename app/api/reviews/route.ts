import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/** Creates a new product review. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, title, description, rating, name, email, phone_number, item_bought } = body

    if (!product_id || !title || !description || !rating || !name || !email || !phone_number || !item_bought) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        title,
        description,
        rating,
        name,
        email,
        phone_number,
        item_bought,
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}