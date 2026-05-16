"use client";

import Link from "next/link";
import { ArrowRight, Compass, Activity, Eye, ChevronRight } from "lucide-react";

const connectServices = [
    { name: "Brand Diagnosis", desc: "브랜드의 현재 상태 진단. 소비자가 이 브랜드를 어떻게 인식하고 있는가, 경쟁사 대비 어디에 있는가.", output: "브랜드 진단 리포트", duration: "2~3주" },
    { name: "Consumer Connection Map", desc: "소비자가 이 카테고리에서 뭘 아파하고, 어디서 묻고, 어디서 사는가. 페인 포인트 맵 + 소비자 여정.", output: "소비자 접속 지도", duration: "3~4주" },
    { name: "Brand Direction", desc: "진단과 소비자 지도를 기반으로 브랜드가 나아갈 방향 설정. 포지셔닝, 보이스, 핵심 메시지.", output: "브랜드 방향서", duration: "2주" },
];

const runServices = [
    { name: "Monthly Coaching", desc: "월 1~2회 코칭 세션. 지난 달 실행 점검 + 이번 달 방향 조정 + 현안 논의. 브랜드 담당자의 의사결정을 돕는 자문.", cycle: "월 2회" },
    { name: "Strategy Review", desc: "분기 1회. 브랜드 전략의 큰 방향을 점검하고 필요 시 수정. 시장 변화, 경쟁 환경, 소비자 변화 반영.", cycle: "분기 1회" },
    { name: "Campaign Check", desc: "마케팅 캠페인, 콘텐츠, 프로모션 기획 시 방향성 체크. \"이게 소비자의 고통에 닿고 있는가\" 점검.", cycle: "수시" },
    { name: "Growth Milestone", desc: "브랜드 성장 단계별 마일스톤 설정 + 달성 여부 추적. 6개월/1년 단위 성장 로드맵.", cycle: "6개월" },
];

const watchServices = [
    { name: "Consumer Pulse", desc: "소비자 리뷰·커뮤니티·SNS에서 브랜드 언급과 페인 포인트 변화를 추적. 새로운 고통이 등장하면 알림.", cycle: "월간 리포트" },
    { name: "Competitor Watch", desc: "경쟁사의 움직임 추적. 신제품, 캠페인, 포지셔닝 변화, 소비자 반응.", cycle: "월간 리포트" },
    { name: "Category Trend", desc: "카테고리 전체의 트렌드 변화. 새로운 플레이어, 기술 변화, 규제 변화, 소비자 행동 변화.", cycle: "분기 리포트" },
    { name: "AI Gravity Check", desc: "Brand Gravity 연동. AI가 이 브랜드를 어떻게 보고 있는지 Gravity Score 정기 측정.", cycle: "월간" },
];

const packages = [
    { name: "Connect Only", includes: "Connect 3종 (1회)", target: "방향을 잡고 싶은 브랜드", price: "300~800만원", priceNote: "1회" },
    { name: "Life Mark Lite", includes: "Run (월 1회 코칭) + Watch (Consumer Pulse)", target: "소규모 브랜드, 스타트업", price: "100~200만원", priceNote: "월" },
    { name: "Life Mark Standard", includes: "Run (월 2회 코칭 + Campaign Check) + Watch 3종", target: "중소 브랜드", price: "300~500만원", priceNote: "월" },
    { name: "Life Mark + Gravity", includes: "Life Mark Standard + Brand Gravity Program", target: "브랜드 방향 + AI 실행 동시", price: "500~800만원", priceNote: "월", highlight: true },
];

