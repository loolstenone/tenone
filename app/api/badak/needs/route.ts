import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// POST: 새 니즈 제출 — 동일 텍스트면 count++, 없으면 신규 생성(pending)
// 스팸 방지: 신규 니즈 생성은 인증 사용자만 허용. 기존 니즈 count++ 은 누구나 가능.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = (body.text ?? '').trim();
    if (!text || text.length < 2) {
      return NextResponse.json({ error: '니즈를 2자 이상 입력해주세요.' }, { status: 400 });
    }
    if (text.length > 60) {
      return NextResponse.json({ error: '60자 이하로 입력해주세요.' }, { status: 400 });
    }

    // 인증 토큰 추출 (없으면 비로그인 사용자)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    let isAuthenticated = false;

    if (token) {
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data: { user } } = await userClient.auth.getUser(token);
      isAuthenticated = !!user;
    }

    // 동일 텍스트 존재 여부 확인 (대소문자·공백 무시)
    const { data: existing } = await supabase
      .from('badak_needs')
      .select('id, count')
      .ilike('display_text', text)
      .maybeSingle();

    if (existing) {
      // 기존 니즈 카운트 증가 — 비로그인도 허용 (누구나 공감 가능)
      await supabase
        .from('badak_needs')
        .update({ count: existing.count + 1 })
        .eq('id', existing.id);
      return NextResponse.json({ status: 'incremented', id: existing.id });
    }

    // 신규 니즈 — 인증 사용자만 생성 허용 (스팸 방지)
    if (!isAuthenticated) {
      // 비로그인: 조용히 성공 처리 (클라이언트 UX 유지) — 실제로는 DB 저장 안 함
      return NextResponse.json({ status: 'submitted', note: 'login_required_for_new' });
    }

    // 신규 니즈 — pending_review 상태로 저장 (Badak이 검토 후 active로 전환)
    const { data: created, error: insertError } = await supabase
      .from('badak_needs')
      .insert({ display_text: text, count: 1, status: 'pending_review' })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json({ status: 'submitted' });
    }
    return NextResponse.json({ status: 'created', id: created.id }, { status: 201 });
  } catch {
    return NextResponse.json({ status: 'submitted' }); // fallback
  }
}

// GET: 니즈 목록 (관심 인원 많은 순, 최대 100개) + 연결된 모임 전체
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);

  const { data: needs, error } = await supabase
    .from('badak_needs')
    .select(`
      id, display_text, count, interest_count, fire_count, status,
      groups:badak_groups!need_id(
        id, title, meeting_type, max_members, current_members,
        schedule, location, event_date, status,
        leader:badak_members!badak_groups_leader_id_fkey(display_name, job_function)
      )
    `)
    .order('count', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // CloudWord 형식으로 변환
  const maxCount = needs?.[0]?.count ?? 1;

  const words = (needs ?? []).map((n) => {
    type RawGroup = {
      id: string; title: string; meeting_type: string;
      max_members: number; current_members: number;
      schedule: string | null; location: string | null; event_date: string | null;
      status: string;
      leader: { display_name: string; job_function: string } | null;
    };
    const rawGroups = (n.groups as unknown) as RawGroup[];

    // 활성 모임만 (closed/completed 제외)
    const activeGroups = rawGroups.filter(
      (g) => g.status !== 'closed' && g.status !== 'completed',
    );

    const groups = activeGroups.map((g) => ({
      id: g.id,
      title: g.title,
      type: (g.meeting_type === 'recurring' ? 'recurring' : 'once') as 'once' | 'recurring',
      maxMembers: g.max_members,
      currentMembers: g.current_members,
      leaderName: g.leader?.display_name ?? '바닥장',
      leaderJob: g.leader?.job_function ?? '',
      schedule: g.schedule ?? undefined,
      eventDate: g.event_date
        ? new Date(g.event_date).toLocaleDateString('ko-KR', {
            month: 'long', day: 'numeric', weekday: 'short',
          })
        : undefined,
      location: g.location ?? '',
      status: (g.status === 'confirmed' ? 'confirmed' : 'recruiting') as 'recruiting' | 'confirmed' | 'closed',
    }));

    return {
      needId: n.id,
      text: n.display_text,
      size: 0.8 + (n.count / maxCount) * 1.2, // 0.8 ~ 2.0
      hasGroup: groups.length > 0,
      members: n.count,
      interestCount: n.interest_count ?? 0,
      fireCount: n.fire_count ?? 0,
      groups,
      group: groups[0] ?? undefined, // 하위 호환
    };
  });

  return NextResponse.json({ words });
}
