"use client";

// 캔버스·전략 계열 그리드 — _shared 의 CellTextarea 만 의존.
// LeanCanvasGrid · BmcGrid · VpcGrid · OkrGrid

import { CellTextarea, type FrameworkData } from "./_shared";

interface GP { data: FrameworkData; onChange: (key: string, val: string) => void }

export function LeanCanvasGrid({ data, onChange }: GP) {
    return (
        <div className="my-2 space-y-1">
            {/* 상단 5열 */}
            <div className="grid grid-cols-5 gap-1">
                {/* Col 1: Problem + Existing Alt */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-stone-50 border border-stone-300 min-h-24">
                        <p className="text-[10px] font-bold text-stone-800">Problem</p>
                        <p className="text-[9px] text-neutral-400">문제</p>
                        <CellTextarea cellKey="problem" value={data["problem"] ?? ""} onChange={onChange} placeholder="Top 3 problems…" />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-stone-700">Existing Alt.</p>
                        <p className="text-[9px] text-neutral-400">기존 대안</p>
                        <CellTextarea cellKey="existing_alternatives" value={data["existing_alternatives"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                {/* Col 2: Solution + Key Metrics */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-300 min-h-24">
                        <p className="text-[10px] font-bold text-slate-900">Solution</p>
                        <p className="text-[9px] text-neutral-400">솔루션</p>
                        <CellTextarea cellKey="solution" value={data["solution"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-slate-700">Key Metrics</p>
                        <p className="text-[9px] text-neutral-400">핵심 지표</p>
                        <CellTextarea cellKey="key_metrics" value={data["key_metrics"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                {/* Col 3: UVP + High-Level Concept (center, tall) */}
                <div className="rounded-lg p-2 bg-stone-50 border border-stone-200 flex flex-col">
                    <p className="text-[10px] font-bold text-stone-800">UVP</p>
                    <p className="text-[9px] text-neutral-400">고유 가치 제안</p>
                    <CellTextarea cellKey="uvp" value={data["uvp"] ?? ""} onChange={onChange} placeholder="Single clear, compelling message…" />
                    <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-stone-600">High-Level Concept</p>
                        <CellTextarea cellKey="high_level_concept" value={data["high_level_concept"] ?? ""} onChange={onChange} placeholder="X for Y…" />
                    </div>
                </div>
                {/* Col 4: Unfair Advantage + Channels */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-200 min-h-24">
                        <p className="text-[10px] font-bold text-slate-800">Unfair Adv.</p>
                        <p className="text-[9px] text-neutral-400">경쟁 우위</p>
                        <CellTextarea cellKey="unfair_advantage" value={data["unfair_advantage"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-slate-600">Channels</p>
                        <p className="text-[9px] text-neutral-400">채널</p>
                        <CellTextarea cellKey="channels" value={data["channels"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                {/* Col 5: Customer Segments + Early Adopters */}
                <div className="flex flex-col gap-1">
                    <div className="rounded-lg p-2 bg-slate-50 border border-slate-200 min-h-24">
                        <p className="text-[10px] font-bold text-slate-800">Customer Seg.</p>
                        <p className="text-[9px] text-neutral-400">고객 세그먼트</p>
                        <CellTextarea cellKey="customer_segments" value={data["customer_segments"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200 min-h-20">
                        <p className="text-[10px] font-bold text-slate-600">Early Adopters</p>
                        <p className="text-[9px] text-neutral-400">초기 사용자</p>
                        <CellTextarea cellKey="early_adopters" value={data["early_adopters"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>
            {/* 하단 2열 */}
            <div className="grid grid-cols-2 gap-1">
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-200 min-h-16">
                    <p className="text-[10px] font-bold text-neutral-600">Cost Structure</p>
                    <p className="text-[9px] text-neutral-400">비용 구조</p>
                    <CellTextarea cellKey="cost_structure" value={data["cost_structure"] ?? ""} onChange={onChange} />
                </div>
                <div className="rounded-lg p-2 bg-slate-50 border border-slate-300 min-h-16">
                    <p className="text-[10px] font-bold text-slate-800">Revenue Streams</p>
                    <p className="text-[9px] text-neutral-400">수익 흐름</p>
                    <CellTextarea cellKey="revenue_streams" value={data["revenue_streams"] ?? ""} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

export function BmcGrid({ data, onChange }: GP) {
    const block = "rounded-lg p-2 border flex flex-col";
    const head = "text-[10px] font-bold";
    const sub = "text-[9px] text-neutral-400";
    return (
        <div className="my-2 space-y-1 overflow-x-auto">
            {/* 상단 5열 */}
            <div className="grid grid-cols-5 gap-1 min-w-[520px]">
                <div className={`${block} bg-slate-50 border-slate-200 min-h-48`}>
                    <p className={`${head} text-slate-800`}>Key Partners</p>
                    <p className={sub}>핵심 파트너</p>
                    <CellTextarea cellKey="bmc_key_partners" value={data["bmc_key_partners"] ?? ""} onChange={onChange} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`${block} bg-slate-50 border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-slate-800`}>Key Activities</p>
                        <p className={sub}>핵심 활동</p>
                        <CellTextarea cellKey="bmc_key_activities" value={data["bmc_key_activities"] ?? ""} onChange={onChange} />
                    </div>
                    <div className={`${block} bg-white border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-slate-600`}>Key Resources</p>
                        <p className={sub}>핵심 자원</p>
                        <CellTextarea cellKey="bmc_key_resources" value={data["bmc_key_resources"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                <div className={`${block} bg-stone-50 border-stone-300 min-h-48`}>
                    <p className={`${head} text-stone-800`}>Value Propositions</p>
                    <p className={sub}>가치 제안</p>
                    <CellTextarea cellKey="bmc_value_propositions" value={data["bmc_value_propositions"] ?? ""} onChange={onChange} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className={`${block} bg-slate-50 border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-stone-700`}>Customer Relationships</p>
                        <p className={sub}>고객 관계</p>
                        <CellTextarea cellKey="bmc_customer_relationships" value={data["bmc_customer_relationships"] ?? ""} onChange={onChange} />
                    </div>
                    <div className={`${block} bg-white border-slate-200 flex-1 min-h-24`}>
                        <p className={`${head} text-slate-700`}>Channels</p>
                        <p className={sub}>채널</p>
                        <CellTextarea cellKey="bmc_channels" value={data["bmc_channels"] ?? ""} onChange={onChange} />
                    </div>
                </div>
                <div className={`${block} bg-slate-50 border-slate-300 min-h-48`}>
                    <p className={`${head} text-slate-900`}>Customer Segments</p>
                    <p className={sub}>고객 세그먼트</p>
                    <CellTextarea cellKey="bmc_customer_segments" value={data["bmc_customer_segments"] ?? ""} onChange={onChange} />
                </div>
            </div>
            {/* 하단 2열 */}
            <div className="grid grid-cols-2 gap-1 min-w-[520px]">
                <div className={`${block} bg-neutral-100 border-neutral-200 min-h-16`}>
                    <p className={`${head} text-neutral-600`}>Cost Structure</p>
                    <p className={sub}>비용 구조</p>
                    <CellTextarea cellKey="bmc_cost_structure" value={data["bmc_cost_structure"] ?? ""} onChange={onChange} />
                </div>
                <div className={`${block} bg-slate-50 border-slate-300 min-h-16`}>
                    <p className={`${head} text-slate-800`}>Revenue Streams</p>
                    <p className={sub}>수익 흐름</p>
                    <CellTextarea cellKey="bmc_revenue_streams" value={data["bmc_revenue_streams"] ?? ""} onChange={onChange} />
                </div>
            </div>
        </div>
    );
}

export function VpcGrid({ data, onChange }: GP) {
    return (
        <div className="my-2 grid md:grid-cols-2 gap-3">
            {/* 좌: Value Map (사각형) */}
            <div className="rounded-xl p-3 bg-slate-50 border-2 border-slate-700">
                <p className="text-[11px] font-bold text-slate-900 text-center mb-2">Value Map · 가치 제안 맵</p>
                <div className="space-y-2">
                    <div className="rounded-lg p-2 bg-white border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-900">Products &amp; Services</p>
                        <p className="text-[9px] text-neutral-400">제품·서비스</p>
                        <CellTextarea cellKey="vpc_products" value={data["vpc_products"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-800">Gain Creators</p>
                        <p className="text-[9px] text-neutral-400">이득 창출</p>
                        <CellTextarea cellKey="vpc_gain_creators" value={data["vpc_gain_creators"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200">
                        <p className="text-[10px] font-bold text-stone-700">Pain Relievers</p>
                        <p className="text-[9px] text-neutral-400">고통 해소</p>
                        <CellTextarea cellKey="vpc_pain_relievers" value={data["vpc_pain_relievers"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>
            {/* 우: Customer Profile (원형 느낌) */}
            <div className="rounded-full p-3 bg-stone-50 border-2 border-stone-400 md:rounded-xl">
                <p className="text-[11px] font-bold text-slate-900 text-center mb-2">Customer Profile · 고객 프로필</p>
                <div className="space-y-2">
                    <div className="rounded-lg p-2 bg-white border border-stone-200">
                        <p className="text-[10px] font-bold text-stone-800">Customer Jobs</p>
                        <p className="text-[9px] text-neutral-400">고객 과업</p>
                        <CellTextarea cellKey="vpc_customer_jobs" value={data["vpc_customer_jobs"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-300">
                        <p className="text-[10px] font-bold text-slate-800">Gains</p>
                        <p className="text-[9px] text-neutral-400">이득·기대</p>
                        <CellTextarea cellKey="vpc_gains" value={data["vpc_gains"] ?? ""} onChange={onChange} />
                    </div>
                    <div className="rounded-lg p-2 bg-white border border-slate-200">
                        <p className="text-[10px] font-bold text-stone-700">Pains</p>
                        <p className="text-[9px] text-neutral-400">고통·장애물</p>
                        <CellTextarea cellKey="vpc_pains" value={data["vpc_pains"] ?? ""} onChange={onChange} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function OkrGrid({ data, onChange }: GP) {
    const krKeys = ["okr_kr1", "okr_kr2", "okr_kr3", "okr_kr4", "okr_kr5"];
    return (
        <div className="my-2 space-y-2">
            {/* Objective */}
            <div className="rounded-xl p-3 bg-stone-50 border-2 border-stone-400">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Objective · 목표</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">큰 방향. 정성적·영감적. &quot;~를 달성한다&quot;</p>
                <textarea
                    value={data["okr_objective"] ?? ""}
                    onChange={e => onChange("okr_objective", e.target.value)}
                    placeholder="예: 고객이 첫 접속 15분 안에 가치를 느끼게 한다"
                    rows={2}
                    className="w-full mt-2 resize-none bg-white/60 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none p-2 rounded border border-stone-200 leading-relaxed"
                />
            </div>
            {/* Key Results */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-300">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-2">Key Results · 핵심 결과 (측정 가능)</p>
                <div className="space-y-1.5">
                    {krKeys.map((k, i) => (
                        <div key={k} className="flex items-start gap-2">
                            <span className="shrink-0 mt-1 w-6 h-6 rounded-full bg-slate-200 text-slate-900 text-[10px] font-bold flex items-center justify-center">
                                {i + 1}
                            </span>
                            <input
                                type="text"
                                value={data[k] ?? ""}
                                onChange={e => onChange(k, e.target.value)}
                                placeholder={i < 3 ? "예: 주간 활성 사용자 1만 → 3만 달성" : "(선택) 추가 KR"}
                                className="flex-1 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-slate-700"
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* Initiatives */}
            <div className="rounded-xl p-3 bg-neutral-50 border border-neutral-200">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Initiatives · 실행 계획</p>
                <CellTextarea cellKey="okr_initiatives" value={data["okr_initiatives"] ?? ""} onChange={onChange} placeholder="- 각 KR을 달성할 구체적 행동…" />
            </div>
        </div>
    );
}
