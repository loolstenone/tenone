'use client';

import { useBadakAnalytics } from './useAnalytics';

// 레이아웃에 삽입하는 Analytics 사이드이펙트 전용 컴포넌트 (UI 없음)
export function BadakAnalytics() {
  useBadakAnalytics();
  return null;
}
