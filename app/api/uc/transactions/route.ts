export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!member) return NextResponse.json({ transactions: [] });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data: transactions, error: txErr } = await supabase
    .from('uc_transactions')
    .select('id, action_key, brand_id, amount, type, created_at')
    .eq('member_id', member.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (txErr) return NextResponse.json({ transactions: [] });

  return NextResponse.json({ transactions: transactions ?? [] });
}
