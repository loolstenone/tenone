'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NextStepCTAProps {
  stage: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

export default function NextStepCTA({ stage, title, description, actionLabel, href }: NextStepCTAProps) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{stage}</div>
          <div className="mt-1 text-sm font-semibold text-text">{title}</div>
          <div className="mt-0.5 text-xs text-text-muted">{description}</div>
        </div>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-sub transition-colors"
        >
          {actionLabel} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
