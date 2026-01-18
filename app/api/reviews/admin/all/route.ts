import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdminPassword } from '@/lib/verify-password';

/** Returns all reviews grouped by product. Requires admin password via x-admin-password header. */
export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password')

    if (!(await verifyAdminPassword(adminPassword))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('product_id', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const groupedReviews = reviews.reduce((acc: any, review: any) => {
      if (!acc[review.product_id]) {
        acc[review.product_id] = []
      }
      acc[review.product_id].push(review)
      return acc
    }, {})

    return NextResponse.json({ reviews: groupedReviews })
  } catch (error) {
    console.error('Error fetching admin reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}