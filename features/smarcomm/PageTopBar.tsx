'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Star, FileText } from 'lucide-react';
import { getSetting, setSetting } from '@/lib/supabase/settings';

// 즐겨찾기는 /smarcomm/dashboard/X 가 아닌 /dashboard/X 정규화 경로로 저장
// (layout 렌더 시 /smarcomm prefix를 자동 prepend)
function normalize(p: string): string {
    return p.replace(/^\/smarcomm/, '') || '/dashboard';
}

export default function PageTopBar() {
    const pathname = usePathname();
    const normalized = normalize(pathname);
    const [starred, setStarred] = useState(false);

    useEffect(() => {
        getSetting<string[]>('smarcomm', 'favorites', 'smarcomm_favorites').then(favs => {
            setStarred(Array.isArray(favs) && favs.includes(normalized));
        });
    }, [normalized]);

    const toggleFavorite = async () => {
        const favs = (await getSetting<string[]>('smarcomm', 'favorites', 'smarcomm_favorites')) ?? [];
        let updated: string[];
        if (starred) {
            updated = favs.filter(f => f !== normalized);
        } else {
            if (favs.length >= 10) { alert('즐겨찾기는 최대 10개까지 가능합니다'); return; }
            updated = [...favs, normalized];
        }
        await setSetting('smarcomm', 'favorites', updated, 'smarcomm_favorites');
        setStarred(!starred);
        window.dispatchEvent(new Event('favorites-changed'));
    };

    return (
        <div className="flex items-center gap-1.5">
            <button onClick={() => window.print()} title="PDF로 저장"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:bg-surface transition-colors">
                <FileText size={13} /> PDF
            </button>
            <button onClick={toggleFavorite} title={starred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${starred
                    ? 'border-warning/30 bg-warning/5 text-warning'
                    : 'border-border text-text-muted hover:text-text hover:bg-surface'
                    }`}>
                <Star size={13} className={starred ? 'fill-warning' : ''} /> 즐겨찾기
            </button>
        </div>
    );
}
