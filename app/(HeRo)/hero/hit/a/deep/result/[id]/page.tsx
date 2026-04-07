import { getHitAResult } from '@/lib/supabase/hit';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

const CH_SUBSCALES: { key: string; label: string }[] = [
  { key: 'conscience', label: '양심성' },
  { key: 'self_discipline', label: '자기훈련' },
  { key: 'perfectionism', label: '완벽주의' },
  { key: 'warmth', label: '온정성' },
  { key: 'social_boldness', label: '사회적 대담성' },
  { key: 'sensitivity', label: '감수성' },
  { key: 'tension', label: '긴장감' },
  { key: 'optimism', label: '낙관성' },
  { key: 'control', label: '자기통제' },
  { key: 'independence', label: '독립성' },
  { key: 'suspicion', label: '경계심' },
  { key: 'openness', label: '개방성' },
  { key: 'adventure', label: '모험성' },
  { key: 'intellect', label: '지적호기심' },
];

const CH_PRECISE: { key: string; label: string }[] = [
  { key: 'integrity', label: '성실성' },
  { key: 'relational', label: '대인관계' },
  { key: 'emotional', label: '정서안정성' },
  { key: 'ethics', label: '윤리성' },
  { key: 'growth', label: '성장지향성' },
];

const HOLLAND_LABELS: Record<string, string> = {
  R: '현실형', I: '탐구형', A: '예술형', S: '사회형', E: '기업형', C: '관습형',
};

export default async function HitADeepResultPage({ params }: Props) {
  const { id } = await params;
  const result = await getHitAResult(id);
  if (!result) notFound();

  const r = result as Record<string, unknown>;
  const chDeep = r.ch_deep_scores as
    | { subscales?: Record<string, number>; precise?: Record<string, number> }
    | null
    | undefined;
  const apDeep = r.ap_deep_scores as
    | {
        interest?: Record<string, number>;
        efficacy?: Record<string, number>;
        total?: Record<string, number>;
        matrix?: Record<string, string>;
        top3TotalCode?: string;
      }
    | null
    | undefined;

  if (!chDeep || !apDeep) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">심화 검사가 완료되지 않았습니다</h1>
          <p className="text-neutral-400 mb-8">심화 검사를 받으시면 더 정밀한 프로파일을 확인할 수 있습니다.</p>
          <Link
            href={`/hero/hit/a/deep?resultId=${id}`}
            className="inline-block px-6 py-3 rounded-lg bg-[#F5C518] text-black font-semibold hover:bg-[#E0B000]"
          >
            심화 검사 시작
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link href={`/hero/hit/a/result/${id}`} className="text-sm text-neutral-500 hover:text-[#F5C518]">
            ← HIT A 기본 결과
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2">HIT A 심화 분석</h1>
          <p className="text-neutral-400">14 하위영역 정밀 프로파일 + 흥미-자기효능감 매트릭스</p>
        </div>

        {/* CH 14 하위영역 */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 border-l-4 border-[#F5C518] pl-4">
            인성 14 하위영역
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CH_SUBSCALES.map(({ key, label }) => {
              const score = chDeep.subscales?.[key] ?? 0;
              return (
                <div key={key} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-300">{label}</span>
                    <span className="text-lg font-bold text-[#F5C518]">{score}</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F5C518] to-[#E0B000]"
                      style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5영역 정밀 재산출 */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 border-l-4 border-[#F5C518] pl-4">
            5영역 정밀 프로파일
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CH_PRECISE.map(({ key, label }) => {
              const score = chDeep.precise?.[key] ?? 0;
              return (
                <div key={key} className="text-center p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <div className="text-3xl font-black text-[#F5C518] mb-1">{score}</div>
                  <div className="text-xs text-neutral-500">{label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AP 흥미-효능감 매트릭스 */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 border-l-4 border-[#F5C518] pl-4">
            적성 흥미-자기효능감 매트릭스
          </h2>
          <p className="text-sm text-neutral-400 mb-6">
            각 적성 영역에 대한 흥미와 자기효능감을 교차 분석했습니다. &quot;최적영역&quot;은 흥미와 실력이 모두 높은 영역입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map(type => {
              const cell = apDeep.matrix?.[type];
              const interest = apDeep.interest?.[type] ?? 0;
              const efficacy = apDeep.efficacy?.[type] ?? 0;
              const total = apDeep.total?.[type] ?? 0;
              const cellColor =
                cell === '최적영역' ? 'border-[#F5C518] bg-[#F5C518]/10' :
                cell === '탐색학습필요' ? 'border-blue-500/40 bg-blue-500/5' :
                cell === '소진리스크' ? 'border-red-500/40 bg-red-500/5' :
                'border-neutral-800 bg-neutral-900/30';
              const cellTextColor =
                cell === '최적영역' ? '#F5C518' :
                cell === '소진리스크' ? '#f87171' :
                cell === '탐색학습필요' ? '#60a5fa' :
                '#94a3b8';
              return (
                <div key={type} className={`rounded-xl border p-5 ${cellColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold">{type} · {HOLLAND_LABELS[type]}</span>
                    <span className="text-2xl font-black text-[#F5C518]">{total}</span>
                  </div>
                  <div className="text-xs font-medium mb-3" style={{ color: cellTextColor }}>
                    {cell || '—'}
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>흥미 {interest}</span>
                    <span>효능감 {efficacy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top3 */}
        {apDeep.top3TotalCode && (
          <section className="mb-16 text-center py-10 rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/5">
            <div className="text-sm text-neutral-400 mb-2">통합 Top 3 코드</div>
            <div className="text-5xl font-black text-[#F5C518]">{apDeep.top3TotalCode}</div>
          </section>
        )}

        <div className="flex justify-center gap-4">
          <Link href={`/hero/hit/a/result/${id}`} className="px-5 py-2.5 rounded-lg border border-neutral-700 text-sm hover:bg-neutral-800">
            기본 결과로
          </Link>
          <Link href="/hero" className="px-5 py-2.5 rounded-lg bg-[#F5C518] text-black text-sm font-semibold hover:bg-[#E0B000]">
            HeRo 메인
          </Link>
        </div>
      </div>
    </div>
  );
}
