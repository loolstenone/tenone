import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ListChecks, Calculator, BookOpenCheck, Sparkles, ShieldCheck, Lock, FlaskConical, AlertCircle } from "lucide-react";
import { HIT_STAGES } from "@/lib/hit/stages";

export const metadata: Metadata = {
  title: "HIT 엔진 — 결과는 이렇게 만들어집니다",
  description: "HeRo Integrated Test의 문항 설계, 서버 채점, 규칙 기반 해설, AI 보조 해설, 응답 품질 관리, 개인정보 원칙을 공개합니다.",
};

/**
 * HIT 엔진 공개 페이지 (2026-10-12) — 회원 전용 검사(a~f 폴더 layout) 밖이라 누구나 읽는다
 *
 * 원칙: 실제로 하는 것만 쓴다. 신뢰도·타당도 "검증 완료" 같은 주장은 데이터로 검증하기 전까지 쓰지 않는다 (표시광고법).
 * 수치·공식은 코드와 같아야 한다 — lib/hit/scoring*.ts · lib/hit/stage-report-modules.ts · lib/hit/cvi.ts · docs/HIT_Reliability_Validity_Review_2026-10.md
 */

const STEPS = [
  {
    icon: ListChecks,
    title: "1. 문항 — 같은 형식, 섞인 순서",
    body: [
      "모든 문항은 1(전혀 아니다)~7(매우 그렇다)의 7점 척도 하나로 답합니다.",
      "같은 영역 안에서 문항 순서를 섞어 앞 문항이 뒤 문항 답에 끼치는 영향을 줄입니다.",
      "일부 문항은 반대 방향으로 쓰여 있어(역문항) 채점 때 뒤집습니다. 무조건 높게 답하는 경향을 걸러내기 위해서입니다.",
      "이력서·면접·재정 같은 \"지금까지 한 일\"은 점수로 재지 않고 체크리스트로 따로 셉니다. 검사는 지금의 나를, 체크리스트는 한 일을 봅니다.",
    ],
  },
  {
    icon: Calculator,
    title: "2. 채점 — 서버의 정해진 규칙",
    body: [
      "점수는 HeRo 서버의 채점 규칙이 계산합니다. 같은 응답에는 언제나 같은 점수가 나옵니다.",
      "영역 점수 = 영역 문항 평균을 0~100으로 환산 ((평균 − 1) ÷ 6 × 100). 성장 배경은 문항별 가중치를 반영합니다.",
      "성격 4축은 양쪽 성향 문항의 비율로, 행동 유형은 네 요인의 상대 비중으로 계산합니다.",
      "S-Power 8가지 강점은 성격·행동·성품·적성 점수를 정해진 가중치로 합한 값입니다. 성장 배경은 강점 점수에 넣지 않습니다.",
      `${HIT_STAGES.b.brand}(${HIT_STAGES.b.name})는 흥미("끌린다", HIT A)와 효능감("할 수 있다", HIT B)을 겹쳐 최적·배우면 되는·소진 주의 영역으로 나눕니다.`,
      `${HIT_STAGES.gap.brand}(${HIT_STAGES.gap.name})의 경력 유효성(CVI) = 직무 유효성 35% + 스킬 현재성 35% + 시장 재진입 30%.`,
    ],
  },
  {
    icon: BookOpenCheck,
    title: "3. 해설 — 미리 쓰고 검수한 324개 모듈",
    body: [
      "결과 해설의 중심은 HeRo가 미리 작성하고 검수한 해설 모듈 324개입니다 (64유형 · 성격 · 행동 · 성품 · 적성 · 역량 · 생애주기별).",
      "점수 구간(67 이상 높음 · 34 이상 보통 · 그 아래 낮음)에 따라 해당 모듈이 선택됩니다. 같은 점수에는 언제나 같은 해설이 나옵니다.",
      "해설 문구는 인트라 › HeRo › 리포트 모듈에서 관리되며, 고칠 때마다 모든 결과에 같은 기준으로 반영됩니다.",
    ],
  },
  {
    icon: Sparkles,
    title: "4. AI 해설 — 보조 역할만",
    body: [
      "결과 마지막의 \"종합 해설\"은 AI가 위 점수를 받아 읽기 쉽게 정리한 문단입니다.",
      "AI는 점수·유형·등급·해설 모듈 선택을 바꾸지 않습니다. AI 호출이 실패해도 결과와 해설 모듈은 그대로 완결됩니다.",
      "AI에는 점수와 유형만 전달되고 이름·연락처는 전달되지 않습니다. AI 처리는 개인정보처리방침의 위탁·국외 이전 항목(Anthropic)에 고지되어 있습니다.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "5. 응답 품질 관리",
    body: [
      "누구나 \"아니다\"라고 답할 만한 확인 문항, 같은 답을 길게 반복한 응답 등 응답 성실도 신호를 기록합니다.",
      "이 신호는 검사 품질 관리용으로 운영자만 보며, 결과 점수나 매칭에 불이익으로 쓰지 않습니다.",
    ],
  },
  {
    icon: Lock,
    title: "6. 개인정보 원칙",
    body: [
      "HIT 검사는 회원만 할 수 있고, 결과는 본인과 HeRo 운영자만 열람합니다. 결과 링크를 안다고 다른 사람이 볼 수 없습니다.",
      "성장 배경(가정·또래·경제 환경) 결과는 본인 리포트에만 쓰고 강점 점수·기업 매칭에는 쓰지 않습니다. 종교 등 민감정보는 묻지 않습니다.",
      "검사 응답은 검사 품질 개선(통계 분석)에 이름 없이 이용합니다.",
    ],
  },
];

export default function HitMethodPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm font-bold text-[#E53935] uppercase tracking-widest mb-4">HIT Engine</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">결과는 이렇게 만들어집니다</h1>
          <p className="text-neutral-500 max-w-xl mx-auto break-keep">
            HIT의 점수와 유형은 AI가 만들어 내는 것이 아니라, 정해진 채점 규칙과 미리 검수한 해설로 만들어집니다. 그 과정을 그대로 공개합니다.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* 흐름 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {[["응답", "7점 척도 · 순서 섞기"], ["채점", "서버 규칙 · 재현 가능"], ["해설", "검수된 모듈 324개"], ["AI", "읽기용 요약 · 보조"]].map(([t, d], i) => (
              <div key={t} className="rounded-xl border border-neutral-200 p-4 text-center">
                <p className="text-[11px] font-semibold text-neutral-400">{i + 1}</p>
                <p className="text-sm font-bold text-neutral-900 mt-1">{t}</p>
                <p className="text-[11px] text-neutral-500 mt-1 break-keep">{d}</p>
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {STEPS.map(s => (
              <div key={s.title}>
                <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 mb-3"><s.icon className="h-5 w-5 text-neutral-400" /> {s.title}</h2>
                <ul className="space-y-2">
                  {s.body.map(b => <li key={b} className="text-sm text-neutral-600 leading-relaxed pl-4 border-l-2 border-neutral-200 break-keep">{b}</li>)}
                </ul>
              </div>
            ))}

            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 mb-3"><FlaskConical className="h-5 w-5 text-neutral-400" /> 7. 검증 계획 — 신뢰도와 타당도</h2>
              <ul className="space-y-2">
                {[
                  "HIT는 아직 표준화(규준) 작업 중인 검사입니다. 응답이 충분히 쌓이는 대로 아래 기준으로 검증하고, 결과를 이 페이지에 공개합니다.",
                  "신뢰도 — 영역별 내적 일관성(Cronbach α 0.70 이상 목표), 2~4주 간격 재검사 일치도.",
                  "타당도 — 의도한 영역으로 문항이 묶이는지(요인분석), 비슷한 것을 재는 영역끼리의 일치(예: 흥미와 효능감), 실제 경력 결과와의 관련성.",
                  "공정성 — 성별·연령·학력에 따라 같은 문항이 다르게 작동하지 않는지 점검합니다.",
                  "검증 전까지 등급 구간(예: 75 / 50 / 25)은 절대 기준이 아니라 참고 기준입니다.",
                ].map(b => <li key={b} className="text-sm text-neutral-600 leading-relaxed pl-4 border-l-2 border-neutral-200 break-keep">{b}</li>)}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 mb-2"><AlertCircle className="h-5 w-5 text-neutral-400" /> HIT를 읽을 때</h2>
              <ul className="space-y-1.5 text-sm text-neutral-600 leading-relaxed list-disc pl-5 break-keep">
                <li>HIT는 스스로 답하는 자기보고 검사입니다. 그 순간의 자기 인식을 보여 주며, 능력을 시험으로 측정한 것이 아닙니다.</li>
                <li>유형은 꼬리표가 아니라 경향입니다. 점수가 50 근처인 축은 양쪽 성향을 모두 쓰는 사람일 수 있습니다.</li>
                <li>HIT 결과는 채용·평가의 단독 판단 근거로 쓰도록 만들어지지 않았습니다. HeRo는 결과를 기업에 제공하지 않습니다.</li>
                <li>상황이 바뀌면 결과도 달라질 수 있습니다. 다시 검사하면 이전 결과는 기록으로 남고 새 결과가 생깁니다.</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/hero/hit" className="inline-flex items-center gap-2 px-5 py-3 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">HIT 검사 보기 <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
