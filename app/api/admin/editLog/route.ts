import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { verifyAdminPassword } from '@/lib/verify-password';

/** Fetches edit logs with optional admin name, action, and pagination filters. Requires password authentication. */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const password = searchParams.get('password');

  if (!password) {
    return NextResponse.json(
      { error: 'Password required' },
      { status: 401 }
    );
  }
  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();
    const adminName = searchParams.get('adminName');
    const action = searchParams.get('action');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('edit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (adminName) {
      query = query.eq('admin_name', adminName);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    const { data: allLogs } = await supabase
      .from('edit_logs')
      .select('admin_name')
      .order('admin_name')

    const uniqueAdmins = [...new Set((allLogs || []).map((a: any) => a.admin_name))]

    return NextResponse.json({
      logs: logs || [],
      admins: uniqueAdmins,
      count,
      total: count,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}