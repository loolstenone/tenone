'use client';

import { useEffect, useRef } from 'react';

// 세션 ID: 탭별 고유값 (sessionStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('badak_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('badak_sid', sid);
  }
  return sid;
}

interface LogEventOptions {
  eventType: 'page_view' | 'session_end' | 'interaction';
  brandId?: string;
  pagePath?: string;
  durationSec?: number;
  properties?: Record<string, unknown>;
}

async function logEvent(opts: LogEventOptions) {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('badak_token') ?? sessionStorage.getItem('sb-access-token'))
    : null;

  await fetch('/api/analytics/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      eventType: opts.eventType,
      brandId:   opts.brandId ?? 'badak',
      sessionId: getSessionId(),
      pagePath:  opts.pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : null),
      durationSec: opts.durationSec,
      properties:  opts.properties ?? {},
    }),
  }).catch(() => {}); // 로깅 실패는 조용히 무시
}

// 페이지뷰 + 세션 체류시간 자동 로깅 훅
export function useBadakAnalytics() {
  const enterTime = useRef(Date.now());

  useEffect(() => {
    logEvent({ eventType: 'page_view' });
    enterTime.current = Date.now();

    const handleUnload = () => {
      const durationSec = Math.round((Date.now() - enterTime.current) / 1000);
      if (durationSec > 2) {
        // sendBeacon: 언로드 시에도 안정적으로 전송
        const payload = JSON.stringify({
          eventType: 'session_end',
          brandId: 'badak',
          sessionId: getSessionId(),
          pagePath: window.location.pathname,
          durationSec,
        });
        navigator.sendBeacon('/api/analytics/event', new Blob([payload], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
}
