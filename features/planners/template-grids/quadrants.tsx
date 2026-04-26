"use client";

// 사분면·매트릭스 계열 그리드 — _shared 의 QuadrantGrid · CellTextarea · Q_TONE/Q_TEXT 만 의존.
// SwotGrid · FourPGrid · AnsoffGrid · BcgGrid · NineBoxGrid
// EisenhowerGrid · PestGrid · MoscowGrid · QuadrantBlankGrid · KanoGrid

import {
    Q_TONE, Q_TEXT, CellTextarea, QuadrantGrid,
    type FrameworkData,
} from "./_shared";

interface GP { data: FrameworkData; onChange: (key: string, val: string) => void }

export function SwotGrid({ data, onChange }: GP) {
    // 표준 SWOT: 세로축=Helpful↔Harmful, 가로축=Internal↔External
    const cells = [
        { key: "s", label: "Strengths",     sub: "내부 · 긍정", tone: "primary"   as const },
        { key: "o", label: "Opportunities", sub: "외부 · 긍정", tone: "secondary" as const },
        { key: "w", label: "Weaknesses",    sub: "내부 · 부정", tone: "tertiary"  as const },
        { key: "t", label: "Threats",       sub: "외부 · 부정", tone: "muted"     as const },
    ];
    return (
        <div className="my-3 select-none">
            <div className="flex items-center justify-center mb-3">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Internal</span>
                <span className="mx-2 text-slate-300">↔</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">External</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {cells.map(q => (
                    <div key={q.key} className={`rounded-md p-3 min-h-32 ${Q_TONE[q.tone]} transition-shadow hover:shadow-sm`}>
                        <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[q.tone]}`}>{q.label}</p>
                        <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{q.sub}</p>
                        <CellTextarea cellKey={q.key} value={data[q.key] ?? ""} onChange={onChange} />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center mt-2.5 gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Helpful</span>
                <span className="text-slate-300">↑↓</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Harmful</span>
            </div>
        </div>
    );
}

export function FourPGrid({ data, onChange }: GP) {
    const cells = [
        { key: "product",   label: "Product",   sub: "제품·서비스",         tone: "primary"   as const },
        { key: "price",     label: "Price",     sub: "가격·수익 모델",       tone: "secondary" as const },
        { key: "place",     label: "Place",     sub: "유통·접근",            tone: "tertiary"  as const },
        { key: "promotion", label: "Promotion", sub: "프로모션·커뮤니케이션", tone: "muted"     as const },
    ];
    return (
        <div className="my-3 grid grid-cols-2 gap-2">
            {cells.map(q => (
                <div key={q.key} className={`rounded-md p-3 min-h-32 ${Q_TONE[q.tone]} transition-shadow hover:shadow-sm`}>
                    <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[q.tone]}`}>{q.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{q.sub}</p>
                    <CellTextarea cellKey={q.key} value={data[q.key] ?? ""} onChange={onChange} />
                </div>
            ))}
        </div>
    );
}

export function AnsoffGrid({ data, onChange }: GP) {
    return (
        <QuadrantGrid
            axisX="시장 (Markets)" axisXLow="기존" axisXHigh="신규"
            axisY="제품 (Products)" axisYHigh="기존" axisYLow="신규"
            quads={[
                { key: "penetration",     label: "Market Penetration",  desc: "시장 침투 · 기존×기존",          color: Q_TONE.primary,   text: Q_TEXT.primary },
                { key: "market_dev",      label: "Market Development",  desc: "시장 개발 · 신시장×기존제품",     color: Q_TONE.secondary, text: Q_TEXT.secondary },
                { key: "product_dev",     label: "Product Development", desc: "제품 개발 · 기존시장×신제품",     color: Q_TONE.tertiary,  text: Q_TEXT.tertiary },
                { key: "diversification", label: "Diversification",     desc: "다각화 · 신시장×신제품 (고위험)", color: Q_TONE.muted,     text: Q_TEXT.muted },
            ]}
            data={data}
            onChange={onChange}
        />
    );
}

export function BcgGrid({ data, onChange }: GP) {
    return (
        <QuadrantGrid
            axisX="Market Share" axisXLow="Low" axisXHigh="High"
            axisY="Market Growth" axisYHigh="High" axisYLow="Low"
            quads={[
                { key: "question", label: "Question Mark", desc: "저점유 · 고성장 (투자 검토)", color: Q_TONE.tertiary,  text: Q_TEXT.tertiary },
                { key: "star",     label: "Star",          desc: "고점유 · 고성장 (전략 자산)", color: Q_TONE.primary,   text: Q_TEXT.primary },
                { key: "dog",      label: "Dog",           desc: "저점유 · 저성장 (철수 검토)", color: Q_TONE.muted,     text: Q_TEXT.muted },
                { key: "cow",      label: "Cash Cow",      desc: "고점유 · 저성장 (현금 창출)", color: Q_TONE.secondary, text: Q_TEXT.secondary },
            ]}
            data={data}
            onChange={onChange}
        />
    );
}

