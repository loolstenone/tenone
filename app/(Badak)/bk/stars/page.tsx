'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { fetchStars } from '@/lib/supabase/badak';
import type { BadakStar } from '@/types/badak';

export default function StarsPage() {
  const [stars, setStars] = useState<BadakStar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStars({ limit: 20 }).then(({ stars }) => { setStars(stars); setLoading(false); });
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Star size={20} className="text-amber-500 fill-amber-500" />
            <h1 className="text-2xl font-bold text-neutral-900">이바닥 스타</h1>
          </div>
          <p className="text-sm text-neutral-500">각 업계에서 빛나는 사람들의 이야기</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : stars.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-neutral-500">이바닥 스타가 곧 찾아옵니다</p>
            <p className="text-sm text-neutral-400 mt-1">매주 업계에서 빛나는 사람을 조명합니다</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {stars.map(star => (
              <Link key={star.id} href={`/stars/${star.slug}`}
                className="group block rounded-xl border border-neutral-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all">
                {star.coverImageUrl && (
                  <div className="aspect-[2/1] overflow-hidden">
                    <img src={star.coverImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2">{star.title}</h2>
                  {star.publishedAt && (
                    <p className="mt-2 text-xs text-neutral-400">{new Date(star.publishedAt).toLocaleDateString('ko-KR')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
