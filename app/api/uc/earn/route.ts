import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { earnUC } from '@/lib/supabase/uc';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const { action_key, brand_id = null } = await request.json();
  if (!action_key) return NextResponse.json({ error: 'action_key required' }, { status: 400 });

  const result = await earnUC(member.id, action_key, brand_id);
  return NextResponse.json(result);
}
