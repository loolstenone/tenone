"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Sprout, Compass, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { HIT_STAGES } from "@/lib/hit/stages";

// 검사 구성·문항 수는 실제 출제(/api/hit/c/questions → hit_questions test_type C)와 같아야 한다 (2026-10-12 신설)
const modules = [
  { icon: ListChecks, title: "취업 준비 상태", desc: "자기 이해·포트폴리오·면접·네트워킹·스킬·실행 준비 + 희망 트랙 준비도. 자기 인식 점수이며, 실제 완료는 Journey 체크리스트에서 셉니다.", count: "48문항", time: "~5분" },
  { icon: Sprout, title: "첫 직무 적응", desc: "조직 적응·학습 속도·관계 형성·피드백 수용 — 첫 회사에서 잘 자리 잡는 힘.", count: "20문항", time: "~2분" },
  { icon: Compass, title: "진로 결정 확신", desc: "첫 직무를 얼마나 분명하게, 내 판단으로 정했는지.", count: "10문항", time: "~1분" },
];

export default function HitCIntroPage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stage = HIT_STAGES.c;

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/hit/c/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (data.sessionToken) router.push(`/hero/hit/c/test?s=${data.sessionToken}`);
      else { setError(data.error ?? "시작할 수 없습니다."); setStarting(false); }
    } catch {
      setError("시작할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      setStarting(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-3">{stage.code} · 생애주기</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{stage.name}</h1>
          <p className="text-neutral-500 mb-2">{stage.desc}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 약 9분</span><span>·</span><span>{stage.approxQuestions}문항</span><span>·</span><span>7점 척도</span>
          </div>
        </div>
      </section>

      {error && (
        <section className="bg-amber-50 border-y border-amber-200">
          <div className="mx-auto max-w-3xl px-6 py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">{error}</p>
              <button onClick={() => router.push("/hero/hit/a")} className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900">HIT A 시작하기 →</button>
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
          <p className="text-xs text-neutral-400 mb-4">HIT A·B를 마친 뒤 진행합니다. 각 문항에 1(매우 비동의)~7(매우 동의)로 응답합니다.</p>
          <button onClick={handleStart} disabled={starting} className="inline-flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold text-lg hover:bg-red-700 transition-colors rounded-xl disabled:opacity-50">
            {starting ? <><Loader2 className="h-5 w-5 animate-spin" /> 시작하는 중...</> : <>{stage.name} 시작하기 <ArrowRight className="h-5 w-5" /></>}
          </button>
        </div>
      </section>
    </div>
  );
}
