'use client';

import { useEffect, useState } from 'react';

export type HitSessionStage = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'gap';

export interface HitResume { token: string; answered: number }

/** 진행 중 세션 — 검사를 중단했다 돌아온 사람이 처음부터 다시 하지 않게 (2026-10-12) */
export function useHitResume(stage: HitSessionStage): HitResume | null {
  const [resume, setResume] = useState<HitResume | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/hit/${stage}/session`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d?.sessionToken && (d.answered ?? 0) > 0) setResume({ token: d.sessionToken, answered: d.answered }); })
      .catch(() => { /* 이어하기 제안만 생략 */ });
    return () => { cancelled = true; };
  }, [stage]);
  return resume;
}

export const RESTART_CONFIRM = '지금까지 한 답변이 사라지고 처음부터 다시 시작합니다. 계속할까요?';

/** 세션 시작 POST — 성공이면 token, 실패면 화면에 보여줄 한국어 메시지 (2026-10-12: 모든 분기가 메시지를 돌려준다) */
export async function postHitSession(
  stage: HitSessionStage,
  body: Record<string, unknown>,
): Promise<{ token: string; error: null } | { token: null; error: string }> {
  try {
    const res = await fetch(`/api/hit/${stage}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.sessionToken) return { token: data.sessionToken as string, error: null };
    if (res.status === 401) return { token: null, error: '로그인이 필요합니다. 로그인 후 다시 시도해 주세요.' };
    return { token: null, error: data?.message || data?.error || '시작할 수 없습니다. 잠시 후 다시 시도해 주세요.' };
  } catch {
    return { token: null, error: '네트워크 오류로 시작할 수 없습니다. 연결을 확인하고 다시 시도해 주세요.' };
  }
}
