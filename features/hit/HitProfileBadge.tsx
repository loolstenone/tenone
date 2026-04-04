'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface HitResult {
  typeCode: string;
  typeNameKo: string;
  typeNickname: string;
  discPrimary: string;
  mbtiType: string;
}

const DISC_COLORS: Record<string, string> = {
  D: '#E53935', I: '#FFB300', S: '#43A047', C: '#1E88E5',
};

/**
 * HIT 프로필 배지 — 로그인한 사용자의 HIT 결과를 표시
 * 모든 사이트의 /my 페이지에 삽입 가능
 */
export default function HitProfileBadge({ memberId }: { memberId?: string }) {
  const [result, setResult] = useState<HitResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) { setLoading(false); return; }

    import('@/lib/supabase/client').then(({ createClient }) => {
      const sb = createClient();
      sb.from('hit_a_results')
        .select('type_code, type_name_ko, type_nickname, disc_primary, mbti_type')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setResult({
              typeCode: data.type_code,
              typeNameKo: data.type_name_ko,
              typeNickname: data.type_nickname,
              discPrimary: data.disc_primary,
              mbtiType: data.mbti_type,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [memberId]);

  if (loading || !result) return null;

  const discColor = DISC_COLORS[result.discPrimary] || '#666';

  return (
    <Link
      href="/hero/hit"
      className="flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: discColor }}
      >
        {result.typeCode.split('-')[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-800">{result.typeCode}</span>
          <span className="text-xs text-neutral-400">{result.typeNickname}</span>
        </div>
        <p className="text-xs text-neutral-500 truncate">{result.typeNameKo}</p>
      </div>
      <Shield className="h-4 w-4 text-neutral-300 shrink-0" />
    </Link>
  );
}
