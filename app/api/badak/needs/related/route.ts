import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

// GET /api/badak/needs/related?needId=xxx
// 해당 니즈의 embedding으로 유사 니즈 4개 반환
export async function GET(request: NextRequest) {
  const needId = request.nextUrl.searchParams.get('needId');
  if (!needId) {
    return NextResponse.json({ words: [] });
  }

  try {
    // 1. 해당 니즈의 embedding 조회
    const { data: need, error } = await supabase
      .from('badak_needs')
      .select('embedding, text')
      .eq('id', needId)
      .single();

    if (error || !need?.embedding) {
      return NextResponse.json({ words: [] });
    }

    // 2. embedding으로 유사 니즈 검색 (자기 자신 제외, threshold 낮게)
    const { data: similar, error: rpcError } = await supabase.rpc('match_badak_needs', {
      query_embedding: need.embedding,
      match_threshold: 0.6,
      match_count: 10,
    });

    if (rpcError || !similar?.length) {
      return NextResponse.json({ words: [] });
    }

    // 3. 자기 자신 제외 + status=approved만 + 상위 4개
    const related = similar
      .filter((r: { id: string; text: string; member_count: number; status: string; has_group: boolean; similarity: number }) =>
        r.id !== needId && r.status === 'approved'
      )
      .slice(0, 4)
      .map((r: { id: string; text: string; member_count: number; has_group: boolean; similarity: number }) => ({
        needId: r.id,
        text: r.text,
        members: r.member_count,
        hasGroup: r.has_group,
        size: Math.max(1, Math.min(3, r.member_count / 5)),
        similarity: Math.round(r.similarity * 100),
      }));

    return NextResponse.json({ words: related });
  } catch {
    return NextResponse.json({ words: [] });
  }
}
