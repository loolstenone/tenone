"use client";

// Mindle 뉴스레터 이슈 관리 — AI 초안 생성 + 발송
// from_name='Mindle' 또는 target_tags @> ['mindle'] 이슈만 표시

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Send, Edit2, Loader2, RefreshCw, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Issue {
    id: string;
    title: string;
    content: string | null;
    status: "draft" | "scheduled" | "sending" | "sent";
    from_name: string | null;
    target_tags: string[] | null;
    scheduled_at: string | null;
    sent_at: string | null;
    recipient_count: number;
    created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
    draft: "초안",
    scheduled: "예약",
    sending: "발송중",
    sent: "발송완료",
};

const STATUS_CLASS: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    scheduled: "bg-blue-100 text-blue-700",
    sending: "bg-amber-100 text-amber-700",
    sent: "bg-emerald-100 text-emerald-700",
};

export default function MindleNewsletterPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);
    const [daysOption, setDaysOption] = useState(7);

    const supabase = createClient();

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("newsletter_issues")
            .select("id, title, content, status, from_name, target_tags, scheduled_at, sent_at, recipient_count, created_at")
            .or("from_name.eq.Mindle,target_tags.cs.{mindle}")
            .order("created_at", { ascending: false })
            .limit(30);
        setIssues((data ?? []) as Issue[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { load(); }, [load]);

    async function generate() {
        setGenError(null);
        setGenerating(true);
        try {
            const res = await fetch("/api/intra/mindle/newsletter/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ days: daysOption, maxItems: 7 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
            await load();
        } catch (e) {
            setGenError(e instanceof Error ? e.message : String(e));
        } finally {
            setGenerating(false);
        }
    }

    async function sendIssue(issueId: string) {
        setSendError(null);
        setSendingId(issueId);
        try {
            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    issueId,
                    fromName: "Mindle",
                    tags: ["mindle"],
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
            await load();
        } catch (e) {
            setSendError(e instanceof Error ? e.message : String(e));
        } finally {
            setSendingId(null);
        }
    }

    const rel = (d: string) => {
        const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
        if (mins < 1) return "방금";
        if (mins < 60) return `${mins}분 전`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}시간 전`;
        return `${Math.floor(hrs / 24)}일 전`;
    };

    const drafts = issues.filter(i => i.status === "draft");
    const sent = issues.filter(i => i.status === "sent" || i.status === "scheduled");

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mindle 뉴스레터"
                description="Whole See 트렌드 카드에서 AI가 자동으로 뉴스레터 초안을 생성합니다."
            />

            {/* AI 초안 생성 패널 */}
            <div className="rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-semibold text-text">AI 초안 생성</h2>
                </div>
                <p className="text-xs text-text-sub mb-4">
                    최근 발행된 Mindle 트렌드 카드를 Claude Haiku가 뉴스레터 초안으로 묶어줍니다.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-text-sub">최근</label>
                        <select
                            value={daysOption}
                            onChange={e => setDaysOption(Number(e.target.value))}
                            className="border border-border rounded px-2 py-1 text-xs text-text bg-white"
                        >
                            <option value={3}>3일</option>
                            <option value={7}>7일</option>
                            <option value={14}>14일</option>
                        </select>
                        <label className="text-xs text-text-sub">이내 트렌드</label>
                    </div>
                    <button
                        onClick={generate}
                        disabled={generating}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-text text-white px-4 py-1.5 text-xs font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                        {generating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Plus className="w-3 h-3" />
                        )}
                        {generating ? "생성 중…" : "초안 생성"}
                    </button>
                    {genError && (
                        <p className="text-xs text-red-600 w-full">{genError}</p>
                    )}
                </div>
            </div>

            {/* 초안 목록 */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-text">
                        초안 {drafts.length}건
                    </h2>
                    <button onClick={load} className="text-[11px] text-text-muted hover:text-text inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />새로고침
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <p className="text-sm text-text-sub">초안이 없습니다.</p>
                        <p className="text-xs text-text-muted mt-1">위 버튼으로 AI 초안을 생성해보세요.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {drafts.map(issue => (
                            <IssueRow
                                key={issue.id}
                                issue={issue}
                                rel={rel}
                                onSend={() => sendIssue(issue.id)}
                                sending={sendingId === issue.id}
                                sendError={sendingId === issue.id ? sendError : null}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 발송 완료 목록 */}
            {sent.length > 0 && (
                <div className="rounded-2xl border border-border bg-white overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text">발송 이력 {sent.length}건</h2>
                    </div>
                    <div className="divide-y divide-border">
                        {sent.map(issue => (
                            <IssueRow
                                key={issue.id}
                                issue={issue}
                                rel={rel}
                                onSend={() => {}}
                                sending={false}
                                sendError={null}
                                readOnly
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 전체 이슈 관리 링크 */}
            <div className="text-center">
                <Link
                    href="/intra/ums/newsletter/issues"
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text"
                >
                    전체 뉴스레터 이슈 관리 <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}

function IssueRow({
    issue,
    rel,
    onSend,
    sending,
    sendError,
    readOnly = false,
}: {
    issue: Issue;
    rel: (d: string) => string;
    onSend: () => void;
    sending: boolean;
    sendError: string | null;
    readOnly?: boolean;
}) {
    return (
        <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_CLASS[issue.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                            {STATUS_LABEL[issue.status] ?? issue.status}
                        </span>
                        <span className="text-[10px] text-text-muted">{rel(issue.created_at)}</span>
                        {issue.sent_at && (
                            <span className="text-[10px] text-text-muted">
                                · 발송 {rel(issue.sent_at)} · {issue.recipient_count}명
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-semibold text-text leading-snug">{issue.title}</p>
                    {issue.content && (
                        <p className="text-xs text-text-sub mt-1 line-clamp-2 leading-relaxed"
                           dangerouslySetInnerHTML={{ __html: issue.content.replace(/<[^>]+>/g, " ").slice(0, 150) }} />
                    )}
                </div>

                {!readOnly && (
                    <div className="shrink-0 flex items-center gap-1.5">
                        <Link
                            href="/intra/ums/newsletter/issues"
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-text-sub hover:text-text hover:bg-surface transition-colors"
                        >
                            <Edit2 size={11} />편집
                        </Link>
                        <button
                            onClick={onSend}
                            disabled={sending}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40"
                        >
                            {sending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                            발송
                        </button>
                    </div>
                )}
            </div>
            {sendError && (
                <p className="mt-2 text-xs text-red-600">{sendError}</p>
            )}
        </div>
    );
}
