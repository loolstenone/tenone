import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createAdminClient();

const DAILY_LIMIT = 5;
const MERGE_THRESHOLD = 0.85;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

// POST: 새 니즈 제출 — 의미 유사(>0.85) 있으면 자동 머지, 없으면 신규 생성(pending)
// 하루 5개 한도: 비로그인=IP 기준, 로그인=user_id 기준
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

    // 인증 토큰 추출
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    let userId: string | null = null;

    if (token) {
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data: { user } } = await userClient.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const clientIp = getClientIp(request);

    // 1단계: 임베딩 생성 후 의미 유사 니즈 검색
    const embedding = await generateEmbedding(text);

    if (embedding) {
      const { data: similar } = await supabase.rpc('match_badak_needs', {
        query_embedding: embedding,
        match_threshold: MERGE_THRESHOLD,
        match_count: 1,
      });
      if (similar && similar.length > 0) {
        const newCount = similar[0].count + 1;
        await supabase
          .from('badak_needs')
          .update({ count: newCount })
          .eq('id', similar[0].id);
        return NextResponse.json({ status: 'merged', id: similar[0].id, count: newCount });
      }
    } else {
      // OpenAI 키 없을 때 폴백: 정확한 텍스트 매칭
      const { data: existing } = await supabase
        .from('badak_needs')
        .select('id, count')
        .ilike('display_text', text)
        .maybeSingle();
      if (existing) {
        const newCount = existing.count + 1;
        await supabase
          .from('badak_needs')
          .update({ count: newCount })
          .eq('id', existing.id);
        return NextResponse.json({ status: 'incremented', id: existing.id, count: newCount });
      }
    }

    // 2단계: 신규 니즈 — 하루 5개 한도 체크
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 로그인 사용자: user_id 기준, 비로그인: IP 기준
    const rateLimitQuery = userId
      ? supabase
          .from('badak_needs')
          .select('id', { count: 'exact', head: true })
          .eq('created_by_user_id', userId)
          .gte('created_at', todayStart.toISOString())
      : supabase
          .from('badak_needs')
          .select('id', { count: 'exact', head: true })
          .eq('created_by_ip', clientIp)
          .gte('created_at', todayStart.toISOString());

    const { count: todayCount } = await rateLimitQuery;

    if ((todayCount ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `하루 ${DAILY_LIMIT}개까지 새 니즈를 등록할 수 있습니다.` },
        { status: 429 },
      );
    }

    // 3단계: 신규 니즈 — pending_review 상태로 저장 (임베딩 포함)
    const { data: created, error: insertError } = await supabase
      .from('badak_needs')
      .insert({
        display_text: text,
        count: 1,
        status: 'pending_review',
        created_by_ip: clientIp,
        created_by_user_id: userId,
        embedding: embedding ? JSON.stringify(embedding) : null,
      })
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

async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (member?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return { userId: user.id };
}

const VALID_NEED_STATUSES = ['pending_review', 'gathering', 'group_created', 'rejected'] as const;

// PUT: 관리자 상태 변경
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  if (!VALID_NEED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const { error } = await supabase.from('badak_needs').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ updated: true });
}

// DELETE: 관리자 니즈 삭제
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabase.from('badak_needs').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: true });
}

// GET: 니즈 목록 + 연결된 모임 전체
// Query params:
//   limit   — 최대 반환 수 (기본 200, 최대 1000)
//   sort    — count(기본) | created_at
//   from    — 생성일 시작 (ISO 날짜, inclusive)
//   to      — 생성일 끝 (ISO 날짜, inclusive)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 1000);
  const sort = searchParams.get('sort') === 'created_at' ? 'created_at' : 'count';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('badak_needs')
    .select(`
      id, display_text, count, interest_count, fire_count, status, tags, created_at,
      groups:badak_groups!need_id(
        id, title, meeting_type, max_members, current_members,
        schedule, location, event_date, status,
        leader:badak_members!badak_groups_leader_id_fkey(display_name, job_function)
      )
    `)
    .not('status', 'in', '("pending_review","rejected")')
    .order(sort, { ascending: sort === 'created_at' ? false : false })
    .limit(limit);

  if (from) query = query.gte('created_at', from);
  if (to) {
    // to 날짜의 끝까지 포함 (23:59:59)
    const toEnd = new Date(to);
    toEnd.setDate(toEnd.getDate() + 1);
    query = query.lt('created_at', toEnd.toISOString());
  }

  const { data: needs, error } = await query;

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
      createdAt: n.created_at ?? undefined,
      groups,
      group: groups[0] ?? undefined, // 하위 호환
    };
  });

  return NextResponse.json({ words });
}
