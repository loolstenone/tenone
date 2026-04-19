import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

  if (!member) return NextResponse.json({ balance: 0, lifetime_earned: 0 });

  const { data: uc } = await supabase
    .from('uc_balances')
    .select('balance, lifetime_earned')
    .eq('member_id', member.id)
    .maybeSingle();

  return NextResponse.json({
    balance: uc?.balance ?? 0,
    lifetime_earned: uc?.lifetime_earned ?? 0,
  });
}
