'use client';

import { useEffect } from 'react';

// sessionStorage 기반 중복 방지 — 같은 세션에서 같은 글 재방문 시 ++ 안 함
export function ArticleViewPing({ articleId }: { articleId: string }) {
  useEffect(() => {
    try {
      const key = `mad_view_${articleId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch { /* private mode */ }
    fetch(`/api/madleague/articles/${articleId}/view`, { method: 'POST', keepalive: true }).catch(() => { /* ignore */ });
  }, [articleId]);
  return null;
}
