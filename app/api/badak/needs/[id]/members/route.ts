import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 해당 니즈에 관심 표명한 멤버 목록 (최대 20명)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: needId } = await params;

  const { data, error } = await supabase
    .from('badak_need_interests')
    .select(`
      member_id,
      badak_members!inner(id, display_name, job_function, avatar_url, profile_public)
    `)
    .eq('need_id', needId)
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  type RawRow = {
    member_id: string;
    badak_members: {
      id: string;
      display_name: string | null;
      job_function: string | null;
      avatar_url: string | null;
      profile_public: boolean | null;
    };
  };

  const members = (data as unknown as RawRow[]).map((row) => ({
    id: row.badak_members.id,
    displayName: row.badak_members.display_name,
    jobFunction: row.badak_members.job_function,
    avatarUrl: row.badak_members.avatar_url,
  }));

  return NextResponse.json({ members });
}
