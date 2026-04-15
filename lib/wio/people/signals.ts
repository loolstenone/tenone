/**
 * WIO People — Signal Aggregator
 *
 * 한 사용자의 매칭 시그널을 여러 테이블에서 모아 PersonSignals 객체로 정규화한다.
 * Badak이 첫 소비자. HeRo·MADLeague 등 다른 브랜드도 재사용.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PersonSignals } from './matching';

/**
 * Badak 컨텍스트에서 특정 auth user의 시그널을 집계한다.
 * - badak_members: 프로필/매칭 모드/offer·need
 * - badak_need_interests: 관심 표현한 니즈
 * - badak_needs: 직접 제출한 니즈 (향후 author_id 필드 필요)
 * - badak_group_members: 참여한 모임
 * - members (대표): affiliations
 */
export async function loadBadakSignals(
  supabase: SupabaseClient,
  userId: string,
): Promise<PersonSignals | null> {
  const { data: member } = await supabase
    .from('badak_members')
    .select(`
      id, user_id, display_name,
      industry, job_function, experience_years,
      looking_for, can_offer, interest_tags,
      profile_public, open_to_needs, open_to_partner, open_to_network
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (!member) return null;

  const memberId = member.id;

  // 공감/관심 표현한 니즈 ID (실제 사용 테이블: badak_needs_interests, user_id 컬럼)
  const { data: interests } = await supabase
    .from('badak_needs_interests')
    .select('need_id')
    .eq('user_id', userId);
  const needIds = (interests ?? []).map((r: { need_id: string }) => r.need_id);

  // 참여한 모임 ID (badak_group_members는 member_id 컬럼 사용)
  const { data: memberships } = await supabase
    .from('badak_group_members')
    .select('group_id')
    .eq('member_id', memberId);
  const groupIds = (memberships ?? []).map((r: { group_id: string }) => r.group_id);

  // 유니버스 공통 활동 (members 대표 테이블)
  const { data: mainMember } = await supabase
    .from('members')
    .select('affiliations')
    .eq('auth_id', userId)
    .maybeSingle();
  const affiliations: string[] = (mainMember as { affiliations?: string[] } | null)?.affiliations ?? [];

  return {
    userId,
    industry: member.industry,
    jobFunction: member.job_function,
    experienceYears: member.experience_years,
    lookingFor: member.looking_for ?? [],
    canOffer: member.can_offer ?? [],
    interestTags: member.interest_tags ?? [],
    affiliations,
    needIds,
    authoredNeedIds: [], // TODO: badak_needs.author_id 필드 추가 후 채우기
    groupIds,
    openToNeeds: member.open_to_needs !== false,
    openToPartner: member.open_to_partner === true,
    openToNetwork: member.open_to_network !== false,
    profilePublic: member.profile_public !== false,
  };
}

/**
 * 여러 Badak 멤버의 시그널을 한 번에 로드 (매칭 후보군).
 * 비공개 프로필(`profile_public=false`)은 제외된다.
 */
export async function loadBadakPeerSignals(
  supabase: SupabaseClient,
  excludeUserId: string,
  limit = 500,
): Promise<PersonSignals[]> {
  const { data: members } = await supabase
    .from('badak_members')
    .select(`
      id, user_id, display_name,
      industry, job_function, experience_years,
      looking_for, can_offer, interest_tags,
      profile_public, open_to_needs, open_to_partner, open_to_network
    `)
    .neq('user_id', excludeUserId)
    .not('user_id', 'is', null)
    .eq('profile_public', true)
    .limit(limit);

  if (!members || members.length === 0) return [];

  const userIds = members.map((m: { user_id: string }) => m.user_id);
  const memberIds = members.map((m: { id: string }) => m.id);
  const memberIdToUserId = new Map<string, string>(
    members.map((m: { id: string; user_id: string }) => [m.id, m.user_id]),
  );

  // 배치로 관심/참여/유니버스 활동 수집
  const [{ data: allInterests }, { data: allGroupMembers }, { data: allMainMembers }] = await Promise.all([
    supabase.from('badak_needs_interests').select('user_id, need_id').in('user_id', userIds),
    supabase.from('badak_group_members').select('member_id, group_id').in('member_id', memberIds),
    supabase.from('members').select('auth_id, affiliations').in('auth_id', userIds),
  ]);

  const needIdsByUser = new Map<string, string[]>();
  (allInterests ?? []).forEach((r: { user_id: string; need_id: string }) => {
    const arr = needIdsByUser.get(r.user_id) ?? [];
    arr.push(r.need_id);
    needIdsByUser.set(r.user_id, arr);
  });

  const groupIdsByUser = new Map<string, string[]>();
  (allGroupMembers ?? []).forEach((r: { member_id: string; group_id: string }) => {
    const uid = memberIdToUserId.get(r.member_id);
    if (!uid) return;
    const arr = groupIdsByUser.get(uid) ?? [];
    arr.push(r.group_id);
    groupIdsByUser.set(uid, arr);
  });

  const affiliationsByUser = new Map<string, string[]>();
  (allMainMembers ?? []).forEach((r: { auth_id: string; affiliations: string[] | null }) => {
    affiliationsByUser.set(r.auth_id, r.affiliations ?? []);
  });

  return members.map((m: {
    user_id: string;
    industry: string | null;
    job_function: string | null;
    experience_years: number | null;
    looking_for: string[] | null;
    can_offer: string[] | null;
    interest_tags: string[] | null;
    profile_public: boolean;
    open_to_needs: boolean;
    open_to_partner: boolean;
    open_to_network: boolean;
  }) => ({
    userId: m.user_id,
    industry: m.industry,
    jobFunction: m.job_function,
    experienceYears: m.experience_years,
    lookingFor: m.looking_for ?? [],
    canOffer: m.can_offer ?? [],
    interestTags: m.interest_tags ?? [],
    affiliations: affiliationsByUser.get(m.user_id) ?? [],
    needIds: needIdsByUser.get(m.user_id) ?? [],
    authoredNeedIds: [],
    groupIds: groupIdsByUser.get(m.user_id) ?? [],
    openToNeeds: m.open_to_needs !== false,
    openToPartner: m.open_to_partner === true,
    openToNetwork: m.open_to_network !== false,
    profilePublic: m.profile_public !== false,
  }));
}

/**
 * 니즈 ID → 표시 텍스트 매핑 (WantsCard의 suggestedTitle 생성용)
 */
export async function loadNeedTextMap(
  supabase: SupabaseClient,
  needIds: string[],
): Promise<Record<string, string>> {
  if (needIds.length === 0) return {};
  const unique = Array.from(new Set(needIds));
  const { data } = await supabase
    .from('badak_needs')
    .select('id, display_text')
    .in('id', unique);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: { id: string; display_text: string }) => {
    map[r.id] = r.display_text;
  });
  return map;
}
