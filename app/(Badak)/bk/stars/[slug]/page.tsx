'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchStarBySlug } from '@/lib/supabase/badak';
import ProfileCard from '@/components/badak/ProfileCard';
import type { BadakStar } from '@/types/badak';

export default function StarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [star, setStar] = useState<BadakStar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchStarBySlug(slug).then(s => { setStar(s); setLoading(false); });
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-[calc(100vh-56px)] items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  if (!star) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center">
        <p className="text-neutral-500">아티클을 찾을 수 없습니다</p>
        <Link href="/stars" className="mt-3 text-sm text-blue-600 hover:underline">목록으로</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/stars" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ArrowLeft size={14} /> 이바닥 스타
        </Link>

        {star.coverImageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img src={star.coverImageUrl} alt="" className="w-full" />
          </div>
        )}

        <h1 className="text-3xl font-bold text-neutral-900 leading-tight">{star.title}</h1>
        {star.publishedAt && (
          <p className="mt-2 text-sm text-neutral-400">{new Date(star.publishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        )}

        <div className="mt-8 prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: star.content }} />

        {star.featuredProfile && (
          <div className="mt-10 border-t border-neutral-200 pt-8">
            <h3 className="text-sm font-semibold text-neutral-500 mb-3">이 글의 주인공</h3>
            <ProfileCard profile={star.featuredProfile} variant="compact" />
          </div>
        )}
      </div>
    </div>
  );
}
