// Mindle TrustLabel — 정직성 SSOT 컴포넌트
//
// Mindle의 모든 트렌드 카드·리포트 하단에 출처·분석일·관련성·agent를 명시.
// SmarComm § ZERO 정직성 원칙(출처·산식·LLM 사용 여부 명시)을 Mindle 카드에 그대로 적용.
//
// 사용:
//   <TrustLabel
//     sources={trend.source_names}
//     sourceUrls={trend.source_urls}
//     analyzedAt={trend.created_at}
//     relevance={trend.relevance_score}
//     agentName={trend.agent_name}
//   />

import { ExternalLink, Microscope } from "lucide-react";

interface TrustLabelProps {
    sources: string[];
    sourceUrls?: string[];
    analyzedAt: string;             // ISO timestamp
    relevance?: number | null;      // 0~1
    agentName?: string | null;      // 'mindle' | 'claude-4.7' 등
    compact?: boolean;              // 카드 피드용 (한 줄)
    accentClass?: string;           // 텍스트 색 커스터마이즈 (기본 indigo)
}

export default function TrustLabel({
    sources,
    sourceUrls,
    analyzedAt,
    relevance,
    agentName,
    compact = false,
    accentClass = "text-indigo-400/60",
}: TrustLabelProps) {
    const date = analyzedAt ? new Date(analyzedAt).toISOString().slice(0, 10) : "";
    const relevancePct = typeof relevance === "number" ? Math.round(relevance * 100) : null;
    const hasSources = sources && sources.length > 0;

    if (compact) {
        return (
            <div className={`flex items-center gap-2 text-[10px] ${accentClass}`}>
                <Microscope className="w-3 h-3 shrink-0" />
                <span>
                    {hasSources ? `출처 ${sources.length}` : "출처 없음"}
                    {date && ` · ${date}`}
                    {relevancePct !== null && ` · 관련성 ${relevancePct}%`}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${accentClass} border-t border-current/10 pt-3 mt-3`}>
            <Microscope className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">출처</span>
            {hasSources ? (
                sources.map((name, i) => {
                    const url = sourceUrls?.[i];
                    return url ? (
                        <a
                            key={`${name}-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline-offset-2 hover:underline inline-flex items-center gap-0.5"
                        >
                            {name}
                            <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    ) : (
                        <span key={`${name}-${i}`}>{name}</span>
                    );
                })
            ) : (
                <span className="opacity-60">미상</span>
            )}
            {date && <span>· 분석 {date}</span>}
            {relevancePct !== null && <span>· 관련성 {relevancePct}%</span>}
            {agentName && <span>· {agentName}</span>}
        </div>
    );
}
