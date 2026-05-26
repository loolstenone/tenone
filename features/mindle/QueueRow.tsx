"use client";

// Mindle 검수 큐 한 줄 — 1-click published/draft/rejected 전환

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileEdit, X, ExternalLink, Loader2 } from "lucide-react";

type Action = "publish" | "draft" | "reject";

interface QueueRowProps {
    id: string;
    title: string;
    summary: string;
    category: string;
    categoryLabel: string;
    relevance: number;
    sourceNames: string[];
    sourceUrls: string[];
    agentName: string;
    createdAt: string;
}

export default function QueueRow({
    id,
    title,
    summary,
    category,
    categoryLabel,
    relevance,
    sourceNames,
    sourceUrls,
    agentName,
    createdAt,
}: QueueRowProps) {
    const router = useRouter();
    const [busy, setBusy] = useState<Action | null>(null);
    const [done, setDone] = useState<Action | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function dispatch(action: Action) {
        setError(null);
        setBusy(action);
        try {
            const res = await fetch(`/api/intra/mindle/queue/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? `HTTP ${res.status}`);
            }
            setDone(action);
            // 다음 정각 cron이 새 카드 채우니, 잠시 후 페이지 갱신
            setTimeout(() => router.refresh(), 300);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setBusy(null);
        }
    }

    if (done) {
        const label = done === "publish" ? "발행됨" : done === "draft" ? "초안 보관" : "기각됨";
        const color = done === "publish" ? "text-emerald-700 bg-emerald-50" : done === "draft" ? "text-blue-700 bg-blue-50" : "text-neutral-500 bg-neutral-100";
        return (
            <div className={`px-5 py-3 text-sm ${color}`}>
                ✓ {label} — {title}
            </div>
        );
    }

    const date = createdAt.slice(0, 10);

    return (
        <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-text/10 text-text">
                            {categoryLabel}
                        </span>
                        <span className="text-[10px] font-semibold text-text-sub">
                            AI 편집점수 {relevance.toFixed(1)}/10
                        </span>
                        <span className="text-[10px] text-text-muted">{date}</span>
                        <span className="text-[10px] text-text-muted">· {agentName}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text leading-snug mb-1">{title}</h3>
                    <p className="text-xs text-text-sub line-clamp-2 leading-relaxed">{summary}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] text-text-muted">
                        {sourceNames.map((name, i) => {
                            const url = sourceUrls[i];
                            return url ? (
                                <a
                                    key={`${name}-${i}`}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 hover:text-text underline-offset-2 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {name}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            ) : (
                                <span key={`${name}-${i}`}>{name}</span>
                            );
                        })}
                    </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                    <ActionButton
                        label="발행"
                        icon={Check}
                        color="emerald"
                        busy={busy === "publish"}
                        disabled={busy !== null}
                        onClick={() => dispatch("publish")}
                    />
                    <ActionButton
                        label="초안"
                        icon={FileEdit}
                        color="blue"
                        busy={busy === "draft"}
                        disabled={busy !== null}
                        onClick={() => dispatch("draft")}
                    />
                    <ActionButton
                        label="기각"
                        icon={X}
                        color="neutral"
                        busy={busy === "reject"}
                        disabled={busy !== null}
                        onClick={() => dispatch("reject")}
                    />
                </div>
            </div>
            {error && (
                <p className="mt-2 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}

function ActionButton({
    label,
    icon: Icon,
    color,
    busy,
    disabled,
    onClick,
}: {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: "emerald" | "blue" | "neutral";
    busy: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    const cls = {
        emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
        blue:    "border-blue-200 text-blue-700 hover:bg-blue-50",
        neutral: "border-border text-text-sub hover:text-text hover:bg-surface",
    }[color];
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40 ${cls}`}
        >
            {busy ? <Loader2 size={11} className="animate-spin" /> : <Icon size={11} />}
            {label}
        </button>
    );
}
