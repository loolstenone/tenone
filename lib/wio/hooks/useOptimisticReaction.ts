'use client';

/**
 * WIO Hooks — useOptimisticReaction
 *
 * 리액션(공감/관심/🔥 등) 토글의 낙관적 업데이트 훅.
 * 1) 즉시 UI 반영 (낙관적 카운트/토글 상태)
 * 2) API 호출 비동기 시도
 * 3) 실패 시 원래 상태로 롤백
 *
 * 이중 클릭/경쟁 상태는 내부 inFlight 플래그로 차단.
 */

import { useCallback, useRef, useState } from 'react';

export interface OptimisticReactionOptions {
  /** 초기 활성 상태 */
  initialActive?: boolean;
  /** 초기 카운트 */
  initialCount?: number;
  /** 네트워크 요청 — true 리턴 시 성공, 예외/false 시 롤백 */
  onToggle: (nextActive: boolean) => Promise<boolean | void>;
  /** 이중 요청 방지 시간(ms). 기본 400 */
  debounceMs?: number;
}

export interface OptimisticReactionResult {
  active: boolean;
  count: number;
  /** 현재 요청 처리 중 여부 */
  pending: boolean;
  /** 토글 실행. 보통 onClick에 바로 바인딩 */
  toggle: () => void;
}

export function useOptimisticReaction(
  options: OptimisticReactionOptions,
): OptimisticReactionResult {
  const { initialActive = false, initialCount = 0, onToggle, debounceMs = 400 } = options;

  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const inFlight = useRef(false);
  const lastCallAt = useRef(0);

  const toggle = useCallback(() => {
    const now = Date.now();
    if (inFlight.current) return;
    if (now - lastCallAt.current < debounceMs) return;
    lastCallAt.current = now;

    const prevActive = active;
    const prevCount = count;
    const nextActive = !prevActive;
    const nextCount = Math.max(0, prevCount + (nextActive ? 1 : -1));

    // 낙관적 반영
    setActive(nextActive);
    setCount(nextCount);
    setPending(true);
    inFlight.current = true;

    Promise.resolve()
      .then(() => onToggle(nextActive))
      .then((result) => {
        // 명시적 false 리턴은 실패로 간주
        if (result === false) {
          setActive(prevActive);
          setCount(prevCount);
        }
      })
      .catch(() => {
        // 롤백
        setActive(prevActive);
        setCount(prevCount);
      })
      .finally(() => {
        setPending(false);
        inFlight.current = false;
      });
  }, [active, count, onToggle, debounceMs]);

  return { active, count, pending, toggle };
}
