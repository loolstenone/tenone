/**
 * 묶음 통계 막대 — 팀 진단·인재 풀 리포트 공용 (2026-10-13)
 * 색 규약: 막대는 중립(neutral-800), 강조 없음. 숨긴 칸(5명 미만)은 '5명 미만'
 */
export function ShareBars({ items }: { items: { label: string; sub?: string; pct: number; hidden?: boolean }[] }) {
    return (
        <ul className="space-y-3">
            {items.map(it => (
                <li key={it.label}>
                    <div className="flex items-baseline justify-between text-sm mb-1">
                        <span className="font-semibold">{it.label}{it.sub && <span className="ml-2 text-xs font-normal text-neutral-500">{it.sub}</span>}</span>
                        <span className="text-neutral-600 tabular-nums">{it.hidden ? "5명 미만" : `${it.pct}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full rounded-full bg-neutral-800" style={{ width: `${it.hidden ? 0 : it.pct}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** 양쪽 성향 균형 막대 — leftPct = 왼쪽 성향 평균 % */
export function BalanceBars({ items }: { items: { left: string; right: string; leftDesc?: string; rightDesc?: string; leftPct: number }[] }) {
    return (
        <ul className="space-y-4">
            {items.map(it => (
                <li key={it.left}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className={it.leftPct >= 50 ? "font-semibold" : "text-neutral-500"}>{it.left} {it.leftPct}%</span>
                        <span className={it.leftPct < 50 ? "font-semibold" : "text-neutral-500"}>{100 - it.leftPct}% {it.right}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-neutral-100">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-neutral-800" style={{ width: `${it.leftPct}%` }} />
                        <div className="absolute inset-y-[-3px] left-1/2 w-px bg-neutral-300" />
                    </div>
                    {(it.leftDesc || it.rightDesc) && (
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                            <span>{it.leftDesc}</span><span>{it.rightDesc}</span>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}

export function ReportCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <h2 className="font-bold text-lg">{title}</h2>
            {desc && <p className="text-sm text-neutral-500 mt-1 mb-5 break-keep">{desc}</p>}
            <div className={desc ? "" : "mt-5"}>{children}</div>
        </section>
    );
}
