import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

/**
 * GET /api/badak/my/groups
 * 내가 개설한 모임 (바닥장) + 내가 참여 신청한 모임 반환
 *
 * Response:
 *   { ledGroups: MyGroup[], joinedGroups: JoinedGroup[] }
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // badak_member id 조회
  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ ledGroups: [], joinedGroups: [] });
  }

  // ── 1. 내가 개설한 모임 ──
  const { data: ledGroupsRaw } = await supabase
    .from('badak_groups')
    .select(`
      id, title, status, max_members, current_members,
      schedule, location, next_date, notice,
      meeting_type, join_type
    `)
    .eq('leader_id', member.id)
    .order('created_at', { ascending: false });

  const ledGroups = await Promise.all(
    (ledGroupsRaw || []).map(async (g) => {
      // 지원자 목록 (badak_group_members JOIN badak_members)
      const { data: applicantsRaw } = await supabase
        .from('badak_group_members')
        .select(`
          id, status, message, created_at,
          member:badak_members!badak_group_members_member_id_fkey(id, display_name, job_function, experience_years)
        `)
        .eq('group_id', g.id)
        .order('created_at', { ascending: true });

      const applicants = (applicantsRaw || []).map((a) => {
        const m = (a.member as unknown) as { id: string; display_name: string; job_function: string; experience_years: number } | null;
        const expLabel = m?.experience_years
          ? `${m.job_function || ''} ${m.experience_years}년차`.trim()
          : m?.job_function || '';
        return {
          id: a.id,
          memberId: m?.id || '',
          name: m?.display_name || '(알 수 없음)',
          job: expLabel,
          message: a.message || '',
          status: a.status as 'applied' | 'approved' | 'rejected',
          appliedAt: new Date(a.created_at).toLocaleDateString('ko-KR'),
        };
      });

      const members = applicants
        .filter((a) => a.status === 'approved')
        .map((a) => ({
          id: a.memberId,
          name: a.name,
          job: a.job,
          joinedAt: a.appliedAt,
        }));

      return {
        id: g.id,
        title: g.title,
        type: (g.meeting_type === 'once' ? 'once' : 'recurring') as 'once' | 'recurring',
        joinType: (g.join_type || 'approval') as 'approval' | 'firstcome',
        status: g.status as 'recruiting' | 'confirmed' | 'closed',
        currentMembers: g.current_members || 0,
        maxMembers: g.max_members || 0,
        schedule: g.schedule || '',
        location: g.location || '',
        nextDate: g.next_date || undefined,
        notice: g.notice || undefined,
        applicants,
        members,
      };
    }),
  );

  // ── 2. 내가 참여 신청한 모임 (joined) ──
  const { data: joinedRaw } = await supabase
    .from('badak_group_members')
    .select(`
      status,
      group:badak_groups!badak_group_members_group_id_fkey(
        id, title, schedule, location, next_date, meeting_type,
        leader:badak_members!badak_groups_leader_id_fkey(display_name)
      )
    `)
    .eq('member_id', member.id)
    .order('created_at', { ascending: false });

  const joinedGroups = (joinedRaw || [])
    .filter((j) => j.group)
    .map((j) => {
      const g = (j.group as unknown) as {
        id: string; title: string; schedule: string; location: string;
        next_date: string | null; meeting_type: string;
        leader: { display_name: string } | null;
      };
      return {
        id: g.id,
        title: g.title,
        type: (g.meeting_type === 'once' ? 'once' : 'recurring') as 'once' | 'recurring',
        leaderName: g.leader?.display_name || '',
        myStatus: j.status as 'applied' | 'approved' | 'rejected',
        nextDate: g.next_date || undefined,
        schedule: g.schedule || '',
        location: g.location || '',
      };
    });

  return NextResponse.json({ ledGroups, joinedGroups });
}
