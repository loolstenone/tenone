'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, FileText, TrendingUp, Palette, Users, ChevronRight } from 'lucide-react';

interface HitResult {
  typeCode: string;
  typeNameKo: string;
  typeNickname: string;
  discPrimary: string;
  mbtiType: string;
}

interface HitBResult {
  hollandCode: string;
  readinessGrade: string;
  competencyTrack: string;
}

const DISC_COLORS: Record<string, string> = {
  D: '#E53935', I: '#FFB300', S: '#43A047', C: '#1E88E5',
};

/**
 * HeRo 프로필 카드 — HIT 결과 + 서비스 이용 내역
 * 모든 사이트의 /my 페이지에 삽입 가능
 */
export default function HitProfileBadge({ memberId }: { memberId?: string }) {
  const [hitA, setHitA] = useState<HitResult | null>(null);
  const [hitB, setHitB] = useState<HitBResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) { setLoading(false); return; }

    import('@/lib/supabase/client').then(({ createClient }) => {
      const sb = createClient();

      // HIT A 결과
      sb.from('hit_a_results')
        .select('type_code, type_name_ko, type_nickname, disc_primary, mbti_type')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setHitA({
              typeCode: data.type_code,
              typeNameKo: data.type_name_ko,
              typeNickname: data.type_nickname,
              discPrimary: data.disc_primary,
              mbtiType: data.mbti_type,
            });
          }
        })
        .catch(() => {});

      // HIT B 결과
      sb.from('hit_b_results')
        .select('holland_code, readiness_grade, competency_track')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setHitB({
              hollandCode: data.holland_code,
              readinessGrade: data.readiness_grade,
              competencyTrack: data.competency_track,
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [memberId]);

  if (loading) return null;

  // HIT 결과 없으면 검사 유도
  if (!hitA && !hitB) {
    return (
      <Link
        href="/hero/hit"
        className="flex items-center gap-3 px-4 py-3 border border-dashed border-neutral-300 rounded-xl hover:border-[#E53935] hover:bg-red-50/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-neutral-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-700">HeRo HIT 검사</p>
          <p className="text-xs text-neutral-400">나의 영웅 유형을 알아보세요</p>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-300" />
      </Link>
    );
  }

  const discColor = DISC_COLORS[hitA?.discPrimary || 'D'] || '#666';

  // 서비스 이용 내역
  const services = [
    hitA && { icon: Shield, label: `${hitA.typeCode} · ${hitA.typeNickname}`, sub: hitA.typeNameKo, href: '/hero/hit', color: discColor },
    hitB && { icon: TrendingUp, label: `Holland ${hitB.hollandCode}`, sub: `준비도 ${hitB.readinessGrade}등급 · ${hitB.competencyTrack || ''}`, href: '/hero/hit/b', color: '#E53935' },
  ].filter(Boolean) as { icon: typeof Shield; label: string; sub: string; href: string; color: string }[];

  // 추가 서비스 링크 (아직 이용 안 한 것도 표시)
  const moreServices = [
    { icon: FileText, label: '이력서', href: '/hero/resume', active: false },
    { icon: Palette, label: '커리어 코칭', href: '/hero/coaching', active: false },
  ];

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      {/* HeRo 헤더 */}
      <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">HeRo Talent</span>
        <Link href="/hero" className="text-[10px] text-neutral-400 hover:text-[#E53935] transition-colors">
          바로가기 →
        </Link>
      </div>

      {/* HIT 결과 */}
      {services.map((s, i) => (
        <Link
          key={i}
          href={s.href}
          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: s.color }}
          >
            <s.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800">{s.label}</p>
            <p className="text-xs text-neutral-400 truncate">{s.sub}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
        </Link>
      ))}

      {/* 추가 서비스 */}
      <div className="px-4 py-2.5 flex items-center gap-3">
        {moreServices.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <s.icon className="h-3 w-3" />
            {s.label}
          </Link>
        ))}
        {!hitA && (
          <Link href="/hero/hit/a" className="flex items-center gap-1.5 text-xs text-[#E53935] font-medium ml-auto">
            HIT-A 검사 →
          </Link>
        )}
        {hitA && !hitB && (
          <Link href="/hero/hit/b" className="flex items-center gap-1.5 text-xs text-[#E53935] font-medium ml-auto">
            HIT-B 검사 →
          </Link>
        )}
      </div>
    </div>
  );
}