export function NineBoxGrid({ data, onChange }: GP) {
    const perf = ["Low", "Mid", "High"];
    const pot  = ["High", "Mid", "Low"];
    const LABELS: Record<string, { label: string; tone: keyof typeof Q_TONE }> = {
        "High-Low":  { label: "Enigma",                tone: "tertiary"  },
        "High-Mid":  { label: "High Potential",        tone: "secondary" },
        "High-High": { label: "Star",                  tone: "primary"   },
        "Mid-Low":   { label: "Inconsistent Player",   tone: "muted"     },
        "Mid-Mid":   { label: "Core Player",           tone: "secondary" },
        "Mid-High":  { label: "High Performer",        tone: "primary"   },
        "Low-Low":   { label: "Under Performer",       tone: "muted"     },
        "Low-Mid":   { label: "Average Performer",     tone: "tertiary"  },
        "Low-High":  { label: "Trusted Professional",  tone: "secondary" },
    };
    return (
        <div className="my-3 select-none">
            <div className="flex items-center justify-center mb-3 ml-16">
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">Low</span>
                <span className="mx-2 text-slate-300">←</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-700">Performance</span>
                <span className="mx-2 text-slate-300">→</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold">High</span>
            </div>
            <div className="flex gap-2">
                <div className="flex flex-col items-center justify-between shrink-0 w-7 py-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold leading-none">High</span>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-700 inline-block -rotate-90 whitespace-nowrap">Potential</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-semibold leading-none">Low</span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1.5">
                    {pot.map(p => perf.map(pf => {
                        const k = `${p}-${pf}`;
                        const info = LABELS[k] ?? { label: k, tone: "tertiary" as const };
                        return (
                            <div key={k} className={`rounded-md p-2 min-h-24 ${Q_TONE[info.tone]}`}>
                                <p className={`text-[10px] font-bold tracking-wide uppercase leading-tight ${Q_TEXT[info.tone]}`}>{info.label}</p>
                                <textarea
                                    value={data[k] ?? ""}
                                    onChange={e => onChange(k, e.target.value)}
                                    placeholder="이름/메모…"
                                    rows={2}
                                    className="w-full mt-1.5 resize-none bg-transparent text-[10px] text-slate-700 placeholder:text-slate-300 placeholder:italic focus:outline-none leading-relaxed"
                                />
                            </div>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}

export function EisenhowerGrid({ data, onChange }: GP) {
    return (
        <QuadrantGrid
            axisX="중요도 (Importance)" axisXLow="Low" axisXHigh="High"
            axisY="긴급도 (Urgency)" axisYHigh="High" axisYLow="Low"
            quads={[
                { key: "delegate",    label: "Delegate",  desc: "위임 · 비중요·긴급",   color: Q_TONE.tertiary,  text: Q_TEXT.tertiary },
                { key: "do_now",      label: "Do",        desc: "즉시 실행 · 중요·긴급", color: Q_TONE.primary,   text: Q_TEXT.primary },
                { key: "eliminate",   label: "Eliminate", desc: "제거 · 비중요·비긴급", color: Q_TONE.muted,     text: Q_TEXT.muted },
                { key: "schedule_it", label: "Schedule",  desc: "계획 · 중요·비긴급",   color: Q_TONE.secondary, text: Q_TEXT.secondary },
            ]}
            data={data}
            onChange={onChange}
        />
    );
}

export function PestGrid({ data, onChange }: GP) {
    const cells = [
        { key: "political",     label: "Political",     sub: "정치·법률·규제", tone: "primary"   as const },
        { key: "economic",      label: "Economic",      sub: "경제·금리·환율", tone: "secondary" as const },
        { key: "social",        label: "Social",        sub: "사회·문화·인구", tone: "tertiary"  as const },
        { key: "technological", label: "Technological", sub: "기술·혁신",      tone: "muted"     as const },
    ];
    return (
        <div className="my-3 grid grid-cols-2 gap-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-md p-3 min-h-32 ${Q_TONE[c.tone]} transition-shadow hover:shadow-sm`}>
                    <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[c.tone]}`}>{c.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-1.5 font-medium tracking-wider">{c.sub}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} />
                </div>
            ))}
        </div>
    );
}

export function MoscowGrid({ data, onChange }: GP) {
    const cells = [
        { key: "must",   label: "Must have",   sub: "반드시 포함 · 핵심 요건", tone: "primary"   as const },
        { key: "should", label: "Should have", sub: "가능하면 포함 · 권장",    tone: "secondary" as const },
        { key: "could",  label: "Could have",  sub: "있으면 좋음 · 옵션",      tone: "tertiary"  as const },
        { key: "wont",   label: "Won't have",  sub: "이번엔 제외 · 차기 검토", tone: "muted"     as const },
    ];
    return (
        <div className="my-3 space-y-2">
            {cells.map(c => (
                <div key={c.key} className={`rounded-md p-3 ${Q_TONE[c.tone]} transition-shadow hover:shadow-sm`}>
                    <div className="flex items-baseline justify-between">
                        <p className={`text-[11px] font-bold tracking-wide uppercase ${Q_TEXT[c.tone]}`}>{c.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider">{c.sub}</p>
                    </div>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="항목들을 줄바꿈으로 나열…" />
                </div>
            ))}
        </div>
    );
}

export function QuadrantBlankGrid({ data, onChange }: GP) {
    const axisX = data["q_axis_x"] ?? "";
    const axisY = data["q_axis_y"] ?? "";
    return (
        <div className="my-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <label className="block">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">X축 라벨</span>
                    <input
                        type="text"
                        value={axisX}
                        onChange={e => onChange("q_axis_x", e.target.value)}
                        placeholder="예: 중요도, 비용, 난이도…"
                        className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                    />
                </label>
                <label className="block">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Y축 라벨</span>
                    <input
                        type="text"
                        value={axisY}
                        onChange={e => onChange("q_axis_y", e.target.value)}
                        placeholder="예: 긴급도, 가치, 노력…"
                        className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                    />
                </label>
            </div>
            <QuadrantGrid
                axisX={axisX || "X축"} axisXLow="Low" axisXHigh="High"
                axisY={axisY || "Y축"} axisYHigh="High" axisYLow="Low"
                quads={[
                    { key: "q2", label: "Quadrant II",  desc: "X−, Y+ · 좌상", color: Q_TONE.secondary, text: Q_TEXT.secondary },
                    { key: "q1", label: "Quadrant I",   desc: "X+, Y+ · 우상", color: Q_TONE.primary,   text: Q_TEXT.primary },
                    { key: "q3", label: "Quadrant III", desc: "X−, Y− · 좌하", color: Q_TONE.muted,     text: Q_TEXT.muted },
                    { key: "q4", label: "Quadrant IV",  desc: "X+, Y− · 우하", color: Q_TONE.tertiary,  text: Q_TEXT.tertiary },
                ]}
                data={data}
                onChange={onChange}
            />
        </div>
    );
}

export function KanoGrid({ data, onChange }: GP) {
    const cells = [
        { key: "kano_attractive",   label: "Attractive · 감동 품질",       sub: "있으면 매우 만족, 없어도 불만 아님", color: "bg-slate-50 border-slate-400", text: "text-slate-900" },
        { key: "kano_performance",  label: "One-dimensional · 성과 품질",  sub: "많을수록 만족, 적을수록 불만",       color: "bg-slate-50 border-slate-300", text: "text-slate-800" },
        { key: "kano_must",         label: "Must-be · 당연한 품질",        sub: "있으면 당연, 없으면 극도 불만",       color: "bg-stone-50 border-stone-300", text: "text-stone-800" },
        { key: "kano_indifferent",  label: "Indifferent · 무관심",         sub: "있어도 없어도 상관없음",              color: "bg-neutral-100 border-neutral-300", text: "text-neutral-600" },
        { key: "kano_reverse",      label: "Reverse · 역품질",             sub: "있을수록 불만, 없을수록 만족",       color: "bg-slate-50 border-slate-300", text: "text-stone-700" },
    ];
    return (
        <div className="my-2 space-y-1.5">
            {cells.map(c => (
                <div key={c.key} className={`rounded-lg p-3 border ${c.color}`}>
                    <p className={`text-xs font-bold ${c.text}`}>{c.label}</p>
                    <p className="text-[10px] text-neutral-500">{c.sub}</p>
                    <CellTextarea cellKey={c.key} value={data[c.key] ?? ""} onChange={onChange} placeholder="해당하는 기능·속성을 줄바꿈으로 나열…" />
                </div>
            ))}
        </div>
    );
}
