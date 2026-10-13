"use client";

/**
 * 생애주기·상황 검사(D·E·F·GAP) 소개 — 공용 (2026-10-12)
 * 문항 수·모듈 이름은 실제 출제(hit_questions → lib/hit/stage-modules.ts 매핑)·채점(lib/hit/scoring-{x}.ts)과 같아야 한다.
 * 옛 소개 페이지는 문항 수(60 vs 실제 100 등)·이전 문자(HIT - C)·없는 리더십 유형을 적고 있었다.
 */
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, AlertCircle, ListChecks, ShieldCheck } from "lucide-react";
import { HIT_STAGES, type HitStageKey } from "@/lib/hit/stages";
import HitStartCTA from "./HitStartCTA";
import { useHitResume, postHitSession } from "./useHitResume";

export interface StageIntroModule { title: string; desc: string; count: number }

type StageIntroProps = { stage: Extract<HitStageKey, "d" | "e" | "f" | "gap">; modules: StageIntroModule[]; note?: string };

function StageIntroContent({ stage, modules, note }: StageIntroProps) {
  const router = useRouter();
  // 어느 HIT A 회차를 잇는지 (2026-10-12) — 세션 시작·테스트 화면·채점까지 그대로 전달
  const hitAResultId = useSearchParams().get("a");
  const aParam = hitAResultId ? `&a=${hitAResultId}` : "";
  const resume = useHitResume(stage);
  const def = HIT_STAGES[stage];
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 응답 신뢰도 점검 문항 2개가 섞여 출제된다 (2026-10-12) — 총 문항 수에 포함
  const total = modules.reduce((a, m) => a + m.count, 0) + 2;
  const minutes = Math.round((total * 6) / 60);

  const start = async (restart = false) => {
    setStarting(true);
    setError(null);
    const r = await postHitSession(stage, { hitAResultId, restart });
    if (r.error === null) { router.push(`/hero/hit/${stage}/test?s=${r.token}${aParam}`); return; }
    setError(r.error);
    setStarting(false);
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-3">{def.group === "situation" ? "상황 모듈" : "생애주기"}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{def.code}</h1>
          <p className="text-lg font-semibold text-neutral-600 mb-4 break-keep">{def.name}</p>
          <p className="text-neutral-500 mb-2 break-keep">{def.desc}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 약 {minutes}분</span><span>·</span><span>{total}문항</span><span>·</span><span>7점 척도</span>
          </div>
        </div>
      </section>

      {error && /기본 성향 검사|Archetype/.test(error) && (
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">{HIT_STAGES.a.ko}를 먼저 마쳐 주세요</p>
              <button onClick={() => router.push("/hero/hit/a")} className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900">{HIT_STAGES.a.ko} 시작하기 →</button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">검사 구성</h2>
          <div className="space-y-4">
            {modules.map(m => (
              <div key={m.title} className="p-5 border border-neutral-200 rounded-xl">
                <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-sm">{m.title}</h3><span className="text-xs text-neutral-400 shrink-0">{m.count}문항</span></div>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed break-keep">{m.desc}</p>
              </div>
            ))}
            <div className="p-5 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 flex items-start gap-3">
              <ListChecks className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-600 leading-relaxed break-keep">
                <span className="font-bold text-neutral-800">준비도는 문항이 아닙니다.</span> 이력서·면접·재정 같은 준비 항목은 나의 성장 기록의 준비 체크리스트에서 예/아니오로 관리하고, 그 완료율이 결과의 준비도 점수가 됩니다. 검사 전에 체크해 두면 결과에 바로 반영됩니다.
              </p>
            </div>
          </div>
          {note && <p className="text-xs text-neutral-500 mt-4 break-keep">{note}</p>}
        </div>
      </section>

      <section className="bg-white border-t border-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-xs text-neutral-400 mb-4 break-keep">
            공통 검사({HIT_STAGES.a.ko} · {HIT_STAGES.b.ko})를 먼저 하면 결과가 더 깊어집니다. {HIT_STAGES.a.ko}는 꼭 먼저 해 주세요.<br />
            각 문항에 1(전혀 아니다)~7(매우 그렇다)로 응답합니다. 정답은 없습니다.
          </p>
          <HitStartCTA
            label={`${def.ko} 시작하기`}
            resume={resume}
            total={total}
            starting={starting}
            error={error}
            onStart={start}
            onResume={() => resume && router.push(`/hero/hit/${stage}/test?s=${resume.token}${aParam}`)}
          />
          <div className="mt-6">
            <Link href="/hero/hit/method" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"><ShieldCheck className="h-3.5 w-3.5" /> 결과는 어떻게 만들어지나요</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StageIntro(props: StageIntroProps) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="h-8 w-8 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>}>
      <StageIntroContent {...props} />
    </Suspense>
  );
}
