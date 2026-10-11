'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

/** 동아리 페이지 공유 — Web Share(모바일) 또는 주소 복사. 공식 주소는 서버가 넘긴 절대 URL */
export function ClubShareButton({ url, title, text, className }: { url: string; title: string; text?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch { /* 사용자가 취소 */ }
  };
  return (
    <button type="button" onClick={share}
      className={className ?? 'inline-flex items-center gap-2 border border-neutral-700 hover:border-white px-5 py-3 text-sm font-bold text-neutral-300 hover:text-white transition'}>
      {done ? <><Check className="h-4 w-4" /> 주소 복사됨</> : <><Share2 className="h-4 w-4" /> 공유</>}
    </button>
  );
}
