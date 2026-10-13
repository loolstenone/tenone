'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { HIT_STAGES, type HitStageKey } from '@/lib/hit/stages';
import type { HitResultItem } from '@/app/api/hit/results/route';

const ORDER: HitStageKey[] = ['a', 'b', 'c', 'd', 'e', 'f', 'gap'];

/**
 * 나의 HIT — 로그인 회원의 전 검사 결과 목록 (검사별 묶음, 최신순)
 * HIT 허브(/hero/hit)와 HeRo 마이페이지가 같이 쓴다. 본인 식별은 서버 세션.
 */
export default function MyHitResults({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [items, setItems] = useState<HitResultItem[] | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const dark = theme === 'dark';

  useEffect(() => {
    let alive = true;
    setItems(null); setError(false);
    fetch('/api/hit/results')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => { if (alive) setItems(d.results ?? []); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [tick]);

  const box = dark ? 'border-neutral-700 bg-neutral-800/50' : 'border-neutral-200 bg-white';
  const sub = dark ? 'text-neutral-400' : 'text-neutral-500';
  const title = dark ? 'text-neutral-100' : 'text-neutral-900';

  if (error) {
    return (
      <div className={`rounded-xl border p-5 text-center ${box}`}>
        <p className={`text-sm ${sub}`}>검사 결과를 불러오지 못했습니다.</p>
        <button onClick={() => setTick(t => t + 1)} className="mt-2 text-sm font-semibold text-[#E53935]">다시 시도</button>
      </div>
    );
  }
  if (!items) {
    return <div className={`rounded-xl border p-6 flex justify-center ${box}`}><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
  }
  if (items.length === 0) {
    return (
      <div className={`rounded-xl border p-6 text-center ${box}`}>
        <p className={`text-sm ${sub}`}>아직 완료한 HIT 검사가 없습니다.</p>
        <Link href={`/hero/hit/${HIT_STAGES.a.key}`} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
          {HIT_STAGES.a.ko} 시작하기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ORDER.map(k => {
        const list = items.filter(i => i.stage === k);
        if (!list.length) return null;
        return (
          <div key={k}>
            <p className={`text-xs font-semibold mb-1.5 ${sub}`}>{HIT_STAGES[k].code} · {HIT_STAGES[k].name}</p>
            <div className={`rounded-xl border divide-y overflow-hidden ${box} ${dark ? 'divide-neutral-700' : 'divide-neutral-100'}`}>
              {list.map(i => (
                <Link key={i.id} href={i.href} className={`flex items-center gap-3 px-4 py-3 transition-colors ${dark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold break-keep ${title}`}>{i.headline}</p>
                    <p className={`text-xs ${sub}`}>{i.createdAt.substring(0, 10)}</p>
                  </div>
                  <span className="text-xs font-bold text-[#E53935] shrink-0">결과 보기</span>
                  <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
