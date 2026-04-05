'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface HitShareButtonsProps {
  typeCode: string;
  typeNameKo: string;
  typeNickname?: string;
  resultId: string;
  /** compact = small icon row, full = wider buttons */
  variant?: 'compact' | 'full';
}

export default function HitShareButtons({
  typeCode,
  typeNameKo,
  typeNickname,
  resultId,
  variant = 'compact',
}: HitShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const resultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/hero/hit/a/result/${resultId}`
    : `/hero/hit/a/result/${resultId}`;

  const shareTitle = `나의 영웅 유형: ${typeCode} - ${typeNameKo}`;
  const shareText = typeNickname
    ? `나의 영웅 유형은 ${typeCode} "${typeNickname}" (${typeNameKo})입니다. 당신의 영웅 유형은?`
    : `나의 영웅 유형은 ${typeCode} (${typeNameKo})입니다. 당신의 영웅 유형은?`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [resultUrl]);

  const handleWebShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: resultUrl,
        });
      } catch {
        // user cancelled or share failed silently
      }
    }
  }, [shareTitle, shareText, resultUrl]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  }, [shareText, resultUrl]);

  const supportsWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  // ── full variant: stacked buttons ──
  if (variant === 'full') {
    return (
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
        >
          {copied
            ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</>
            : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
        </button>

        {supportsWebShare && (
          <button
            onClick={handleWebShare}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" /> 공유하기
          </button>
        )}

        <button
          onClick={handleTwitterShare}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
        >
          <XIcon className="h-3.5 w-3.5" /> X(Twitter) 공유
        </button>
      </div>
    );
  }

  // ── compact variant: icon row ──
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
        title="링크 복사"
      >
        {copied
          ? <Check className="h-4 w-4 text-green-500" />
          : <Copy className="h-4 w-4 text-neutral-500" />}
      </button>

      {supportsWebShare && (
        <button
          onClick={handleWebShare}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          title="공유하기"
        >
          <Share2 className="h-4 w-4 text-neutral-500" />
        </button>
      )}

      <button
        onClick={handleTwitterShare}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
        title="X(Twitter) 공유"
      >
        <XIcon className="h-4 w-4 text-neutral-500" />
      </button>
    </div>
  );
}

/** X (Twitter) icon - simple SVG */
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
