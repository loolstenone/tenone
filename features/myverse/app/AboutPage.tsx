"use client";

import Link from "next/link";

const PRINCIPLES = [
    { no: 1, title: "도모(圖謀)하라", desc: "생각을 행동으로 옮기기 전, 충분히 꾀하고 헤아려라." },
    { no: 2, title: "문제를 먼저 정의하라", desc: "해결책보다 문제 정의가 먼저다. 잘못된 문제를 빠르게 푸는 것은 실패다." },
    { no: 3, title: "Vrief — 세 번 걸러라", desc: "Vision → Reality → Issue → Execution → Feedback. 기획의 5단계." },
    { no: 4, title: "GPR로 기록하라", desc: "Goal을 세우고, Plan을 실행하고, Result를 돌아본다. 기록이 자산이 된다." },
    { no: 5, title: "계획과 기획을 구분하라", desc: "계획은 일정이다. 기획은 방향이다. 방향 없는 일정은 빠른 실패다." },
    { no: 6, title: "Vridge — 다리를 놓아라", desc: "현재와 미래 사이에 실행 가능한 다리를 설계하라." },
    { no: 7, title: "가설을 세우고 검증하라", desc: "확신 없이 시작하되, 검증 없이 확신하지 마라." },
    { no: 8, title: "단순하게 만들어라", desc: "복잡한 것을 단순하게 설명할 수 없다면, 아직 이해하지 못한 것이다." },
    { no: 9, title: "피드백을 환영하라", desc: "비판은 방향 수정의 기회다. 방어하는 대신 흡수하라." },
    { no: 10, title: "지금 시작하라", desc: "완벽한 계획을 기다리지 마라. 실행하며 완성된다." },
];

const TIMELINE = [
    { year: "2004", event: "기획자로 현장 입문 — 첫 기획서를 쓰다" },
    { year: "2010", event: "Vrief 프레임워크 초안 정립 — 기획 실패의 공통 패턴 발견" },
    { year: "2015", event: "GPR 성과 관리 체계 완성 — 팀 단위 검증" },
    { year: "2018", event: "마이버스 종이 플래너 첫 출시" },
    { year: "2022", event: "디지털 버전 출시 — 굿노트·삼성노트 호환 PDF" },
    { year: "2024", event: "AI 비서 통합 연구 시작 — 능동적 플래너의 개념 수립" },
    { year: "2026", event: "마이버스 AI 정식 런칭 — 아침 브리핑, 저녁 회고, 59종 템플릿" },
];

