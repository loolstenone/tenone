'use client';

/**
 * WIO Auth — withLoginGate
 *
 * 인증이 필요한 액션을 가로채는 래퍼. 비로그인 상태일 때 onRequireLogin
 * 콜백을 호출하고 액션을 차단한다. 로그인 상태면 원래 액션을 실행한다.
 *
 * 사용 예:
 *   const guardedReact = withLoginGate(handleReact, { isLoggedIn, onRequireLogin });
 *   <button onClick={guardedReact}>공감</button>
 */

import { useCallback } from 'react';

export interface LoginGateOptions {
  /** 현재 로그인 상태 */
  isLoggedIn: boolean;
  /** 비로그인 시 호출될 콜백 — 보통 로그인 모달 열기 */
  onRequireLogin: () => void;
}

/**
 * 함수형 래퍼 — 호출 시점에 isLoggedIn 체크.
 * React 컴포넌트 밖에서도 사용 가능.
 */
export function withLoginGate<TArgs extends unknown[], TReturn>(
  action: (...args: TArgs) => TReturn,
  options: LoginGateOptions,
): (...args: TArgs) => TReturn | void {
  return (...args: TArgs) => {
    if (!options.isLoggedIn) {
      options.onRequireLogin();
      return;
    }
    return action(...args);
  };
}

/**
 * React 훅 버전 — 의존성 메모이제이션 포함.
 * 컴포넌트 내부에서 자주 쓸 때 권장.
 */
export function useLoginGate(options: LoginGateOptions) {
  const { isLoggedIn, onRequireLogin } = options;

  return useCallback(
    <TArgs extends unknown[], TReturn>(
      action: (...args: TArgs) => TReturn,
    ): ((...args: TArgs) => TReturn | void) => {
      return (...args: TArgs) => {
        if (!isLoggedIn) {
          onRequireLogin();
          return;
        }
        return action(...args);
      };
    },
    [isLoggedIn, onRequireLogin],
  );
}
