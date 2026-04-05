"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft, Sparkles } from "lucide-react";
import HitModelGuideModal from "@/features/hit/HitModelGuideModal";
import HitModelGuide from "@/features/hit/HitModelGuide";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import type { HitAResult } from "@/types/hit";

// 마크다운 → 순수 텍스트 (볼드는 유지)
function cleanMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')           // 헤딩 제거
    .replace(/\*\*(.+?)\*\*/g, '$1')    // **볼드** → 볼드 (순수 텍스트)
    .replace(/\*(.+?)\*/g, '$1')        // *이탤릭* → 이탤릭
    .replace(/`(.+?)`/g, '$1')          // `코드` → 코드
    .replace(/^[-*]\s/gm, '')           // 불릿 제거
    .replace(/^\d+\.\s/gm, '')          // 번호 리스트 제거
    .trim();
}

interface HeroTypeData {
  strengths: { title: string; desc: string }[];
  cautions: { title: string; desc: string }[];
  fit_direction: string;
  profile_overview: string;
}

export default function HitAReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitAResult | null>(null);
  const [heroType, setHeroType] = useState<HeroTypeData | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/a/result/${resultId}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) {
          setLoading(false);
          return;
        }
        if (data.type_code) {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const sb = createClient();
            const { data: ht } = await sb
              .from("hit_hero_types")
              .select("strengths,cautions,fit_direction,profile_overview")
              .eq("type_code", data.type_code)
              .maybeSingle();
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
          ufScores: (data.uf_sibling != null) ? {
            sibling: data.uf_sibling, parent: data.uf_parent, family: data.uf_family,
            peer: data.uf_peer, self: data.uf_self, temperament: data.uf_temperament,
            economic: data.uf_economic, trauma: data.uf_trauma, cultural: data.uf_cultural,
          } : undefined,
          createdAt: data.created_at,
        });
        if (data.report_modules) setReportModules(data.report_modules);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p>
          <Link
            href="/hero/hit/a"
            className="text-[#E53935] underline text-sm"
          >
            다시 검사하기
          </Link>
        </div>
      </div>
    );
  }

  const spData = result.sPowerScores
    ? [
        { label: "전략적 사고", value: result.sPowerScores.strategic },
        { label: "실행 추진력", value: result.sPowerScores.execution },
        { label: "창의성", value: result.sPowerScores.creativity },
        { label: "대인관계", value: result.sPowerScores.interpersonal },
        { label: "분석적 판단", value: result.sPowerScores.analytical },
      ]
    : [];

  const ufData = result.ufScores ? [
    { label: "형제관계", value: result.ufScores.sibling },
    { label: "부모관계", value: result.ufScores.parent },
    { label: "가정환경", value: result.ufScores.family },
    { label: "또래관계", value: result.ufScores.peer },
    { label: "자기개념", value: result.ufScores.self },
    { label: "기질", value: result.ufScores.temperament },
    { label: "경제환경", value: result.ufScores.economic },
    { label: "전환경험", value: result.ufScores.trauma },
    { label: "문화·세대", value: result.ufScores.cultural },
  ].filter(d => d.value > 0) : [];

  const narrativeParagraphs =
    result.aiNarrative?.split("\n").filter((p) => p.trim()) ?? [];

  const formattedDate = new Date(result.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Report modules grouped by category
  const discMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("DISC-"))
    : [];
  const mbtiMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("MBTI-"))
    : [];
  const crossMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("CROSS-"))
    : [];
  const spMods = reportModules
    ? Object.entries(reportModules).filter(
        ([k]) => k.startsWith("SP-") && !k.includes("GROWTH")
      )
    : [];
  const spGrowth = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.includes("GROWTH"))
    : [];
  const commMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("COMM-"))
    : [];
  const ufMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("UF-"))
    : [];

  return (
    <div className="hit-report-container mx-auto max-w-[210mm] px-8 py-10 print:pb-0">
      {/* ── 인쇄 버튼 (화면에서만 보임) ── */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link
          href={`/hero/hit/a/result/${resultId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" /> 결과 페이지로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <HitModelGuideModal />
          <Link
            href={`/hero/coaching/ai?resultId=${resultId}`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#E53935] text-[#E53935] text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            AI 상담
          </Link>
          <button
            onClick={handlePrint}
            className="print-keep inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            인쇄 / PDF
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          Section 1: 표지 / 헤더
          ══════════════════════════════════════════ */}
      <section className="hit-print-section">
        {/* 보고서 헤더 */}
        <div className="border-b-2 border-[#E53935] pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/hero-logo.png"
                alt="HeRo"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="text-xs font-bold text-[#E53935] uppercase tracking-[0.2em] mb-1">
                  HeRo Integrated Test
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">
                  HIT A 결과 보고서
                </h1>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-400">
              <p>{formattedDate}</p>
              <p className="mt-1 font-mono text-[10px]">ID: {resultId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* 영웅 유형 카드 */}
        <div className="mb-6">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
            나의 영웅 유형
          </p>
          <HeroTypeCard
            typeCode={result.typeCode}
            nameKo={result.typeNameKo}
            nickname={result.typeNickname}
            category={result.typeCategory}
            traits={result.typeTraits}
            careers={result.typeCareers}
          />
        </div>

        {heroType?.profile_overview && (
          <div className="bg-neutral-50 p-6 rounded-xl mb-4">
            <p className="text-[15px] text-neutral-600 leading-[1.8]">
              {heroType.profile_overview}
            </p>
          </div>
        )}
      </section>

      {/* 인쇄 전용: 검사 설명 */}
      <section className="hit-print-section mt-12 hidden print:block">
        <HitModelGuide mode="print" />
      </section>

      {/* ══════════════════════════════════════════
          Section 2: DISC 행동유형
          ══════════════════════════════════════════ */}
      <section className="hit-print-section mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">
          DISC 행동유형
        </h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-6">
          <DISCChart d={result.discDScore} i={result.discIScore} s={result.discSScore} c={result.discCScore} primary={result.discPrimary} />
        </div>
        {/* 기저요인 (UF) */}
        {(ufData.length > 0 || result.baseSummary) && (
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">기저요인의 영향</p>
            {ufData.length > 0 && (
              <div className="border border-neutral-200 rounded-xl p-6 flex justify-center mb-4">
                <RadarChart data={ufData} size={240} />
              </div>
            )}
            {result.baseSummary && (
              <p className="text-[15px] text-neutral-600 leading-[1.8] border-l-2 border-neutral-300 pl-4 mb-4">
                {result.baseSummary}
              </p>
            )}
            {ufMods.length > 0 && ufMods.map(([id, m]) => (
              <div key={id} className="mb-4 border-l-2 border-purple-400 pl-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        )}
        {discMods.length > 0 && discMods.map(([id, m]) => (
          <div key={id} className="mb-7">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════
          Section 3: MBTI 성향
          ══════════════════════════════════════════ */}
      <section className="hit-print-section mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">
          MBTI 성향
        </h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-6">
          <MBTISpectrum eScore={result.mbtiEScore} sScore={result.mbtiSScore} tScore={result.mbtiTScore} jScore={result.mbtiJScore} />
        </div>
        {mbtiMods.length > 0 && mbtiMods.map(([id, m]) => (
          <div key={id} className="mb-7">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
        {crossMods.length > 0 && (
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">DISC x MBTI 교차 해석</p>
            {crossMods.map(([id, m]) => (
              <div key={id} className="mb-7">
                <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          Section 4: S-Power 강점
          ══════════════════════════════════════════ */}
      <section className="hit-print-section mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">
          S-Power 강점
        </h2>
        {spData.length > 0 && (
          <div className="border border-neutral-200 rounded-xl p-6 flex justify-center mb-6">
            <RadarChart data={spData} size={260} />
          </div>
        )}
        {spMods.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">핵심 강점</p>
            {spMods.map(([id, m]) => (
              <div key={id} className="mb-7 border-l-2 border-green-400 pl-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        )}
        {spGrowth.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">성장 영역</p>
            {spGrowth.map(([id, m]) => (
              <div key={id} className="mb-7 border-l-2 border-amber-400 pl-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        )}
        {narrativeParagraphs.length > 0 && (
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3 w-auto opacity-60" />
              HeRo의 분석
            </p>
            <div className="space-y-3">
              {narrativeParagraphs.map((p, i) => (
                <p key={i} className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(p)}</p>
              ))}
            </div>
          </div>
        )}
        {commMods.length > 0 && (
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">소통 스타일</p>
            {commMods.map(([id, m]) => (
              <div key={id} className="mb-7">
                <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          Section 5: 강점 / 주의점
          ══════════════════════════════════════════ */}
      <section className="hit-print-section mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">
          강점 및 주의점
        </h2>
        {heroType?.strengths && heroType.strengths.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">강점</p>
            {heroType.strengths.map((s, i) => (
              <div key={i} className="mb-4 border-l-2 border-green-400 pl-4">
                <p className="text-sm font-semibold text-neutral-800 mb-0.5">{s.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{s.desc}</p>
              </div>
            ))}
          </div>
        )}
        {heroType?.cautions && heroType.cautions.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">주의점</p>
            {heroType.cautions.map((c, i) => (
              <div key={i} className="mb-4 border-l-2 border-amber-400 pl-4">
                <p className="text-sm font-semibold text-neutral-800 mb-0.5">{c.title}</p>
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{c.desc}</p>
              </div>
            ))}
          </div>
        )}
        {heroType?.fit_direction && (
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">적합 방향</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8] border-l-2 border-blue-400 pl-4">
              {heroType.fit_direction}
            </p>
          </div>
        )}
      </section>

      {/* ── 푸터 ── */}
      <div className="mt-16 pt-6 border-t border-neutral-200 flex items-center justify-center gap-3">
        <Image src="/hero-logo-wide.png" alt="HeRo" width={48} height={24} className="h-5 w-auto opacity-30" />
        <p className="text-xs text-neutral-300">
          HeRo Integrated Test (HIT) | Ten:One Universe | {formattedDate}
        </p>
      </div>

      {/* ── AI 상담 플로팅 버튼 (우하단, 인쇄 시 숨김) ── */}
      <Link
        href={`/hero/coaching/ai?resultId=${resultId}`}
        className="no-print fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-[#E53935] text-white font-bold rounded-full shadow-lg hover:bg-red-700 hover:shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="h-5 w-5" />
        AI 상담
      </Link>

      {/* ── 마지막 페이지: 로고 워터마크 (인쇄/PDF 전용) ── */}
      <div className="hidden print:block" style={{ pageBreakBefore: "always" }}>
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 40px)" }}>
          <div className="text-center">
            <Image
              src="/hero-logo-black-wide.png"
              alt="HeRo"
              width={400}
              height={200}
              className="w-80 mx-auto opacity-[0.06]"
            />
            <p className="text-sm text-neutral-300 mt-10 tracking-widest uppercase">
              HeRo Integrated Test
            </p>
            <p className="text-xs text-neutral-300 mt-2">
              Ten:One Universe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
