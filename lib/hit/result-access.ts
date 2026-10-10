/**
 * HIT 검사 결과 접근 통제 (2026-10-11 레드팀 조치)
 *   - 회원 결과(member_id 있음): 본인 세션 또는 직원만
 *   - 비회원 결과(member_id 없음): 결과 링크(UUID)를 아는 사람 — 기존 비로그인 검사 흐름 유지
 *   - 응답에서 member_id는 제거한다
 */
import { NextRequest } from 'next/server';
import { getApiUser } from '@/lib/api-guard';

export async function canReadHitResult(req: NextRequest, result: { member_id?: string | null } | null | undefined): Promise<boolean> {
  if (!result) return false;
  if (!result.member_id) return true;
  const user = await getApiUser(req);
  if (!user) return false;
  return user.isStaff || user.memberId === result.member_id;
}

export function stripHitResult<T extends { member_id?: string | null }>(result: T): Omit<T, 'member_id'> {
  const { member_id: _omit, ...rest } = result;
  void _omit;
  return rest;
}
