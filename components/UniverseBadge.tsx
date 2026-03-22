'use client';

import Link from 'next/link';
import { useSite } from '@/lib/site-context';

export function UniverseBadge() {
    const { site } = useSite();
    if (!site.showUniverseBadge) return null;

    return (
        <div className="border-t border-white/10 pt-4 mt-6 text-center">
            <Link
                href="https://tenone.biz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-col items-center gap-1 opacity-40 hover:opacity-70 transition-opacity"
            >
                <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                    TEN:ONE
                </span>
                <p className="text-[10px] text-neutral-500">
                    {site.universeLabel}
                </p>
            </Link>
        </div>
    );
}
