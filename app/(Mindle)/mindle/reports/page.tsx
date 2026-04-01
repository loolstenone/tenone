"use client";

import { FileText, Calendar, ChevronRight, Lock } from "lucide-react";

const reports = [
    {
        id: "r1", week: "13주차", date: "3월 24일~30일, 2026", status: "latest",
        title: "에이전트 AI, 기업 현장에 진입하다 — 워크플로우는 이제 달라진다",
        summary: "이번 주 핵심 신호: 자율 AI 에이전트가 더 이상 데모가 아니다. 실제 프로덕션에서 작동 중이다. Z세대의 가치 소비는 더욱 깊어지고, 공간 컴퓨팅에선 첫 킬러앱이 등장했다.",
        keywords: ["에이전트 AI", "Z세대 가치", "공간 컴퓨팅", "슬로우 콘텐츠"],
        sections: 5, readTime: "12분",
    },
    {
        id: "r2", week: "12주차", date: "3월 17일~23일, 2026", status: "published",
        title: "하이퍼로컬의 역설 — 로컬로 생각하고, 글로벌로 확장하라",
        summary: "하이퍼로컬 브랜드가 고객 충성도 지표에서 글로벌 대형 체인을 앞서고 있다. 디지털 디톡스가 프리미엄 라이프스타일 카테고리로 부상한다. 마이크로 SaaS 창업자들이 역대 가장 빠르게 10억을 돌파한다.",
        keywords: ["하이퍼로컬", "디지털 디톡스", "마이크로 SaaS", "크리에이터 이코노미"],
        sections: 5, readTime: "11분",
    },
    {
        id: "r3", week: "11주차", date: "3월 10일~16일, 2026", status: "published",
        title: "구독 피로감이 임계점에 달했다",
        summary: "소비자들이 구독을 역대 최고 속도로 해지하고 있다. 플랫폼들은 슈퍼 번들로 대응한다. AI 카피라이팅은 진정성 논란에 직면했다.",
        keywords: ["구독 피로", "AI 카피", "경험 경제", "번들링"],
        sections: 4, readTime: "10분",
    },
    {
        id: "r4", week: "10주차", date: "3월 3일~9일, 2026", status: "published",
        title: "신뢰 격차 — AI 콘텐츠와 소비자 불신의 충돌",
        summary: "AI 생성 UGC가 플랫폼을 넘치게 하면서 소비자 신뢰 지표가 하락한다. 검증 시스템에 투자한 브랜드는 참여율이 3배 상승했다.",
        keywords: ["AI UGC", "신뢰 경제", "보이스 커머스", "검증"],
        sections: 5, readTime: "13분",
    },
    {
        id: "r5", week: "9주차", date: "2월 24일~3월 2일, 2026", status: "locked",
        title: "프리미엄 리포트: Q1 메가 트렌드 종합 분석",
        summary: "8주간의 신호를 하나로 모은 심층 전략 분석. Q2 2026 독점 전망 포함.",
        keywords: ["Q1 종합", "전망", "전략"],
        sections: 8, readTime: "25분",
    },
];

export default function MindleReportsPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-5xl px-6">
                <section className="py-8 border-b border-neutral-800/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">주간 리포트</h1>
                            <p className="text-neutral-500 text-sm">AI가 분석한 트렌드 리포트를 매주 월요일 발행합니다.</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
                            <Calendar className="w-3 h-3" /> 매주 월요일 오전 9시
                        </div>
                    </div>
                </section>

                <section className="py-6">
                    <div className="divide-y divide-neutral-800/40">
                        {reports.map((r) => (
                            <article key={r.id} className="group py-6 cursor-pointer">
                                <div className="flex items-start gap-5">
                                    <div className="hidden sm:flex flex-col items-center shrink-0 w-16 pt-1">
                                        <span className={`text-[10px] font-bold tracking-wider ${r.status === "latest" ? "text-[#F5C518]" : r.status === "locked" ? "text-neutral-600" : "text-neutral-500"}`}>{r.week}</span>
                                        <span className="text-[10px] text-neutral-700 mt-0.5">{r.date.split(",")[0]}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {r.status === "latest" && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F5C518] text-black">최신</span>}
                                            {r.status === "locked" && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> 프리미엄</span>}
                                        </div>
                                        <h2 className={`text-lg font-bold leading-snug mb-2 transition-colors ${r.status === "locked" ? "text-neutral-500" : "text-white group-hover:text-[#F5C518]"}`}>{r.title}</h2>
                                        <p className="text-neutral-500 text-[13px] leading-relaxed mb-3 line-clamp-2">{r.summary}</p>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {r.keywords.map(kw => (
                                                <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">{kw}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-neutral-600">
                                            <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" />{r.sections}개 섹션</span>
                                            <span>{r.readTime}</span>
                                            {r.status !== "locked" && <span className="flex items-center gap-1 text-neutral-500 group-hover:text-[#F5C518] transition-colors">읽기 <ChevronRight className="w-2.5 h-2.5" /></span>}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
