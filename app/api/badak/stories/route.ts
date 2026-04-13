import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const { data, error } = await supabase
    .from('badak_stories')
    .select(`
      id, title, content, before_role, after_role, created_at,
      member:badak_members!badak_stories_member_id_fkey(display_name, avatar_url, job_function)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ stories: [] });
  return NextResponse.json({ stories: data || [] });
}
