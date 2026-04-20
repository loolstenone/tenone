'use client';

import { useEffect, useState } from 'react';
import { getMemberCapabilityRoles, type MemberCapabilityRole } from '@/lib/supabase/capabilities';

const CAPABILITY_KO: Record<string, string> = {
    community: '커뮤니티',
    meetup: '밋업',
    club: '클럽',
    portfolio: '포트폴리오',
    membership: '멤버십',
    course: '코스',
    showcase: '쇼케이스',
    subscription: '구독',
    purchase: '구매',
};

const CAPABILITY_COLOR: Record<string, string> = {
    community: '#22c55e',
    meetup: '#f59e0b',
    club: '#8b5cf6',
    portfolio: '#3b82f6',
    membership: '#6366f1',
    course: '#14b8a6',
    showcase: '#ec4899',
    subscription: '#3b82f6',
    purchase: '#f59e0b',
};

interface Props {
    memberId: string;
    brandId: string;
    accentColor?: string;
    className?: string;
}

export function CapabilitySection({ memberId, brandId, accentColor, className = '' }: Props) {
    const [roles, setRoles] = useState<MemberCapabilityRole[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getMemberCapabilityRoles(memberId, brandId)
            .then(setRoles)
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, [memberId, brandId]);

    if (!loaded || roles.length === 0) return null;

    return (
        <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${className}`}>
            <p className="text-[11px] font-semibold text-neutral-500 mb-3 uppercase tracking-wider">서비스 권한</p>
            <div className="flex flex-wrap gap-2">
                {roles.map(r => {
                    const color = accentColor ?? CAPABILITY_COLOR[r.capability_key] ?? '#6b7280';
                    return (
                        <span
                            key={r.id}
                            className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                            style={{ backgroundColor: color + '20', color }}
                        >
                            {CAPABILITY_KO[r.capability_key] ?? r.capability_key} · {r.role}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
