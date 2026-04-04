'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LockedSectionProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  previewContent?: React.ReactNode;
  icon?: React.ReactNode;
  /** 'blur' = blurred preview with gradient overlay, 'card' = locked info card */
  variant?: 'blur' | 'card';
}

export default function LockedSection({
  title,
  description,
  ctaText,
  ctaHref,
  previewContent,
  icon,
  variant = 'card',
}: LockedSectionProps) {
  if (variant === 'blur' && previewContent) {
    return (
      <div className="relative mt-12">
        {/* Gradient overlay with CTA */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 flex flex-col items-center justify-end pb-8">
          <Lock className="h-6 w-6 text-neutral-400 mb-2" />
          <p className="text-sm font-medium text-neutral-700 mb-1">{description}</p>
          <Link
            href={ctaHref}
            className="px-6 py-2.5 bg-[#E53935] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            {ctaText}
          </Link>
        </div>
        {/* Blurred preview */}
        <div className="blur-sm pointer-events-none select-none">{previewContent}</div>
      </div>
    );
  }

  // Card variant
  return (
    <div className="mt-4 border border-neutral-200 rounded-xl p-6 bg-neutral-50">
      <div className="flex items-center gap-3 mb-3">
        {icon || <Lock className="h-5 w-5 text-[#E53935]" />}
        <h3 className="font-bold text-neutral-800">{title}</h3>
      </div>
      <p className="text-sm text-neutral-500 mb-4">{description}</p>
      <Link
        href={ctaHref}
        className="text-sm text-[#E53935] font-medium hover:underline transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  );
}
