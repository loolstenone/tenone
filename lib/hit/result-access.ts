/**
 * HIT 검사 결과 접근 통제 (2026-10-11 레드팀 조치 · 2026-10-12 회원 전용 전환)
 *   - HIT 검사는 회원 전용 → 결과는 본인 또는 직원만
 *   - member_id 없는 옛 결과(더미·회원 전용 전환 이전)는 직원만
 *   - 응답에서 member_id는 제거한다
 */
import { NextRequest } from 'next/server';
import { getApiUser } from '@/lib/api-guard';

export async function canReadHitResult(req: NextRequest, result: { member_id?: string | null } | null | undefined): Promise<boolean> {
  if (!result) return false;
  const user = await getApiUser(req);
  if (!user) return false;
  if (user.isStaff) return true;
  return !!result.member_id && user.memberId === result.member_id;
}

export function stripHitResult<T extends { member_id?: string | null }>(result: T): Omit<T, 'member_id'> {
  const { member_id: _omit, ...rest } = result;
  void _omit;
  return rest;
}
