/**
 * 서비스 간 연계 동의 — 서버 전용 (service_role). 레지스트리·고지 문구는 lib/service-links.ts
 * 받는 쪽 서비스는 다른 서비스 데이터를 읽기 전에 반드시 hasServiceLink()를 통과해야 한다 (데이터 계약 3·4조)
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { getServiceLink } from '@/lib/service-links';

export type ServiceLinkRow = { scope: string; consent_version: string; granted_at: string; revoked_at: string | null };

export async function hasServiceLink(memberId: string, key: string): Promise<boolean> {
  const { count } = await createAdminClient().from('member_service_links')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId).eq('scope', key).is('revoked_at', null);
  return (count ?? 0) > 0;
}

/** 본인의 활성 연계 */
export async function listActiveServiceLinks(memberId: string): Promise<ServiceLinkRow[]> {
  const { data } = await createAdminClient().from('member_service_links')
    .select('scope, consent_version, granted_at, revoked_at')
    .eq('member_id', memberId).is('revoked_at', null)
    .order('granted_at', { ascending: false });
  return (data ?? []) as ServiceLinkRow[];
}

/** 동의 — 이미 활성이면 그대로 (멱등). 레지스트리에 없거나 준비 중인 연계는 거부 */
export async function grantServiceLink(memberId: string, key: string): Promise<{ error?: string }> {
  const def = getServiceLink(key);
  if (!def) return { error: '없는 연계입니다.' };
  if (!def.live) return { error: '아직 준비 중인 연계입니다.' };
  if (await hasServiceLink(memberId, key)) return {};
  const { error } = await createAdminClient().from('member_service_links').insert({
    member_id: memberId, scope: key, source_brand: def.source, target_brand: def.target, consent_version: def.version,
  });
  // 동시 요청으로 활성 유니크 인덱스에 걸리면 이미 동의된 것
  if (error && error.code !== '23505') return { error: error.message };
  return {};
}

/** 철회 — 행을 지우지 않고 revoked_at 기록 (이력 보존) */
export async function revokeServiceLink(memberId: string, key: string): Promise<{ error?: string }> {
  const { error } = await createAdminClient().from('member_service_links')
    .update({ revoked_at: new Date().toISOString(), revoke_reason: 'member' })
    .eq('member_id', memberId).eq('scope', key).is('revoked_at', null);
  return error ? { error: error.message } : {};
}