export default function LifeMarkPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">

            {/* 히어로 */}
            <section className="pt-40 pb-24 px-6 max-w-4xl mx-auto">
                <p className="text-xs tracking-[0.25em] uppercase text-neutral-500 mb-4">Life Mark</p>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                    브랜드가 소비자의 삶에<br />
                    <span className="text-amber-500">접속을 시도</span>합니다.
                </h1>
                <p className="text-neutral-400 leading-relaxed max-w-xl">
                    Brand Gravity가 AI 추천 진입이라는 구체적 결과를 파는 서비스라면,
                    Life Mark는 브랜드의 방향과 성장을 함께 만들어가는 러닝 메이트입니다.
                    한 번 하고 끝나는 프로젝트가 아니라, 브랜드가 성장하는 동안 계속 옆에서 같이 뛰는 것.
                </p>
            </section>

            {/* 접속 3단계 개념 */}
            <section className="px-6 max-w-4xl mx-auto mb-24">
                <div className="p-8 border border-neutral-800 rounded-2xl">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-6">접속하려면</p>
                    <div className="space-y-4">
                        {[
                            { n: "①", text: "소비자가 어디 있는지 알아야 하고", sub: "시장 조사" },
                            { n: "②", text: "무슨 말을 해야 하는지 알아야 하고", sub: "브랜드 전략" },
                            { n: "③", text: "접속 상태를 유지해야 한다", sub: "모니터링" },
                        ].map(item => (
                            <div key={item.n} className="flex items-baseline gap-4">
                                <span className="text-amber-500 font-bold text-lg w-6 flex-shrink-0">{item.n}</span>
                                <span className="text-neutral-200">{item.text}</span>
                                <span className="text-xs text-neutral-600 ml-1">— {item.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3개 서비스 */}
            <div className="px-6 max-w-4xl mx-auto space-y-16 mb-24">

                {/* Connect */}
                <section>
                    <div className="flex items-center gap-3 mb-2">
                        <Compass className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-bold">Connect</h2>
                        <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">접속 준비</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-6">
                        한 번. 브랜드가 소비자에게 접속하기 위한 기반을 잡는다.
                        단독 수주 가능하며, Run으로 이어지는 구조입니다.
                    </p>
                    <div className="space-y-3">
                        {connectServices.map(s => (
                            <div key={s.name} className="grid sm:grid-cols-[1fr_auto_auto] gap-4 p-5 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition items-start">
                                <div>
                                    <h3 className="text-sm font-bold mb-1">{s.name}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                                </div>
                                <div className="text-right sm:text-center">
                                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-0.5">납품물</p>
                                    <p className="text-xs text-neutral-300">{s.output}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-0.5">기간</p>
                                    <p className="text-xs text-amber-500 font-medium">{s.duration}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Run */}
                <section>
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-bold">Run</h2>
                        <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">함께 뛰기</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-6">
                        월간 러닝 메이트. 월정액 리테이너 모델로 운영됩니다.
                        브랜드가 클수록 세션이 늘어납니다.
                    </p>
                    <div className="space-y-3">
                        {runServices.map(s => (
                            <div key={s.name} className="flex items-start gap-4 p-5 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold mb-1">{s.name}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-0.5">주기</p>
                                    <p className="text-xs text-amber-500 font-medium">{s.cycle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Watch */}
                <section>
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-amber-500" />
                        <h2 className="text-2xl font-bold">Watch</h2>
                        <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">접속 상태 유지</span>
                    </div>
                    <p className="text-sm text-neutral-400 mb-6">
                        시장과 소비자는 계속 바뀝니다. 접속 상태를 유지하려면 계속 봐야 합니다.
                        Mindle 크롤링 인프라와 Brand Gravity의 AI Prober를 공유합니다.
                    </p>
                    <div className="space-y-3">
                        {watchServices.map(s => (
                            <div key={s.name} className="flex items-start gap-4 p-5 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold mb-1">{s.name}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-0.5">주기</p>
                                    <p className="text-xs text-amber-500 font-medium">{s.cycle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Life Mark × Brand Gravity 관계 */}
            <section className="px-6 max-w-4xl mx-auto mb-24">
                <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Relationship</p>
                <h2 className="text-2xl font-bold mb-8">Life Mark × Brand Gravity</h2>
                <div className="grid sm:grid-cols-2 gap-px bg-neutral-800 rounded-xl overflow-hidden mb-8">
                    <div className="bg-[#0A0A0A] p-6">
                        <p className="text-xs tracking-[0.15em] uppercase text-neutral-500 mb-4">Life Mark</p>
                        <p className="text-xs text-neutral-300 leading-relaxed mb-1">철학 · 코칭 · 모니터링</p>
                        <p className="text-sm text-neutral-500 italic mt-3">트레이너</p>
                        <p className="text-xs text-neutral-600 mt-1">브랜드의 체력을 키우는 사람</p>
                    </div>
                    <div className="bg-[#111] p-6 border-l border-amber-500/20">
                        <p className="text-xs tracking-[0.15em] uppercase text-amber-500 mb-4">Brand Gravity</p>
                        <p className="text-xs text-neutral-300 leading-relaxed mb-1">AI 추천 진입 · 실행</p>
                        <p className="text-sm text-neutral-500 italic mt-3">전문의</p>
                        <p className="text-xs text-neutral-600 mt-1">특정 부위(AI 추천)를 진단하고 치료하는 사람</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { lm: "Connect (진단·방향)", bg: "Gravity Scan (AI 진단)" },
                        { lm: "Run (월간 코칭)", bg: "Gravity Program (3개월 실행)" },
                        { lm: "Watch (시장 추적)", bg: "Gravity Dashboard (Score 추적)" },
                    ].map(r => (
                        <div key={r.lm} className="flex items-center gap-3 text-sm">
                            <span className="text-neutral-300 flex-1 text-right">{r.lm}</span>
                            <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="text-amber-400 flex-1">{r.bg}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-neutral-600 mt-6 leading-relaxed">
                    트레이너가 "여기 좀 이상한데요" 하면 전문의에게 보내는 구조.
                    둘이 합쳐지면 방향 + 실행의 완전한 그림이 됩니다.
                </p>
            </section>

            {/* 패키지 */}
            <section className="px-6 max-w-4xl mx-auto mb-24">
                <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Packages</p>
                <h2 className="text-2xl font-bold mb-8">서비스 패키지</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {packages.map(p => (
                        <div key={p.name} className={`p-6 border rounded-xl flex flex-col gap-4 ${p.highlight ? "border-amber-500/40 bg-amber-500/5" : "border-neutral-800"}`}>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${p.highlight ? "text-amber-500" : "text-neutral-400"}`}>{p.name}</p>
                                <p className="text-xs text-neutral-500 leading-relaxed">{p.includes}</p>
                            </div>
                            <p className="text-xs text-neutral-600">{p.target}</p>
                            <div className="mt-auto">
                                <p className="text-xl font-bold text-white">{p.price}</p>
                                <p className="text-xs text-neutral-500">{p.priceNote}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 max-w-4xl mx-auto text-center pb-24">
                <p className="text-xs tracking-[0.2em] text-amber-500 uppercase mb-4">Life Mark</p>
                <h2 className="text-2xl font-bold mb-3">함께 뛸 준비가 됐다면</h2>
                <p className="text-sm text-neutral-400 mb-8 max-w-md mx-auto">
                    브랜드의 현재 상태, 원하는 방향, 규모를 알려주세요.
                    맞는 구조를 함께 설계합니다.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <Link href="/brandgravity/apply" className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                        상담 신청 <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/brandgravity/services" className="inline-flex items-center gap-2 px-6 py-3.5 border border-neutral-700 text-sm rounded-lg hover:border-neutral-500 transition">
                        Brand Gravity 서비스 보기
                    </Link>
                </div>
            </section>

        </div>
    );
}
