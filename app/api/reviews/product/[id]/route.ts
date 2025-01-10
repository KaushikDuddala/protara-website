import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/** Returns public reviews and aggregated stats for a product. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const supabase = await createClient()

    const { data: reviews, error } = await supabase
      .from('public_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const { data: stats, error: statsError } = await supabase
      .from('review_stats')
      .select('*')
      .eq('product_id', productId)
      .single()

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Stats error:', statsError)
    }

    return NextResponse.json({
      reviews: reviews || [],
      stats: stats || { product_id: productId, total_reviews: 0, average_rating: 0 },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}