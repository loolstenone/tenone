import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { topMatches, type MatchMode } from '@/lib/wio/people/matching';
import { loadBadakSignals, loadBadakPeerSignals } from '@/lib/wio/people/signals';

const supabase = createAdminClient();

const VALID_MODES: MatchMode[] = ['needs_match', 'mutual', 'network'];

// GET /api/badak/explore/people?mode=needs_match&limit=20
// 매칭 점수 상위 N명 + 근거
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const modeParam = (searchParams.get('mode') ?? 'needs_match') as MatchMode;
  const mode: MatchMode = VALID_MODES.includes(modeParam) ? modeParam : 'needs_match';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);

  // 1) 내 시그널
  const me = await loadBadakSignals(supabase, user.id);
  if (!me) {
    return NextResponse.json(
      { error: '먼저 바닥 가입이 필요해요', matches: [], peers: [] },
      { status: 200 },
    );
  }

  // 2) 후보군 시그널
  const peers = await loadBadakPeerSignals(supabase, user.id, 500);

  // 3) 매칭 계산
  const matches = topMatches(me, peers, mode, { limit, minScore: 1 });

  // 4) 매칭된 peer 정보를 카드 렌더링용으로 fetch
  const matchedUserIds = matches.map((m) => m.peerId);
  const { data: memberRows } = matchedUserIds.length > 0
    ? await supabase
        .from('badak_members')
        .select('id, user_id, display_name, avatar_url, industry, job_function, experience_years')
        .in('user_id', matchedUserIds)
    : { data: [] };

  const peerInfoByUserId = new Map(
    (memberRows ?? []).map((m: {
      id: string; user_id: string; display_name: string; avatar_url: string | null;
      industry: string | null; job_function: string | null; experience_years: number | null;
    }) => [m.user_id, m]),
  );

  const enriched = matches.map((m) => {
    const info = peerInfoByUserId.get(m.peerId);
    return {
      peerId: m.peerId,
      memberId: info?.id ?? null,
      displayName: info?.display_name ?? '바닥 멤버',
      avatarUrl: info?.avatar_url ?? null,
      industry: info?.industry ?? null,
      jobFunction: info?.job_function ?? null,
      experienceYears: info?.experience_years ?? null,
      score: m.score,
      reasons: m.reasons,
      mode: m.mode,
    };
  });

  return NextResponse.json({ mode, matches: enriched });
}
