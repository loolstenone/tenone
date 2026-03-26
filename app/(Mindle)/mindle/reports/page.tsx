"use client";

import { FileText, Calendar, Eye, ArrowRight, Download } from "lucide-react";

const reports = [
    { id: "r1", week: "2026년 3월 4주차", title: "에이전트 AI 도입 가속 + 숏폼 피로도 확산", keywords: ["에이전트 AI", "슬로우 콘텐츠", "체험형 소비", "로컬 크리에이터"], summary: "이번 주 전 플랫폼에서 '에이전트 AI'가 1위 키워드. 숏폼 체류 시간 감소 시그널 다수 포착.", views: 1247, isLatest: true },
    { id: "r2", week: "2026년 3월 3주차", title: "Z세대 가치소비 심화 + AI 영상 편집 급부상", keywords: ["Z세대 가치소비", "AI 영상 편집", "하이퍼로컬", "구독 피로"], summary: "Z세대 가치 소비 패턴 전 플랫폼 확인. AI 영상 편집 키워드 전주 대비 340% 증가.", views: 2156, isLatest: false },
    { id: "r3", week: "2026년 3월 2주차", title: "공간 컴퓨팅 논쟁 + 프리랜서 시장 변화", keywords: ["공간 컴퓨팅", "프리랜서 플랫폼", "AI 카피라이팅", "마이크로 SaaS"], summary: "공간 컴퓨팅 대중화 찬반 논쟁 활발. 프리랜서 시장에서 AI 툴 활용 능력이 단가에 직결.", views: 1893, isLatest: false },
];

export default function MindleReportsPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">주간 리포트</h1>
                    <p className="text-neutral-400 mb-8">매주 월요일 발행. AI가 분석하고 전문가가 큐레이션한 위클리 트렌드 리포트.</p>
                    <div className="space-y-5">
                        {reports.map((r) => (
                            <article key={r.id} className={`group p-7 rounded-2xl border transition-all ${r.isLatest ? "border-[#F5C518]/30 bg-[#F5C518]/5" : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <FileText className="w-4 h-4 text-[#F5C518]" />
                                    <span className="text-[#F5C518] text-xs font-medium">{r.week}</span>
                                    {r.isLatest && <span className="text-[10px] bg-[#F5C518] text-black px-2 py-0.5 rounded font-semibold">LATEST</span>}
                                </div>
                                <h2 className="text-white font-bold text-xl mb-3 group-hover:text-[#F5C518] transition-colors">{r.title}</h2>
                                <p className="text-neutral-400 text-sm mb-4">{r.summary}</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {r.keywords.map((kw) => (
                                        <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">#{kw}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-neutral-500 flex items-center gap-1"><Eye className="w-3 h-3" />{r.views.toLocaleString()}</span>
                                    <button className="text-sm text-white hover:text-[#F5C518] transition-colors flex items-center gap-1">리포트 보기 <ArrowRight className="w-3.5 h-3.5" /></button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
