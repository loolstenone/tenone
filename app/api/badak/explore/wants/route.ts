import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { topMatches, generateWants, type MatchMode } from '@/lib/wio/people/matching';
import { loadBadakSignals, loadBadakPeerSignals, loadNeedTextMap } from '@/lib/wio/people/signals';

const supabase = createAdminClient();

// GET /api/badak/explore/wants?limit=10
// 니즈×니즈 → 공동 지향(Wants) 카드. 실시간 계산.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 30);

  const me = await loadBadakSignals(supabase, user.id);
  if (!me) return NextResponse.json({ wants: [] });

  const peers = await loadBadakPeerSignals(supabase, user.id, 500);

  // 3모드 각각 매칭 → Wants 생성 → 병합
  const modes: MatchMode[] = ['needs_match', 'mutual', 'network'];
  const allMatches = modes.flatMap((m) =>
    topMatches(me, peers, m, { limit: 10, minScore: 2 }),
  );

  // Wants 생성용: 모든 공유 니즈 ID 수집 후 텍스트 매핑
  const allNeedIds = Array.from(new Set([
    ...(me.needIds ?? []),
    ...peers.flatMap((p) => p.needIds ?? []),
  ]));
  const needTextById = await loadNeedTextMap(supabase, allNeedIds);

  const wants = generateWants(me, allMatches, peers, { needTextById, limit });

  // peer 표시 정보 붙이기
  const peerIds = Array.from(new Set(wants.flatMap((w) => w.memberIds.filter((id) => id !== me.userId))));
  const { data: memberRows } = peerIds.length > 0
    ? await supabase
        .from('badak_members')
        .select('user_id, id, display_name, avatar_url, job_function, experience_years')
        .in('user_id', peerIds)
    : { data: [] };

  const peerInfo = new Map(
    (memberRows ?? []).map((m: {
      user_id: string; id: string; display_name: string; avatar_url: string | null;
      job_function: string | null; experience_years: number | null;
    }) => [m.user_id, m]),
  );

  const enrichedWants = wants.map((w) => {
    const otherIds = w.memberIds.filter((id) => id !== me.userId);
    const others = otherIds.map((id) => {
      const info = peerInfo.get(id);
      return {
        userId: id,
        memberId: info?.id ?? null,
        displayName: info?.display_name ?? '바닥 멤버',
        avatarUrl: info?.avatar_url ?? null,
        jobFunction: info?.job_function ?? null,
        experienceYears: info?.experience_years ?? null,
      };
    });
    return {
      needIds: w.needIds,
      needTexts: w.needIds.map((id) => needTextById[id]).filter(Boolean),
      mode: w.mode,
      score: w.score,
      reasons: w.reasons,
      suggestedTitle: w.suggestedTitle,
      others,
    };
  });

  return NextResponse.json({ wants: enrichedWants });
}
