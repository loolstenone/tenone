'use client';

import { useState } from 'react';
import { Heart, Share2, MessageCircle, Link2, Check } from 'lucide-react';

interface Props {
  articleId: string;
  slug: string;
  title: string;
  initialLikesCount: number;
  initialLiked: boolean;
  canLike: boolean;
  commentsCount: number;
}

export function ArticleActions({ articleId, slug, title, initialLikesCount, initialLiked, canLike, commentsCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikesCount);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function toggleLike() {
    if (!canLike) {
      alert('좋아요는 매드리거만 가능합니다. 먼저 로그인하세요.');
      return;
    }
    if (processing) return;
    setProcessing(true);
    // optimistic
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/madleague/articles/${articleId}/like`, { method: 'POST' });
      if (!res.ok) {
        setLiked(liked);
        setCount((c) => c + (liked ? 1 : -1));
      }
    } finally {
      setProcessing(false);
    }
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : `https://madleague.net/madleague/madzine/${slug}`;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      prompt('URL 복사', url);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={toggleLike}
        className={`inline-flex items-center gap-2 px-5 py-2.5 border-2 transition font-bold ${
          liked
            ? 'bg-[#EC1D25] border-[#EC1D25] text-white'
            : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#EC1D25] hover:text-[#EC1D25]'
        }`}
      >
        <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
        <span>{count.toLocaleString()}</span>
      </button>

      <a href="#comments" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-neutral-300 text-neutral-700 hover:border-black hover:text-black transition font-bold">
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount.toLocaleString()}</span>
      </a>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={share}
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-neutral-300 text-neutral-700 hover:border-black hover:text-black transition font-bold text-sm"
        >
          {copied ? <><Check className="h-4 w-4" /> 복사됨</> : <><Share2 className="h-4 w-4" /> 공유</>}
        </button>
        <button
          onClick={async () => {
            const url = typeof window !== 'undefined' ? window.location.href : `https://madleague.net/madleague/madzine/${slug}`;
            try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
            catch { prompt('URL 복사', url); }
          }}
          className="inline-flex items-center justify-center h-10 w-10 border-2 border-neutral-300 text-neutral-700 hover:border-black hover:text-black transition"
          title="URL 복사"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
