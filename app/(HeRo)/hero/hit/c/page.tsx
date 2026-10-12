"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListChecks, Sprout, Compass, Clock, AlertCircle } from "lucide-react";
import { HIT_STAGES, estimateMinutes, hitStageMinutesLabel } from "@/lib/hit/stages";
import HitStartCTA from "@/features/hit/HitStartCTA";
import { useHitResume, postHitSession } from "@/features/hit/useHitResume";

// 검사 구성·문항 수는 실제 출제(/api/hit/c/questions → hit_questions test_type C)와 같아야 한다 (2026-10-12 신설)
const modules = [
  { icon: ListChecks, title: "취업 준비 상태", desc: "자기 이해·포트폴리오·면접·네트워킹·스킬·실행 준비 + 희망 트랙 준비도. 자기 인식 점수이며, 실제 완료는 Journey 체크리스트에서 셉니다.", count: "48문항", time: `~${estimateMinutes(48)}분` },
  { icon: Sprout, title: "첫 직무 적응", desc: "조직 적응·학습 속도·관계 형성·피드백 수용 — 첫 회사에서 잘 자리 잡는 힘.", count: "20문항", time: `~${estimateMinutes(20)}분` },
  { icon: Compass, title: "진로 결정 확신", desc: "첫 직무를 얼마나 분명하게, 내 판단으로 정했는지.", count: "10문항", time: `~${estimateMinutes(10)}분` },
];

function HitCIntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 생애주기 검사가 어느 HIT A 회차를 잇는지 (2026-10-12) — 시작·결과 채점까지 그대로 전달
  const hitAResultId = searchParams.get("a");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resume = useHitResume("c");
  const stage = HIT_STAGES.c;
  const aParam = hitAResultId ? `&a=${hitAResultId}` : "";

  const handleStart = async (restart = false) => {
    setStarting(true);
    setError(null);
    const r = await postHitSession("c", { hitAResultId, restart });
    if (r.error === null) { router.push(`/hero/hit/c/test?s=${r.token}${aParam}`); return; }
    setError(r.error);
    setStarting(false);
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-3">생애주기</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{stage.code}</h1>
          <p className="text-lg font-semibold text-neutral-600 mb-4 break-keep">{stage.name}</p>
          <p className="text-neutral-500 mb-2">{stage.desc}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {hitStageMinutesLabel("c")}</span><span>·</span><span>{stage.approxQuestions}문항</span><span>·</span><span>7점 척도</span>
          </div>
        </div>
      </section>

      {error && /Archetype/.test(error) && (
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">{HIT_STAGES.a.code}을 먼저 완료해주세요</p>
              <button onClick={() => router.push("/hero/hit/a")} className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900">{HIT_STAGES.a.code} 시작하기 →</button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">검사 구성</h2>
          <div className="space-y-4">
            {modules.map((m, i) => (
              <div key={i} className="flex items-start gap-4 p-5 border border-neutral-200 rounded-xl">
                <div className="w-10 h-10 bg-neutral-100 text-neutral-500 rounded-lg flex items-center justify-center flex-shrink-0"><m.icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-sm">{m.title}</h3><div className="flex items-center gap-2 text-xs text-neutral-400"><span>{m.count}</span><span>{m.time}</span></div></div>
                  <p className="text-xs text-neutral-500 mt-1">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-xs text-neutral-400 mb-4">HIT - Archetype · Bounce를 마친 뒤 진행합니다. 각 문항에 1(매우 비동의)~7(매우 동의)로 응답합니다.</p>
          <HitStartCTA
            label={`${stage.code} 시작하기`}
            resume={resume}
            total={stage.approxQuestions}
            starting={starting}
            error={error}
            onStart={handleStart}
            onResume={() => resume && router.push(`/hero/hit/c/test?s=${resume.token}${aParam}`)}
          />
        </div>
      </section>
    </div>
  );
}

export default function HitCIntroPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>}>
      <HitCIntroContent />
    </Suspense>
  );
}
