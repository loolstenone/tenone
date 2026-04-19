import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 내가 관심 표명한 니즈 목록
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!member) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('badak_need_interests')
    .select(`
      need_id,
      created_at,
      badak_needs!inner(id, display_text, count, status)
    `)
    .eq('member_id', member.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  type RawRow = {
    need_id: string;
    created_at: string;
    badak_needs: {
      id: string;
      display_text: string | null;
      count: number | null;
      status: string | null;
    };
  };

  const needs = (data as unknown as RawRow[]).map((row) => ({
    id: row.badak_needs.id,
    displayText: row.badak_needs.display_text,
    count: row.badak_needs.count ?? 0,
    status: row.badak_needs.status,
    interestedAt: row.created_at,
  }));

  return NextResponse.json({ needs });
}
