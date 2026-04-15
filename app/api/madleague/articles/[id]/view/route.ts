import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// POST — 조회수 +1 (anonymous 허용)
export async function POST(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const sb = await createClient();
  await sb.rpc('mad_increment_article_views', { p_article_id: id });
  return NextResponse.json({ ok: true });
}