export function AboutPage() {
    return (
        <div className="bg-white text-[#1a1a1a] min-h-screen">
            {/* 히어로 */}
            <section className="px-6 py-20 md:py-28 max-w-3xl mx-auto text-center">
                <p className="text-xs uppercase tracking-widest text-[#6366F1] mb-4">About Myverse</p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
                    우리는 모두 기획자다
                </h1>
                <p className="text-neutral-500 text-lg leading-relaxed mb-4">
                    적어도 자기 인생에서 만큼은.
                </p>
                <p className="text-neutral-400 text-sm italic border-t border-neutral-100 pt-6 mt-6">
                    "생각한대로 살지 않으면, 사는대로 생각하게 된다"
                </p>
            </section>

            {/* 우리의 이야기 */}
            <section className="px-6 py-16 max-w-2xl mx-auto">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-6">우리의 이야기</h2>
                <div className="space-y-5 text-neutral-600 leading-relaxed">
                    <p>
                        Myverse는 22년간 기획 현장에서 반복되는 질문에서 시작했습니다.
                        왜 어떤 사람은 같은 상황에서 더 나은 방향을 찾고, 어떤 사람은 바쁘게 일하면서도 제자리를 걷는가?
                    </p>
                    <p>
                        답은 도구가 아니라 <strong className="text-[#1a1a1a]">사고 체계</strong>에 있었습니다.
                        문제를 정의하는 방식, 가설을 세우는 습관, 결과를 돌아보는 루틴 —
                        이 세 가지가 기획자와 그렇지 않은 사람의 차이를 만들었습니다.
                    </p>
                    <p>
                        Myverse는 그 사고 체계를 일상의 도구로 만든 퍼스널 OS입니다.
                        종이에서 시작해 디지털을 거쳐, 이제 능동 AI 비서와 함께합니다.
                    </p>
                </div>
            </section>

            {/* 타임라인 */}
            <section className="px-6 py-16 bg-neutral-50">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-10">22년의 여정</h2>
                    <div className="relative">
                        <div className="absolute left-16 top-0 bottom-0 w-px bg-neutral-200" />
                        <div className="space-y-8">
                            {TIMELINE.map((item) => (
                                <div key={item.year} className="flex items-start gap-6">
                                    <span className="w-10 text-right text-sm font-mono text-[#6366F1] font-semibold shrink-0 pt-0.5">
                                        {item.year}
                                    </span>
                                    <div className="w-6 h-6 rounded-full border-2 border-[#6366F1] bg-white shrink-0 mt-0.5 z-10" />
                                    <p className="text-neutral-600 text-sm leading-relaxed pt-0.5">{item.event}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Principle 10 */}
            <section className="px-6 py-16 max-w-2xl mx-auto">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Principle 10</h2>
                <p className="text-sm text-neutral-400 mb-10">Myverse가 일하는 방식 — 10가지 원칙</p>
                <div className="space-y-6">
                    {PRINCIPLES.map((p) => (
                        <div key={p.no} className="flex gap-4">
                            <span className="text-2xl font-serif font-bold text-neutral-100 w-8 shrink-0 leading-none mt-1">
                                {p.no}
                            </span>
                            <div>
                                <h3 className="font-semibold text-[#1a1a1a] mb-1">{p.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 방법론 요약 */}
            <section className="px-6 py-16 bg-[#6366F1]">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xs uppercase tracking-widest text-teal-200 mb-10">핵심 방법론</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-3">Vrief</h3>
                            <p className="text-teal-100 text-sm leading-relaxed">
                                Vision → Reality → Issue → Execution → Feedback.
                                기획의 5단계. 현실을 직시하고 실행 가능한 방향을 찾는 체계.
                            </p>
                            <Link href="/myverse/planning" className="inline-block mt-4 text-xs text-teal-200 underline underline-offset-2 hover:text-white transition-colors">
                                자세히 →
                            </Link>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-3">GPR</h3>
                            <p className="text-teal-100 text-sm leading-relaxed">
                                Goal · Plan · Result.
                                목표를 세우고, 실행하고, 돌아본다. 평가가 아닌 성장의 프로토콜.
                            </p>
                            <Link href="/myverse/gpr" className="inline-block mt-4 text-xs text-teal-200 underline underline-offset-2 hover:text-white transition-colors">
                                자세히 →
                            </Link>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-3">Myverse AI</h3>
                            <p className="text-teal-100 text-sm leading-relaxed">
                                아침엔 브리핑하고, 저녁엔 정리한다.
                                능동 AI 비서가 당신의 하루를 함께 설계한다.
                            </p>
                            <Link href="/myverse/canvas-tool" className="inline-block mt-4 text-xs text-teal-200 underline underline-offset-2 hover:text-white transition-colors">
                                자세히 →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 max-w-2xl mx-auto text-center">
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                    나는 무엇을 도모(圖謀)하고 있는가?
                </h2>
                <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                    지금 당장 완벽한 기획자가 될 필요는 없습니다.<br />
                    다만, 오늘의 생각을 기록하는 것에서 시작합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/myverse/app"
                        className="inline-block bg-[#6366F1] text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Myverse 시작하기
                    </Link>
                    <Link
                        href="/myverse/programs"
                        className="inline-block border border-neutral-200 text-neutral-700 text-sm font-medium px-6 py-3 rounded-lg hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
                    >
                        교육 프로그램 보기
                    </Link>
                </div>
            </section>
        </div>
    );
}
