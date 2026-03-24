'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Star, FileText } from 'lucide-react';

export default function PageTopBar() {
  const pathname = usePathname();
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('smarcomm_favorites') || '[]');
      setStarred(favs.includes(pathname));
    } catch {}
  }, [pathname]);

  const toggleFavorite = () => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('smarcomm_favorites') || '[]');
      let updated: string[];
      if (starred) {
        updated = favs.filter(f => f !== pathname);
      } else {
        if (favs.length >= 10) { alert('즐겨찾기는 최대 10개까지 가능합니다'); return; }
        updated = [...favs, pathname];
      }
      localStorage.setItem('smarcomm_favorites', JSON.stringify(updated));
      setStarred(!starred);
      window.dispatchEvent(new Event('favorites-changed'));
    } catch {}
  };

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => window.print()} title="PDF로 저장"
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:text-text hover:bg-surface transition-colors">
        <FileText size={13} /> PDF
      </button>
      <button onClick={toggleFavorite} title={starred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
          starred
            ? 'border-warning/30 bg-warning/5 text-warning'
            : 'border-border text-text-muted hover:text-text hover:bg-surface'
        }`}>
        <Star size={13} className={starred ? 'fill-warning' : ''} /> 즐겨찾기
      </button>
    </div>
  );
}
