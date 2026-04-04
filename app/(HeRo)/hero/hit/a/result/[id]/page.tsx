"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RefreshCw, ArrowRight, Copy, Check, Sparkles, Users } from "lucide-react";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import LockedSection from "@/features/hit/LockedSection";
import type { HitAResult } from "@/types/hit";

export default function HitAResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitAResult | null>(null);
  const [heroType, setHeroType] = useState<{ strengths: { title: string; desc: string }[]; cautions: { title: string; desc: string }[]; fit_direction: string; profile_overview: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/a/result/${resultId}`)
      .then(r => r.json())
      .then(async (data) => {
        if (data.error) { setLoading(false); return; }
        // 유형별 보고서 데이터 로드
        if (data.type_code) {
          try {
            const { createClient } = await import('@/lib/supabase/client');
            const sb = createClient();
            const { data: ht } = await sb.from('hit_hero_types').select('strengths,cautions,fit_direction,profile_overview').eq('type_code', data.type_code).maybeSingle();
            if (ht) setHeroType(ht);
          } catch {}
        }
        setResult({
          id: data.id,
          sessionId: data.session_id,
          memberId: data.member_id,
          mbtiType: data.mbti_type,
          mbtiEScore: data.mbti_e_score,
          mbtiSScore: data.mbti_s_score,
          mbtiTScore: data.mbti_t_score,
          mbtiJScore: data.mbti_j_score,
          discPrimary: data.disc_primary,
          discSubtype: data.disc_subtype,
          discDScore: data.disc_d_score,
          discIScore: data.disc_i_score,
          discSScore: data.disc_s_score,
          discCScore: data.disc_c_score,
          baseSummary: data.base_summary,
          baseScores: data.base_scores || {},
          typeCode: data.type_code,
          typeNameKo: data.type_name_ko,
          typeNickname: data.type_nickname,
          typeCategory: data.type_category,
          typeTraits: data.type_traits,
          typeCareers: data.type_careers,
          aiNarrative: data.ai_narrative,
          sPowerScores: data.s_power_scores,
          createdAt: data.created_at,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p>
          <Link href="/hero/hit/a" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const spData = result.sPowerScores ? [
    { label: "전략적 사고", value: result.sPowerScores.strategic },
    { label: "실행 추진력", value: result.sPowerScores.execution },
    { label: "창의성", value: result.sPowerScores.creativity },
    { label: "대인관계", value: result.sPowerScores.interpersonal },
    { label: "분석적 판단", value: result.sPowerScores.analytical },
  ] : [];

  // AI narrative: show first paragraph free, rest is blurred
  const narrativeParagraphs = result.aiNarrative?.split('\n').filter(p => p.trim()) ?? [];
  const freeNarrative = narrativeParagraphs[0] ?? '';
  const hasMoreNarrative = narrativeParagraphs.length > 1;

  // Generate blurred preview text based on result type
  const discLabel = result.discPrimary === 'D' ? '주도형' : result.discPrimary === 'I' ? '사교형' : result.discPrimary === 'S' ? '안정형' : '신중형';
  const mbtiE = result.mbtiEScore >= 50 ? 'E(외향)' : 'I(내향)';
  const mbtiEPct = result.mbtiEScore >= 50 ? result.mbtiEScore : 100 - result.mbtiEScore;
  const mbtiS = result.mbtiSScore >= 50 ? 'S(감각)' : 'N(직관)';
  const mbtiSPct = result.mbtiSScore >= 50 ? result.mbtiSScore : 100 - result.mbtiSScore;
  const mbtiT = result.mbtiTScore >= 50 ? 'T(사고)' : 'F(감정)';
  const mbtiTPct = result.mbtiTScore >= 50 ? result.mbtiTScore : 100 - result.mbtiTScore;
  const mbtiJ = result.mbtiJScore >= 50 ? 'J(판단)' : 'P(인식)';
  const mbtiJPct = result.mbtiJScore >= 50 ? result.mbtiJScore : 100 - result.mbtiJScore;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION A: Free — Tier 1 (20% 공개)                    */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - A 결과</p>
        <h1 className="text-2xl md:text-3xl font-extrabold">나의 영웅 유형</h1>
      </div>

      {/* 64유형 카드 */}
      <HeroTypeCard
        typeCode={result.typeCode}
        nameKo={result.typeNameKo}
        nickname={result.typeNickname}
        category={result.typeCategory}
        traits={result.typeTraits}
        careers={result.typeCareers}
      />

      {/* 기저요인 요약 */}
      {result.baseSummary && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">기저요인 요약</h2>
          <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
            {result.baseSummary}
          </p>
        </section>
      )}

      {/* DISC */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">DISC 행동유형</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <DISCChart
            d={result.discDScore}
            i={result.discIScore}
            s={result.discSScore}
            c={result.discCScore}
            primary={result.discPrimary}
          />
        </div>
      </section>

      {/* MBTI */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">MBTI 성향 스펙트럼</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <MBTISpectrum
            eScore={result.mbtiEScore}
            sScore={result.mbtiSScore}
            tScore={result.mbtiTScore}
            jScore={result.mbtiJScore}
          />
        </div>
      </section>

      {/* S-Power */}
      {spData.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">S-Power 강점</h2>
          <div className="border border-neutral-200 rounded-xl p-6 flex justify-center">
            <RadarChart data={spData} size={280} />
          </div>
        </section>
      )}

      {/* AI Narrative — free preview (first paragraph only) */}
      {freeNarrative && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">AI 분석</h2>
          <div className="bg-neutral-50 p-6 rounded-xl">
            <p className="text-sm text-neutral-700 leading-relaxed">{freeNarrative}</p>
            {hasMoreNarrative && (
              <p className="text-xs text-neutral-400 mt-3">... 더 자세한 분석은 PDF 보고서에서 확인하세요.</p>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION B: Locked — Tier 2 (PDF 보고서, 회원가입 필요)   */}
      {/* ═══════════════════════════════════════════════════════ */}

      <LockedSection
        variant="blur"
        title="PDF 보고서"
        description="더 자세한 해설을 보시려면"
        ctaText="회원가입하고 PDF 보고서 받기"
        ctaHref={`/signup?from=hit&resultId=${resultId}`}
        previewContent={
          <div className="space-y-6 px-1">
            {/* 상세 DISC 분석 preview */}
            <div>
              <h3 className="text-base font-bold text-neutral-800 mb-2">상세 DISC 분석</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {discLabel}({result.discPrimary}) 점수가 가장 높은 당신은 {result.discPrimary === 'D' ? '결과를 중시하고 도전적인 목표를 설정하며, 빠른 의사결정으로 팀을 이끄는 경향이 있습니다. 경쟁 상황에서 동기부여가 높아지고, 문제 해결에 직접적으로 나서는 리더십을 발휘합니다.' : result.discPrimary === 'I' ? '사람들과의 교류에서 에너지를 얻으며, 낙관적이고 열정적인 태도로 팀에 활력을 불어넣습니다. 새로운 아이디어를 제시하고, 설득력 있는 커뮤니케이션으로 다른 사람의 동의를 얻어냅니다.' : result.discPrimary === 'S' ? '안정적인 환경을 선호하며, 꾸준하고 인내심 있는 태도로 팀에 신뢰를 줍니다. 변화보다 개선을 선호하고, 협력적인 관계 속에서 최고의 성과를 냅니다.' : '정확성과 품질을 중시하며, 체계적인 분석과 계획으로 실수를 최소화합니다. 데이터에 기반한 의사결정을 선호하고, 높은 기준을 유지하려는 성향이 강합니다.'}
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed mt-2">
                보조 유형 {result.discSubtype}의 영향으로 {result.discSubtype?.includes('D') && result.discPrimary !== 'D' ? '주도적 추진력이 더해져' : result.discSubtype?.includes('I') && result.discPrimary !== 'I' ? '사교적 소통력이 보완되어' : result.discSubtype?.includes('S') && result.discPrimary !== 'S' ? '안정적 지속력이 강화되어' : '분석적 정밀함이 더해져'} 독특한 행동 패턴을 만들어냅니다.
              </p>
            </div>

            {/* MBTI 축별 해설 preview */}
            <div>
              <h3 className="text-base font-bold text-neutral-800 mb-2">MBTI 축별 해설</h3>
              <div className="space-y-2">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">{mbtiE} {mbtiEPct}%</span> — {result.mbtiEScore >= 50 ? '다양한 사람과의 교류에서 에너지를 얻으며, 자신의 생각을 즉각적으로 표현하는 것을 선호합니다. 그룹 활동과 네트워킹에 적극적이며, 외부 세계의 자극이 창의성의 원천이 됩니다.' : '에너지를 혼자만의 시간에서 충전하며, 깊은 내면의 성찰을 통해 통찰을 얻습니다. 소규모 모임이나 일대일 대화를 선호하며, 충분한 생각 후에 의견을 제시합니다.'}
                </p>
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">{mbtiS} {mbtiSPct}%</span> — {result.mbtiSScore >= 50 ? '구체적인 사실과 현실적인 정보를 중시하며, 실용적인 접근 방식을 선호합니다. 경험에 기반한 판단력이 뛰어나고, 세부 사항을 놓치지 않는 관찰력을 가지고 있습니다.' : '패턴과 가능성을 먼저 파악하며, 미래 지향적 사고가 특징입니다. 추상적 개념을 잘 다루고, 혁신적인 아이디어를 생성하는 데 뛰어난 능력을 보여줍니다.'}
                </p>
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">{mbtiT} {mbtiTPct}%</span> — {result.mbtiTScore >= 50 ? '논리적 분석과 객관적 기준으로 판단하며, 공정성과 효율성을 우선시합니다. 문제의 본질을 파악하는 능력이 뛰어나고, 감정에 흔들리지 않는 일관된 의사결정을 합니다.' : '사람의 감정과 가치를 고려하여 결정하며, 공감 능력과 조화를 중시합니다. 팀원들의 사기와 동기부여에 민감하며, 인간적인 측면을 놓치지 않는 균형 잡힌 판단을 합니다.'}
                </p>
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">{mbtiJ} {mbtiJPct}%</span> — {result.mbtiJScore >= 50 ? '계획적이고 체계적인 접근을 선호하며, 목표를 설정하고 마감 기한을 준수하는 것에 강점이 있습니다. 질서와 구조 속에서 안정감을 느끼며, 결정을 미루지 않습니다.' : '유연하고 적응력이 높으며, 새로운 정보에 따라 계획을 수정하는 것을 자연스럽게 받아들입니다. 열린 가능성을 유지하며, 순간의 영감과 기회를 놓치지 않습니다.'}
                </p>
              </div>
            </div>

            {/* 기저요인 상세 분석 preview */}
            <div>
              <h3 className="text-base font-bold text-neutral-800 mb-2">기저요인 상세 분석</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                5개 영역(인지 스타일, 감정 조절, 관계 지향, 동기 구조, 스트레스 대처)에 대한 심층 분석 결과, 당신은 인지적으로 분석-직관 균형 패턴을 보이며, 감정 조절 영역에서 높은 자기인식 점수를 기록했습니다. 특히 동기 구조에서 성취 지향성과 자율성 욕구가 두드러지게 나타납니다.
              </p>
            </div>

            {/* S-Power 상세 해설 preview */}
            <div>
              <h3 className="text-base font-bold text-neutral-800 mb-2">S-Power 상세 해설</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                5가지 S-Power 역량 중 상위 3개에 대한 심층 해석과 개발 방향을 제시합니다. 각 역량의 현재 수준, 잠재력, 그리고 실천 가능한 개발 전략을 포함합니다.
              </p>
            </div>

            {/* 강점/주의 패턴 preview — 실제 유형별 데이터 */}
            <div>
              <h3 className="text-base font-bold text-neutral-800 mb-2">강점 & 주의 패턴</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-2">핵심 강점</p>
                  <ul className="text-sm text-neutral-600 space-y-1.5">
                    {(heroType?.strengths || []).slice(0, 5).map((s: { title: string; desc: string }, i: number) => (
                      <li key={i}><span className="font-medium">{i+1}. {s.title}</span> — {s.desc.substring(0, 60)}...</li>
                    ))}
                    {(!heroType?.strengths?.length) && <>
                      <li>1. 전략적 의사결정 능력</li>
                      <li>2. 목표 지향적 실행력</li>
                      <li>3. 독립적 문제해결 능력</li>
                    </>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-2">주의 패턴</p>
                  <ul className="text-sm text-neutral-600 space-y-1.5">
                    {(heroType?.cautions || []).slice(0, 3).map((c: { title: string; desc: string }, i: number) => (
                      <li key={i}><span className="font-medium">{i+1}. {c.title}</span> — {c.desc.substring(0, 60)}...</li>
                    ))}
                    {(!heroType?.cautions?.length) && <>
                      <li>1. 완벽주의로 인한 지연</li>
                      <li>2. 감정 표현의 절제</li>
                    </>}
                  </ul>
                </div>
              </div>
            </div>

            {/* 적합 방향 preview */}
            {heroType?.fit_direction && (
              <div>
                <h3 className="text-base font-bold text-neutral-800 mb-2">이 유형에게 어울리는 방향</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {heroType.fit_direction.substring(0, 200)}...
                </p>
              </div>
            )}
          </div>
        }
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION C: Locked — Tier 3 (AI 맞춤 상담, 유료)         */}
      {/* ═══════════════════════════════════════════════════════ */}

      <div className="mt-8 border border-neutral-200 rounded-xl p-6 bg-neutral-50">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-5 w-5 text-[#E53935]" />
          <h3 className="font-bold text-neutral-800">AI 맞춤 상담</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          DISC x MBTI 교차 해석, 대인관계 가이드, 직무 적합도, 맞춤 성장 로드맵을 AI가 분석합니다.
        </p>
        <Link
          href={`/hero/coaching?type=ai&resultId=${resultId}`}
          className="text-sm text-[#E53935] font-medium hover:underline transition-colors"
        >
          AI 상담 시작하기 →
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION D: Locked — Tier 4 (대면 멘토링, 유료)           */}
      {/* ═══════════════════════════════════════════════════════ */}

      <div className="mt-4 border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Users className="h-5 w-5 text-[#E53935]" />
          <h3 className="font-bold text-neutral-800">전문가 대면 상담</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          HeRo의 전문 멘토가 HIT 결과를 함께 분석하고 커리어를 설계합니다.
        </p>
        <Link
          href={`/hero/coaching?type=mentor&resultId=${resultId}`}
          className="text-sm text-[#E53935] font-medium hover:underline transition-colors"
        >
          대면 상담 예약하기 →
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Actions                                                 */}
      {/* ═══════════════════════════════════════════════════════ */}

      <section className="mt-10 space-y-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full py-3 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
        >
          {copied ? <><Check className="h-4 w-4 text-green-500" /> 복사됨</> : <><Copy className="h-4 w-4" /> 결과 링크 복사</>}
        </button>
        <Link
          href="/hero/hit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#E53935] text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          HIT - B 이어서 받기 <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/hero/hit/a"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> 다시 검사하기
        </Link>
      </section>
    </div>
  );
}
