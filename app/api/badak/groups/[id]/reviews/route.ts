import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { earnUC } from '@/lib/supabase/uc';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 후기 목록 (부모 시즌 후기 포함)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;

  // 현재 그룹의 시즌 정보 조회
  const { data: group } = await supabase
    .from('badak_groups')
    .select('id, season_number, parent_group_id')
    .eq('id', groupId)
    .single();

  const fetchReviews = async (gid: string, seasonNum: number) => {
    const { data, error } = await supabase
      .from('badak_group_reviews')
      .select(`
        id, rating, content, created_at,
        member:badak_members!badak_group_reviews_member_id_fkey(
          id, display_name, job_function, avatar_url
        )
      `)
      .eq('group_id', gid)
      .order('created_at', { ascending: false });
    if (error) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => {
      const m = Array.isArray(r.member) ? r.member[0] : r.member;
      return {
        id: r.id as string,
        rating: r.rating as number,
        content: r.content as string,
        created_at: r.created_at as string,
        author: m?.display_name ?? '알 수 없음',
        job_function: m?.job_function ?? null,
        avatar_url: m?.avatar_url ?? null,
        member_id: m?.id,
        season_number: seasonNum,
      };
    });
  };

  const currentReviews = await fetchReviews(groupId, group?.season_number ?? 1);

  // 부모 그룹 후기 추가 (시즌 연속 모임인 경우)
  let inheritedReviews: typeof currentReviews = [];
  if (group?.parent_group_id) {
    const { data: parentGroup } = await supabase
      .from('badak_groups')
      .select('id, season_number')
      .eq('id', group.parent_group_id)
      .single();
    if (parentGroup) {
      inheritedReviews = await fetchReviews(parentGroup.id, parentGroup.season_number ?? 1);
    }
  }

  const reviews = [...currentReviews, ...inheritedReviews];
  return NextResponse.json({ reviews });
}

// POST: 후기 작성 (참여 완료 멤버만)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  // 종료된 모임에만 후기 가능 (title도 함께 가져옴)
  const { data: group } = await supabase
    .from('badak_groups')
    .select('status, title')
    .eq('id', groupId)
    .single();
  if (group?.status !== 'completed') {
    return NextResponse.json({ error: '종료된 모임에만 후기를 남길 수 있습니다' }, { status: 400 });
  }

  const body = await request.json();
  if (!body.rating || !body.content?.trim()) {
    return NextResponse.json({ error: 'rating and content required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('badak_group_reviews')
    .insert({
      group_id: groupId,
      member_id: member.id,
      rating: body.rating,
      content: body.content.trim(),
    })
    .select()
    .single();

  if (error) {
    const isUnique = error.code === '23505';
    return NextResponse.json({ error: error.message }, { status: isUnique ? 409 : 400 });
  }

  // UC 코인 지급 (모임 후기 작성)
  const { data: memberRow } = await supabase
    .from('members')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (memberRow) {
    await earnUC(memberRow.id, 'write_review', 'badak');
  }

  // 커뮤니티 후기 보드에도 자동 집계
  await supabase.from('badak_community_posts').insert({
    user_id: user.id,
    member_id: member.id,
    board: 'review',
    title: `[후기] ${group?.title ?? '모임'} — ★${body.rating}`,
    content: body.content.trim(),
    group_id: groupId,
    rating: body.rating,
    tags: [],
  });

  return NextResponse.json({ review: data });
}
